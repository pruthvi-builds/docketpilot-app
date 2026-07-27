import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() || "";
    if (q.length < 2) return NextResponse.json({ cases: [], deadlines: [], tasks: [] });

  const firmId = session.firmId;

  const [cases, deadlines, tasks] = await Promise.all([
        prisma.case.findMany({
                where: {
                          firmId,
                          OR: [
                            { clientName: { contains: q, mode: "insensitive" } },
                            { caseNumber: { contains: q, mode: "insensitive" } },
                            { court: { contains: q, mode: "insensitive" } },
                            { caseType: { contains: q, mode: "insensitive" } },
                                    ],
                },
                take: 8,
                select: { id: true, clientName: true, caseNumber: true, court: true, caseType: true, status: true },
        }),
        prisma.deadline.findMany({
                where: {
                          case: { firmId },
                          OR: [
                            { type: { contains: q, mode: "insensitive" } },
                            { notes: { contains: q, mode: "insensitive" } },
                                    ],
                },
                take: 8,
                include: { case: { select: { clientName: true } } },
                orderBy: { dueDate: "asc" },
        }),
        prisma.task.findMany({
                where: { firmId, title: { contains: q, mode: "insensitive" } },
                take: 8,
                include: { case: { select: { clientName: true } } },
        }),
      ]);

  return NextResponse.json({
        cases: cases.map((c) => ({
                id: c.id,
                label: c.clientName,
                sub: [c.court, c.caseNumber ? "#" + c.caseNumber : null, c.caseType].filter(Boolean).join(" - "),
                status: c.status,
        })),
        deadlines: deadlines.map((d) => ({
                id: d.id,
                caseId: d.caseId,
                label: d.type + " - " + d.case.clientName,
                sub: d.dueDate.toISOString().slice(0, 10) + (d.notes ? " - " + d.notes : ""),
        })),
        tasks: tasks.map((t) => ({
                id: t.id,
                caseId: t.caseId,
                label: t.title,
                sub: [t.case?.clientName, t.priority, t.done ? "Done" : null].filter(Boolean).join(" - "),
        })),
  });
}
