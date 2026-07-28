import Link from "next/link";
import FaqAccordion from "./FaqAccordion";
import EnterpriseWaitlistForm from "./EnterpriseWaitlistForm";

const COMPETITORS = [
  { name: "DocketPilot", price: 9, display: "$9", note: "flat / firm", highlight: true },
  { name: "MyCase", price: 39, display: "$39", note: "per user" },
  { name: "PracticePanther", price: 74, display: "$49–99", note: "per user" },
  { name: "Clio Manage", price: 124, display: "$99–149", note: "per user" },
];
const MAX_PRICE = Math.max(...COMPETITORS.map((c) => c.price));

const FEATURES = [
  { icon: "bolt", title: "Deadline Wizard", body: "One date in — every deadline out, cited to the rule.", tag: "New" },
  { icon: "alert", title: "Conflict detection", body: "Warns you before two deadlines collide.", tag: "New" },
  { icon: "layers", title: "One dashboard", body: "Every case, sorted by urgency, color-coded." },
  { icon: "bell", title: "Auto reminders", body: "30, 14, 7, 1 day out — your schedule." },
  { icon: "upload", title: "Calendar & import", body: "One-click export. Spreadsheet import." },
  { icon: "file", title: "Docs & audit log", body: "Attach files. Every change logged." },
];

const USE_CASES = [
  { icon: "user", title: "Solo attorneys", body: "You're the calendar system — let software help." },
  { icon: "users", title: "Small litigation firms", body: "Catch handoff conflicts before they become malpractice." },
  { icon: "scale", title: "Probate & family practices", body: "SOLs and creditor deadlines, one dashboard." },
];

const FAQS = [
  {
    q: "Do I need a credit card to start?",
    a: "No. Create your firm account and start free — no card required.",
  },
  {
    q: "What happens to our data if we cancel?",
    a: "Export anytime. If you cancel, data is retained briefly then deleted — see our Privacy Policy.",
  },
  {
    q: "Is the Deadline Wizard giving legal advice?",
    a: "No. It's a calculator citing real FRCP rules — a starting point, not a substitute for your own scheduling order.",
  },
  {
    q: "Can other firms see our cases?",
    a: "No. Every query is scoped to your firm, enforced in code. Details on our Security page.",
  },
  {
    q: "Why so much cheaper than MyCase, Clio, or PracticePanther?",
    a: "Those bundle billing, trust accounting, and client portals most small firms don't need. We do one job — deadlines — and price accordingly.",
  },
];

