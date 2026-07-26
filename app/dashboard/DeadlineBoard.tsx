"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Deadline = {
  id: string;
  type: string;
  dueDate: string;
  notes: string | null;
  caseId: string;
  clientName: string;
  caseNumber: string | null;
  court: string | null;
};

type CaseOption = { id: string; clientName: string; caseNumber: string | null; court: string | null };

const DEADLINE_TYPES = ["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"];

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function urgency(dateStr: string) {
  const d = daysUntil(dateStr);
  if (d < 0) return { label: `Overdue by ${Math.abs(d)}d`, cls: "bg-red-100 text-red-800" };
  if (d === 0) return { label: "Due today", cls: "bg-red-100 text-red-800" };
  if (d <= 7) return { label: `Due in ${d}d`, cls: "bg-orange-100 text-orange-800" };
  if (d <= 30) return { label: `Due in ${d}d`, cls: "bg-yellow-100 text-yellow-800" };
  return { label: `Due in ${d}d`, cls: "bg-green-100 text-green-800" };
}

export default function DeadlineBoard({
  initialDeadlines,
  caseOptions,
}: {
  initialDeadlines: Deadline[];
  caseOptions: CaseOption[];
}) {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState(initialDeadlines);
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Deadline | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    caseId: "",
    caseNumber: "",
    court: "",
    type: DEADLINE_TYPES[0],
    dueDate: "",
    notes: "",
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return deadlines
      .filter(
        (d) =>
          !q ||
          d.clientName.toLowerCase().includes(q) ||
          (d.caseNumber || "").toLowerCase().includes(q) ||
          (d.court || "").toLowerCase().includes(q)
      )
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  }, [deadlines, query]);

  const stats = useMemo(() => {
    const overdue = deadlines.filter((d) => daysUntil(d.dueDate) < 0).length;
    const week = deadlines.filter((d) => { const n = daysUntil(d.dueDate); return n >= 0 && n <= 7; }).length;
    const month = deadlines.filter((d) => { const n = daysUntil(d.dueDate); return n > 7 && n <= 30; }).length;
    return { total: deadlines.length, overdue, week, month };
  }, [deadlines]);

  function openAdd() {
    setEditing(null);
    setForm({ clientName: "", caseId: "", caseNumber: "", court: "", type: DEADLINE_TYPES[0], dueDate: "", notes: "" });
    setModalOpen(true);
  }

  function openEdit(d: Deadline) {
    setEditing(d);
    setForm({
      clientName: d.clientName,
      caseId: d.caseId,
      caseNumber: d.caseNumber || "",
      court: d.court || "",
      type: d.type,
      dueDate: d.dueDate,
      notes: d.notes || "",
    });
    setModalOpen(true);
  }

  function onPickClientName(name: string) {
    const match = caseOptions.find((c) => c.clientName.toLowerCase() === name.toLowerCase());
    setForm((f) => ({
      ...f,
      clientName: name,
      caseId: match ? match.id : "",
      caseNumber: match ? match.caseNumber || "" : f.caseNumber,
      court: match ? match.court || "" : f.court,
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/deadlines/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: form.type, dueDate: form.dueDate, notes: form.notes }),
        });
        if (res.ok) {
          setDeadlines((prev) =>
            prev.map((d) => (d.id === editing.id ? { ...d, type: form.type, dueDate: form.dueDate, notes: form.notes } : d))
          );
        }
      } else {
        const res = await fetch("/api/deadlines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseId: form.caseId || undefined,
            newCase: form.caseId
              ? undefined
              : { clientName: form.clientName, caseNumber: form.caseNumber, court: form.court },
            type: form.type,
            dueDate: form.dueDate,
            notes: form.notes,
          }),
        });
        if (res.ok) {
          router.refresh();
        }
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this deadline?")) return;
    const res = await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
    if (res.ok) setDeadlines((prev) => prev.filter((d) => d.id !== id));
  }

  async function onComplete(id: string) {
    const res = await fetch(`/api/deadlines/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: true }),
    });
    if (res.ok) setDeadlines((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          onClick={openAdd}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-md"
        >
          + Add Deadline
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Stat label="Total tracked" value={stats.total} />
        <Stat label="Overdue" value={stats.overdue} cls="text-red-600" />
        <Stat label="Due in 7 days" value={stats.week} cls="text-orange-600" />
        <Stat label="Due in 30 days" value={stats.month} cls="text-yellow-600" />
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by client, case number, or court..."
        className="w-full mb-4 px-4 py-2.5 rounded-md border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
      />

      <div className="space-y-3">
        {filtered.map((d) => {
          const u = urgency(d.dueDate);
          return (
            <div
              key={d.id}
              className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-900">{d.clientName}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.cls}`}>{u.label}</span>
                </div>
                <div className="text-sm text-slate-500 mt-0.5">
                  {d.type} · {d.court || "—"} {d.caseNumber ? `· #${d.caseNumber}` : ""}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {d.dueDate}
                  {d.notes ? ` · ${d.notes}` : ""}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`/api/deadlines/${d.id}/ics`}
                  className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
                >
                  Add to calendar
                </a>
                <button onClick={() => onComplete(d.id)} className="text-xs px-3 py-1.5 rounded-md border border-green-200 text-green-700 hover:bg-green-50">
                  Mark done
                </button>
                <button onClick={() => openEdit(d)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
                  Edit
                </button>
                <button onClick={() => onDelete(d.id)} className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50">
                  Delete
                </button>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 border border-dashed border-slate-300 rounded-lg">
            No deadlines yet. Click &quot;Add Deadline&quot; to get started.
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 bg-slate-900/55 flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}
        >
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editing ? "Edit Deadline" : "Add Deadline"}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              {!editing && (
                <>
                  <div>
                    <label className="text-xs font-medium text-slate-600">Client Name</label>
                    <input
                      required
                      list="client-options"
                      value={form.clientName}
                      onChange={(e) => onPickClientName(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                      placeholder="Jane Doe (existing or new)"
                    />
                    <datalist id="client-options">
                      {caseOptions.map((c) => (
                        <option key={c.id} value={c.clientName} />
                      ))}
                    </datalist>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-slate-600">Case Number</label>
                      <input
                        value={form.caseNumber}
                        disabled={!!form.caseId}
                        onChange={(e) => setForm({ ...form, caseNumber: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-600">Court</label>
                      <input
                        value={form.court}
                        disabled={!!form.caseId}
                        onChange={(e) => setForm({ ...form, court: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100"
                      />
                    </div>
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Deadline Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    {DEADLINE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Date</label>
                  <input
                    required
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Notes</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100">
                  Cancel
                </button>
                <button disabled={saving} className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60">
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, cls }: { label: string; value: number; cls?: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4">
      <div className={`text-2xl font-bold ${cls || "text-slate-900"}`}>{value}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
