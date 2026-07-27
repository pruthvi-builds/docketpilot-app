import Link from "next/link";

export default function LandingPage() {
  return (
    <div>
      <header className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">
              DP
            </div>
            <span className="font-semibold text-lg">DocketPilot</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-indigo-500 hover:bg-indigo-400 transition px-4 py-2 rounded-md font-medium"
            >
              Start free trial
            </Link>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-6 pt-10 pb-16">
          <h1 className="text-3xl md:text-4xl font-bold max-w-2xl leading-tight">
            Never miss a court deadline again.
          </h1>
          <p className="mt-4 text-slate-300 max-w-xl">
            DocketPilot is a deadline &amp; case-date tracker built for solo and small law
            firms — filing deadlines, hearings, statutes of limitations, and discovery
            cutoffs, all in one dashboard sorted by urgency, with automatic email reminders.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Automatic email reminders
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Built for 1–10 attorney firms
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-400" /> Set up in under 5 minutes
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/signup"
              className="inline-block bg-white text-slate-900 font-semibold px-5 py-2.5 rounded-md hover:bg-slate-200 transition"
            >
              Start your free trial
            </Link>
            <a
              href="/api/demo/login"
              className="inline-block border border-slate-500 text-slate-200 font-semibold px-5 py-2.5 rounded-md hover:bg-slate-800 transition"
            >
              View live demo
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        <Feature
          title="Every deadline, one dashboard"
          body="Filing deadlines, hearings, statutes of limitations, and discovery cutoffs across every case, sorted soonest-first."
        />
        <Feature
          title="Automatic reminders"
          body="Email alerts fire 30, 14, 7, and 1 day before a deadline — configurable per firm, so nothing slips through."
        />
        <Feature
          title="Calendar &amp; bulk import"
          body="Export any deadline to your calendar with one click, or bulk-import your existing case list from a spreadsheet."
        />
      </main>

      <footer className="text-center text-xs text-slate-400 py-10 border-t border-slate-200">
        © {new Date().getFullYear()} DocketPilot ·{" "}
        <Link href="/security" className="text-slate-500 hover:text-slate-700 underline">
          Security &amp; data practices
        </Link>
        {" "}·{" "}
        <Link href="/terms" className="text-slate-500 hover:text-slate-700 underline">
          Terms of Service
        </Link>
        {" "}·{" "}
        <Link href="/privacy" className="text-slate-500 hover:text-slate-700 underline">
          Privacy Policy
        </Link>
        {" "}·{" "}
        <Link href="/refund-policy" className="text-slate-500 hover:text-slate-700 underline">
          Refund Policy
        </Link>
      </footer>
    </div>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5">
      <h3 className="font-semibold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 mt-2">{body}</p>
    </div>
  );
}
