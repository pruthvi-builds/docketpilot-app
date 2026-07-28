import { google } from "googleapis";
import { prisma } from "./db";

const CALENDAR_NAME = "DocketPilot Deadlines";
const SCOPES = ["https://www.googleapis.com/auth/calendar.events", "https://www.googleapis.com/auth/calendar.calendarlist"];

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function isGoogleCalendarConfigured() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REDIRECT_URI);
}

/** Step 1 of OAuth: where we send the user to grant access. `state` carries the userId through the redirect. */
export function getGoogleAuthUrl(state: string) {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline", // needed to get a refresh_token
    prompt: "consent", // force refresh_token on every connect, not just the first
    scope: SCOPES,
    state,
  });
}

/**
 * Step 2: exchange the ?code= Google redirected back with for tokens, create
 * (or find) a dedicated calendar in the user's account, and store the
 * connection. Called once, right after the OAuth redirect.
 */
export async function connectGoogleCalendar(userId: string, code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error("Google did not return a refresh token — the user may need to revoke prior access and reconnect.");
  }
  client.setCredentials(tokens);

  const calendar = google.calendar({ version: "v3", auth: client });

  // Find an existing "DocketPilot Deadlines" calendar from a prior connection, or create one.
  const list = await calendar.calendarList.list();
  let calendarId = list.data.items?.find((c) => c.summary === CALENDAR_NAME)?.id;
  if (!calendarId) {
    const created = await calendar.calendars.insert({ requestBody: { summary: CALENDAR_NAME } });
    calendarId = created.data.id!;
  }

  await prisma.googleCalendarConnection.upsert({
    where: { userId },
    create: {
      userId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: BigInt(tokens.expiry_date || Date.now() + 3600_000),
      calendarId,
    },
    update: {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiryDate: BigInt(tokens.expiry_date || Date.now() + 3600_000),
      calendarId,
    },
  });
}

export async function disconnectGoogleCalendar(userId: string) {
  await prisma.googleCalendarConnection.deleteMany({ where: { userId } });
  await prisma.googleCalendarEvent.deleteMany({ where: { userId } });
}

/** Returns an authenticated Calendar client for this user, refreshing the access token if needed. Null if not connected. */
async function getCalendarClientForUser(userId: string) {
  const conn = await prisma.googleCalendarConnection.findUnique({ where: { userId } });
  if (!conn) return null;

  const client = getOAuthClient();
  client.setCredentials({
    access_token: conn.accessToken,
    refresh_token: conn.refreshToken,
    expiry_date: Number(conn.expiryDate),
  });

  // googleapis auto-refreshes and fires this when it does — persist the new token.
  client.on("tokens", async (tokens) => {
    await prisma.googleCalendarConnection.update({
      where: { userId },
      data: {
        accessToken: tokens.access_token || conn.accessToken,
        expiryDate: BigInt(tokens.expiry_date || Date.now() + 3600_000),
      },
    });
  });

  return { calendar: google.calendar({ version: "v3", auth: client }), calendarId: conn.calendarId };
}

export type DeadlineForPush = {
  id: string;
  type: string;
  dueDate: Date;
  notes: string | null;
  clientName: string;
  caseNumber: string | null;
};

/** Push (create or update) a single deadline into the user's dedicated Google Calendar, best-effort. */
export async function pushDeadlineToGoogleCalendar(userId: string, deadline: DeadlineForPush) {
  const ctx = await getCalendarClientForUser(userId);
  if (!ctx) return; // user hasn't connected Google Calendar — nothing to do

  const summary = `${deadline.type}${deadline.clientName ? ` — ${deadline.clientName}` : ""}`;
  const description = [
    deadline.caseNumber ? `Case #${deadline.caseNumber}` : null,
    deadline.notes || null,
    "Synced from DocketPilot (one-way).",
  ]
    .filter(Boolean)
    .join("\n");

  const dateStr = deadline.dueDate.toISOString().slice(0, 10);
  const eventBody = {
    summary,
    description,
    start: { date: dateStr },
    end: { date: dateStr },
  };

  try {
    const existing = await prisma.googleCalendarEvent.findUnique({
      where: { deadlineId_userId: { deadlineId: deadline.id, userId } },
    });

    if (existing) {
      await ctx.calendar.events.update({
        calendarId: ctx.calendarId,
        eventId: existing.eventId,
        requestBody: eventBody,
      });
    } else {
      const created = await ctx.calendar.events.insert({
        calendarId: ctx.calendarId,
        requestBody: eventBody,
      });
      await prisma.googleCalendarEvent.create({
        data: { deadlineId: deadline.id, userId, eventId: created.data.id! },
      });
    }
  } catch (err) {
    // Best-effort, same philosophy as sendEmail/sendPush: never let a calendar
    // API hiccup break the actual deadline create/update request.
    console.error("[google-calendar] push failed:", (err as Error)?.message || err);
  }
}

/** Remove a deadline's event from the user's calendar, best-effort. */
export async function removeDeadlineFromGoogleCalendar(userId: string, deadlineId: string) {
  const existing = await prisma.googleCalendarEvent.findUnique({
    where: { deadlineId_userId: { deadlineId, userId } },
  });
  if (!existing) return;

  const ctx = await getCalendarClientForUser(userId);
  if (!ctx) return;

  try {
    await ctx.calendar.events.delete({ calendarId: ctx.calendarId, eventId: existing.eventId });
  } catch (err) {
    console.error("[google-calendar] delete failed:", (err as Error)?.message || err);
  } finally {
    await prisma.googleCalendarEvent.delete({ where: { id: existing.id } }).catch(() => undefined);
  }
}
