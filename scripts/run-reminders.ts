// Convenience script for running the reminder sweep locally or from any cron
// host that isn't Vercel (a plain crontab entry, GitHub Actions, etc).
//   npx tsx scripts/run-reminders.ts
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is not set — aborting.");
  process.exit(1);
}

fetch(`${appUrl}/api/cron/send-reminders`, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
})
  .then((r) => r.json())
  .then((data) => console.log("Reminder sweep result:", data))
  .catch((err) => {
    console.error("Reminder sweep failed:", err);
    process.exit(1);
  });
