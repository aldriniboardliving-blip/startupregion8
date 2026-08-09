import type { MetadataRoute } from "next";
import {
  getBlogs,
  getNews,
  getGovernmentPages,
  getStartups,
} from "@/lib/data";
import { PROVINCES } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [startups, news, blogs, government] = await Promise.all([
    getStartups({}),
    getNews({}),
    getBlogs({}),
    getGovernmentPages(),
  ]);

  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/startups`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/government`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  const startupRoutes = startups.map((s) => ({
    url: `${SITE_URL}/startups/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const newsRoutes = news.map((n) => ({
    url: `${SITE_URL}/news/${n.slug}`,
    lastModified: n.updatedAt ? new Date(n.updatedAt) : now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const blogRoutes = blogs.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt ? new Date(b.updatedAt) : now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  const govRoutes = government.map((g) => ({
    url: `${SITE_URL}/government/${g.slug}`,
    lastModified: g.updatedAt ? new Date(g.updatedAt) : now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  const provinceRoutes = PROVINCES.map((p) => ({
    url: `${SITE_URL}/startups?province=${p.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...startupRoutes,
    ...newsRoutes,
    ...blogRoutes,
    ...govRoutes,
    ...provinceRoutes,
  ];
}