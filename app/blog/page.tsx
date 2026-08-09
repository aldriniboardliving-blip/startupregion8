import type { Metadata } from "next";
import ArticleCard from "@/components/ArticleCard";
import EmptyState from "@/components/EmptyState";
import { getBlogs } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Stories, insights, and lessons from founders building startups across Eastern Visayas (Region 8).",
};

export default async function BlogPage() {
  const items = await getBlogs();
  const [hero, ...rest] = items;

  return (
    <div className="container-x py-14">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Insights & Stories
        </p>
        <h1 className="section-title mt-1">Startup Blog</h1>
        <p className="mt-3 text-slate-500">
          Stories, lessons, and insights from founders across Eastern Visayas.
        </p>
      </div>

      {items.length === 0 ? (
        <EmptyState
          scene="blog"
          eyebrow="Insights & Stories"
          title="No blog posts published yet"
          description="We're working on stories, lessons, and insights from founders across Eastern Visayas. Subscribe and be the first to know when they're live."
          actions={[
            { label: "Browse startups", href: "/startups", variant: "primary" },
            { label: "Read the news", href: "/news" },
          ]}
          notify
        />
      ) : (
        <>
          {hero && (
            <div className="mb-10">
              <ArticleCard item={hero} type="blog" variant="wide" />
            </div>
          )}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((b) => (
              <ArticleCard key={b._id} item={b} type="blog" />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
