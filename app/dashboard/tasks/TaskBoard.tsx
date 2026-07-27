"use client";
import { useMemo, useState } from "react";

type Task = {
  id: string;
  title: string;
  priority: string;
  dueDate: string | null;
  done: boolean;
  caseId: string | null;
  caseName: string | null;
};
type CaseOption = { id: string; clientName: string };

const PRIORITY_STYLES: Record<string, string> = {
  HIGH: "bg-red-100 text-red-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  LOW: "bg-slate-100 text-slate-600",
};

export default function TaskBoard({ initialTasks, caseOptions }: { initialTasks: Task[]; caseOptions: CaseOption[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [saving, setSaving] = useState(false);
  const [hideDone, setHideDone] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "MEDIUM", dueDate: "", caseId: "" });

  const visible = useMemo(() => (hideDone ? tasks.filter((t) => !t.done) : tasks), [tasks, hideDone]);

  function openAdd() {
    setEditing(null);
    setForm({ title: "", priority: "MEDIUM", dueDate: "", caseId: "" });
    setModalOpen(true);
  }
  function openEdit(t: Task) {
    setEditing(t);
    setForm({ title: t.title, priority: t.priority, dueDate: t.dueDate || "", caseId: t.caseId || "" });
    setModalOpen(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch("/api/tasks/" + editing.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, priority: form.priority, dueDate: form.dueDate || null }),
        });
        if (res.ok) {
          const updated = await res.json();
          setTasks((prev) => prev.map((t) => (t.id === editing.id ? { ...t, ...updated, caseName: t.caseName } : t)));
        }
      } else {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: form.title, priority: form.priority, dueDate: form.dueDate || null, caseId: form.caseId || null }),
        });
        if (res.ok) {
          const created = await res.json();
          const caseName = caseOptions.find((c) => c.id === created.caseId)?.clientName || null;
          setTasks((prev) => [{ ...created, caseName }, ...prev]);
        }
      }
      setModalOpen(false);
    } finally {
      setSaving(false);
    }
  }

  async function toggleDone(t: Task) {
    const res = await fetch("/api/tasks/" + t.id, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !t.done }),
    });
    if (res.ok) setTasks((prev) => prev.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)));
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this task?")) return;
    const res = await fetch("/api/tasks/" + id, { method: "DELETE" });
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          Hide completed
        </label>
        <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2.5 rounded-md">
          + Add Task
        </button>
      </div>

      <div className="space-y-2">
        {visible.map((t) => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <input type="checkbox" checked={t.done} onChange={() => toggleDone(t)} className="w-4 h-4 shrink-0" />
              <div className="min-w-0">
                <div className={"font-medium truncate " + (t.done ? "line-through text-slate-400" : "text-slate-900")}>{t.title}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {t.caseName ? t.caseName + " · " : ""}
                  {t.dueDate || "No due date"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + PRIORITY_STYLES[t.priority]}>{t.priority}</span>
              <button onClick={() => openEdit(t)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
                Edit
              </button>
              <button onClick={() => onDelete(t.id)} className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
        {visible.length === 0 && (
          <div className="text-center py-16 text-slate-400 border border-dashed border-slate-300 rounded-lg">
            No tasks. Click &quot;Add Task&quot; to get started.
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editing ? "Edit Task" : "Add Task"}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600">Title</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm" />
              </div>
              {!editing && (
                <div>
                  <label className="text-xs font-medium text-slate-600">Link to case (optional)</label>
                  <select value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm">
                    <option value="">— None —</option>
                    {caseOptions.map((c) => (
                      <option key={c.id} value={c.id}>{c.clientName}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Due date (optional)</label>
                  <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm" />
                </div>
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
