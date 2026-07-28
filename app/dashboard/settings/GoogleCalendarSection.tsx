"use client";
import { useState } from "react";

export default function GoogleCalendarSection({
  connected,
  status,
}: {
  connected: boolean;
  status?: string;
}) {
  const [isConnected, setIsConnected] = useState(connected);
  const [disconnecting, setDisconnecting] = useState(false);

  async function disconnect() {
    setDisconnecting(true);
    const res = await fetch("/api/integrations/google-calendar/disconnect", { method: "POST" });
    setDisconnecting(false);
    if (res.ok) setIsConnected(false);
  }

  return (
    <div>
      <p className="text-sm text-slate-500 mb-3">
        Push every deadline into a dedicated &quot;DocketPilot Deadlines&quot; calendar in your Google account — automatically, one-way. Your
        other calendars and events are never touched.
      </p>

      {status === "connected" && (
        <p className="text-sm text-green-700 mb-3">Google Calendar connected — new and updated deadlines will sync automatically.</p>
      )}
      {status === "denied" && (
        <p className="text-sm text-slate-500 mb-3">Connection cancelled — no access was granted.</p>
      )}
      {status === "error" && (
        <p className="text-sm text-red-600 mb-3">Something went wrong connecting Google Calendar. Please try again.</p>
      )}

      {isConnected ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-green-700">Connected ✓</span>
          <button
            disabled={disconnecting}
            onClick={disconnect}
            className="bg-slate-100 hover:bg-slate-200 disabled:opacity-60 text-slate-700 text-sm font-semibold px-4 py-2 rounded-md"
          >
            {disconnecting ? "Disconnecting..." : "Disconnect"}
          </button>
        </div>
      ) : (
        <a
          href="/api/integrations/google-calendar/connect"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-md"
        >
          Connect Google Calendar
        </a>
      )}
    </div>
  );
}
