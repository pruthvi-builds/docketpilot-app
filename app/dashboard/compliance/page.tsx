import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import CertificateView from "./CertificateView";

const ACTION_LABELS: Record<string, string> = {
  "case.created": "created a case",
  "case.updated": "updated a case",
  "case.deleted": "deleted a case",
  "deadline.created": "added a deadline",
  "deadline.updated": "updated a deadline",
  "deadline.deleted": "deleted a deadline",
  "reminder.sent": "sent a reminder email",
  "task.created": "added a task",
  "task.updated": "updated a task",
  "task.deleted": "deleted a task",
  "document.uploaded": "uploaded a document",
  "document.deleted": "deleted a document",
  "team.invited": "invited a team member",
};

export default async function CompliancePage() {
  const session = await getSession();
  const firmId = session!.firmId;

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [firm, deadlines, recentLogs, users] = await Promise.all([
    prisma.firm.findUnique({ where: { id: firmId } }),
    prisma.deadline.findMany({
      where: { case: { firmId } },
      select: { dueDate: true, completed: true, completedAt: true },
    }),
    prisma.activityLog.findMany({
      where: { firmId },
      orderBy: { createdAt: "desc" },
      take: 15,
    }),
    prisma.user.findMany({ where: { firmId }, select: { id: true, name: true } }),
  ]);
  if (!firm) return null;

  const userMap = new Map(users.map((u) => [u.id, u.name]));

  const total = deadlines.length;
  const completed = deadlines.filter((d) => d.completed).length;
  const overdueOpen = deadlines.filter((d) => !d.completed && d.dueDate < now).length;
  const upcoming30 = deadlines.filter((d) => !d.completed && d.dueDate >= now && d.dueDate <= in30).length;

  // On-time rate is only computed from deadlines where we actually captured a
  // completion timestamp (completedAt). Deadlines completed before this
  // feature shipped won't have one, so they're excluded rather than guessed at
  // — the certificate says so explicitly instead of showing a fabricated rate.
  const withCompletionTime = deadlines.filter((d) => d.completed && d.completedAt);
  const onTime = withCompletionTime.filter((d) => d.completedAt! <= d.dueDate).length;
  const onTimeRate = withCompletionTime.length > 0 ? Math.round((onTime / withCompletionTime.length) * 100) : null;

  const reminderDays = firm.reminderDaysBefore
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const logs = recentLogs.map((l) => ({
    id: l.id,
    label: ACTION_LABELS[l.action] || l.action,
    detail: l.detail,
    userName: l.userId ? userMap.get(l.userId) || "A team member" : "System",
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <CertificateView
      firmName={firm.name}
      generatedAt={now.toISOString()}
      firmSince={firm.createdAt.toISOString()}
      stats={{ total, completed, overdueOpen, upcoming30 }}
      onTime={{ rate: onTimeRate, sampleSize: withCompletionTime.length }}
      reminderDays={reminderDays}
      logs={logs}
    />
  );
}
