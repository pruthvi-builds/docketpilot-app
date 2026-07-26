import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function findOwned(id: string, firmId: string) {
  return prisma.deadline.findFirst({
    where: { id, case: { firmId } },
    include: { case: true },
  });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await findOwned(params.id, session.firmId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if (body.type !== undefined) data.type = body.type;
  if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
  if (body.completed !== undefined) data.completed = Boolean(body.completed);
  // Editing the date invalidates previously-sent reminder tracking so new thresholds re-fire correctly.
  if (body.dueDate !== undefined) data.remindersSentDays = "";

  const updated = await prisma.deadline.update({ where: { id: params.id }, data });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "deadline.updated", detail: updated.type },
  });

  return NextResponse.json({
    id: updated.id,
    type: updated.type,
    dueDate: updated.dueDate.toISOString().slice(0, 10),
    notes: updated.notes,
    completed: updated.completed,
    caseId: updated.caseId,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await findOwned(params.id, session.firmId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.deadline.delete({ where: { id: params.id } });
  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "deadline.deleted", detail: existing.type },
  });

  return NextResponse.json({ ok: true });
}
