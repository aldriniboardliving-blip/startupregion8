import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { getNews } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "News",
  description:
    "Latest news, events, funding opportunities, and announcements from the Eastern Visayas startup community.",
};

export default async function NewsPage() {
  const items = await getNews();
  return (
    <div className="container-x py-14">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Stay Informed
        </p>
        <h1 className="section-title mt-1">Latest News</h1>
        <p className="mt-3 text-slate-500">
          Updates, announcements, and stories from the Region 8 startup community.
        </p>
      </div>
      {items.length === 0 ? (
        <EmptyState
          scene="news"
          eyebrow="Stay Informed"
          title="No news published yet"
          description="Updates, announcements, and stories from the Region 8 startup community are on the way. Get notified the moment something breaks."
          actions={[
            { label: "Explore startups", href: "/startups", variant: "primary" },
            { label: "Visit the blog", href: "/blog" },
          ]}
          notify
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((n) => (
            <ArticleCard key={n._id} item={n} type="news" />
          ))}
        </div>
      )}
    </div>
  );
}
