import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, SESSION_COOKIE_NAME } from "./lib/jwt";
import { DEMO_FIRM_ID } from "./lib/demo";

// Paths the read-only demo account is still allowed to POST/PUT/DELETE to —
// nothing here mutates firm data, so they're safe to exclude from the guard.
const DEMO_WRITE_ALLOWLIST = ["/api/auth/logout", "/api/demo/login"];

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyJwt(token);

  const { pathname } = req.nextUrl;
  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/signup";
  const isApi = pathname.startsWith("/api/");
  const isMutating = !["GET", "HEAD", "OPTIONS"].includes(req.method);

  if (isDashboard && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (isAuthPage && session) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  if (
    isApi &&
    isMutating &&
    session?.firmId === DEMO_FIRM_ID &&
    !DEMO_WRITE_ALLOWLIST.includes(pathname)
  ) {
    return NextResponse.json(
      { error: "This is a read-only demo. Sign up for your own account to make changes." },
      { status: 403 }
    );
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/signup", "/api/:path*"],
};
