import Link from "next/link";
import Carousel from "@/components/Carousel";
import ArticleCard from "@/components/ArticleCard";
import StartupCard from "@/components/StartupCard";
import ProvinceExplorer from "@/components/ProvinceExplorer";
import EmptyState from "@/components/EmptyState";
import {
  getCarouselItems,
  getNews,
  getBlogs,
  getStartups,
  getFundingRanking,
  getProvinceCounts,
} from "@/lib/data";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [carousel, featuredBlogs, featuredNews, latestNews, featuredStartups, provinceCounts, topFunded] =
    await Promise.all([
      getCarouselItems(),
      getBlogs({ limit: 3, featured: true }),
      getNews({ limit: 2, featured: true }),
      getNews({ limit: 3 }),
      getStartups({ featured: true, limit: 6 }),
      getProvinceCounts(),
      getFundingRanking(5),
    ]);

  const heroBlog = featuredBlogs[0];

  return (
    <>
      {/* Hero carousel */}
      <Carousel items={carousel} />

      {/* Intro strip */}
      <section className="border-b border-slate-200 bg-white py-6">
        <div className="container-x flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Eastern Visayas Startup Ecosystem
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Connecting innovators, founders, and the community across all six provinces.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700">
              {provinceCounts.Total} startups registered
            </span>
            <Link href="/startups" className="btn-primary">
              Browse all startups
            </Link>
          </div>
        </div>
      </section>

      {/* Featured startups */}
      {featuredStartups.length > 0 && (
        <section className="container-x py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Featured Companies
              </p>
              <h2 className="section-title mt-1">Featured Startups</h2>
            </div>
            <Link
              href="/startups"
              className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block"
            >
              View all →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredStartups.map((s) => (
              <StartupCard key={s._id} startup={s} />
            ))}
          </div>
          <div className="mt-6 sm:hidden">
            <Link href="/startups" className="btn-secondary w-full">
              View all startups
            </Link>
          </div>
        </section>
      )}

      {/* Featured blog + news */}
      <section className="bg-white py-16">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="section-title">Featured Blogs</h2>
                <Link href="/blog" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              {heroBlog ? (
                <div className="space-y-6">
                  <ArticleCard item={heroBlog} type="blog" variant="wide" />
                  {featuredBlogs.slice(1).map((b) => (
                    <ArticleCard key={b._id} item={b} type="blog" />
                  ))}
                </div>
              ) : (
                <EmptyState
                  scene="blog"
                  title="No featured blog posts yet"
                  description="Founder stories from across Eastern Visayas are on the way."
                  actions={[
                    { label: "Visit the blog", href: "/blog", variant: "primary" },
                    { label: "Read the news", href: "/news" },
                  ]}
                />
              )}
            </div>
            <div>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="section-title">Latest News</h2>
                <Link href="/news" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                  View all →
                </Link>
              </div>
              {featuredNews.length > 0 || latestNews.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2">
                  {[...featuredNews, ...latestNews].slice(0, 4).map((n) => (
                    <ArticleCard key={n._id} item={n} type="news" />
                  ))}
                </div>
              ) : (
                <EmptyState
                  scene="news"
                  title="No news yet"
                  description="Updates from the Region 8 startup community are coming soon."
                  actions={[
                    { label: "Visit the news", href: "/news", variant: "primary" },
                    { label: "Explore startups", href: "/startups" },
                  ]}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Funding leaderboard */}
      {topFunded.length > 0 && (
        <section className="bg-white py-16">
          <div className="container-x">
            <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                  Funding Leaderboard
                </p>
                <h2 className="section-title mt-1">Top Funded Startups</h2>
                <p className="mt-2 text-slate-500">
                  The region's startups ranked by total funding & awards received.
                </p>
              </div>
              <Link
                href="/startups"
                className="text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                View all startups →
              </Link>
            </div>

            <div className="grid gap-4">
              {topFunded.map((s, i) => {
                const topAward = s.fundings.reduce((a, b) => (b.amount > a.amount ? b : a), s.fundings[0]);
                const medal =
                  i === 0
                    ? "bg-amber-400 text-slate-900"
                    : i === 1
                    ? "bg-slate-300 text-slate-800"
                    : i === 2
                    ? "bg-amber-700 text-white"
                    : "bg-slate-100 text-slate-500";
                return (
                  <Link
                    key={s._id}
                    href={`/startups/${s.slug}`}
                    className="card group flex items-center gap-4 p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg sm:p-5"
                  >
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-black ${medal}`}
                    >
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col truncate">
                      <h3 className="truncate font-bold text-slate-900 group-hover:text-brand-600">
                        {s.productName}
                      </h3>
                      <span className="truncate text-xs font-normal text-slate-500">
                        {s.companyName}
                      </span>
                    </div>
                      <p className="mt-0.5 truncate text-sm text-slate-500">
                        {topAward.name}
                        {topAward.from ? ` · ${topAward.from}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-emerald-600">
                        {formatCurrency(s.totalFunding)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {s.fundings.length} award{s.fundings.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Provinces */}
      <section className="container-x py-16">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            Where We Operate
          </p>
          <h2 className="section-title mt-1">Explore by Province</h2>
          <p className="mt-3 text-slate-500">
            Click a province to see all registered startups within it.
          </p>
        </div>
        <ProvinceExplorer initialCounts={provinceCounts} />
      </section>
    </>
  );
}
