import crypto from "crypto";
import { cookies } from "next/headers";

/**
 * Signed-cookie sessions (HMAC-SHA256). Replaces the M2/M3 unsigned dev
 * cookies. Cookie value: base64url(payload).signature — tamper-proof
 * without external deps. Payload carries the role so every server action
 * can authorize cheaply.
 */

export type Session = {
  uid: string; // user id
  email: string;
  role: "COUPLE" | "VENDOR" | "ADMIN";
  vendorId?: string;
  coupleId?: string;
};

const COOKIE = "weddo_session";
const MAX_AGE = 60 * 60 * 24 * 30;

function secret(): string {
  return process.env.AUTH_SECRET ?? "weddo-dev-secret-do-not-use-in-prod";
}

function sign(payloadB64: string): string {
  return crypto
    .createHmac("sha256", secret())
    .update(payloadB64)
    .digest("base64url");
}

export function encodeSession(s: Session): string {
  const payloadB64 = Buffer.from(JSON.stringify(s)).toString("base64url");
  return `${payloadB64}.${sign(payloadB64)}`;
}

export function decodeSession(raw: string | undefined): Session | null {
  if (!raw) return null;
  const [payloadB64, sig] = raw.split(".");
  if (!payloadB64 || !sig) return null;
  const expected = sign(payloadB64);
  // timing-safe compare
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payloadB64, "base64url").toString()) as Session;
  } catch {
    return null;
  }
}

export async function setSession(s: Session) {
  const jar = await cookies();
  jar.set(COOKIE, encodeSession(s), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const jar = await cookies();
  return decodeSession(jar.get(COOKIE)?.value);
}
