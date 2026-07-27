import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

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
  "team.invited": "invited a team member",
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const units: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
  ];
  let value = seconds;
  let unit = "second";
  for (const [size, name] of units) {
    if (value < size) break;
    value = Math.floor(value / size);
    unit = name;
  }
  return value <= 1 && unit === "second" ? "just now" : value + " " + unit + (value === 1 ? "" : "s") + " ago";
}

export default async function ActivityPage() {
  const session = await getSession();
  const firmId = session!.firmId;

  const [logs, users] = await Promise.all([
    prisma.activityLog.findMany({
      where: { firmId },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
    prisma.user.findMany({ where: { firmId }, select: { id: true, name: true } }),
  ]);

  const userMap = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Activity Log</h1>
        <p className="text-sm text-slate-500">Who changed what, and when — across your whole firm.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {logs.map((log) => (
          <div key={log.id} className="px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-slate-700">
              <span className="font-medium text-slate-900">
                {log.userId ? userMap.get(log.userId) || "A former team member" : "System"}
              </span>{" "}
              {ACTION_LABELS[log.action] || log.action}
              {log.detail ? <span className="text-slate-500"> · {log.detail}</span> : null}
            </div>
            <div className="text-xs text-slate-400 shrink-0">{timeAgo(log.createdAt)}</div>
          </div>
        ))}
        {logs.length === 0 && (
          <div className="px-4 py-10 text-center text-slate-400">No activity recorded yet.</div>
        )}
      </div>
    </div>
  );
}
