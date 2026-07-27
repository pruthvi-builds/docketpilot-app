// Rules-based deadline calculator — DocketPilot's core differentiator vs.
// manual-entry-only competitors. Pick a trigger event + date, get a
// pre-populated list of the deadlines that typically flow from it.
//
// IMPORTANT: These are informational starting points based on well-established
// federal rules (or common practice, clearly labeled as such below). They are
// NOT a substitute for checking your court's local rules, standing orders, or
// scheduling order. Every rule set below carries a jurisdictionNote surfaced
// in the UI for exactly this reason.

export type DeadlineKind =
  | "Filing Deadline"
  | "Hearing Date"
  | "Statute of Limitations"
  | "Discovery Cutoff"
  | "Other";

export type RuleDeadline = {
  key: string;
  label: string;
  type: DeadlineKind;
  offsetDays: number; // signed: negative = before trigger date, positive = after
  notes: string;
};

export type RuleSet = {
  id: string;
  label: string;
  triggerLabel: string;
  jurisdictionNote: string;
  deadlines: RuleDeadline[];
};

export const RULE_SETS: RuleSet[] = [
  {
    id: "frcp_complaint_served",
    label: "Federal Civil — Complaint Served on Defendant",
    triggerLabel: "Date the summons and complaint were served",
    jurisdictionNote:
      "Based on the Federal Rules of Civil Procedure. Confirm against your court's local rules — many states use similar but not identical periods.",
    deadlines: [
      {
        key: "answer_standard",
        label: "Answer / Rule 12 Response Due",
        type: "Filing Deadline",
        offsetDays: 21,
        notes: "FRCP 12(a)(1)(A)(i): 21 days after being served with the summons and complaint.",
      },
      {
        key: "answer_waiver",
        label: "Answer Due — if service was waived (Rule 4(d))",
        type: "Filing Deadline",
        offsetDays: 60,
        notes: "FRCP 12(a)(1)(A)(ii): 60 days after the request for waiver was sent (90 days if defendant is outside any U.S. judicial district).",
      },
    ],
  },
  {
    id: "frcp_26f_conference",
    label: "Federal Civil — Rule 26(f) Conference Held",
    triggerLabel: "Date of the Rule 26(f) discovery conference",
    jurisdictionNote:
      "Based on the Federal Rules of Civil Procedure. Confirm the court hasn't set a different date by scheduling order.",
    deadlines: [
      {
        key: "initial_disclosures",
        label: "Initial Disclosures Due",
        type: "Discovery Cutoff",
        offsetDays: 14,
        notes: "FRCP 26(a)(1)(C): within 14 days after the parties' Rule 26(f) conference, unless the court orders otherwise.",
      },
    ],
  },
  {
    id: "discovery_request_served",
    label: "Discovery Request Served (Interrogatories / RFP / RFA)",
    triggerLabel: "Date discovery requests were served on the other party",
    jurisdictionNote:
      "Based on FRCP 33, 34, and 36. Many states mirror this 30-day period, but confirm your jurisdiction's local rules.",
    deadlines: [
      {
        key: "discovery_response",
        label: "Discovery Responses Due",
        type: "Discovery Cutoff",
        offsetDays: 30,
        notes: "FRCP 33(b)(2), 34(b)(2)(A), 36(a)(3): 30 days after service (33 days if served by mail, per Rule 6(d)).",
      },
    ],
  },
  {
    id: "trial_date_set",
    label: "Trial Date Set — Common Pretrial Checklist",
    triggerLabel: "Scheduled trial date",
    jurisdictionNote:
      "Pretrial deadlines are usually fixed by the judge's scheduling order and vary a lot by court. Treat these as a starting checklist, not authoritative dates — always reconcile against your actual scheduling order.",
    deadlines: [
      {
        key: "dispositive_motions",
        label: "Dispositive Motion Deadline (suggested)",
        type: "Filing Deadline",
        offsetDays: -60,
        notes: "Common federal practice sets dispositive motion deadlines around 60 days before trial — confirm your scheduling order.",
      },
      {
        key: "pretrial_disclosures",
        label: "Pretrial Disclosures Due",
        type: "Filing Deadline",
        offsetDays: -30,
        notes: "FRCP 26(a)(3)(B): unless the court orders otherwise, at least 30 days before trial.",
      },
      {
        key: "motions_in_limine",
        label: "Motions in Limine Deadline (suggested)",
        type: "Filing Deadline",
        offsetDays: -14,
        notes: "Common practice, not a fixed rule — confirm your court's standing order.",
      },
    ],
  },
  {
    id: "custom_blank",
    label: "Custom — Start Blank",
    triggerLabel: "Trigger date",
    jurisdictionNote: "Add your own deadlines relative to a trigger date, then adjust each one before saving.",
    deadlines: [],
  },
];

export function addDays(dateStr: string, days: number): string {
  // Parse and mutate in UTC explicitly so the result doesn't shift by a day
  // depending on the browser's local timezone offset.
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

export function getRuleSet(id: string): RuleSet | undefined {
  return RULE_SETS.find((r) => r.id === id);
}
