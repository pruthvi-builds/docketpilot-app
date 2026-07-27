"use client";
import Link from "next/link";
import { useState } from "react";

type Steps = {
  hasCase: boolean;
  hasDeadline: boolean;
  hasDocument: boolean;
  hasTeammate: boolean;
};

export default function OnboardingChecklist({ steps }: { steps: Steps }) {
  const [dismissed, setDismissed] = useState(false);
  const allDone = steps.hasCase && steps.hasDeadline && steps.hasDocument && steps.hasTeammate;

  if (dismissed || allDone) return null;

  async function dismiss() {
    setDismissed(true);
    await fetch("/api/firm/onboarding", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dismissed: true }),
    });
  }

  const items = [
    { done: steps.hasCase, label: "Add your first case", href: "/dashboard/cases/new" },
    { done: steps.hasDeadline, label: "Add a deadline to it", href: "/dashboard/cases" },
    { done: steps.hasDocument, label: "Upload a document", href: "/dashboard/cases" },
    { done: steps.hasTeammate, label: "Invite a teammate", href: "/dashboard/settings" },
  ];

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold text-slate-900">Getting started</h2>
          <p className="text-sm text-slate-500 mt-0.5">A few quick steps to get the most out of DocketPilot.</p>
        </div>
        <button onClick={dismiss} className="text-xs text-slate-400 hover:text-slate-600 shrink-0">
          Dismiss
        </button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-2 text-sm px-3 py-2 rounded-md border ${
              item.done
                ? "bg-white border-green-200 text-slate-400 line-through"
                : "bg-white border-slate-200 text-slate-700 hover:border-indigo-300"
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                item.done ? "bg-green-500 text-white" : "border border-slate-300"
              }`}
            >
              {item.done ? "✓" : ""}
            </span>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
