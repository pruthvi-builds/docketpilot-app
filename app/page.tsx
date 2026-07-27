import Link from "next/link";
import { Fragment } from "react";

const COMPETITORS = [
  { name: "DocketPilot", price: "$9", note: "flat, per firm", highlight: true },
  { name: "MyCase", price: "$39", note: "per user" },
  { name: "PracticePanther", price: "$49–99", note: "per user" },
  { name: "Clio Manage", price: "$99–149", note: "per user" },
];

const FEATURES = [
  {
    title: "Deadline Wizard",
    body: "Enter one trigger date — the date you were served, the date of a Rule 26(f) conference — and DocketPilot calculates every deadline that follows, cited to the actual Federal Rule.",
    tag: "New",
  },
  {
    title: "Conflict detection",
    body: "Before you save a new deadline, DocketPilot checks your whole firm calendar and warns you if another case already has something due that day.",
    tag: "New",
  },
  {
    title: "Every deadline, one dashboard",
    body: "Filing deadlines, hearings, statutes of limitations, and discovery cutoffs across every open case, sorted soonest-first and color-coded by urgency.",
  },
  {
    title: "Automatic email reminders",
    body: "Alerts fire 30, 14, 7, and 1 day before a deadline by default — the exact schedule is configurable per firm.",
  },
  {
    title: "Calendar & bulk import",
    body: "Export any deadline to Outlook or Google Calendar in one click, or bulk-import your existing case list from a spreadsheet in minutes.",
  },
  {
    title: "Documents & audit log",
    body: "Attach filings and correspondence directly to a case, and see a full history of every deadline created, edited, or completed.",
  },
];

