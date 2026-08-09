import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "";
  const rules: MetadataRoute.Robots["rules"] = [
    {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/sys-portal-x9/", "/api/"],
    },
  ];
  return siteUrl
    ? { rules, sitemap: `${siteUrl}/sitemap.xml` }
    : { rules };
}