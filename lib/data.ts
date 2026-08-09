import { getDb, collections } from "@/lib/mongodb";
import { toPublicStartup, toPublicItem, PROVINCES, startupSlug } from "@/lib/utils";
import { ObjectId } from "mongodb";
import type {
  ContentItem,
  ContentDoc,
  Founder,
  Funding,
  Startup,
  StartupDoc,
  CollectionName,
} from "@/lib/types";

export async function getCarouselItems(): Promise<ContentItem[]> {
  const db = await getDb();
  const items = (await db
    .collection(collections.carousel)
    .find({ active: true })
    .sort({ sortOrder: 1, createdAt: -1 })
    .toArray()) as ContentDoc[];
  return items.map((i) => toPublicItem(i));
}

export async function getNews({ limit, featured }: { limit?: number; featured?: boolean } = {}): Promise<ContentItem[]> {
  const db = await getDb();
  const query: Record<string, unknown> = { published: true };
  if (featured) query.featured = true;
  let cursor = db.collection(collections.news).find(query).sort({ createdAt: -1 });
  if (limit) cursor = cursor.limit(limit);
  const items = (await cursor.toArray()) as ContentDoc[];
  return items.map((i) => toPublicItem(i));
}

export async function getBlogs({ limit, featured }: { limit?: number; featured?: boolean } = {}): Promise<ContentItem[]> {
  const db = await getDb();
  const query: Record<string, unknown> = { published: true };
  if (featured) query.featured = true;
  let cursor = db.collection(collections.blogs).find(query).sort({ createdAt: -1 });
  if (limit) cursor = cursor.limit(limit);
  const items = (await cursor.toArray()) as ContentDoc[];
  return items.map((i) => toPublicItem(i));
}

export async function getGovernmentPages(): Promise<ContentItem[]> {
  const db = await getDb();
  const items = (await db.collection(collections.government).find().sort({ createdAt: -1 }).toArray()) as ContentDoc[];
  return items.map((i) => toPublicItem(i));
}

interface GetStartupsOptions {
  province?: string;
  featured?: boolean;
  limit?: number;
  id?: string;
  slug?: string;
}

export async function getStartups(options: GetStartupsOptions & { slug: string }): Promise<Startup | null>;
export async function getStartups(options: GetStartupsOptions & { id: string }): Promise<Startup | null>;
export async function getStartups(options: GetStartupsOptions & { province?: string; featured?: boolean; limit?: number }): Promise<Startup[]>;
export async function getStartups(options: GetStartupsOptions = {}): Promise<Startup[] | Startup | null> {
  const db = await getDb();
  const { province, featured, limit, id, slug } = options;

  if (slug) {
    let startup: StartupDoc | null;
    try {
      startup = (await db
        .collection(collections.startups)
        .findOne({ slug: { $eq: slug } })) as unknown as StartupDoc | null;
    } catch {
      startup = null;
    }
    if (!startup) {
      const all = (await db.collection(collections.startups).find({}).toArray()) as StartupDoc[];
      startup =
        all.find(
          (s) => (s.slug || startupSlug(s.companyName)) === slug
        ) || null;
    }
    if (!startup) return null;
    const founders = await db.collection(collections.founders).find({ startupId: startup._id }).toArray();
    const fundings = await db.collection(collections.fundings).find({ startupId: startup._id }).toArray();
    return toPublicStartup({
      ...startup,
      founders: founders.map((f) => ({ name: f.name, position: f.position } as Founder)),
      fundings: fundings.map((f) => fundingFromDoc(f)),
    });
  }

  if (id) {
    let oid: ObjectId;
    try {
      oid = new ObjectId(id);
    } catch {
      return null;
    }
    const startup = (await db.collection(collections.startups).findOne({ _id: oid })) as unknown as StartupDoc | null;
    if (!startup) return null;
    const founders = await db.collection(collections.founders).find({ startupId: oid }).toArray();
    const fundings = await db.collection(collections.fundings).find({ startupId: oid }).toArray();
    return toPublicStartup({
      ...startup,
      founders: founders.map((f) => ({ name: f.name, position: f.position } as Founder)),
      fundings: fundings.map((f) => fundingFromDoc(f)),
    });
  }

  const query: Record<string, unknown> = {};
  if (province) query.province = province;
  if (featured) query.featured = true;

  let cursor = db.collection(collections.startups).find(query).sort({ createdAt: -1 });
  if (limit) cursor = cursor.limit(limit);
  const startups = (await cursor.toArray()) as StartupDoc[];
  const ids = startups.map((s) => s._id);
  const founders = await db.collection(collections.founders).find({ startupId: { $in: ids } }).toArray();
  const fundings = await db.collection(collections.fundings).find({ startupId: { $in: ids } }).toArray();
  const byStartup: Record<string, Founder[]> = {};
  for (const f of founders) {
    const key = String(f.startupId);
    byStartup[key] = byStartup[key] || [];
    byStartup[key].push({ name: f.name, position: f.position });
  }
  const byFunding: Record<string, Funding[]> = {};
  for (const f of fundings) {
    const key = String(f.startupId);
    byFunding[key] = byFunding[key] || [];
    byFunding[key].push(fundingFromDoc(f));
  }
  return startups.map((s) =>
    toPublicStartup({ ...s, founders: byStartup[String(s._id)] || [], fundings: byFunding[String(s._id)] || [] })
  );
}

function fundingFromDoc(f: Record<string, unknown>): Funding {
  return {
    name: String(f.name || ""),
    from: String(f.from || ""),
    amount: Number(f.amount) || 0,
    link: String(f.link || ""),
    dateAwarded: f.dateAwarded ? String(f.dateAwarded) : null,
  };
}

export async function getBySlug(coll: CollectionName, slug: string): Promise<ContentItem | null> {
  const db = await getDb();
  const item = (await db.collection(coll).findOne({ slug })) as unknown as ContentDoc | null;
  return item ? toPublicItem(item) : null;
}

export async function getProvinceCounts(): Promise<Record<string, number>> {
  const db = await getDb();
  const counts: Record<string, number> = {};
  for (const p of PROVINCES) {
    counts[p.name] = await db
      .collection(collections.startups)
      .countDocuments({ province: p.name });
  }
  counts.Total = await db.collection(collections.startups).countDocuments();
  return counts;
}

export async function getFundingRanking(limit = 5): Promise<Startup[]> {
  const startups = await getStartups({});
  return startups
    .filter((s) => s.totalFunding > 0)
    .sort((a, b) => b.totalFunding - a.totalFunding)
    .slice(0, limit);
}

/**
 * Resolve a unique, SEO-friendly slug for a company name. When the base slug
 * is already used by another startup, appends -2, -3, ... until it is free.
 */
export async function resolveStartupSlug(
  companyName: string,
  excludeId?: string
): Promise<string> {
  const db = await getDb();
  const base = startupSlug(companyName);
  const matches = (await db
    .collection(collections.startups)
    .find(
      { slug: { $regex: `^${base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(-[0-9]+)?$` } },
      { projection: { slug: 1 } }
    )
    .toArray()) as Array<{ slug?: string }>;
  const taken = new Set(matches.map((m) => m.slug).filter(Boolean) as string[]);

  if (excludeId) {
    try {
      const self = (await db.collection(collections.startups).findOne(
        { _id: new ObjectId(excludeId) },
        { projection: { slug: 1 } }
      )) as { slug?: string } | null;
      if (self?.slug) taken.delete(self.slug);
    } catch {
      /* invalid id — no self to exclude */
    }
  }

  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i += 1;
  return `${base}-${i}`;
}
