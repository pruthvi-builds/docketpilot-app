import Link from "next/link";

export const metadata = {
  title: "Security & Data Practices — DocketPilot",
};

export default function SecurityPage() {
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

      <main className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-2xl font-bold text-slate-900">Security &amp; how we handle your data</h1>
        <p className="text-slate-500 mt-2">
          Plain-language answers, because you&apos;re trusting us with confidential case data and that
          deserves a straight answer, not marketing language.
        </p>

        <div className="mt-10 space-y-8">
          <Section title="Your firm's data is isolated">
            Every case, deadline, task, document, and activity record is tagged to your firm and every
            database query is scoped to that tag. Other firms using DocketPilot cannot see, query, or
            export your data, and there is no cross-firm reporting or aggregation of any kind.
          </Section>

          <Section title="Documents are private by default">
            Uploaded documents are stored in a private object store, not a public file host. There is no
            public URL for any document — every download is re-checked against your login session and your
            firm ID before the file is served, every time.
          </Section>

          <Section title="Encrypted in transit">
            The entire app is served over HTTPS. Login sessions are signed tokens stored in an httpOnly
            cookie, which means the token itself is never exposed to page scripts.
          </Section>

          <Section title="We don't sell or share your data">
            DocketPilot does not sell, rent, or share client or case data with third parties, and we don't
            run ads. The only outbound data flow is transactional email (deadline reminder notifications),
            sent through our email provider on your behalf.
          </Section>

          <Section title="Where we are today">
            DocketPilot is an early-stage product. We are not yet SOC 2 certified or through a formal
            third-party security audit — we want to say that plainly rather than let it go unmentioned.
            What's described above reflects the actual current architecture, not a compliance claim. If
            formal certification matters for your firm's requirements, tell us — it's on our roadmap and
            we'd rather know it's a blocker for you now than lose your trust later.
          </Section>

          <Section title="Questions or concerns">
            Reach out any time at{" "}
            <a href="mailto:security@docketpilot.app" className="text-indigo-600 font-medium">
              security@docketpilot.app
            </a>{" "}
            — a real person reads it, not a ticket queue.
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200">
          <Link href="/signup" className="text-indigo-600 font-semibold">
            ← Back to sign up
          </Link>
        </div>
      </main>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{children}</p>
    </div>
  );
}
