import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "./db";
import { signJwt, verifyJwt, SESSION_COOKIE_NAME, type SessionPayload } from "./jwt";

export type { SessionPayload };
export { SESSION_COOKIE_NAME };

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function signSession(payload: SessionPayload) {
  return signJwt(payload);
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}

/** Server Component / Route Handler helper: get the logged-in user + firm, or null. */
export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(SESSION_COOKIE_NAME)?.value;
  return verifyJwt(token);
}

/** Throws-free helper for API routes: returns session or null, caller decides how to respond. */
export async function requireSession() {
  const session = await getSession();
  if (!session) return null;
  // Confirm the user/firm still exist (handles deleted accounts gracefully).
  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) return null;
  return { session, user };
}
