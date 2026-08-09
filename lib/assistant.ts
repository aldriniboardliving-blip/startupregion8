import { getDb, collections } from "@/lib/mongodb";
import { normalizeProvince, PROVINCES, formatCurrency } from "@/lib/utils";
import type { Db } from "mongodb";

export interface AssistantItem {
  label: string;
  sub?: string;
  href?: string;
  value?: string;
}

export interface AssistantReply {
  text: string;
  items?: AssistantItem[];
  href?: string;
  suggestions?: string[];
}

interface StartupBrief {
  _id: unknown;
  companyName: string;
  province: string;
  slug?: string;
  productName?: string;
  totalFunding?: number;
  status?: string;
  featured?: boolean;
}

/* ----------------------------------------------------------------------------
 * Intent detection
 * -------------------------------------------------------------------------- */

type Intent =
  | "greeting"
  | "help"
  | "count_total"
  | "count_province"
  | "list_provinces"
  | "top_funding"
  | "recent_funding"
  | "featured"
  | "startup_lookup"
  | "founders"
  | "news"
  | "blogs"
  | "government"
  | "site_info"
  | "unknown";

const PROVINCE_KEYWORDS = PROVINCES.map((p) => p.name.toLowerCase());
const REGION_KEYWORDS = ["eastern visayas", "region 8", "region viii", "region eight"];

function matchProvince(q: string): string | null {
  const lower = q.toLowerCase();
  if (isRegionQuery(lower)) return null;

  const norm = normalizeProvince(lower);
  if (norm && PROVINCES.some((p) => p.name.toLowerCase() === norm.toLowerCase())) return norm;

  // "in leyte / samar / biliran" style matches
  for (const p of PROVINCES) {
    const words = p.name.toLowerCase().split(" ");
    if (words.every((w) => lower.includes(w))) return p.name;
  }
  return null;
}

function isRegionQuery(q: string): boolean {
  const lower = q.toLowerCase();
  return REGION_KEYWORDS.some((r) => lower.includes(r));
}

function isCountQuery(q: string): boolean {
  return /how many|count|total|number of|no\.? of|quantity/.test(q.toLowerCase());
}

function isFundingQuery(q: string): boolean {
  return /funding|fund|investment|raise|financ(e|ing)|capital/.test(q.toLowerCase());
}

function isFounderQuery(q: string): boolean {
  return /founder|co-founder|cofounder|team|who founded|started/.test(q.toLowerCase());
}

function detectIntent(q: string): Intent {
  const lower = q.toLowerCase().trim();
  if (!lower) return "help";
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|kamusta|magandang)/.test(lower)) return "greeting";
  if (/help|what can you do|how do you work|what do you know|guide|commands/.test(lower)) return "help";
  if (/founder/.test(lower)) return "founders";
  if (/top|number one|highest|best funded|most funding|leading startup|ranking|rank/.test(lower)) return "top_funding";
  if (/new|recent|latest/.test(lower) && isFundingQuery(lower)) return "recent_funding";
  if (/(who is|tell me about|more about|profile|about the (company|startup))/.test(lower)) return "startup_lookup";
  if (/news|headline|latest update/.test(lower)) return "news";
  if (/blog|article|post/.test(lower)) return "blogs";
  if (/government|program|initiative|dti|dost|grant|agency/.test(lower)) return "government";
  if (/(featured|spotlight|highlights)/.test(lower)) return "featured";
  if (/which provinces|list.*province|by province|per province/.test(lower)) return "list_provinces";
  if (isCountQuery(lower)) {
    const prov = matchProvince(lower);
    if (prov || isRegionQuery(lower)) return "count_province";
    return "count_total";
  }
  if (matchProvince(lower) || isRegionQuery(lower)) {
    // e.g. "startups in Leyte"
    if (/startup|company|business/.test(lower)) return "count_province";
  }
  if (/about this (site|app|website)|what is this|who made this/.test(lower)) return "site_info";
  return "unknown";
}

/* ----------------------------------------------------------------------------
 * Helpers
 * -------------------------------------------------------------------------- */

function money(n: number | undefined): string {
  return n ? formatCurrency(n) : "no public funding data";
}

/* ----------------------------------------------------------------------------
 * Handlers — each runs a real DB query and returns an answer
 * -------------------------------------------------------------------------- */

