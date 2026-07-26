import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "standardwebhooks";
import { prisma } from "@/lib/db";

// Dodo Payments (Merchant of Record) webhook handler. Follows the Standard
// Webhooks spec: https://standardwebhooks.com/ — signature is HMAC SHA256
// over "webhook-id.webhook-timestamp.rawBody", verified with the secret from
// Dashboard > Developer > Webhooks.
export async function POST(req: NextRequest) {
  const secret = process.env.DODO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "Webhook secret not configured." }, { status: 400 });
  }

  const rawBody = await req.text();
  const webhookHeaders = {
    "webhook-id": req.headers.get("webhook-id") || "",
    "webhook-signature": req.headers.get("webhook-signature") || "",
    "webhook-timestamp": req.headers.get("webhook-timestamp") || "",
  };

  let event: any;
  try {
    const wh = new Webhook(secret);
    event = await wh.verify(rawBody, webhookHeaders);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const data = event?.data;
  const firmId: string | undefined = data?.metadata?.firmId;

  switch (event?.type) {
    // Subscription became active (first payment succeeded, or renewed).
    case "subscription.active":
    case "subscription.renewed": {
      if (firmId) {
        await prisma.firm.update({
          where: { id: firmId },
          data: {
            plan: "active",
            paymentCustomerId: data?.customer?.customer_id || undefined,
            paymentSubscriptionId: data?.subscription_id || undefined,
          },
        });
      }
      break;
    }
    // Subscription ended, was cancelled, or a renewal payment failed for good.
    case "subscription.cancelled":
    case "subscription.expired":
    case "subscription.failed": {
      const subId = data?.subscription_id;
      const firm = firmId
        ? await prisma.firm.findUnique({ where: { id: firmId } })
        : subId
        ? await prisma.firm.findFirst({ where: { paymentSubscriptionId: subId } })
        : null;
      if (firm) {
        await prisma.firm.update({ where: { id: firm.id }, data: { plan: "canceled" } });
      }
      break;
    }
    default:
      // Ignore payment.succeeded/failed and other events we don't act on yet.
      break;
  }

  return NextResponse.json({ received: true });
}
