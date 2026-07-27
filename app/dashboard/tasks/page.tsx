import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import TaskBoard from "./TaskBoard";

export default async function TasksPage() {
  const session = await getSession();
  const firmId = session!.firmId;

  const [tasks, cases] = await Promise.all([
    prisma.task.findMany({
      where: { firmId },
      include: { case: { select: { id: true, clientName: true } } },
      orderBy: [{ done: "asc" }, { dueDate: "asc" }],
    }),
    prisma.case.findMany({ where: { firmId, status: "OPEN" }, orderBy: { clientName: "asc" }, select: { id: true, clientName: true } }),
  ]);

  const initialTasks = tasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority,
    dueDate: t.dueDate ? t.dueDate.toISOString().slice(0, 10) : null,
    done: t.done,
    caseId: t.caseId,
    caseName: t.case?.clientName || null,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Tasks</h1>
        <p className="text-sm text-slate-500">Everyday to-dos, separate from hard court deadlines.</p>
      </div>
      <TaskBoard initialTasks={initialTasks} caseOptions={cases} />
    </div>
  );
}
