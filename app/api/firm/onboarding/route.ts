import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  await prisma.firm.update({
    where: { id: session.firmId },
    data: { onboardingDismissed: Boolean(body?.dismissed) },
  });

  return NextResponse.json({ ok: true });
}
