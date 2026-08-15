import { NextResponse } from "next/server";
import { isAuthed } from "@/lib/auth";
import { getDb, collections } from "@/lib/mongodb";
import { withRateLimit, RATE_LIMITS } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface LinkOptionItem {
  group: string;
  label: string;
  value: string;
}

interface SluggedDoc {
  title?: unknown;
  slug?: unknown;
}

export async function GET(req: Request): Promise<NextResponse> {
  const limited = withRateLimit(req, RATE_LIMITS.adminGet);
  if (limited) return limited;
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = await getDb();

  const [news, blogs, gov, startups] = await Promise.all([
    db
      .collection(collections.news)
      .find({}, { projection: { title: 1, slug: 1 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    db
      .collection(collections.blogs)
      .find({}, { projection: { title: 1, slug: 1 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    db
      .collection(collections.government)
      .find({}, { projection: { title: 1, slug: 1 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
    db
      .collection(collections.startups)
      .find({}, { projection: { companyName: 1, slug: 1 } })
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray(),
  ]);

  const items: LinkOptionItem[] = [
    { group: "Site", label: "Home", value: "/" },
    { group: "Site", label: "Startups", value: "/startups" },
    { group: "Site", label: "News", value: "/news" },
    { group: "Site", label: "Blog", value: "/blog" },
    { group: "Site", label: "Government Programs", value: "/government" },
    { group: "Site", label: "About Us", value: "/about" },
    ...(news as unknown as SluggedDoc[]).map((n) => ({
      group: "News articles",
      label: String(n.title || "Untitled"),
      value: `/news/${encodeURIComponent(String(n.slug || ""))}`,
    })),
    ...(blogs as unknown as SluggedDoc[]).map((b) => ({
      group: "Blog posts",
      label: String(b.title || "Untitled"),
      value: `/blog/${encodeURIComponent(String(b.slug || ""))}`,
    })),
    ...(gov as unknown as SluggedDoc[]).map((g) => ({
      group: "Government programs",
      label: String(g.title || "Untitled"),
      value: `/government/${encodeURIComponent(String(g.slug || ""))}`,
    })),
    ...startups.map((s) => ({
      group: "Startups",
      label: String(s.companyName || "Untitled startup"),
      value: `/startups/${String(s.slug || "")}`,
    })),
  ];

  return NextResponse.json({ items });
}