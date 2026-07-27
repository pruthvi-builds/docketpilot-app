"use client";
import { useState } from "react";
import { initializePaddle, type Paddle } from "@paddle/paddle-js";

// Paddle.js overlay checkout — runs entirely client-side, no server round-trip
// needed to start a session (unlike the old Dodo redirect-based flow). Reads
// its config from NEXT_PUBLIC_* env vars, which Next.js inlines at build time.
export default function PaddleCheckoutButton({
  firmId,
  customerEmail,
}: {
  firmId: string;
  customerEmail: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID;
  const environment = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production") || "sandbox";

  async function startCheckout() {
    if (!clientToken || !priceId) {
      setError("Billing isn't configured yet. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN and NEXT_PUBLIC_PADDLE_PRICE_ID to your environment.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const paddle: Paddle | undefined = await initializePaddle({ token: clientToken, environment });
      if (!paddle) throw new Error("Could not initialize Paddle.");
      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email: customerEmail },
        customData: { firmId },
      });
    } catch (err: any) {
      setError(err?.message || "Could not start checkout.");
    } finally {
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
