import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cases = await prisma.case.findMany({
    where: { firmId: session.firmId },
    include: { deadlines: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(cases);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.clientName?.trim()) {
    return NextResponse.json({ error: "Client name is required." }, { status: 400 });
  }

  const created = await prisma.case.create({
    data: {
      firmId: session.firmId,
      clientName: body.clientName.trim(),
      caseNumber: body.caseNumber?.trim() || null,
      court: body.court?.trim() || null,
      caseType: body.caseType?.trim() || null,
    },
  });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "case.created", detail: created.clientName },
  });

  return NextResponse.json(created);
}
