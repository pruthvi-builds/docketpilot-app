import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Firm-wide conflict check: "does anything else land on this date already?"
// Solo/small firms don't have per-courtroom calendars, but knowing you've
// already got 3 other deadlines on the same day is exactly the kind of
// overload signal that prevents missed or rushed filings.
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const datesParam = searchParams.get("dates") || "";
  const excludeCaseId = searchParams.get("excludeCaseId") || undefined;

  const dates = datesParam
    .split(",")
    .map((d) => d.trim())
    .filter((d) => d && !isNaN(Date.parse(d)));

  if (dates.length === 0) return NextResponse.json({ conflicts: {} });

  const start = new Date(dates.reduce((a, b) => (a < b ? a : b)) + "T00:00:00");
  const end = new Date(dates.reduce((a, b) => (a > b ? a : b)) + "T23:59:59");

  const existing = await prisma.deadline.findMany({
    where: {
      dueDate: { gte: start, lte: end },
      completed: false,
      case: { firmId: session.firmId, ...(excludeCaseId ? { id: { not: excludeCaseId } } : {}) },
    },
    include: { case: { select: { clientName: true } } },
  });

  const conflicts: Record<string, { clientName: string; type: string }[]> = {};
  for (const dateStr of dates) {
    const matches = existing.filter((d) => d.dueDate.toISOString().slice(0, 10) === dateStr);
    if (matches.length > 0) {
      conflicts[dateStr] = matches.map((m) => ({ clientName: m.case.clientName, type: m.type }));
    }
  }

  return NextResponse.json({ conflicts });
}
