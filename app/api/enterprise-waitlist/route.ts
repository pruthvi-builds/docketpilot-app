import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const firmName = body?.firmName?.trim();
  const email = body?.email?.trim().toLowerCase();
  const firmSize = body?.firmSize?.trim() || null;
  const message = body?.message?.trim().slice(0, 1000) || null;

  if (!firmName || !email) {
    return NextResponse.json({ error: "Firm name and email are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 400 });
  }

  const lead = await prisma.enterpriseLead.create({
    data: { firmName, email, firmSize, message },
  });

  // Best-effort notification — never blocks the response if SMTP isn't configured.
  sendEmail(
    "pruthvik.fit@gmail.com",
    `New Enterprise waitlist signup: ${firmName}`,
    `<p><strong>Firm:</strong> ${firmName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Size:</strong> ${firmSize || "—"}</p><p><strong>Message:</strong> ${message || "—"}</p>`,
    `Firm: ${firmName}\nEmail: ${email}\nSize: ${firmSize || "—"}\nMessage: ${message || "—"}`
  ).catch(() => null);

  return NextResponse.json({ ok: true, id: lead.id });
}
