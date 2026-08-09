import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import StartupCard from "@/components/StartupCard";
import { getStartups, getProvinceCounts } from "@/lib/data";
import { PROVINCES } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Startups",
  description:
    "Browse the startup directory of Eastern Visayas (Region 8) — companies, founders, and funding across Leyte, Samar, Biliran, and more.",
};

export default async function StartupsPage({
  searchParams,
}: {
  searchParams: { province?: string };
}) {
  const province = searchParams.province;
  const selected = PROVINCES.find((p) => p.slug === province);
  const counts = await getProvinceCounts();
  const startups = await getStartups({ province: selected?.name });

  return (
    <div className="container-x py-14">
      <div className="mb-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          The Ecosystem
        </p>
        <h1 className="section-title mt-1">Startups in Region 8</h1>
        <p className="mt-3 text-slate-500">
          {startups.length} startup{startups.length === 1 ? "" : "s"}
          {selected ? ` in ${selected.name}` : " across the region"}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap justify-center gap-2">
        <Link
          href="/startups"
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !selected
              ? "bg-brand-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          All ({counts.Total})
        </Link>
        {PROVINCES.map((p) => (
          <Link
            key={p.slug}
            href={`/startups?province=${p.slug}`}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              selected?.slug === p.slug
                ? "bg-brand-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {p.name} ({counts[p.name] || 0})
          </Link>
        ))}
      </div>

      {startups.length === 0 ? (
        <EmptyState
          scene="startup"
          eyebrow="The Ecosystem"
          title={`No startups found${selected ? ` in ${selected.name}` : ""}`}
          description={
            selected
              ? "There are no registered startups in this province yet. Be the first to put it on the map."
              : "The region's startup directory is still taking shape. Check back soon to meet the founders building Eastern Visayas."
          }
          actions={[
            selected
              ? { label: "See all startups", href: "/startups", variant: "primary" }
              : { label: "Explore by province", href: "/government", variant: "primary" },
            { label: "Read the news", href: "/news" },
          ]}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((s) => (
            <StartupCard key={s._id} startup={s} />
          ))}
        </div>
      )}
    </div>
  );
}
