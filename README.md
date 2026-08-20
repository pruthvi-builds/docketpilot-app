**Live demo:** https://docketpilot-app.vercel.app
**Tech stack:** Next.js 14 (App Router), TypeScript, Prisma, PostgreSQL/SQLite, Tailwind CSS, JWT auth (Edge middleware), Paddle billing webhooks, deployed via Vercel

Multi-tenant SaaS deadline tracker for law firms. Every firm gets isolated data, JWT-based auth that works inside Next.js Edge middleware, a CSV import pipeline, a cron-driven reminder engine, and billing via Paddle with signed webhook verification.

# DocketPilot

Deadline &amp; case-date tracker for solo and small law firms. Multi-tenant SaaS built with Next.js 14 (App Router), Prisma + SQLite, and Tailwind. Verified working end-to-end (signup/login, dashboard, case CRUD, deadline CRUD, calendar export, CSV import, team management, reminder cron, billing scaffold) as of this build.

## What's actually working right now (no extra setup needed)

- Firm signup/login with hashed passwords and JWT session cookies (Edge-safe via `jose`, so auth works in Next.js middleware).
- Multi-tenant data model — every firm only ever sees its own cases/deadlines/team.
- Dashboard: every open deadline across every case, sorted soonest-first, color-coded by urgency (overdue / due this week / due this month / later), with search.
- Case management: create, edit, close, delete; each case holds multiple deadlines (filing deadline, hearing, statute of limitations, discovery cutoff, other).
- Bulk case import from CSV (paste-in, no file upload plumbing needed).
- One-click `.ics` calendar download per deadline (works standalone, no calendar API integration required).
- Team management: firm admins can add attorneys/staff; a temp password is generated and shown once (no email dependency to get someone onboarded).
- Firm-level settings: reminder day thresholds (e.g. "30,14,7,1").
- Audit log of key actions (case/deadline created, updated, deleted; reminders sent; team changes).

## What needs your own credentials before it's "live"

Nothing above requires external services. These two do:

- **Email reminders** — the reminder engine and cron endpoint are fully built and tested (`/api/cron/send-reminders`, protected by `CRON_SECRET`). Without `SMTP_HOST`/`SMTP_USER`/`SMTP_PASS` set, it still runs correctly and just logs the email to the server console instead of sending it. Add real SMTP credentials (Gmail app password, Resend, Postmark, SES, etc.) in `.env` to start actually sending.
- **Billing** — uses Paddle (a merchant-of-record processor) instead of Stripe/Razorpay, since Stripe is invite-only for India-based accounts and Razorpay's international billing still requires a registered business entity. Paddle explicitly supports India-based individuals with no company registration and no upfront cost. Checkout is a client-side Paddle.js overlay (`PaddleCheckoutButton.tsx`, no server round-trip needed to start it); the webhook route (`/api/billing/webhook`) verifies Paddle's signature scheme via `@paddle/paddle-node-sdk`. Without `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`/`NEXT_PUBLIC_PADDLE_PRICE_ID`, the Upgrade button shows a clear "billing not configured" message instead of erroring. Add your own keys when you're ready to charge.

I did not create the Paddle/SMTP accounts or enter any credentials on your behalf — that's intentionally left for you to wire up with your own accounts.

## Run it locally

```bash
npm install
cp .env.example .env        # edit DATABASE_URL, JWT_SECRET and CRON_SECRET at minimum
npx prisma db push          # creates the schema in your Postgres database
npm run db:seed             # optional: seeds a demo firm
npm run dev                 # http://localhost:3000
```

Need a free Postgres instance for local dev? [Neon](https://neon.tech) gives you a connection string in under a minute.

Seeded demo login (if you ran `db:seed`): `demo@docketpilot.app` / `password123`.

## Deploying

- **Vercel** is the path of least resistance: push to a GitHub repo, import into Vercel, add a Postgres database (Vercel Postgres or the Neon integration — either one auto-injects `DATABASE_URL`), and set the remaining env vars from `.env.example` in the Vercel dashboard.
- `vercel.json` already defines the daily reminder cron (`/api/cron/send-reminders` at 13:00 UTC). If you deploy elsewhere, use `scripts/run-reminders.ts` from any scheduler (crontab, GitHub Actions) instead.

## Suggested next steps before cold-emailing prospects

1. Deploy to Vercel with a real Postgres database attached.
2. Wire up real SMTP + Paddle keys.
3. Run the landing page + a small batch of cold emails into solo/small-firm attorney lists (state bar directories) to validate willingness to pay before investing further — the pitch is already on the homepage (`app/page.tsx`).
4. Nice-to-haves once validated: password reset flow, 2FA, Google/Outlook calendar sync (beyond one-off `.ics` downloads), mobile-friendly SMS reminders, per-user (not just per-firm) notification preferences.
