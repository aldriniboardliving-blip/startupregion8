import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(req: Request): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.adminGet);
  if (limited) return limited;
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
  return NextResponse.json({ authenticated: true, user: session.user });
}
