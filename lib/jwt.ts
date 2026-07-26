// Edge-safe JWT helpers (used by middleware.ts, which runs on the Edge runtime
// and cannot load Node-only packages like jsonwebtoken/bcrypt/Prisma). `jose`
// works in both the Edge runtime and Node, so it's the one JWT implementation
// shared by middleware and the rest of the app.
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
const secret = encoder.encode(process.env.JWT_SECRET || "dev-only-insecure-secret-change-me");

export const SESSION_COOKIE_NAME = "dp_session";

export type SessionPayload = {
  userId: string;
  firmId: string;
  role: string; // "ADMIN" | "ATTORNEY" | "STAFF" — validated at write time, not DB-enforced
};

export async function signJwt(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyJwt(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    if (typeof payload.userId !== "string" || typeof payload.firmId !== "string") return null;
    return { userId: payload.userId, firmId: payload.firmId, role: String(payload.role || "ATTORNEY") };
  } catch {
    return null;
  }
}
