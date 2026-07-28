import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { disconnectGoogleCalendar } from "@/lib/googleCalendar";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await disconnectGoogleCalendar(session.userId);
  return NextResponse.json({ ok: true });
}
