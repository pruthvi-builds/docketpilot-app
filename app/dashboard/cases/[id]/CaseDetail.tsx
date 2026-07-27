"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import DeadlineWizard from "./DeadlineWizard";
import ExtractDeadlinesModal from "./ExtractDeadlinesModal";

type Deadline = { id: string; type: string; dueDate: string; notes: string | null; completed: boolean };
type CaseDocument = { id: string; filename: string; size: number; uploadedAt: string };
type CaseData = {
  id: string;
  clientName: string;
  caseNumber: string | null;
  court: string | null;
  caseType: string | null;
  status: string;
  deadlines: Deadline[];
  documents: CaseDocument[];
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

const DEADLINE_TYPES = ["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"];

function daysUntil(dateStr: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export default function CaseDetail({ initialCase }: { initialCase: CaseData }) {
  const router = useRouter();
  const [data, setData] = useState(initialCase);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: DEADLINE_TYPES[0], dueDate: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [documents, setDocuments] = useState(initialCase.documents);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showWizard, setShowWizard] = useState(false);
  const [showExtract, setShowExtract] = useState(false);

  function openAdd() {
    setEditingId(null);
    setForm({ type: DEADLINE_TYPES[0], dueDate: "", notes: "" });
    setShowForm(true);
  }
  function openEdit(d: Deadline) {
    setEditingId(d.id);
    setForm({ type: d.type, dueDate: d.dueDate, notes: d.notes || "" });
    setShowForm(true);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        const res = await fetch(`/api/deadlines/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (res.ok) {
          setData((prev) => ({
            ...prev,
            deadlines: prev.deadlines.map((d) => (d.id === editingId ? { ...d, ...form } : d)),
          }));
        }
      } else {
        const res = await fetch("/api/deadlines", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caseId: data.id, ...form }),
        });
        if (res.ok) {
          const created = await res.json();
          setData((prev) => ({ ...prev, deadlines: [...prev.deadlines, created].sort((a, b) => a.dueDate.localeCompare(b.dueDate)) }));
        }
      }
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this deadline?")) return;
    const res = await fetch(`/api/deadlines/${id}`, { method: "DELETE" });
    if (res.ok) setData((prev) => ({ ...prev, deadlines: prev.deadlines.filter((d) => d.id !== id) }));
  }

  async function toggleComplete(d: Deadline) {
    const res = await fetch(`/api/deadlines/${d.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !d.completed }),
    });
    if (res.ok) {
      setData((prev) => ({
        ...prev,
        deadlines: prev.deadlines.map((x) => (x.id === d.id ? { ...x, completed: !x.completed } : x)),
      }));
    }
  }

  async function toggleCaseStatus() {
    const newStatus = data.status === "OPEN" ? "CLOSED" : "OPEN";
    const res = await fetch(`/api/cases/${data.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      setData((prev) => ({ ...prev, status: newStatus }));
      router.refresh();
    }
  }

  async function onDeleteCase() {
    if (!confirm(`Delete case for ${data.clientName}? This removes all its deadlines too.`)) return;
    const res = await fetch(`/api/cases/${data.id}`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/cases");
  }

  async function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    if (file.size > 4.5 * 1024 * 1024) {
      setUploadError("That file is over 4.5MB — too large to upload right now.");
      return;
    }
    setUploading(true);
    try {
      const res = await fetch(`/api/documents?caseId=${data.id}&filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (res.ok) {
        const doc = await res.json();
        setDocuments((prev) => [doc, ...prev]);
      } else {
        const body = await res.json().catch(() => null);
        setUploadError(body?.error || "Upload failed.");
      }
    } finally {
      setUploading(false);
    }
  }

  async function onDeleteDocument(id: string) {
    if (!confirm("Delete this document?")) return;
    const res = await fetch(`/api/documents/${id}`, { method: "DELETE" });
    if (res.ok) setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">{data.clientName}</h1>
          <p className="text-sm text-slate-500">
            {data.court || "—"} {data.caseNumber ? `· #${data.caseNumber}` : ""} {data.caseType ? `· ${data.caseType}` : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium h-fit ${data.status === "OPEN" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-600"}`}>
            {data.status}
          </span>
          <button onClick={toggleCaseStatus} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
            Mark {data.status === "OPEN" ? "Closed" : "Open"}
          </button>
          <button onClick={onDeleteCase} className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50">
            Delete Case
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-slate-900">Deadlines</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowWizard(true)} className="bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-sm font-semibold px-4 py-2 rounded-md">
            ⚡ Deadline Wizard
          </button>
          <button onClick={() => setShowExtract(true)} className="bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-sm font-semibold px-4 py-2 rounded-md">
            📋 Extract from Text
          </button>
          <button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-md">
            + Add Deadline
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {data.deadlines.map((d) => {
          const days = daysUntil(d.dueDate);
          const cls = d.completed
            ? "bg-slate-100 text-slate-500"
            : days < 0
            ? "bg-red-100 text-red-800"
            : days <= 7
            ? "bg-orange-100 text-orange-800"
            : days <= 30
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800";
          return (
            <div key={d.id} className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-900">{d.type}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${cls}`}>
                    {d.completed ? "Done" : days < 0 ? `Overdue by ${Math.abs(days)}d` : `Due in ${days}d`}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {d.dueDate}
                  {d.notes ? ` · ${d.notes}` : ""}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <a href={`/api/deadlines/${d.id}/ics`} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
                  Calendar
                </a>
                <button onClick={() => toggleComplete(d)} className="text-xs px-3 py-1.5 rounded-md border border-green-200 text-green-700 hover:bg-green-50">
                  {d.completed ? "Reopen" : "Mark done"}
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
        {data.deadlines.length === 0 && (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-300 rounded-lg">No deadlines on this case yet.</div>
        )}
      </div>

      <div className="flex justify-between items-center mb-3 mt-8">
        <h2 className="font-semibold text-slate-900">Documents</h2>
        <label className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-md cursor-pointer">
          {uploading ? "Uploading..." : "+ Upload Document"}
          <input type="file" className="hidden" onChange={onFileSelected} disabled={uploading} />
        </label>
      </div>
      {uploadError && <div className="text-sm text-red-600 mb-3">{uploadError}</div>}
      <div className="space-y-2">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white border border-slate-200 rounded-lg p-3 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="font-medium text-slate-900 truncate">{doc.filename}</div>
              <div className="text-xs text-slate-400 mt-0.5">
                {formatBytes(doc.size)} · uploaded {doc.uploadedAt.slice(0, 10)}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <a href={`/api/documents/${doc.id}/download`} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
                Download
              </a>
              <button onClick={() => onDeleteDocument(doc.id)} className="text-xs px-3 py-1.5 rounded-md border border-red-200 text-red-600 hover:bg-red-50">
                Delete
              </button>
            </div>
          </div>
        ))}
        {documents.length === 0 && (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-300 rounded-lg">No documents on this case yet.</div>
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Deadline" : "Add Deadline"}</h3>
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm">
                    {DEADLINE_TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">Date</label>
                  <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100">
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

      {showWizard && (
        <DeadlineWizard
          caseId={data.id}
          onClose={() => setShowWizard(false)}
          onCreated={(created) =>
            setData((prev) => ({
              ...prev,
              deadlines: [...prev.deadlines, ...created].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
            }))
          }
        />
      )}

      {showExtract && (
        <ExtractDeadlinesModal
          caseId={data.id}
          onClose={() => setShowExtract(false)}
          onCreated={(created) =>
            setData((prev) => ({
              ...prev,
              deadlines: [...prev.deadlines, ...created].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
            }))
          }
        />
      )}
    </div>
  );
}
