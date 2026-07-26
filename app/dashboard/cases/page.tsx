import Link from "next/link";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function CasesPage() {
  const session = await getSession();
  const cases = await prisma.case.findMany({
    where: { firmId: session!.firmId },
    include: { _count: { select: { deadlines: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Cases</h1>
          <p className="text-sm text-slate-500">{cases.length} case{cases.length === 1 ? "" : "s"} on file.</p>
        </div>
        <Link
          href="/dashboard/cases/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-md"
        >
          + New Case
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg divide-y divide-slate-100">
        {cases.map((c) => (
          <Link
            key={c.id}
            href={`/dashboard/cases/${c.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
          >
            <div>
              <div className="font-medium text-slate-900">{c.clientName}</div>
              <div className="text-xs text-slate-500">
                {c.court || "—"} {c.caseNumber ? `· #${c.caseNumber}` : ""} · {c._count.deadlines} deadline
                {c._count.deadlines === 1 ? "" : "s"}
              </div>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                c.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {c.status}
            </span>
          </Link>
        ))}
        {cases.length === 0 && <div className="px-4 py-10 text-center text-slate-400">No cases yet.</div>}
      </div>
    </div>
  );
}
