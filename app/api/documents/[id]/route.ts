import { NextRequest, NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await prisma.document.findFirst({ where: { id: params.id, firmId: session.firmId } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await del(doc.pathname);
  await prisma.document.delete({ where: { id: doc.id } });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "document.deleted", detail: doc.filename },
  });

  return NextResponse.json({ ok: true });
}
