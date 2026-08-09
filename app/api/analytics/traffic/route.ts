import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import type { TrafficData, TrafficPageStat } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  const coll = db.collection(collections.visits);

  const [totalVisits, uniqueVisitors, pageRows] = await Promise.all([
    coll.countDocuments(),
    coll.distinct("visitorId"),
    coll
      .aggregate<{ _id: string; views: number; totalDurationMs: number; avgDurationMs: number }>([
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
            totalDurationMs: { $sum: "$durationMs" },
            avgDurationMs: { $avg: "$durationMs" },
          },
        },
        { $sort: { views: -1 } },
        { $limit: 100 },
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
    uniqueVisitors: uniqueVisitors.length,
    avgSessionMs,
    pages,
  };

  return NextResponse.json(data);
}
