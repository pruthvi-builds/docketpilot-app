import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { DEMO_FIRM_ID, DEMO_USER_EMAIL } from "@/lib/demo";

// One-off/idempotent endpoint used to (re)create the public read-only demo
// firm. Not linked anywhere in the UI — call it directly with the secret
// header. Safe to call more than once: pass ?reset=true to wipe and reseed,
// otherwise it's a no-op if the demo firm already exists.
function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(12, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret");
  if (!secret || secret !== process.env.SEED_DEMO_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reset = req.nextUrl.searchParams.get("reset") === "true";
  const existing = await prisma.firm.findUnique({ where: { id: DEMO_FIRM_ID } });

  if (existing && !reset) {
    return NextResponse.json({ ok: true, message: "Demo firm already exists.", firmId: DEMO_FIRM_ID });
  }

  if (existing) {
    // Cascade-safe manual cleanup order (documents/tasks/deadlines depend on cases; users/cases depend on firm).
    await prisma.document.deleteMany({ where: { firmId: DEMO_FIRM_ID } });
    await prisma.task.deleteMany({ where: { firmId: DEMO_FIRM_ID } });
    await prisma.activityLog.deleteMany({ where: { firmId: DEMO_FIRM_ID } });
    await prisma.deadline.deleteMany({ where: { case: { firmId: DEMO_FIRM_ID } } });
    await prisma.case.deleteMany({ where: { firmId: DEMO_FIRM_ID } });
    await prisma.user.deleteMany({ where: { firmId: DEMO_FIRM_ID } });
    await prisma.firm.delete({ where: { id: DEMO_FIRM_ID } });
  }

  const passwordHash = await hashPassword(crypto.randomUUID());

  const firm = await prisma.firm.create({
    data: {
      id: DEMO_FIRM_ID,
      name: "Alvarez & Partners (Demo)",
      plan: "trial",
      onboardingDismissed: true,
      users: {
        create: [{ email: DEMO_USER_EMAIL, name: "Jane Alvarez", role: "ADMIN", passwordHash }],
      },
    },
  });

  const casesData = [
    {
      clientName: "Maria Alvarez",
      caseNumber: "2026-CV-1042",
      court: "King County Superior Court",
      caseType: "Civil",
      deadlines: [
        { type: "Filing Deadline", dueDate: addDays(-2), notes: "Motion for summary judgment", completed: false },
        { type: "Hearing Date", dueDate: addDays(-20), notes: "Case management conference", completed: true },
      ],
    },
    {
      clientName: "Tom Whitfield",
      caseNumber: "2026-FAM-330",
      court: "Family Court Div. 3",
      caseType: "Family",
      deadlines: [{ type: "Hearing Date", dueDate: addDays(3), notes: "Custody hearing", completed: false }],
    },
    {
      clientName: "Nguyen Estate",
      caseNumber: "2025-PR-118",
      court: "Probate Court",
      caseType: "Probate",
      deadlines: [{ type: "Statute of Limitations", dueDate: addDays(14), notes: "Creditor claim deadline", completed: false }],
    },
    {
      clientName: "Riverside LLC",
      caseNumber: "2026-CV-2071",
      court: "District Court",
      caseType: "Civil",
      deadlines: [{ type: "Discovery Cutoff", dueDate: addDays(45), notes: "", completed: false }],
    },
  ];

  let firstCaseId: string | null = null;

  for (const c of casesData) {
    const created = await prisma.case.create({
      data: {
        firmId: firm.id,
        clientName: c.clientName,
        caseNumber: c.caseNumber,
        court: c.court,
        caseType: c.caseType,
        deadlines: { create: c.deadlines },
      },
    });
    if (!firstCaseId) firstCaseId = created.id;
  }

  await prisma.task.createMany({
    data: [
      { firmId: firm.id, title: "Draft summary judgment motion", priority: "HIGH", dueDate: addDays(-1), done: false },
      { firmId: firm.id, title: "Call opposing counsel re: discovery", priority: "MEDIUM", dueDate: addDays(2), done: false },
      { firmId: firm.id, title: "File proof of service", priority: "LOW", dueDate: addDays(10), done: true },
    ],
  });

  if (firstCaseId) {
    try {
      const pathname = `documents/${firstCaseId}/demo-retainer-agreement.txt`;
      const blob = await put(
        pathname,
        "Sample retainer agreement (demo content only — DocketPilot document attachments).\n",
        { access: "private", contentType: "text/plain" }
      );
      await prisma.document.create({
        data: {
          firmId: firm.id,
          caseId: firstCaseId,
          filename: "retainer-agreement.txt",
          pathname: blob.pathname,
          contentType: "text/plain",
          size: 90,
        },
      });
    } catch {
      // Blob storage misconfigured in this environment — skip the demo document, not fatal.
    }
  }

  await prisma.activityLog.createMany({
    data: [
      { firmId: firm.id, action: "case.created", detail: "Maria Alvarez" },
      { firmId: firm.id, action: "deadline.created", detail: "Motion for summary judgment" },
      { firmId: firm.id, action: "task.created", detail: "Draft summary judgment motion" },
    ],
  });

  return NextResponse.json({ ok: true, firmId: firm.id });
}
