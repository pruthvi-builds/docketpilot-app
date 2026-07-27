import { NextRequest, NextResponse } from "next/server";
import { Paddle, EventName } from "@paddle/paddle-node-sdk";
import { prisma } from "@/lib/db";

// Paddle (Merchant of Record) webhook handler. Paddle signs requests with a
// "Paddle-Signature" header (ts=...;h1=... — HMAC SHA256 over "ts:rawBody"),
// verified here with the secret from Developer Tools > Notifications > this
// destination. We use the official SDK's `webhooks.unmarshal` helper instead
// of hand-rolling HMAC comparison.
export async function POST(req: NextRequest) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET;
  const apiKey = process.env.PADDLE_API_KEY;
  if (!secret || !apiKey) {
    return NextResponse.json({ error: "Billing isn't configured yet." }, { status: 400 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("paddle-signature") || "";

  const paddle = new Paddle(apiKey);

  let event;
  try {
    event = await paddle.webhooks.unmarshal(rawBody, secret, signature);
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  if (!event) {
    return NextResponse.json({ error: "Invalid event." }, { status: 400 });
  }

  const data: any = event.data;
  const firmId: string | undefined = data?.customData?.firmId;

  switch (event.eventType) {
    // Subscription became active (first payment succeeded, or renewed/resumed).
    case EventName.SubscriptionActivated:
    case EventName.SubscriptionResumed:
    case EventName.SubscriptionCreated: {
      if (firmId) {
        await prisma.firm.update({
          where: { id: firmId },
          data: {
            plan: "active",
            paymentCustomerId: data?.customerId || undefined,
            paymentSubscriptionId: data?.id || undefined,
          },
        });
      }
      break;
    }
    // Subscription ended, was cancelled/paused, or a renewal payment failed for good.
    case EventName.SubscriptionCanceled:
    case EventName.SubscriptionPastDue:
    case EventName.SubscriptionPaused: {
      const subId = data?.id;
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
      // Ignore transaction.* and other events we don't act on yet.
      break;
  }

  return NextResponse.json({ received: true });
}
