import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const VALID_TYPES = ["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"];

function parseCsv(text: string): Record<string, string>[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((c) => c.trim());
    const row: Record<string, string> = {};
    headers.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const csv = body?.csv as string | undefined;
  if (!csv?.trim()) return NextResponse.json({ error: "No CSV provided." }, { status: 400 });

  const rows = parseCsv(csv);
  let created = 0;
  const errors: string[] = [];

  for (const [i, row] of rows.entries()) {
    const lineNum = i + 2; // account for header row
    const clientName = row.clientName?.trim();
    const dueDate = row.dueDate?.trim();
    if (!clientName) {
      errors.push(`Line ${lineNum}: missing clientName, skipped.`);
      continue;
    }
    if (!dueDate || isNaN(Date.parse(dueDate))) {
      errors.push(`Line ${lineNum}: invalid or missing dueDate, skipped.`);
      continue;
    }
    const type = VALID_TYPES.includes(row.deadlineType) ? row.deadlineType : "Other";

    await prisma.case.create({
      data: {
        firmId: session.firmId,
        clientName,
        caseNumber: row.caseNumber || null,
        court: row.court || null,
        deadlines: {
          create: { type, dueDate: new Date(dueDate), notes: row.notes || null },
        },
      },
    });
    created += 1;
  }

  await prisma.activityLog.create({
    data: { firmId: session.firmId, userId: session.userId, action: "cases.imported", detail: `${created} case(s)` },
  });

  return NextResponse.json({ created, errors });
}
