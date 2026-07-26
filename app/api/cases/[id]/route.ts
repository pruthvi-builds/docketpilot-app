import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function assertOwnership(caseId: string, firmId: string) {
  const record = await prisma.case.findFirst({ where: { id: caseId, firmId } });
  return record;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const record = await prisma.case.findFirst({
    where: { id: params.id, firmId: session.firmId },
    include: { deadlines: true },
  });
  if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(record);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await assertOwnership(params.id, session.firmId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const updated = await prisma.case.update({
    where: { id: params.id },
    data: {
      clientName: body.clientName?.trim() ?? undefined,
      caseNumber: body.caseNumber !== undefined ? body.caseNumber?.trim() || null : undefined,
      court: body.court !== undefined ? body.court?.trim() || null : undefined,
      caseType: body.caseType !== undefined ? body.caseType?.trim() || null : undefined,
      status: body.status ?? undefined,
    },
  });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "case.updated", detail: updated.clientName },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await assertOwnership(params.id, session.firmId);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.case.delete({ where: { id: params.id } });
  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "case.deleted", detail: existing.clientName },
  });

  return NextResponse.json({ ok: true });
}
