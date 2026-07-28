"use client";

type Stats = { total: number; completed: number; overdueOpen: number; upcoming30: number };
type OnTime = { rate: number | null; sampleSize: number };
type LogEntry = { id: string; label: string; detail: string | null; userName: string; createdAt: string };

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function CertificateView({
  firmName,
  generatedAt,
  firmSince,
  stats,
  onTime,
  reminderDays,
  logs,
}: {
  firmName: string;
  generatedAt: string;
  firmSince: string;
  stats: Stats;
  onTime: OnTime;
  reminderDays: string[];
  logs: LogEntry[];
}) {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : null;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compliance Certificate</h1>
          <p className="text-sm text-slate-500">
            A record of your firm&apos;s deadline-tracking activity — useful for malpractice-insurance renewals or showing clients how dates are managed.
          </p>
        </div>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-md shrink-0"
        >
          Download / Print PDF
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="text-center border-b border-slate-200 pb-6 mb-6 print:border-slate-900">
          <div className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-1">DocketPilot</div>
          <h2 className="text-2xl font-bold text-slate-900">Deadline Compliance Certificate</h2>
          <p className="text-sm text-slate-500 mt-1">{firmName}</p>
          <p className="text-xs text-slate-400 mt-1">Generated {fmtDateTime(generatedAt)}</p>
        </div>

        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Tracking summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="border border-slate-200 rounded-md py-3">
              <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              <div className="text-xs text-slate-500">Deadlines tracked</div>
            </div>
            <div className="border border-slate-200 rounded-md py-3">
              <div className="text-2xl font-bold text-slate-900">{completionRate !== null ? `${completionRate}%` : "—"}</div>
              <div className="text-xs text-slate-500">Marked complete</div>
            </div>
            <div className="border border-slate-200 rounded-md py-3">
              <div className={`text-2xl font-bold ${stats.overdueOpen > 0 ? "text-red-600" : "text-slate-900"}`}>{stats.overdueOpen}</div>
              <div className="text-xs text-slate-500">Overdue &amp; open</div>
            </div>
            <div className="border border-slate-200 rounded-md py-3">
              <div className="text-2xl font-bold text-slate-900">{stats.upcoming30}</div>
              <div className="text-xs text-slate-500">Due in next 30 days</div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Firm has used DocketPilot since {fmtDate(firmSince)}.</p>
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">On-time completion rate</h3>
          {onTime.rate !== null ? (
            <p className="text-sm text-slate-700">
              <span className="text-xl font-bold text-slate-900">{onTime.rate}%</span> of deadlines with a recorded completion date
              ({onTime.sampleSize} total) were marked done on or before their due date.
            </p>
          ) : (
            <p className="text-sm text-slate-500">
              Not enough data yet — this rate is calculated from completion timestamps recorded going forward, not backfilled from history.
            </p>
          )}
        </section>

        <section className="mb-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Automatic reminder configuration</h3>
          <p className="text-sm text-slate-700">
            {reminderDays.length > 0
              ? `Every tracked deadline automatically emails the assigned team at ${reminderDays.join(", ")} day(s) before it is due.`
              : "No automatic reminder schedule is currently configured."}
          </p>
        </section>

        <section>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500 mb-3">Audit trail (most recent {logs.length})</h3>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500">No activity recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100 text-sm">
              {logs.map((l) => (
                <div key={l.id} className="py-2 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium text-slate-900">{l.userName}</span>{" "}
                    <span className="text-slate-600">{l.label}</span>
                    {l.detail && <span className="text-slate-400"> · {l.detail}</span>}
                  </div>
                  <span className="text-xs text-slate-400 shrink-0">{fmtDateTime(l.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="border-t border-slate-200 mt-8 pt-4 text-xs text-slate-400">
          This certificate reflects DocketPilot&apos;s software records only. It is not a legal opinion, a guarantee of compliance with any
          court rule, or insurance advice — consult your malpractice carrier or counsel on how to use it.
        </div>
      </div>
    </div>
  );
}
