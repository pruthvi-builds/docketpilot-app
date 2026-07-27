import Link from "next/link";

export const metadata = {
  title: "Terms of Service — DocketPilot",
};

export default function TermsPage() {
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
        <h1 className="text-2xl font-bold text-slate-900">Terms of Service</h1>
        <p className="text-slate-500">Last updated: July 2026</p>

        <p>
          These Terms of Service (&quot;Terms&quot;) govern access to and use of DocketPilot
          (&quot;DocketPilot&quot;, &quot;we&quot;, &quot;us&quot;), a deadline and case-date tracking
          tool for law firms, available at docketpilot-app.vercel.app. By creating an account or using
          the service, you agree to these Terms on behalf of yourself and, if applicable, your firm.
        </p>

        <h2>1. The service</h2>
        <p>
          DocketPilot lets law firms track case deadlines, hearings, and related dates, and send
          automated email reminders. The service is provided on a subscription basis after an initial
          free trial period.
        </p>

        <h2>2. Accounts and eligibility</h2>
        <p>
          You must provide accurate information when creating an account and are responsible for
          maintaining the confidentiality of your login credentials and for all activity under your
          account. You must be authorized to act on behalf of the firm you register.
        </p>

        <h2>3. Subscriptions, billing, and cancellation</h2>
        <p>
          Paid plans are billed in advance on a recurring monthly basis through our payment processor,
          Paddle.com, which acts as merchant of record for all purchases. You can cancel your
          subscription at any time from your account settings; cancellation takes effect at the end of
          the current billing period, and no further charges will occur after that. See our{" "}
          <Link href="/refund-policy" className="underline">Refund Policy</Link> for details on refunds.
        </p>

        <h2>4. Acceptable use</h2>
        <p>
          You agree not to use DocketPilot to store or process data you are not legally entitled to
          hold, to attempt to disrupt or reverse-engineer the service, or to use the service in a way
          that violates applicable law or the rights of others.
        </p>

        <h2>5. Your data</h2>
        <p>
          You retain ownership of the case, deadline, and document data you upload. We process it only
          to provide the service to you, as described in our{" "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>

        <h2>6. Disclaimer</h2>
        <p>
          DocketPilot is a scheduling and reminder tool, not a substitute for independent calendaring
          practices, legal judgment, or court rules. We are not responsible for missed deadlines,
          and you remain solely responsible for verifying and tracking your firm&apos;s deadlines through
          your own professional obligations.
        </p>

        <h2>7. Service availability and changes</h2>
        <p>
          We aim for high availability but do not guarantee uninterrupted access. We may modify or
          discontinue features with reasonable notice where practical.
        </p>

        <h2>8. Limitation of liability</h2>
        <p>
          To the maximum extent permitted by law, DocketPilot and its operators are not liable for
          indirect, incidental, or consequential damages arising from use of the service. Our total
          liability for any claim is limited to the amount you paid in the twelve months preceding the
          claim.
        </p>

        <h2>9. Termination</h2>
        <p>
          We may suspend or terminate accounts that violate these Terms. You may stop using the service
          and cancel your subscription at any time.
        </p>

        <h2>10. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the service after changes take
          effect constitutes acceptance of the revised Terms.
        </p>

        <h2>11. Contact</h2>
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:support@docketpilot.app" className="underline">support@docketpilot.app</a>.
        </p>

        <p className="mt-10">
          <Link href="/" className="underline text-slate-500">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
