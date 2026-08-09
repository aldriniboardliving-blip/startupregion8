import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import type { TrafficData, TrafficPageStat, TrafficRange } from "@/lib/types";

const RANGES: TrafficRange[] = ["day", "week", "month", "year", "all"];

function rangeToMs(range: TrafficRange): number | null {
  const HOUR = 3.6e6;
  if (range === "day") return 24 * HOUR;
  if (range === "week") return 7 * 24 * HOUR;
  if (range === "month") return 30 * 24 * HOUR;
  if (range === "year") return 365 * 24 * HOUR;
  return null;
}

export async function GET(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);

  const rawRange = searchParams.get("range") || "all";
  const range: TrafficRange = RANGES.includes(rawRange as TrafficRange)
    ? (rawRange as TrafficRange)
    : "all";

  const rawPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
  const pageSize = Math.min(100, Math.max(5, parseInt(searchParams.get("pageSize") || "25", 10) || 25));
  const skip = (rawPage - 1) * pageSize;

  const db = await getDb();
  const coll = db.collection(collections.visits);

  const sinceMs = rangeToMs(range);
  const match = sinceMs ? { visitedAt: { $gte: new Date(Date.now() - sinceMs) } } : {};

  const [totalVisits, uniqueVisitors, totalPages, pageRows] = await Promise.all([
    coll.countDocuments(match),
    coll.distinct("visitorId", match).then((ids) => ids.length),
    coll.distinct("path", match).then((paths) => paths.length),
    coll
      .aggregate<{ _id: string; views: number; totalDurationMs: number; avgDurationMs: number }>([
        { $match: match },
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
            totalDurationMs: { $sum: "$durationMs" },
            avgDurationMs: { $avg: "$durationMs" },
          },
        },
        { $sort: { views: -1 } },
        { $skip: skip },
        { $limit: pageSize },
      ])
      .toArray(),
  ]);

  const pages: TrafficPageStat[] = pageRows.map((r) => ({
    path: r._id,
    views: r.views,
    totalDurationMs: r.totalDurationMs,
    avgDurationMs: Math.round(r.avgDurationMs),
  }));

  const avgSessionMs =
    totalVisits > 0
      ? Math.round(
          pages.reduce((sum, p) => sum + p.totalDurationMs, 0) / totalVisits
        )
      : 0;

  const data: TrafficData = {
    totalVisits,
    uniqueVisitors,
    avgSessionMs,
    pages,
    totalPages,
    page: rawPage,
    pageSize,
  };

  return NextResponse.json(data);
}
