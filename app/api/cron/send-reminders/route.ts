import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail, reminderEmailHtml } from "@/lib/mailer";
import { daysUntil } from "@/lib/urgency";
import { sendPush } from "@/lib/push";

/**
 * Daily reminder sweep. Trigger this once a day (Vercel Cron, or any scheduler)
 * with:  Authorization: Bearer <CRON_SECRET>
 *
 * For every firm, checks each open, incomplete deadline against that firm's
 * configured reminder thresholds (Firm.reminderDaysBefore, e.g. "30,14,7,1").
 * Sends one email per threshold crossed, and records it on the deadline so the
 * same reminder never fires twice.
 *
 * Email sends are best-effort: a failure for one recipient (bad address,
 * provider rejection, etc.) is logged and skipped rather than aborting the
 * whole run, so one bad address can't block reminders for every other firm.
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (!process.env.CRON_SECRET || auth !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const firms = await prisma.firm.findMany({
    include: {
      users: true,
      cases: {
        where: { status: "OPEN" },
        include: { deadlines: { where: { completed: false } } },
      },
    },
  });

  let sent = 0;
  let failed = 0;

  for (const firm of firms) {
    const thresholds = firm.reminderDaysBefore
      .split(",")
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n));
    const recipients = firm.users.map((u) => u.email);
    if (recipients.length === 0) continue;

    const pushSubs = await prisma.pushSubscription.findMany({
      where: { userId: { in: firm.users.map((u) => u.id) } },
    });

    for (const c of firm.cases) {
      for (const d of c.deadlines) {
        const days = daysUntil(d.dueDate);
        const already = d.remindersSentDays.split(",").filter(Boolean).map(Number);
        const matchedThreshold = thresholds.find((t) => t === days && !already.includes(t));
        if (matchedThreshold === undefined) continue;

        const html = reminderEmailHtml({
          clientName: c.clientName,
          caseNumber: c.caseNumber,
          court: c.court,
          type: d.type,
          dueDateLabel: d.dueDate.toISOString().slice(0, 10),
          daysLabel: matchedThreshold === 0 ? "due today" : `${matchedThreshold} day${matchedThreshold === 1 ? "" : "s"} away`,
          notes: d.notes,
          appUrl,
        });

        for (const to of recipients) {
          try {
            await sendEmail(to, `Deadline reminder: ${c.clientName} — ${d.type}`, html);
          } catch (err) {
            failed += 1;
            console.error(`[send-reminders] Failed to email ${to} for ${c.clientName} — ${d.type}:`, err);
          }
        }

        for (const sub of pushSubs) {
          try {
            await sendPush(
              sub,
              {
                title: `Deadline: ${c.clientName}`,
                body: `${d.type} — ${matchedThreshold === 0 ? "due today" : `${matchedThreshold} day${matchedThreshold === 1 ? "" : "s"} away`}`,
                url: "/dashboard",
              },
              (id) => prisma.pushSubscription.delete({ where: { id } }).then(() => undefined)
            );
          } catch (err) {
            console.error(`[send-reminders] Failed to push-notify for ${c.clientName} — ${d.type}:`, err);
          }
        }

        await prisma.deadline.update({
          where: { id: d.id },
          data: { remindersSentDays: [...already, matchedThreshold].join(",") },
        });
        await prisma.activityLog.create({
          data: { firmId: firm.id, action: "reminder.sent", detail: `${c.clientName} — ${d.type}` },
        });
        sent += 1;
      }
    }
  }

  return NextResponse.json({ ok: true, remindersSent: sent, failedSends: failed });
}