const USE_CASES = [
  {
    title: "Solo attorneys",
    body: "You're the only calendar system you have. DocketPilot replaces the sticky notes and the mental math with one place that tells you what's due, in order, every morning.",
  },
  {
    title: "Small litigation firms",
    body: "When two or three attorneys share a docket, deadlines get missed in the handoff. Firm-wide conflict detection catches it before it becomes a malpractice call.",
  },
  {
    title: "Probate & family practices",
    body: "Statutes of limitations and creditor-claim deadlines don't forgive a missed date. Track every case type in one dashboard instead of juggling separate systems.",
  },
];

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    a: "No. Create your firm account and start using DocketPilot free — no card required. You only add billing details if and when you decide to upgrade.",
  },
  {
    q: "What happens to our data if we cancel?",
    a: "You can export your cases and deadlines at any time. If you cancel, your data is retained for a reasonable period in case you come back, then deleted — see our Privacy Policy for specifics.",
  },
  {
    q: "Is the Deadline Wizard giving us legal advice?",
    a: "No. It's a calculator seeded with real, citable Federal Rules of Civil Procedure provisions, so you can see exactly which rule produced each date. It's a starting point, not a substitute for confirming against your court's local rules and your own scheduling order — every rule set in the product says so explicitly.",
  },
  {
    q: "Can other firms see our cases?",
    a: "No. Every case, deadline, and document is tagged to your firm, and every database query is scoped to that tag — other firms using DocketPilot cannot see, query, or export your data. Details on our Security page.",
  },
  {
    q: "Why is DocketPilot so much cheaper than MyCase, Clio, or PracticePanther?",
    a: "Those tools bundle in billing, trust accounting, client portals, and per-user pricing that most solo and small firms don't need just to stop missing deadlines. DocketPilot does one thing — deadline tracking — and prices it flat per firm instead of per seat.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="sticky top-0 z-40 bg-slate-900 max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center font-bold">
              DP
            </div>
            <span className="font-semibold text-lg">DocketPilot</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
            <a href="#faq" className="hover:text-white">FAQ</a>
          </nav>
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

        {/* Hero */}
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              Never miss a court deadline again.
            </h1>
            <p className="mt-5 text-slate-300 max-w-xl text-lg">
              DocketPilot is a deadline &amp; case-date tracker built for solo and small law
              firms — filing deadlines, hearings, statutes of limitations, and discovery
              cutoffs, all in one dashboard sorted by urgency, with automatic email reminders.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-block bg-white text-slate-900 font-semibold px-5 py-3 rounded-md hover:bg-slate-200 transition"
              >
                Start your free trial
              </Link>
              <a
                href="/api/demo/login"
                className="inline-block border border-slate-500 text-slate-200 font-semibold px-5 py-3 rounded-md hover:bg-slate-800 transition"
              >
                View live demo
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> No credit card required
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> $9/month flat after trial
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Set up in under 5 minutes
              </div>
            </div>
          </div>

          {/* Product screenshot with floating UI cards */}
          <div className="relative">
            <div className="rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-dashboard.png"
                alt="DocketPilot dashboard showing every deadline across every case, sorted by urgency"
                className="w-full block"
              />
            </div>
            <div className="hidden sm:flex absolute -left-6 -top-6 items-center gap-2 bg-white text-slate-900 rounded-lg shadow-xl px-4 py-3 text-sm max-w-[220px]">
              <span className="text-green-500 text-lg leading-none">✓</span>
              <span>Reminder email sent — 7 days out</span>
            </div>
            <div className="hidden sm:flex absolute -right-6 top-1/3 items-center gap-2 bg-white text-slate-900 rounded-lg shadow-xl px-4 py-3 text-sm max-w-[230px]">
              <span className="text-indigo-500 text-lg leading-none">⚡</span>
              <span>Deadline Wizard added 2 deadlines from 1 date</span>
            </div>
            <div className="hidden sm:flex absolute -bottom-6 left-1/4 items-center gap-2 bg-white text-slate-900 rounded-lg shadow-xl px-4 py-3 text-sm max-w-[220px]">
              <span className="text-orange-500 text-lg leading-none">⚠</span>
              <span>Conflict check: 1 other deadline this day</span>
            </div>
          </div>
        </div>
      </header>

      {/* Problem / stat section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            Why this matters
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900">
            About 1 in 4 legal malpractice claims start with a missed deadline.
          </h2>
          <p className="mt-4 text-slate-500 max-w-2xl mx-auto">
            The ABA Standing Committee on Lawyers&apos; Professional Liability has repeatedly found
            missed deadlines and calendaring errors to be the single most common cause of
            malpractice claims — ahead of substantive errors, inadequate discovery, or conflicts
            of interest. It&apos;s also one of the most preventable.
          </p>
          <p className="mt-4 text-slate-900 font-medium">
            DocketPilot exists to make sure your firm is never that statistic.
          </p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Everything you need to stop missing dates
          </h2>
          <p className="mt-3 text-slate-500">
            Purpose-built for deadline tracking — not a bloated practice-management suite you
            only use 10% of.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                {f.tag && (
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                    {f.tag}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Set up in three steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n={1} title="Create your firm" body="Sign up with your name and email — no credit card, no IT setup. Takes under two minutes." />
            <Step n={2} title="Add your cases" body="Enter cases one at a time, or bulk-import your existing docket from a spreadsheet." />
            <Step n={3} title="Let it watch your calendar" body="The dashboard sorts every deadline by urgency, sends reminders automatically, and flags conflicts before they happen." />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Built for how small firms actually work</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {USE_CASES.map((u) => (
            <div key={u.title} className="border border-slate-200 rounded-xl p-6">
              <h3 className="font-semibold text-slate-900 mb-2">{u.title}</h3>
              <p className="text-sm text-slate-500">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              One flat price. No per-seat surprises.
            </h2>
            <p className="mt-3 text-slate-500">
              Start free — no credit card required. If DocketPilot earns a spot in your
              workflow, it&apos;s $9/month per firm, period.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-4 text-sm">
              <div className="p-4 font-medium text-slate-500 border-b border-slate-200">Tool</div>
              <div className="p-4 font-medium text-slate-500 border-b border-slate-200 text-center">Starting price</div>
              <div className="p-4 font-medium text-slate-500 border-b border-slate-200 text-center col-span-2">Billing model</div>
              {COMPETITORS.map((c) => (
                <Fragment key={c.name}>
                  <div className={`p-4 border-b border-slate-100 font-semibold ${c.highlight ? "text-indigo-700" : "text-slate-900"}`}>
                    {c.name}
                    {c.highlight && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full align-middle">
                        DocketPilot
                      </span>
                    )}
                  </div>
                  <div className={`p-4 border-b border-slate-100 text-center font-semibold ${c.highlight ? "text-indigo-700" : "text-slate-900"}`}>
                    {c.price}/mo
                  </div>
                  <div className="p-4 border-b border-slate-100 text-center col-span-2 text-slate-500">
                    {c.note}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Competitor prices are publicly listed starting prices as of this writing and may vary by plan tier or change over time — check each vendor&apos;s site for current pricing.
          </p>

          <div className="mt-8 flex justify-center">
            <Link
              href="/signup"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-md transition"
            >
              Start your free trial
            </Link>
          </div>
        </div>
      </section>

      {/* Trust / security instead of testimonials */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Built to be trusted with your docket
          </h2>
          <p className="mt-3 text-slate-500">
            DocketPilot is early — we&apos;d rather show you exactly how it&apos;s built than
            show you a testimonial we made up.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <TrustCard
            title="Firm-level data isolation"
            body="Every case, deadline, and document is tagged to your firm, and every database query is scoped to that tag — enforced in code, not just policy."
          />
          <TrustCard
            title="Rule-cited deadline logic"
            body="The Deadline Wizard's rule sets cite the actual Federal Rule of Civil Procedure behind each calculated date, so you can verify the math yourself."
          />
          <TrustCard
            title="Full audit trail"
            body="Every deadline created, edited, completed, or deleted is logged with a timestamp — nothing changes on your docket silently."
          />
        </div>
        <p className="text-center mt-8 text-sm text-slate-500">
          Read the full breakdown on our{" "}
          <Link href="/security" className="text-indigo-600 underline">Security &amp; data practices</Link> page.
        </p>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-10">
            Questions attorneys ask before switching
          </h2>
          <div className="space-y-6">
            {FAQS.map((f) => (
              <div key={f.q} className="bg-white border border-slate-200 rounded-lg p-5">
                <h3 className="font-semibold text-slate-900">{f.q}</h3>
                <p className="text-sm text-slate-500 mt-2">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Stop tracking deadlines in your head.
          </h2>
          <p className="mt-3 text-slate-300">
            Free to start, no credit card required, $9/month flat if you keep it.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-block bg-white text-slate-900 font-semibold px-6 py-3 rounded-md hover:bg-slate-200 transition"
            >
              Start your free trial
            </Link>
            <a
              href="/api/demo/login"
              className="inline-block border border-slate-500 text-slate-200 font-semibold px-6 py-3 rounded-md hover:bg-slate-800 transition"
            >
              View live demo
            </a>
          </div>
        </div>
      </section>

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

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div>
      <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm mb-3">
        {n}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-slate-300">{body}</p>
    </div>
  );
}

function TrustCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-6">
      <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{body}</p>
    </div>
  );
}
