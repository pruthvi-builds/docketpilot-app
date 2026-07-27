import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import DeadlineBoard from "./DeadlineBoard";
import OnboardingChecklist from "./OnboardingChecklist";

export default async function DashboardPage() {
  const session = await getSession();
  const firmId = session!.firmId;

  const [deadlines, cases, firm, caseCount, deadlineCount, documentCount, userCount] = await Promise.all([
    prisma.deadline.findMany({
      where: { case: { firmId }, completed: false },
      include: { case: true },
      orderBy: { dueDate: "asc" },
    }),
    prisma.case.findMany({
      where: { firmId, status: "OPEN" },
      orderBy: { clientName: "asc" },
    }),
    prisma.firm.findUnique({ where: { id: firmId }, select: { onboardingDismissed: true } }),
    prisma.case.count({ where: { firmId } }),
    prisma.deadline.count({ where: { case: { firmId } } }),
    prisma.document.count({ where: { firmId } }),
    prisma.user.count({ where: { firmId } }),
  ]);

  const serializable = deadlines.map((d) => ({
    id: d.id,
    type: d.type,
    dueDate: d.dueDate.toISOString().slice(0, 10),
    notes: d.notes,
    caseId: d.caseId,
    clientName: d.case.clientName,
    caseNumber: d.case.caseNumber,
    court: d.case.court,
  }));

  const caseOptions = cases.map((c) => ({
    id: c.id,
    clientName: c.clientName,
    caseNumber: c.caseNumber,
    court: c.court,
  }));

  return (
    <div>
      {!firm?.onboardingDismissed && (
        <OnboardingChecklist
          steps={{
            hasCase: caseCount > 0,
            hasDeadline: deadlineCount > 0,
            hasDocument: documentCount > 0,
            hasTeammate: userCount > 1,
          }}
        />
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Your Deadlines</h1>
          <p className="text-sm text-slate-500">All key dates across every open case, soonest first.</p>
        </div>
      </div>
      <DeadlineBoard initialDeadlines={serializable} caseOptions={caseOptions} />
    </div>
  );
}
