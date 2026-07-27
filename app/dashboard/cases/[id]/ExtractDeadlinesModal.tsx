"use client";
import { useEffect, useMemo, useState } from "react";
import { extractDeadlines, ExtractedDeadline } from "@/lib/deadlineExtract";

type Deadline = { id: string; type: string; dueDate: string; notes: string | null; completed: boolean };

const DEADLINE_TYPES = ["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"];

type Row = ExtractedDeadline & { type: string; include: boolean };

export default function ExtractDeadlinesModal({
  caseId,
  onCreated,
  onClose,
}: {
  caseId: string;
  onCreated: (created: Deadline[]) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, { clientName: string; type: string }[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function scan() {
    const found = extractDeadlines(text);
    setRows(found.map((f) => ({ ...f, type: f.typeGuess, include: true })));
    setError("");
  }

  const includedDates = useMemo(
    () => Array.from(new Set((rows || []).filter((r) => r.include).map((r) => r.dueDate))),
    [rows]
  );

  useEffect(() => {
    if (includedDates.length === 0) {
      setConflicts({});
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/deadlines/conflicts?dates=${encodeURIComponent(includedDates.join(","))}&excludeCaseId=${caseId}`
      );
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.conflicts || {});
      }
    }, 300);
    return () => clearTimeout(t);
  }, [includedDates, caseId]);

  function updateRow(key: string, patch: Partial<Row>) {
    setRows((prev) => (prev ? prev.map((r) => (r.key === key ? { ...r, ...patch } : r)) : prev));
  }

  async function onSave() {
    const included = (rows || []).filter((r) => r.include);
    if (included.length === 0) {
      setError("Select at least one deadline to add.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/deadlines/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          deadlines: included.map((r) => ({
            type: r.type,
            dueDate: r.dueDate,
            notes: `Auto-extracted from pasted text — verify against the source document. "${r.rawMatch}" in: ${r.context}`,
          })),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Could not create deadlines.");
        return;
      }
      const created = await res.json();
      onCreated(created);
      onClose();
    } finally {
      setSaving(false);
    }
  }

  const totalConflicts = Object.keys(conflicts).length;

  return (
    <div className="fixed inset-0 bg-slate-900/55 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-bold text-slate-900">Extract Deadlines from Text</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Beta</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Paste the text of a court order, notice, or scheduling letter — DocketPilot scans it for dates and
          suggests deadlines. Nothing is saved until you review and confirm each one below.
        </p>

        {!rows && (
          <>
            <textarea
              rows={9}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={'Paste text here, e.g.:\n"Defendant\'s Answer is due on August 4, 2026. A case management conference is scheduled for July 30, 2026."'}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm font-mono"
            />
            <div className="flex justify-end gap-2 pt-4">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100">
                Cancel
              </button>
              <button
                onClick={scan}
                disabled={!text.trim()}
                className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
              >
                Scan for dates
              </button>
            </div>
          </>
        )}

        {rows && (
          <>
            {rows.length === 0 ? (
              <div className="text-center py-8 text-slate-400 border border-dashed border-slate-300 rounded-lg mb-4">
                No dates found in that text. Try pasting a section that includes a date like &quot;July 30, 2026&quot; or &quot;07/30/2026&quot;.
              </div>
            ) : (
              <>
                {totalConflicts > 0 && (
                  <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2 mb-4">
                    ⚠ {totalConflicts} of these date(s) already have other deadlines on your firm calendar — check for overload before saving.
                  </p>
                )}
                <div className="space-y-2 mb-4">
                  {rows.map((row) => (
                    <div key={row.key} className="border border-slate-200 rounded-md p-3">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={row.include}
                          onChange={(e) => updateRow(row.key, { include: e.target.checked })}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-medium text-sm text-slate-900">{row.dueDate}</span>
                            <select
                              value={row.type}
                              onChange={(e) => updateRow(row.key, { type: e.target.value })}
                              className="text-xs border border-slate-300 rounded px-1.5 py-0.5"
                            >
                              {DEADLINE_TYPES.map((t) => (
                                <option key={t}>{t}</option>
                              ))}
                            </select>
                            {conflicts[row.dueDate] && (
                              <span className="text-xs text-red-600">
                                {conflicts[row.dueDate].length} other deadline(s) this day
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1 italic">&quot;...{row.context}...&quot;</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button onClick={() => setRows(null)} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100">
                ← Paste different text
              </button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100">
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving || rows.length === 0}
                  className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-40"
                >
                  {saving ? "Saving..." : `Add ${rows.filter((r) => r.include).length} deadline(s)`}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
