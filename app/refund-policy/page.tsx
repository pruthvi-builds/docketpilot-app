import Link from "next/link";

export const metadata = {
  title: "Refund Policy — DocketPilot",
};

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">DP</div>
            <span className="font-semibold text-lg">DocketPilot</span>
          </Link>
          <Link href="/login" className="text-slate-300 hover:text-white text-sm">
            Log in
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-14 prose prose-slate">
        <h1 className="text-2xl font-bold text-slate-900">Refund Policy</h1>
        <p className="text-slate-500">Last updated: July 2026</p>

        <p>
          Subscriptions to DocketPilot are billed and processed by our payment processor,{" "}
          Dodo Payments, acting as the merchant of record. This policy explains when refunds are
          available.
        </p>

        <h2>1. Free trial</h2>
        <p>
          New accounts start on a free trial. You are not charged during the trial, and you can cancel
          at any time before it ends with nothing owed.
        </p>

        <h2>2. Monthly subscriptions</h2>
        <p>
          Paid plans renew monthly and are billed in advance. You can cancel at any time from your
          account settings — cancellation stops future renewals but does not automatically refund the
          current billing period.
        </p>

        <h2>3. Requesting a refund</h2>
        <p>
          If you believe you were charged in error, were double-billed, or experienced a service issue
          that prevented you from using DocketPilot during a paid period, contact us within 14 days of
          the charge at{" "}
          <a href="mailto:billing@docketpilot.app" className="underline">billing@docketpilot.app</a>{" "}
          with your account email and the date of the charge. We review refund requests case by case
          and will issue a refund through Dodo Payments where appropriate.
        </p>

        <h2>4. How refunds are processed</h2>
        <p>
          Approved refunds are issued to the original payment method via Dodo Payments, our merchant of
          record, and typically appear within 5–10 business days depending on your bank or card issuer.
        </p>

        <h2>5. Non-refundable circumstances</h2>
        <p>
          We generally do not issue refunds for partial months after a plan has been used, for accounts
          terminated due to a violation of our{" "}
          <Link href="/terms" className="underline">Terms of Service</Link>, or for requests made more
          than 30 days after the charge.
        </p>

        <h2>6. Contact</h2>
        <p>
          For any billing or refund question, reach us at{" "}
          <a href="mailto:billing@docketpilot.app" className="underline">billing@docketpilot.app</a>.
        </p>

        <p className="mt-10">
          <Link href="/" className="underline text-slate-500">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
