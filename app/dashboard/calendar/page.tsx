import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CalendarView from "./CalendarView";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { month?: string };
}) {
  const session = await getSession();
  const firmId = session!.firmId;

  const now = new Date();
  const monthParam = searchParams.month; // "YYYY-MM"
  const [y, m] = monthParam ? monthParam.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];

  const rangeStart = new Date(Date.UTC(y, m - 1, 1));
  const rangeEnd = new Date(Date.UTC(y, m, 1));

  const deadlines = await prisma.deadline.findMany({
    where: { case: { firmId }, dueDate: { gte: rangeStart, lt: rangeEnd } },
    include: { case: { select: { clientName: true } } },
    orderBy: { dueDate: "asc" },
  });

  const events = deadlines.map((d) => ({
    id: d.id,
    caseId: d.caseId,
    date: d.dueDate.toISOString().slice(0, 10),
    label: d.case.clientName + " — " + d.type,
    completed: d.completed,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Calendar</h1>
        <p className="text-sm text-slate-500">Every deadline across your firm, laid out by day.</p>
      </div>
      <CalendarView year={y} month={m} events={events} />
    </div>
  );
}
