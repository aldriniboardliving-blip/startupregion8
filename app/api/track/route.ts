import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

interface TrackBody {
  visitorId?: string;
  path?: string;
  durationMs?: number;
}

export async function POST(req: Request): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.track);
  if (limited) return limited;

  let body: TrackBody;
  try {
    body = (await req.json()) as TrackBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const visitorId = String(body.visitorId || "").slice(0, 100);
  const path = String(body.path || "").slice(0, 500);
  const durationMs = Math.max(0, Math.round(Number(body.durationMs) || 0));

  if (!visitorId || !path || durationMs < 500) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const db = await getDb();
  await db.collection(collections.visits).insertOne({
    visitorId,
    path,
    durationMs,
    visitedAt: new Date(),
  });

  return NextResponse.json({ ok: true });
}
