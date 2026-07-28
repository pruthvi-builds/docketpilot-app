"use client";
import { useState } from "react";

export default function EnterpriseWaitlistForm() {
  const [firmName, setFirmName] = useState("");
  const [email, setEmail] = useState("");
  const [firmSize, setFirmSize] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    setError("");
    try {
      const res = await fetch("/api/enterprise-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmName, email, firmSize }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.error || "Something went wrong — try again.");
        setStatus("error");
        return;
      }
      setStatus("done");
    } catch {
      setError("Something went wrong — try again.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 text-center">
        <p className="font-semibold text-slate-900">You&apos;re on the list.</p>
        <p className="text-sm text-slate-500 mt-1">We&apos;ll reach out when Enterprise is ready.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 grid sm:grid-cols-3 gap-3">
      <input
        required
        placeholder="Firm name"
        value={firmName}
        onChange={(e) => setFirmName(e.target.value)}
        className="px-3 py-2.5 border border-slate-300 rounded-md text-sm"
      />
      <input
        required
        type="email"
        placeholder="Work email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-3 py-2.5 border border-slate-300 rounded-md text-sm"
      />
      <select
        value={firmSize}
        onChange={(e) => setFirmSize(e.target.value)}
        className="px-3 py-2.5 border border-slate-300 rounded-md text-sm text-slate-600"
      >
        <option value="">Firm size (optional)</option>
        <option>11–50 attorneys</option>
        <option>51–200 attorneys</option>
        <option>200+ attorneys</option>
      </select>
      <button
        disabled={status === "saving"}
        className="sm:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-md transition disabled:opacity-50"
      >
        {status === "saving" ? "Joining..." : "Join the Enterprise waitlist"}
      </button>
      {error && <p className="sm:col-span-3 text-sm text-red-600">{error}</p>}
    </form>
  );
}
