import type {
  Province,
  ContentDoc,
  ContentItem,
  Founder,
  Funding,
  Startup,
  StartupDoc,
} from "@/lib/types";

export const PROVINCES: Province[] = [
  { name: "Leyte", slug: "leyte" },
  { name: "Southern Leyte", slug: "southern-leyte" },
  { name: "Biliran", slug: "biliran" },
  { name: "Samar", slug: "samar" },
  { name: "Northern Samar", slug: "northern-samar" },
  { name: "Eastern Samar", slug: "eastern-samar" },
];

export function normalizeProvince(value: string | undefined): string {
  if (!value) return "";
  const v = String(value).trim();
  const lower = v.toLowerCase();

  const bySlug = PROVINCES.find((p) => p.slug === lower);
  if (bySlug) return bySlug.name;

  const byExactName = PROVINCES.find((p) => p.name.toLowerCase() === lower);
  if (byExactName) return byExactName.name;

  // Score each province by how many of its words appear in the address, so
  // multi-word names like "Southern Leyte" win over "Leyte".
  let best: Province | undefined;
  let bestScore = 0;
  for (const p of PROVINCES) {
    const words = p.name.toLowerCase().split(" ");
    let score = 0;
    for (const w of words) {
      if (lower.includes(w)) score += 1;
    }
    if (score > bestScore) {
      best = p;
      bestScore = score;
    }
  }
  return best ? best.name : "";
}

export function slugify(text: string | undefined): string {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/** True when a stored "address" is actually a bare lat/lng pair (leftover from
 * an old fallback that persisted coordinates instead of a real address). */
export function isBareCoordinates(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^-?\d+(\.\d+)?\s*[, ]\s*-?\d+(\.\d+)?$/.test(String(value).trim());
}

/** Slug a startup company name into a URL-safe, SEO-friendly identifier. */
export function startupSlug(companyName: string): string {
  const base = slugify(companyName) || "startup";
  return base.replace(/[^a-z0-9-]/g, "");
}

export function toPublicStartup(
  s: StartupDoc & { founders?: Founder[]; fundings?: Funding[] }
): Startup {
  const fundings: Funding[] = (s.fundings || []).map((f) => ({
    name: f.name,
    from: f.from,
    amount: Number(f.amount) || 0,
    link: f.link,
    dateAwarded: f.dateAwarded || null,
  }));
  return {
    _id: String(s._id),
    slug: s.slug || startupSlug(s.companyName),
    companyName: s.companyName,
    productName: s.productName,
    dateFounded: s.dateFounded,
    address: isBareCoordinates(s.address) ? "" : s.address,
    lat: s.lat,
    lng: s.lng,
    website: s.website,
    employeeRange: s.employeeRange,
    description: s.description,
    province: s.province,
    logo: s.logo,
    featured: s.featured,
    status: s.status,
    founders: s.founders || [],
    fundings,
    totalFunding: fundings.reduce((sum, f) => sum + f.amount, 0),
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}

export function toPublicItem(item: ContentDoc): ContentItem {
  return {
    _id: String(item._id),
    title: item.title,
    subtitle: item.subtitle,
    slug: item.slug,
    excerpt: item.excerpt,
    content: item.content,
    image: item.image,
    link: item.link,
    category: item.category,
    author: item.author,
    featured: item.featured,
    active: item.active,
    sortOrder: item.sortOrder,
    createdAt: item.createdAt,
    published: item.published,
  };
}

export function formatDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatCurrency(amount: number): string {
  const n = Number(amount) || 0;
  return "₱" + n.toLocaleString("en-PH", { maximumFractionDigits: 0 });
}
