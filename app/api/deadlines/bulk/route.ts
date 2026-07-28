import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { pushDeadlineToGoogleCalendar } from "@/lib/googleCalendar";

const VALID_TYPES = ["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"];

// Bulk-create deadlines for a case in one call — used by the rules-based
// Deadline Wizard so a whole set of computed deadlines is created (and
// logged) as a single action instead of N separate requests.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const caseId = body?.caseId;
  const items = Array.isArray(body?.deadlines) ? body.deadlines : [];

  if (!caseId) return NextResponse.json({ error: "caseId is required." }, { status: 400 });
  if (items.length === 0) return NextResponse.json({ error: "At least one deadline is required." }, { status: 400 });

  const owned = await prisma.case.findFirst({ where: { id: caseId, firmId: session.firmId } });
  if (!owned) return NextResponse.json({ error: "Case not found." }, { status: 404 });

  const toCreate = items
    .filter((it: any) => it?.dueDate && !isNaN(Date.parse(it.dueDate)))
    .map((it: any) => ({
      caseId,
      type: VALID_TYPES.includes(it.type) ? it.type : "Other",
      dueDate: new Date(it.dueDate),
      notes: it.notes?.trim() || null,
    }));

  if (toCreate.length === 0) {
    return NextResponse.json({ error: "None of the supplied deadlines had a valid date." }, { status: 400 });
  }

  await prisma.deadline.createMany({ data: toCreate });

  await prisma.activityLog.create({
    data: {
      firmId: session.firmId,
      userId: session.userId,
      action: "deadline.bulk_created",
      detail: `${toCreate.length} deadline(s) via wizard for ${owned.clientName}`,
    },
  });

  const created = await prisma.deadline.findMany({
    where: { caseId },
    orderBy: { dueDate: "asc" },
  });

  const newlyCreated = created.filter((d) => toCreate.some((tc: any) => tc.dueDate.getTime() === d.dueDate.getTime() && tc.type === d.type));
  for (const d of newlyCreated) {
    await pushDeadlineToGoogleCalendar(session.userId, {
      id: d.id,
      type: d.type,
      dueDate: d.dueDate,
      notes: d.notes,
      clientName: owned.clientName,
      caseNumber: owned.caseNumber,
    });
  }

  return NextResponse.json(
    created.map((d) => ({
      id: d.id,
      type: d.type,
      dueDate: d.dueDate.toISOString().slice(0, 10),
      notes: d.notes,
      completed: d.completed,
      caseId: d.caseId,
    }))
  );
}
