import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, signSession, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const firmName = body?.firmName?.trim();
  const name = body?.name?.trim();
  const email = body?.email?.trim().toLowerCase();
  const password = body?.password;

  if (!firmName || !name || !email || !password) {
    return NextResponse.json({ error: "All fields are required." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const firm = await prisma.firm.create({
    data: {
      name: firmName,
      users: {
        create: { email, name, passwordHash, role: "ADMIN" },
      },
      activity: { create: { action: "firm.created", detail: firmName } },
    },
    include: { users: true },
  });

  const user = firm.users[0];
  const token = await signSession({ userId: user.id, firmId: firm.id, role: "ADMIN" });
  setSessionCookie(token);

  return NextResponse.json({ ok: true });
}
