import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "sr8_session";

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function isAuthed(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  const ix = token.lastIndexOf(".");
  if (ix <= 0 || ix === token.length - 1) return false;
  const payload = token.slice(0, ix);
  const signature = token.slice(ix + 1);
  const secret = process.env.SESSION_SECRET || "default-dev-secret-change-me";

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(signature),
      new TextEncoder().encode(payload)
    );
    if (!valid) return false;
    const data = JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as {
      exp?: number;
    };
    return typeof data.exp === "number" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isLegacyLogin = pathname === "/login" || pathname.startsWith("/login/");
  const isPortal =
    pathname === "/sys-portal-x9" || pathname.startsWith("/sys-portal-x9/");
  const isPortalLogin = pathname === "/sys-portal-x9/login";

  const authed = await isAuthed(req);

  // Hidden admin area: unauthenticated visitors see a fake 404 (URL stays /admin/...)
  if (isAdmin || isLegacyLogin) {
    if (authed) return NextResponse.next();
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  // Secret portal: only the login page is reachable; everything under the portal is disguised
  if (isPortal && !isPortalLogin) {
    return NextResponse.rewrite(new URL("/404", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login/:path*", "/sys-portal-x9/:path*"],
};