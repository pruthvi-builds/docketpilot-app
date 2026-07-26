import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, hashPassword } from "@/lib/auth";

function randomTempPassword() {
  return Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6);
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const users = await prisma.user.findMany({
    where: { firmId: session.firmId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only firm admins can add team members." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = body?.email?.trim().toLowerCase();
  const name = body?.name?.trim();
  const role = ["ADMIN", "ATTORNEY", "STAFF"].includes(body?.role) ? body.role : "ATTORNEY";

  if (!email || !name) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "That email is already in use." }, { status: 409 });
  }

  const tempPassword = randomTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const user = await prisma.user.create({
    data: { email, name, role, passwordHash, firmId: session.firmId },
  });

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "team.member_added", detail: email },
  });

  // Return the temp password once so the admin can share it — no SMTP dependency required.
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role, tempPassword });
}
