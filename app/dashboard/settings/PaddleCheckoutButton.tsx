"use client";
import { useState } from "react";

// Dodo Payments checkout — server creates the session (POST /api/billing/checkout),
// we just redirect the browser to the returned checkout_url. No client SDK needed.
export default function CheckoutButton({
  firmId,
  customerEmail,
}: {
  firmId: string;
  customerEmail: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function startCheckout() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/billing/checkout", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (err: any) {
      setError(err?.message || "Could not start checkout.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={startCheckout}
        disabled={loading}
        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-md"
      >
        {loading ? "Opening checkout..." : "Upgrade plan"}
      </button>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