function Icon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "bolt":
      return <svg {...common}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "alert":
      return <svg {...common}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "layers":
      return <svg {...common}><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>;
    case "bell":
      return <svg {...common}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
    case "upload":
      return <svg {...common}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>;
    case "file":
      return <svg {...common}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
    case "user":
      return <svg {...common}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    case "users":
      return <svg {...common}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "scale":
      return <svg {...common}><line x1="12" y1="3" x2="12" y2="21" /><path d="m5 7 3 8H2z" /><path d="m19 7 3 8h-6z" /><path d="M5 7h14" /><path d="M9 21h6" /></svg>;
    case "shield":
      return <svg {...common}><path d="M12 2 4 5v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V5Z" /></svg>;
    case "check":
      return <svg {...common}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
    default:
      return null;
  }
}

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
              Every case deadline, sorted by urgency, with automatic reminders.
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
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> No card required
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> $9/month flat
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> 5-minute setup
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
            <div className="hidden sm:flex absolute -left-6 -top-6 items-center gap-2 bg-white text-slate-900 rounded-lg shadow-xl px-4 py-3 text-sm max-w-[200px]">
              <span className="text-green-500 text-lg leading-none">✓</span>
              <span>Reminder sent</span>
            </div>
            <div className="hidden sm:flex absolute -right-6 top-1/3 items-center gap-2 bg-white text-slate-900 rounded-lg shadow-xl px-4 py-3 text-sm max-w-[210px]">
              <span className="text-indigo-500 text-lg leading-none">⚡</span>
              <span>2 deadlines added</span>
            </div>
            <div className="hidden sm:flex absolute -bottom-6 left-1/4 items-center gap-2 bg-white text-slate-900 rounded-lg shadow-xl px-4 py-3 text-sm max-w-[200px]">
              <span className="text-orange-500 text-lg leading-none">⚠</span>
              <span>Conflict found</span>
            </div>
          </div>
        </div>
      </header>

      {/* Problem / stat section */}
      <section className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            Why this matters
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <span className="text-6xl md:text-7xl font-bold text-slate-900">1 in 4</span>
          </div>
          <p className="mt-3 text-lg text-slate-700 font-medium max-w-xl mx-auto">
            legal malpractice claims start with a missed deadline — the #1 cause, ahead of every other error.
          </p>
          <p className="mt-3 text-xs text-slate-400">Source: ABA Standing Committee on Lawyers&apos; Professional Liability</p>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Stop missing dates
          </h2>
          <p className="mt-2 text-slate-500 text-sm">Not a bloated suite — just what deadline tracking needs.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition">
              <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Icon name={f.icon} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900 text-sm">{f.title}</h3>
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
        <div className="max-w-5xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            Three steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step n={1} title="Create your firm" body="No card, no IT — under 2 minutes." />
            <Step n={2} title="Add your cases" body="One at a time, or bulk-import a spreadsheet." />
            <Step n={3} title="Let it watch" body="Sorted, reminded, and conflict-checked automatically." />
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Built for small firms</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          {USE_CASES.map((u) => (
            <div key={u.title} className="border border-slate-200 rounded-xl p-5">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
                <Icon name={u.icon} />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">{u.title}</h3>
              <p className="text-sm text-slate-500">{u.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              One flat price
            </h2>
            <p className="mt-2 text-slate-500 text-sm">
              Free to start. $9/month per firm if you keep it — not per seat.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            {COMPETITORS.map((c) => (
              <div key={c.name} className="flex items-center gap-4">
                <div className="w-32 shrink-0 text-sm font-medium text-slate-700 flex items-center gap-1">
                  {c.name}
                  {c.highlight && <span className="text-indigo-600">★</span>}
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-7 overflow-hidden">
                  <div
                    className={`h-full rounded-full flex items-center justify-end px-3 text-xs font-semibold ${c.highlight ? "bg-indigo-600 text-white" : "bg-slate-300 text-slate-700"}`}
                    style={{ width: `${Math.max(12, (c.price / MAX_PRICE) * 100)}%` }}
                  >
                    {c.display}
                  </div>
                </div>
                <div className="w-20 shrink-0 text-xs text-slate-400 text-right">{c.note}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3 text-center">
            Publicly listed starting prices as of this writing — verify current pricing on each vendor&apos;s site.
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
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            Built to be trusted
          </h2>
          <p className="mt-2 text-slate-500 text-sm">
            We&apos;re early — here&apos;s how it&apos;s actually built, not a testimonial we made up.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-5">
          <TrustCard icon="shield" title="Firm-level isolation" body="Every query scoped to your firm — in code." />
          <TrustCard icon="check" title="Rule-cited logic" body="Every date traces to a real FRCP citation." />
          <TrustCard icon="clock" title="Full audit trail" body="Every change logged and timestamped." />
        </div>
        <p className="text-center mt-6 text-sm text-slate-500">
          <Link href="/security" className="text-indigo-600 underline">Security &amp; data practices →</Link>
        </p>
      </section>

      {/* Enterprise / BigLaw waitlist */}
      <section id="enterprise" className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center max-w-xl mx-auto mb-8">
          <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-900 text-white px-2 py-1 rounded-full">Coming soon</span>
          <h2 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900">Built small. Built to scale to BigLaw.</h2>
          <p className="mt-2 text-slate-500 text-sm">
            SSO, per-matter permissions, and a security review — for firms bigger than 10 attorneys. Join the waitlist and we&apos;ll reach out first.
          </p>
        </div>
        <EnterpriseWaitlistForm />
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-2xl mx-auto px-6 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-8">
            Questions before switching
          </h2>
          <FaqAccordion faqs={FAQS} />
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold">
            Stop tracking deadlines in your head.
          </h2>
          <p className="mt-3 text-slate-300 text-sm">
            Free to start. No card. $9/month flat if you keep it.
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
      <h3 className="font-semibold mb-1 text-sm">{title}</h3>
      <p className="text-sm text-slate-300">{body}</p>
    </div>
  );
}

function TrustCard({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div className="border border-slate-200 rounded-xl p-5">
      <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center mb-3">
        <Icon name={icon} />
      </div>
      <h3 className="font-semibold text-slate-900 text-sm mb-1">{title}</h3>
      <p className="text-sm text-slate-500">{body}</p>
    </div>
  );
}
