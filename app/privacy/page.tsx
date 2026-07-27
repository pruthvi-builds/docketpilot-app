import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — DocketPilot",
};

export default function PrivacyPage() {
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
        <h1 className="text-2xl font-bold text-slate-900">Privacy Policy</h1>
        <p className="text-slate-500">Last updated: July 2026</p>

        <p>
          This Privacy Policy explains what information DocketPilot collects, how we use it, and the
          choices you have. It applies to docketpilot-app.vercel.app and the DocketPilot application.
        </p>

        <h2>1. Information we collect</h2>
        <p>We collect:</p>
        <ul>
          <li>
            <strong>Account information</strong> — name, email address, firm name, and password (stored
            as a salted hash, never in plain text).
          </li>
          <li>
            <strong>Case and deadline data</strong> — the case names, dates, tasks, notes, and documents
            you or your firm enter into the product.
          </li>
          <li>
            <strong>Billing information</strong> — subscription status and plan tier. Card and payment
            details are collected and processed directly by our payment processor, Paddle.com; we do
            not receive or store your full card number.
          </li>
          <li>
            <strong>Usage data</strong> — basic technical logs (timestamps, IP address, browser type)
            used for security and troubleshooting.
          </li>
        </ul>

        <h2>2. How we use information</h2>
        <p>We use the information above to:</p>
        <ul>
          <li>Provide and maintain the DocketPilot service, including sending deadline reminder emails you configure.</li>
          <li>Authenticate your account and keep your firm&apos;s data isolated from other firms.</li>
          <li>Process subscription billing through Paddle.</li>
          <li>Respond to support requests and improve the product.</li>
        </ul>

        <h2>3. Data isolation</h2>
        <p>
          Every case, deadline, task, and document is tagged to your firm, and every database query is
          scoped to that tag. Other firms using DocketPilot cannot see, query, or export your data. See
          our <Link href="/security" className="underline">Security &amp; data practices</Link> page for
          more detail.
        </p>

        <h2>4. Sharing of information</h2>
        <p>
          We do not sell, rent, or share your case or client data with third parties for marketing
          purposes. We share data only with the service providers required to operate DocketPilot:
        </p>
        <ul>
          <li>Our hosting and database provider, to run the application.</li>
          <li>Our email delivery provider, to send deadline reminder and account emails.</li>
          <li>Paddle.com, our payment processor and merchant of record, to process subscription payments.</li>
        </ul>
        <p>We may also disclose information if required by law or to protect the rights and safety of our users.</p>

        <h2>5. Data retention</h2>
        <p>
          We retain your account and case data for as long as your account is active. If you close your
          account, we delete or anonymize your data within a reasonable period, except where retention
          is required for legal, tax, or billing record-keeping purposes.
        </p>

        <h2>6. Security</h2>
        <p>
          The application is served entirely over HTTPS, session tokens are stored in httpOnly cookies,
          and uploaded documents are stored in a private object store with no public URLs. See our{" "}
          <Link href="/security" className="underline">Security &amp; data practices</Link> page for
          full details.
        </p>

        <h2>7. Your rights and choices</h2>
        <p>
          You can access, correct, export, or delete most of your data directly from the application.
          You can also contact us to request access to, correction of, or deletion of your personal
          information, subject to legal retention requirements.
        </p>

        <h2>8. Cookies</h2>
        <p>
          We use a small number of essential cookies required to keep you logged in and to remember
          basic preferences. We do not use third-party advertising cookies.
        </p>

        <h2>9. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will post the updated version on this
          page with a new &quot;last updated&quot; date.
        </p>

        <h2>10. Contact</h2>
        <p>
          Questions about this policy or your data can be sent to{" "}
          <a href="mailto:security@docketpilot.app" className="underline">security@docketpilot.app</a>.
        </p>

        <p className="mt-10">
          <Link href="/" className="underline text-slate-500">← Back to home</Link>
        </p>
      </main>
    </div>
  );
}
