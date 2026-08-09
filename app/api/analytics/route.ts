import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import { PROVINCES } from "@/lib/utils";
import type { AnalyticsData } from "@/lib/types";

export async function GET(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();

  const [startups, founders, news, blogs, carousel, government] = await Promise.all([
    db.collection(collections.startups).countDocuments(),
    db.collection(collections.founders).countDocuments(),
    db.collection(collections.news).countDocuments(),
    db.collection(collections.blogs).countDocuments(),
    db.collection(collections.carousel).countDocuments(),
    db.collection(collections.government).countDocuments(),
  ]);

  const byProvince: Record<string, number> = {};
  for (const p of PROVINCES) {
    byProvince[p.name] = await db
      .collection(collections.startups)
      .countDocuments({ province: p.name });
  }

  const byEmployeeRange: Record<string, number> = {};
  const ranges = await db
    .collection(collections.startups)
    .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$employeeRange", count: { $sum: 1 } } }])
    .toArray();
  for (const r of ranges) {
    byEmployeeRange[r._id || "N/A"] = r.count;
  }

  const featured = await db
    .collection(collections.startups)
    .countDocuments({ featured: true });
  const inactive = await db
    .collection(collections.startups)
    .countDocuments({ status: "inactive" });

  const recent = await db
    .collection(collections.startups)
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  const byYear: Record<string, number> = {};
  const all = await db
    .collection(collections.startups)
    .find({}, { projection: { dateFounded: 1 } })
    .toArray();
  for (const s of all) {
    if (s.dateFounded) {
      const y = String(s.dateFounded).slice(0, 4);
      byYear[y] = (byYear[y] || 0) + 1;
    }
  }

  const data: AnalyticsData = {
    totals: { startups, founders, news, blogs, carousel, government },
    byProvince,
    byEmployeeRange,
    byYear,
    featured,
    inactive,
    recent: recent.map((s) => ({
      _id: String(s._id),
      companyName: s.companyName,
      province: s.province,
      createdAt: s.createdAt,
    })),
  };

  return NextResponse.json(data);
}
