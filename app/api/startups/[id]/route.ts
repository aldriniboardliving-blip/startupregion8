import { NextResponse } from "next/server";
import { getDb, collections } from "@/lib/mongodb";
import { isAuthed } from "@/lib/auth";
import { normalizeProvince, toPublicStartup } from "@/lib/utils";
import { resolveStartupSlug } from "@/lib/data";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";
import { modifyResult } from "@/lib/crud";
import { ObjectId } from "mongodb";
import type { FounderInput, Funding, FundingInput, StartupDoc } from "@/lib/types";

interface RouteContext {
  params: { id: string };
}

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

export async function GET(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.publicGet);
  if (limited) return limited;
  const authed = await isAuthed();
  const db = await getDb();
  let oid: ObjectId;
  try {
    oid = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const startup = (await db.collection(collections.startups).findOne({ _id: oid })) as unknown as StartupDoc | null;
  // Hide de-listed/inactive startups from anonymous visitors.
  if (!startup || (!authed && startup.status === "inactive")) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const founders = await db
    .collection(collections.founders)
    .find({ startupId: oid })
    .toArray();
  const fundings = await db
    .collection(collections.fundings)
    .find({ startupId: oid })
    .toArray();
  return NextResponse.json(
    toPublicStartup({
      ...startup,
      founders: founders.map((f) => ({ name: f.name, position: f.position })),
      fundings: fundings.map((f) => ({
        name: f.name,
        from: f.from,
        amount: Number(f.amount) || 0,
        link: f.link,
        dateAwarded: f.dateAwarded || null,
      })),
    })
  );
}

export async function PUT(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  let oid: ObjectId;
  try {
    oid = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  let body: StartupBody;
  try {
    body = (await req.json()) as StartupBody;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
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

  const companyName = (body.companyName || "").trim();
  const slug = await resolveStartupSlug(companyName, params.id);

  const update = {
    $set: {
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
      updatedAt: new Date().toISOString(),
    },
  };

  const res = await db.collection(collections.startups).findOneAndUpdate(
    { _id: oid },
    update,
    { returnDocument: "after" }
  );
  const updated = modifyResult<StartupDoc>(res);
  if (!updated) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.collection(collections.founders).deleteMany({ startupId: oid });
  const founderDocs = founders.map((f) => ({
    ...f,
    startupId: oid,
    createdAt: new Date().toISOString(),
  }));
  if (founderDocs.length) {
    await db.collection(collections.founders).insertMany(founderDocs);
  }

  await db.collection(collections.fundings).deleteMany({ startupId: oid });
  const fundingDocs = fundings.map((f) => ({
    ...f,
    startupId: oid,
    createdAt: new Date().toISOString(),
  }));
  if (fundingDocs.length) {
    await db.collection(collections.fundings).insertMany(fundingDocs);
  }

  return NextResponse.json(toPublicStartup({ ...updated, founders, fundings }));
}

export async function DELETE(req: Request, { params }: RouteContext): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.mutation);
  if (limited) return limited;
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const db = await getDb();
  let oid: ObjectId;
  try {
    oid = new ObjectId(params.id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const res = await db.collection(collections.startups).deleteOne({ _id: oid });
  if (!res.deletedCount) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await db.collection(collections.founders).deleteMany({ startupId: oid });
  await db.collection(collections.fundings).deleteMany({ startupId: oid });
  return NextResponse.json({ ok: true });
}
