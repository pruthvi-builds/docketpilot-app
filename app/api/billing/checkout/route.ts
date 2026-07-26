import { NextResponse } from "next/server";
import DodoPayments from "dodopayments";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") {
    return NextResponse.json({ error: "Only firm admins can manage billing." }, { status: 403 });
  }

  const { DODO_PAYMENTS_API_KEY, DODO_PRODUCT_ID, DODO_PAYMENTS_ENVIRONMENT, NEXT_PUBLIC_APP_URL } = process.env;
  if (!DODO_PAYMENTS_API_KEY || !DODO_PRODUCT_ID) {
    return NextResponse.json(
      { error: "Billing isn't configured yet. Add DODO_PAYMENTS_API_KEY and DODO_PRODUCT_ID to your environment." },
      { status: 400 }
    );
  }

  const [firm, user] = await Promise.all([
    prisma.firm.findUnique({ where: { id: session.firmId } }),
    prisma.user.findUnique({ where: { id: session.userId } }),
  ]);
  if (!firm || !user) return NextResponse.json({ error: "Not found." }, { status: 404 });

  const client = new DodoPayments({
    bearerToken: DODO_PAYMENTS_API_KEY,
    environment: (DODO_PAYMENTS_ENVIRONMENT as "test_mode" | "live_mode") || "test_mode",
  });

  const appUrl = NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  try {
    const checkoutSession = await client.checkoutSessions.create({
      product_cart: [{ product_id: DODO_PRODUCT_ID, quantity: 1 }],
      customer: firm.paymentCustomerId
        ? { customer_id: firm.paymentCustomerId }
        : { email: user.email, name: user.name },
      return_url: `${appUrl}/dashboard/settings?billing=success`,
      metadata: { firmId: firm.id },
    });

    return NextResponse.json({ url: checkoutSession.checkout_url });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Could not start checkout." }, { status: 500 });
  }
}
