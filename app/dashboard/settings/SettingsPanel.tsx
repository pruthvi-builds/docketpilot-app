"use client";
import { useState } from "react";
import PaddleCheckoutButton from "./PaddleCheckoutButton";

type Team = { id: string; name: string; email: string; role: string; createdAt: string }[];

export default function SettingsPanel({
  firm,
  team,
  isAdmin,
  userEmail,
}: {
  firm: { id: string; name: string; plan: string; reminderDaysBefore: string };
  team: Team;
  isAdmin: boolean;
  userEmail: string;
}) {
  const [firmName, setFirmName] = useState(firm.name);
  const [reminderDays, setReminderDays] = useState(firm.reminderDaysBefore);
  const [savingFirm, setSavingFirm] = useState(false);
  const [firmSaved, setFirmSaved] = useState(false);

  const [members, setMembers] = useState(team);
  const [inviteForm, setInviteForm] = useState({ name: "", email: "", role: "ATTORNEY" });
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ email: string; tempPassword: string } | null>(null);
  const [inviteError, setInviteError] = useState("");

  async function saveFirm(e: React.FormEvent) {
    e.preventDefault();
    setSavingFirm(true);
    setFirmSaved(false);
    const res = await fetch("/api/firm", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: firmName, reminderDaysBefore: reminderDays }),
    });
    setSavingFirm(false);
    if (res.ok) setFirmSaved(true);
  }

  async function invite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setInviteError("");
    setInviteResult(null);
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteForm),
    });
    const data = await res.json();
    setInviting(false);
    if (!res.ok) {
      setInviteError(data.error || "Could not add team member.");
      return;
    }
    setMembers((prev) => [...prev, { id: data.id, name: data.name, email: data.email, role: data.role, createdAt: new Date().toISOString() }]);
    setInviteResult({ email: data.email, tempPassword: data.tempPassword });
    setInviteForm({ name: "", email: "", role: "ATTORNEY" });
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500">Firm info, reminder schedule, team, and billing.</p>
      </div>

      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Firm &amp; Reminders</h2>
        <form onSubmit={saveFirm} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">Firm name</label>
            <input
              disabled={!isAdmin}
              value={firmName}
              onChange={(e) => setFirmName(e.target.value)}
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">Reminder days before due date</label>
            <input
              disabled={!isAdmin}
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
              placeholder="30,14,7,1"
              className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm disabled:bg-slate-100"
            />
            <p className="text-xs text-slate-400 mt-1">Comma-separated. An email goes out at each threshold.</p>
          </div>
          {isAdmin && (
            <button disabled={savingFirm} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md">
              {savingFirm ? "Saving..." : firmSaved ? "Saved ✓" : "Save changes"}
            </button>
          )}
        </form>
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="font-semibold text-slate-900 mb-4">Team</h2>
        <div className="divide-y divide-slate-100 mb-4">
          {members.map((m) => (
            <div key={m.id} className="py-2 flex items-center justify-between text-sm">
              <div>
                <span className="font-medium text-slate-900">{m.name}</span>{" "}
                <span className="text-slate-400">· {m.email}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{m.role}</span>
            </div>
          ))}
        </div>

        {isAdmin && (
          <form onSubmit={invite} className="grid sm:grid-cols-4 gap-2 items-end">
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-slate-600">Name</label>
              <input
                required
                value={inviteForm.name}
                onChange={(e) => setInviteForm({ ...inviteForm, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="sm:col-span-1">
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                required
                type="email"
                value={inviteForm.email}
                onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600">Role</label>
              <select
                value={inviteForm.role}
                onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="ATTORNEY">Attorney</option>
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <button disabled={inviting} className="bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md h-fit">
              {inviting ? "Adding..." : "Add member"}
            </button>
          </form>
        )}
        {inviteError && <p className="text-sm text-red-600 mt-2">{inviteError}</p>}
        {inviteResult && (
          <p className="text-sm text-green-700 mt-2">
            Added {inviteResult.email}. Temporary password: <code className="bg-slate-100 px-1 rounded">{inviteResult.tempPassword}</code> — share it securely, they should change it after logging in.
          </p>
        )}
      </section>

      <section className="bg-white border border-slate-200 rounded-lg p-6">
        <h2 className="font-semibold text-slate-900 mb-2">Billing</h2>
        <p className="text-sm text-slate-500 mb-1">
          Current plan: <span className="font-medium text-slate-900">{firm.plan}</span>
        </p>
        <p className="text-sm text-slate-500 mb-4">
          DocketPilot Pro is <span className="font-medium text-slate-900">$9/month</span> per firm, billed monthly. Cancel anytime.
        </p>
        {isAdmin && <PaddleCheckoutButton firmId={firm.id} customerEmail={userEmail} />}
      </section>
    </div>
  );
}
