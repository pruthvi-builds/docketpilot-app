"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewCasePage() {
  const router = useRouter();
  const [form, setForm] = useState({ clientName: "", caseNumber: "", court: "", caseType: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [csvText, setCsvText] = useState("");
  const [importResult, setImportResult] = useState<{ created: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (!res.ok) {
      setError("Could not create case. Please check the fields.");
      return;
    }
    const data = await res.json();
    router.push(`/dashboard/cases/${data.id}`);
  }

  async function onImport() {
    setImporting(true);
    setImportResult(null);
    const res = await fetch("/api/cases/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ csv: csvText }),
    });
    const data = await res.json();
    setImporting(false);
    setImportResult(data);
    if (res.ok) router.refresh();
  }

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">New Case</h1>
        <p className="text-sm text-slate-500">Add a single case, then attach deadlines from the case page.</p>
        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-lg p-6 space-y-3">
          <Field label="Client Name" value={form.clientName} onChange={(v) => setForm({ ...form, clientName: v })} required />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Case Number" value={form.caseNumber} onChange={(v) => setForm({ ...form, caseNumber: v })} />
            <Field label="Court" value={form.court} onChange={(v) => setForm({ ...form, court: v })} />
          </div>
          <Field label="Case Type" value={form.caseType} onChange={(v) => setForm({ ...form, caseType: v })} placeholder="e.g. Family, Civil, Probate" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-md">
            {saving ? "Creating..." : "Create Case"}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-bold text-slate-900">Bulk import from CSV</h2>
        <p className="text-sm text-slate-500">
          Columns: <code className="bg-slate-100 px-1 rounded">clientName, caseNumber, court, deadlineType, dueDate (YYYY-MM-DD), notes</code>.
          First row must be the header.
        </p>
        <div className="mt-3 bg-white border border-slate-200 rounded-lg p-6 space-y-3">
          <textarea
            rows={6}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder={"clientName,caseNumber,court,deadlineType,dueDate,notes\nJane Doe,2026-CV-1042,Superior Court,Filing Deadline,2026-08-15,"}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
          />
          <button
            onClick={onImport}
            disabled={importing || !csvText.trim()}
            className="bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-md"
          >
            {importing ? "Importing..." : "Import CSV"}
          </button>
          {importResult && (
            <div className="text-sm mt-2">
              <p className="text-green-700 font-medium">{importResult.created} case(s) imported.</p>
              {importResult.errors?.length > 0 && (
                <ul className="text-red-600 mt-1 list-disc list-inside">
                  {importResult.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
      />
    </div>
  );
}
