import webpush from "web-push";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:support@docketpilot.app";

let configured = false;
function ensureConfigured() {
  if (configured) return true;
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  configured = true;
  return true;
}

export type PushPayload = { title: string; body: string; url?: string };

/**
 * Best-effort push send — mirrors sendEmail()'s "never throw, just log"
 * behavior so a missing VAPID config or a stale subscription never breaks the
 * reminder sweep. Deletes subscriptions the push service reports as gone
 * (410/404) so they stop being retried forever.
 */
export async function sendPush(
  subscription: { id: string; endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
  onGone?: (id: string) => Promise<void>
) {
  if (!ensureConfigured()) {
    console.log("[push] VAPID keys not configured — skipping push send:", payload.title);
    return;
  }
  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.statusCode === 410) {
      try {
        await onGone?.(subscription.id);
      } catch {
        // already gone / race with another cleanup — fine to ignore
      }
    } else {
      console.error("[push] send failed:", err?.message || err);
    }
  }
}