async function handleGreeting(): Promise<AssistantReply> {
  return {
    text: "Hi! I'm the Region 8 assistant. I can look up real data from this site — ask me about startups, funding, provinces, news, blogs, or government programs.",
    suggestions: [
      "How many startups are in Eastern Visayas?",
      "Which startup has the most funding?",
      "Is there new funding?",
      "Startups in Leyte",
      "What government programs are available?",
      "Latest news",
    ],
  };
}

async function handleHelp(): Promise<AssistantReply> {
  return {
    text: "I answer questions using the live data in this app. Try things like:",
    items: [
      { label: "Counts", sub: "“How many startups are there?” · “Startups in Biliran”" },
      { label: "Funding", sub: "“Which startup has the most funding?” · “New funding?”" },
      { label: "Spotlights", sub: "“Who are the featured startups?”" },
      { label: "Profiles", sub: "“Tell me about iBoard Solutions Inc.”" },
      { label: "Founders", sub: "“Who founded …?”" },
      { label: "Content", sub: "“Latest news” · “Blog posts” · “Government programs”" },
    ],
    suggestions: ["How many startups are there?", "Which startup is the best funded?", "Latest news"],
  };
}

async function handleCountTotal(): Promise<AssistantReply> {
  const db = await getDb();
  const total = await db.collection(collections.startups).countDocuments();
  const active = await db.collection(collections.startups).countDocuments({ status: "active" });
  const text =
    total === 0
      ? "There are no startups in the database yet."
      : `There are ${total} startup${total === 1 ? "" : "s"} listed on Region 8 Startups (${active} active, ${total - active} inactive).`;
  return {
    text,
    suggestions: ["By province?", "Which startup is the best funded?", "Who are the featured startups?"],
  };
}

async function handleCountProvince(q: string): Promise<AssistantReply> {
  const db = await getDb();
  const prov = matchProvince(q);

  if (prov) {
    const count = await db.collection(collections.startups).countDocuments({ province: prov });
    const startups = (await db
      .collection(collections.startups)
      .find({ province: prov })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray()) as unknown as StartupBrief[];
    return {
      text:
        count === 0
          ? `There are no startups listed under ${prov} yet.`
          : `There ${count === 1 ? "is" : "are"} ${count} startup${count === 1 ? "" : "s"} in ${prov}.`,
      items: startups.map((s) => ({
        label: s.companyName,
        sub: s.productName ? s.productName : undefined,
        href: s.slug ? `/startups/${s.slug}` : undefined,
      })),
      suggestions: ["Which startup is the best funded?", "How many in Eastern Visayas total?"],
    };
  }

  if (isRegionQuery(q)) {
    const total = await db.collection(collections.startups).countDocuments();
    return {
      text: `Across Eastern Visayas (Region 8), there ${total === 1 ? "is" : "are"} ${total} startup${total === 1 ? "" : "s"} listed on this site.`,
      suggestions: ["By province?", "Which startup is the best funded?"],
    };
  }

  return handleCountTotal();
}

async function handleListProvinces(): Promise<AssistantReply> {
  const db = await getDb();
  const counts: { _id: string; count: number }[] = (await db
    .collection(collections.startups)
    .aggregate<{ _id: string; count: number }>([{ $group: { _id: "$province", count: { $sum: 1 } } }])
    .toArray()) as unknown as { _id: string; count: number }[];
  const total = counts.reduce((sum, c) => sum + c.count, 0);
  const items = counts
    .filter((c) => c._id)
    .sort((a, b) => b.count - a.count)
    .map((c) => ({
      label: c._id,
      value: `${c.count} startup${c.count === 1 ? "" : "s"}`,
    }));
  return {
    text: `Startup distribution across the provinces (${total} total):`,
    items,
    suggestions: ["Which startup is the best funded?", "Startups in Leyte"],
  };
}

async function handleTopFunding(): Promise<AssistantReply> {
  const db = await getDb();
  const startups = (await db
    .collection(collections.startups)
    .find({})
    .sort({ createdAt: -1 })
    .toArray()) as unknown as StartupBrief[];

  const ids = startups.map((s) => s._id);
  const funding = await db
    .collection(collections.fundings)
    .find({ startupId: { $in: ids } })
    .toArray();

  const byStartup = new Map<string, number>();
  for (const f of funding) {
    const key = String(f.startupId);
    byStartup.set(key, (byStartup.get(key) || 0) + Number(f.amount) || 0);
  }

  const ranked = startups
    .map((s) => ({ ...s, _id: String(s._id), totalFunding: byStartup.get(String(s._id)) || 0 }))
    .filter((s) => s.totalFunding > 0)
    .sort((a, b) => b.totalFunding - a.totalFunding)
    .slice(0, 5);

  if (!ranked.length) {
    return {
      text: "No startup currently has public funding data on this site.",
      suggestions: ["Latest news", "Government programs"],
    };
  }

  return {
    text: `Here are the top-funded startups in Region 8 (by total announced funding):`,
    items: ranked.map((s, i) => ({
      label: `${i + 1}. ${s.companyName}`,
      sub: `${formatCurrency(s.totalFunding)}${s.province ? ` · ${s.province}` : ""}`,
      href: s.slug ? `/startups/${s.slug}` : undefined,
    })),
    suggestions: ["Is there new funding?", "Startups in Leyte"],
  };
}

