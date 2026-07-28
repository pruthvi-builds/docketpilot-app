import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { connectGoogleCalendar } from "@/lib/googleCalendar";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const userId = req.nextUrl.searchParams.get("state"); // set to session.userId in /connect
  const error = req.nextUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/dashboard/settings?calendar=denied`, APP_URL));
  }
  if (!code || !userId) {
    return NextResponse.redirect(new URL(`/dashboard/settings?calendar=error`, APP_URL));
  }

  try {
    await connectGoogleCalendar(userId, code);
    await prisma.user.findUnique({ where: { id: userId } }).then(async (u) => {
      if (u) {
        await prisma.activityLog.create({
          data: { firmId: u.firmId, userId, action: "calendar.connected", detail: "Google Calendar" },
        });
      }
    });
    return NextResponse.redirect(new URL(`/dashboard/settings?calendar=connected`, APP_URL));
  } catch (err) {
    console.error("[google-calendar] callback failed:", (err as Error)?.message || err);
    return NextResponse.redirect(new URL(`/dashboard/settings?calendar=error`, APP_URL));
  }
}
