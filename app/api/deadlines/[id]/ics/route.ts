import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { buildIcsEvent } from "@/lib/ics";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const deadline = await prisma.deadline.findFirst({
    where: { id: params.id, case: { firmId: session.firmId } },
    include: { case: true },
  });
  if (!deadline) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const ics = buildIcsEvent({
    uid: deadline.id,
    title: `${deadline.type} — ${deadline.case.clientName}`,
    description: [deadline.case.court, deadline.case.caseNumber ? `#${deadline.case.caseNumber}` : "", deadline.notes]
      .filter(Boolean)
      .join(" · "),
    dueDate: deadline.dueDate,
  });

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="deadline-${deadline.id}.ics"`,
    },
  });
}
