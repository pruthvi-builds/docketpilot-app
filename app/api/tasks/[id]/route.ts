import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

async function findOwned(id: string, firmId: string) {
    return prisma.task.findFirst({ where: { id, firmId } });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const existing = await findOwned(params.id, session.firmId);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
    const data: any = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.priority !== undefined && VALID_PRIORITIES.includes(body.priority)) data.priority = body.priority;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.done !== undefined) data.done = Boolean(body.done);

  const updated = await prisma.task.update({ where: { id: params.id }, data });

  await prisma.activityLog.create({
        data: { firmId: session.firmId, userId: session.userId, action: "task.updated", detail: updated.title },
  });

  return NextResponse.json({
        id: updated.id,
        title: updated.title,
        priority: updated.priority,
        dueDate: updated.dueDate ? updated.dueDate.toISOString().slice(0, 10) : null,
        done: updated.done,
        caseId: updated.caseId,
  });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const existing = await findOwned(params.id, session.firmId);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.task.delete({ where: { id: params.id } });
    await prisma.activityLog.create({
          data: { firmId: session.firmId, userId: session.userId, action: "task.deleted", detail: existing.title },
    });

  return NextResponse.json({ ok: true });
}
