import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "sr8_session";
const secret = process.env.SESSION_SECRET || "default-dev-secret-change-me";

interface SessionData {
  user: string;
  exp: number;
}

function b64url(buf: Buffer | string): string {
  return Buffer.from(buf).toString("base64url");
}

function sign(payload: string): string {
  const sig = createHmac("sha256", secret).update(payload).digest();
  return `${payload}.${b64url(sig)}`;
}

function verify(token: string | undefined): SessionData | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", secret).update(payload).digest();
  let received: Buffer;
  try {
    received = Buffer.from(sig, "base64url");
  } catch {
    return null;
  }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
    return null;
  }
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionData;
    if (!data || typeof data !== "object" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createSession(): Promise<string> {
  const data: SessionData = {
    user: process.env.ADMIN_USERNAME || "admin",
    exp: Date.now() + 1000 * 60 * 60 * 12, // 12 hours
  };
  const token = sign(b64url(JSON.stringify(data)));
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, "", { httpOnly: true, path: "/", maxAge: 0 });
}

export interface Session {
  user: string;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const data = verify(token);
  return data ? { user: data.user } : null;
}

export async function isAuthed(): Promise<boolean> {
  return !!(await getSession());
}