async function handleRecentFunding(): Promise<AssistantReply> {
  const db = await getDb();
  const recent = await db
    .collection(collections.fundings)
    .find({})
    .sort({ dateAwarded: -1, createdAt: -1 })
    .limit(5)
    .toArray();
  if (!recent.length) {
    return {
      text: "There are no funding records on this site yet.",
      suggestions: ["Latest news", "Which startup is the best funded?"],
    };
  }
  const startups = (await db
    .collection(collections.startups)
    .find({}, { projection: { companyName: 1, slug: 1 } })
    .toArray()) as unknown as StartupBrief[];
  const byId = new Map(startups.map((s) => [String(s._id), s]));
  return {
    text: "The most recent funding records are:",
    items: recent.map((f) => {
      const s = byId.get(String(f.startupId));
      return {
        label: `${s?.companyName || "A startup"} — ${f.name}`,
        sub: `${formatCurrency(Number(f.amount))}${f.from ? ` · ${f.from}` : ""}${f.dateAwarded ? ` · ${String(f.dateAwarded).slice(0, 10)}` : ""}`,
        href: s?.slug ? `/startups/${s.slug}` : undefined,
      };
    }),
    suggestions: ["Which startup is the best funded?", "Latest news"],
  };
}

async function handleFeatured(): Promise<AssistantReply> {
  const db = await getDb();
  const featured = (await db
    .collection(collections.startups)
    .find({ featured: true })
    .sort({ createdAt: -1 })
    .toArray()) as unknown as StartupBrief[];
  if (!featured.length) {
    return {
      text: "There are no featured startups right now.",
      suggestions: ["How many startups are there?", "Which startup is the best funded?"],
    };
  }
  return {
    text: `Here ${featured.length === 1 ? "is" : "are"} the featured startup${featured.length === 1 ? "" : "s"}:`,
    items: featured.map((s) => ({
      label: s.companyName,
      sub: s.province,
      href: s.slug ? `/startups/${s.slug}` : undefined,
    })),
    suggestions: ["Which startup is the best funded?", "How many startups are there?"],
  };
}

async function findStartupByName(db: Db, q: string) {
  const lower = q.toLowerCase();
  const keywords = lower
    .replace(/tell me about|who is|more about|profile|startup|company|the |a |an /g, "")
    .split(/[^a-z0-9&.\-]+/)
    .filter((w) => w.length > 2);

  const all = (await db.collection(collections.startups).find({}).toArray()) as unknown as Array<
    StartupBrief & { description?: string }
  >;

  const scored = all
    .map((s) => {
      const name = s.companyName.toLowerCase();
      let score = 0;
      for (const kw of keywords) {
        if (name.includes(kw)) score += 1;
      }
      return { s, score };
    })
    .sort((a, b) => b.score - a.score);

  const match = scored[0] && scored[0].score > 0 ? scored[0].s : null;
  return match;
}

async function handleStartupLookup(q: string): Promise<AssistantReply> {
  const db = await getDb();
  const s = await findStartupByName(db, q);
  if (!s) {
    return {
      text: "I couldn't find that startup. Try asking about a specific company name.",
      suggestions: ["How many startups are there?", "Which startup is the best funded?"],
    };
  }
  return {
    text: `**${s.companyName}**${s.province ? ` — ${s.province}` : ""}\n${s.productName ? `Product: ${s.productName}\n` : ""}${s.description ? `${s.description}\n` : ""}Total funding: ${money(s.totalFunding)}`,
    href: s.slug ? `/startups/${s.slug}` : undefined,
    suggestions: ["Who founded them?", "How much funding do they have?", "Other startups in this province"],
  };
}

