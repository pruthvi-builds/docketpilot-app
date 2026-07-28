import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getGoogleAuthUrl, isGoogleCalendarConfigured } from "@/lib/googleCalendar";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));

  if (!isGoogleCalendarConfigured()) {
    return NextResponse.json({ error: "Google Calendar isn't configured on this deployment yet." }, { status: 503 });
  }

  const url = getGoogleAuthUrl(session.userId);
  return NextResponse.redirect(url);
}
