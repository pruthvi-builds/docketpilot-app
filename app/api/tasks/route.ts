import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tasks = await prisma.task.findMany({
        where: { firmId: session.firmId },
        include: { case: { select: { id: true, clientName: true } } },
        orderBy: [{ done: "asc" }, { dueDate: "asc" }],
  });

  return NextResponse.json(
        tasks.map((t) => ({
                id: t.id,
                title: t.title,
                priority: t.priority,
                dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
                done: t.done,
                caseId: t.caseId,
                caseName: t.case?.clientName || null,
        }))
      );
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
    if (!body?.title?.trim()) {
          return NextResponse.json({ error: "A title is required." }, { status: 400 });
    }
    const priority = VALID_PRIORITIES.includes(body.priority) ? body.priority : "MEDIUM";

  let caseId: string | null = null;
    if (body.caseId) {
          const owned = await prisma.case.findFirst({ where: { id: body.caseId, firmId: session.firmId } });
          if (!owned) return NextResponse.json({ error: "Case not found." }, { status: 404 });
          caseId = owned.id;
    }

  const task = await prisma.task.create({
        data: {
                firmId: session.firmId,
                caseId,
                title: body.title.trim(),
                priority,
                dueDate: body.dueDate ? new Date(body.dueDate) : null,
        },
  });

  await prisma.activityLog.create({
        data: { firmId: session.firmId, userId: session.userId, action: "task.created", detail: task.title },
  });

  return NextResponse.json({
        id: task.id,
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
        done: task.done,
        caseId: task.caseId,
        caseName: null,
  });
}
