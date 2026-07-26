import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const VALID_TYPES = ["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.dueDate || isNaN(Date.parse(body.dueDate))) {
    return NextResponse.json({ error: "A valid due date is required." }, { status: 400 });
  }
  const type = VALID_TYPES.includes(body.type) ? body.type : "Other";

  let caseId: string | undefined = body.caseId;

  if (!caseId) {
    if (!body.newCase?.clientName?.trim()) {
      return NextResponse.json({ error: "Client name is required for a new case." }, { status: 400 });
    }
    const newCase = await prisma.case.create({
      data: {
        firmId: session.firmId,
        clientName: body.newCase.clientName.trim(),
        caseNumber: body.newCase.caseNumber?.trim() || null,
        court: body.newCase.court?.trim() || null,
      },
    });
    caseId = newCase.id;
  } else {
    const owned = await prisma.case.findFirst({ where: { id: caseId, firmId: session.firmId } });
    if (!owned) return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  const deadline = await prisma.deadline.create({
    data: {
      caseId,
      type,
      dueDate: new Date(body.dueDate),
      notes: body.notes?.trim() || null,
    },
  });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "deadline.created", detail: type },
  });

  return NextResponse.json({
    id: deadline.id,
    type: deadline.type,
    dueDate: deadline.dueDate.toISOString().slice(0, 10),
    notes: deadline.notes,
    completed: deadline.completed,
    caseId: deadline.caseId,
  });
}
