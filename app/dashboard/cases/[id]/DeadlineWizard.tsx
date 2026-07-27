"use client";
import { useEffect, useMemo, useState } from "react";
import { RULE_SETS, addDays, getRuleSet } from "@/lib/deadlineRules";

type Deadline = { id: string; type: string; dueDate: string; notes: string | null; completed: boolean };

type WizardRow = {
  key: string;
  label: string;
  type: string;
  dueDate: string;
  notes: string;
  include: boolean;
};

export default function DeadlineWizard({
  caseId,
  onCreated,
  onClose,
}: {
  caseId: string;
  onCreated: (created: Deadline[]) => void;
  onClose: () => void;
}) {
  const [ruleSetId, setRuleSetId] = useState(RULE_SETS[0].id);
  const [triggerDate, setTriggerDate] = useState("");
  const [rows, setRows] = useState<WizardRow[]>([]);
  const [conflicts, setConflicts] = useState<Record<string, { clientName: string; type: string }[]>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const ruleSet = useMemo(() => getRuleSet(ruleSetId), [ruleSetId]);

  // Recompute rows whenever the rule set or trigger date changes.
  useEffect(() => {
    if (!ruleSet) return;
    if (!triggerDate) {
      setRows(
        ruleSet.deadlines.map((d) => ({
          key: d.key,
          label: d.label,
          type: d.type,
          dueDate: "",
          notes: d.notes,
          include: true,
        }))
      );
      return;
    }
    setRows(
      ruleSet.deadlines.map((d) => ({
        key: d.key,
        label: d.label,
        type: d.type,
        dueDate: addDays(triggerDate, d.offsetDays),
        notes: d.notes,
        include: true,
      }))
    );
  }, [ruleSetId, triggerDate, ruleSet]);

  // Debounced firm-wide conflict check across the currently-included dates.
  useEffect(() => {
    const dates = Array.from(new Set(rows.filter((r) => r.include && r.dueDate).map((r) => r.dueDate)));
    if (dates.length === 0) {
      setConflicts({});
      return;
    }
    const t = setTimeout(async () => {
      const res = await fetch(
        `/api/deadlines/conflicts?dates=${encodeURIComponent(dates.join(","))}&excludeCaseId=${caseId}`
      );
      if (res.ok) {
        const data = await res.json();
        setConflicts(data.conflicts || {});
      }
    }, 300);
    return () => clearTimeout(t);
  }, [rows, caseId]);

  function updateRow(key: string, patch: Partial<WizardRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addBlankRow() {
    setRows((prev) => [
      ...prev,
      { key: `custom_${prev.length}_${Date.now()}`, label: "Custom deadline", type: "Other", dueDate: triggerDate || "", notes: "", include: true },
    ]);
  }

  async function onSave() {
    const included = rows.filter((r) => r.include && r.dueDate);
    if (included.length === 0) {
      setError("Select at least one deadline with a date.");
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
          deadlines: included.map((r) => ({ type: r.type, dueDate: r.dueDate, notes: `${r.label}${r.notes ? " — " + r.notes : ""}` })),
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
          <h3 className="text-lg font-bold text-slate-900">Deadline Wizard</h3>
          <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Auto-calculate</span>
        </div>
        <p className="text-sm text-slate-500 mb-4">
          Pick a trigger event and one date — DocketPilot fills in the deadlines that typically follow, based on federal court rules.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
          <div>
            <label className="text-xs font-medium text-slate-600">Trigger event</label>
            <select
              value={ruleSetId}
              onChange={(e) => setRuleSetId(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              {RULE_SETS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">{ruleSet?.triggerLabel || "Trigger date"}</label>
            <input
              type="date"
              value={triggerDate}
              onChange={(e) => setTriggerDate(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
          </div>
        </div>

        {ruleSet?.jurisdictionNote && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-4">
            ⚠ {ruleSet.jurisdictionNote}
          </p>
        )}

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
                    <span className="font-medium text-sm text-slate-900">{row.label}</span>
                    <select
                      value={row.type}
                      onChange={(e) => updateRow(row.key, { type: e.target.value })}
                      className="text-xs border border-slate-300 rounded px-1.5 py-0.5"
                    >
                      {["Filing Deadline", "Hearing Date", "Statute of Limitations", "Discovery Cutoff", "Other"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  {row.notes && <p className="text-xs text-slate-400 mt-1">{row.notes}</p>}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="date"
                      value={row.dueDate}
                      onChange={(e) => updateRow(row.key, { dueDate: e.target.value })}
                      className="px-2 py-1 border border-slate-300 rounded-md text-sm"
                    />
                    {row.dueDate && conflicts[row.dueDate] && (
                      <span className="text-xs text-red-600">
                        {conflicts[row.dueDate].length} other deadline(s) on this date
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No deadlines in this set yet — add one below.</p>}
        </div>

        <button onClick={addBlankRow} className="text-xs px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 mb-4">
          + Add another deadline
        </button>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-md text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : `Add ${rows.filter((r) => r.include && r.dueDate).length} deadline(s)`}
          </button>
        </div>
      </div>
    </div>
  );
}
