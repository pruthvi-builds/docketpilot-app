import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only firm admins can change settings." }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.name !== undefined) data.name = body.name.trim();
  if (body.reminderDaysBefore !== undefined) {
    const cleaned = String(body.reminderDaysBefore)
      .split(",")
      .map((s: string) => s.trim())
      .filter((s: string) => s !== "" && !isNaN(Number(s)))
      .join(",");
    data.reminderDaysBefore = cleaned || "7";
  }

  const updated = await prisma.firm.update({ where: { id: session.firmId }, data });
  return NextResponse.json({ ok: true, firm: updated });
}