async function handleFounders(q: string): Promise<AssistantReply> {
  const db = await getDb();
  const s = await findStartupByName(db, q);
  if (!s) {
    return {
      text: "Which startup's founders are you asking about? Try including the company name.",
      suggestions: ["How many startups are there?", "Tell me about iBoard Solutions Inc."],
    };
  }
  const founders = await db
    .collection(collections.founders)
    .find({ startupId: s._id })
    .toArray();
  return {
    text: founders.length
      ? `Founders of ${s.companyName}:`
      : `No founders are listed for ${s.companyName} yet.`,
    items: founders.map((f) => ({
      label: f.name,
      sub: f.position,
      href: s.slug ? `/startups/${s.slug}` : undefined,
    })),
  };
}

async function handleNews(): Promise<AssistantReply> {
  const db = await getDb();
  const items = await db
    .collection(collections.news)
    .find({ published: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  if (!items.length) {
    return { text: "There are no published news articles yet.", suggestions: ["Blog posts", "Government programs"] };
  }
  return {
    text: `Here are the latest news articles:`,
    items: items.map((n) => ({
      label: String(n.title || "Untitled"),
      sub: n.excerpt ? String(n.excerpt).slice(0, 100) : undefined,
      href: n.slug ? `/news/${n.slug}` : undefined,
    })),
    suggestions: ["Latest blog posts", "How many startups are there?"],
  };
}

async function handleBlogs(): Promise<AssistantReply> {
  const db = await getDb();
  const items = await db
    .collection(collections.blogs)
    .find({ published: true })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();
  if (!items.length) {
    return { text: "There are no published blog posts yet.", suggestions: ["Latest news", "Government programs"] };
  }
  return {
    text: `Here are the latest blog posts:`,
    items: items.map((b) => ({
      label: String(b.title || "Untitled"),
      sub: b.excerpt ? String(b.excerpt).slice(0, 100) : undefined,
      href: b.slug ? `/blog/${b.slug}` : undefined,
    })),
    suggestions: ["Latest news", "Government programs"],
  };
}

async function handleGovernment(): Promise<AssistantReply> {
  const db = await getDb();
  const items = await db
    .collection(collections.government)
    .find({})
    .sort({ createdAt: -1 })
    .toArray();
  if (!items.length) {
    return {
      text: "There are no government programs listed yet.",
      suggestions: ["How many startups are there?", "Latest news"],
    };
  }
  return {
    text: `Here ${items.length === 1 ? "is" : "are"} the government program${items.length === 1 ? "" : "s"} listed:`,
    items: items.map((g) => ({
      label: String(g.title || "Untitled"),
      sub: g.excerpt ? String(g.excerpt).slice(0, 100) : undefined,
      href: g.slug ? `/government/${g.slug}` : undefined,
    })),
    suggestions: ["How many startups are there?", "Which startup is the best funded?"],
  };
}

async function handleSiteInfo(): Promise<AssistantReply> {
  return {
    text: "Region 8 Startups is a directory and hub for the startup ecosystem of Eastern Visayas (Region 8), Philippines — featuring startups, funding records, news, blogs, and government programs across Leyte, Southern Leyte, Biliran, Samar, Northern Samar, and Eastern Samar.",
    suggestions: ["How many startups are there?", "Which startup is the best funded?", "Latest news"],
  };
}

async function handleUnknown(q: string): Promise<AssistantReply> {
  const prov = matchProvince(q);
  const countIntent = isCountQuery(q) || isFundingQuery(q);
  if (prov && countIntent) return handleCountProvince(q);
  return {
    text: "I'm not sure I understood that. I can look up data about startups, provinces, funding, founders, news, blogs, and government programs on this site.",
    suggestions: ["How many startups are there?", "Which startup is the best funded?", "Latest news"],
  };
}

/* ----------------------------------------------------------------------------
 * Entry point
 * -------------------------------------------------------------------------- */

export async function answerQuestion(q: string): Promise<AssistantReply> {
  const intent = detectIntent(q);
  switch (intent) {
    case "greeting":
      return handleGreeting();
    case "help":
      return handleHelp();
    case "count_total":
      return handleCountTotal();
    case "count_province":
      return handleCountProvince(q);
    case "list_provinces":
      return handleListProvinces();
    case "top_funding":
      return handleTopFunding();
    case "recent_funding":
      return handleRecentFunding();
    case "featured":
      return handleFeatured();
    case "startup_lookup":
      return handleStartupLookup(q);
    case "founders":
      return handleFounders(q);
    case "news":
      return handleNews();
    case "blogs":
      return handleBlogs();
    case "government":
      return handleGovernment();
    case "site_info":
      return handleSiteInfo();
    default:
      return handleUnknown(q);
  }
}
