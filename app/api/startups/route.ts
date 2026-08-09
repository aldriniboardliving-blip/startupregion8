import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import { normalizeProvince, toPublicStartup } from "@/lib/utils";
import { resolveStartupSlug } from "@/lib/data";
import { ObjectId } from "mongodb";
import type { FounderInput, Funding, FundingInput, StartupDoc } from "@/lib/types";

interface StartupBody {
  companyName?: string;
  productName?: string;
  dateFounded?: string | null;
  address?: string;
  lat?: number | null;
  lng?: number | null;
  website?: string;
  employeeRange?: string;
  description?: string;
  province?: string;
  logo?: string;
  featured?: boolean;
  status?: string;
  founders?: FounderInput[];
  fundings?: FundingInput[];
}

export async function GET(req: Request): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const province = searchParams.get("province");
  const featured = searchParams.get("featured");
  const query: Record<string, unknown> = {};
  if (province) query.province = normalizeProvince(province);
  if (featured === "true") query.featured = true;

  const db = await getDb();
  const startups = (await db
    .collection(collections.startups)
    .find(query)
    .sort({ createdAt: -1 })
    .toArray()) as StartupDoc[];

  const ids = startups.map((s) => s._id);
  const founders = await db
    .collection(collections.founders)
    .find({ startupId: { $in: ids } })
    .toArray();
  const fundings = await db
    .collection(collections.fundings)
    .find({ startupId: { $in: ids } })
    .toArray();

  const byStartup: Record<string, FounderInput[]> = {};
  for (const f of founders) {
    const key = String(f.startupId);
    byStartup[key] = byStartup[key] || [];
    byStartup[key].push({ name: f.name, position: f.position });
  }
  const byFunding: Record<string, Funding[]> = {};
  for (const f of fundings) {
    const key = String(f.startupId);
    byFunding[key] = byFunding[key] || [];
    byFunding[key].push({
      name: f.name,
      from: f.from,
      amount: Number(f.amount) || 0,
      link: f.link,
      dateAwarded: f.dateAwarded || null,
    });
  }

  const result = startups.map((s) =>
    toPublicStartup({ ...s, founders: byStartup[String(s._id)] || [], fundings: byFunding[String(s._id)] || [] })
  );
  return NextResponse.json(result);
}

export async function POST(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: StartupBody;
  try {
    body = (await req.json()) as StartupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const companyName = (body.companyName || "").trim();
  if (!companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  const founders: FounderInput[] = Array.isArray(body.founders)
    ? body.founders
        .filter((f) => f && (f.name || "").trim())
        .map((f) => ({ name: (f.name || "").trim(), position: (f.position || "").trim() }))
    : [];

  const fundings: Funding[] = Array.isArray(body.fundings)
    ? body.fundings
        .filter((f) => f && (f.name || "").trim())
        .map((f) => ({
          name: (f.name || "").trim(),
          from: (f.from || "").trim(),
          amount: Number(f.amount) || 0,
          link: (f.link || "").trim(),
          dateAwarded: f.dateAwarded || null,
        }))
    : [];

  const db = await getDb();
  const now = new Date().toISOString();
  const slug = await resolveStartupSlug(companyName);
  const startup: Omit<StartupDoc, "_id"> = {
    companyName,
    slug,
    productName: (body.productName || "").trim(),
    dateFounded: body.dateFounded || null,
    address: (body.address || "").trim(),
    lat: body.lat ?? null,
    lng: body.lng ?? null,
    website: (body.website || "").trim(),
    employeeRange: body.employeeRange || "",
    description: (body.description || "").trim(),
    province: normalizeProvince(body.province || body.address),
    logo: body.logo || "",
    featured: !!body.featured,
    status: body.status === "inactive" ? "inactive" : "active",
    createdAt: now,
    updatedAt: now,
  };

  const { insertedId } = await db.collection(collections.startups).insertOne(startup);
  const founderDocs = founders.map((f) => ({
    ...f,
    startupId: insertedId,
    createdAt: now,
  }));
  if (founderDocs.length) {
    await db.collection(collections.founders).insertMany(founderDocs);
  }
  const fundingDocs = fundings.map((f) => ({
    ...f,
    startupId: insertedId,
    createdAt: now,
  }));
  if (fundingDocs.length) {
    await db.collection(collections.fundings).insertMany(fundingDocs);
  }

  return NextResponse.json(
    { ...toPublicStartup({ ...startup, _id: insertedId, founders, fundings }) },
    { status: 201 }
  );
}

export async function DELETE(req: Request): Promise<NextResponse> {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const db = await getDb();
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const res = await db.collection(collections.startups).deleteOne({ _id: oid });
  if (!res.deletedCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.collection(collections.founders).deleteMany({ startupId: oid });
  await db.collection(collections.fundings).deleteMany({ startupId: oid });
  return NextResponse.json({ ok: true });
}
