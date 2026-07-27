import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signSession, setSessionCookie } from "@/lib/auth";
import { DEMO_FIRM_ID, DEMO_USER_EMAIL } from "@/lib/demo";

export const dynamic = "force-dynamic";

// Public, no-signup entry point into a read-only demo firm. Anyone can hit
// this link from the landing/login pages. Mutating requests against
// DEMO_FIRM_ID are blocked centrally in middleware.ts, so this is safe to
// leave open.
export async function GET(req: NextRequest) {
  const user = await prisma.user.findUnique({ where: { email: DEMO_USER_EMAIL } });
  if (!user || user.firmId !== DEMO_FIRM_ID) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "?error=demo_unavailable";
    return NextResponse.redirect(url);
  }

  const token = await signSession({ userId: user.id, firmId: user.firmId, role: user.role });
  setSessionCookie(token);

  const url = req.nextUrl.clone();
  url.pathname = "/dashboard";
  url.search = "";
  return NextResponse.redirect(url);
}
