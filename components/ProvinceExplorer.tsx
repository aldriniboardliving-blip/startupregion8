"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PROVINCES } from "@/lib/utils";
import EmptyState from "@/components/EmptyState";
import StartupCard from "@/components/StartupCard";
import type { Startup } from "@/lib/types";

interface ProvinceExplorerProps {
  initialCounts: Record<string, number>;
}

export default function ProvinceExplorer({ initialCounts }: ProvinceExplorerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [active, setActive] = useState<string | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const provinceFromUrl = searchParams.get("province");

  async function load(name: string) {
    setActive(name);
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/startups?province=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error("Failed to load startups");
      const data = (await res.json()) as Startup[];
      setStartups(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStartups([]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }

  const loadCb = useCallback((name: string) => {
    void load(name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (provinceFromUrl) {
      const match = PROVINCES.find((p) => p.slug === provinceFromUrl);
      if (match) loadCb(match.name);
    }
  }, [provinceFromUrl, loadCb]);

  function handleSelect(name: string, slug: string) {
    router.replace(`/?province=${slug}`, { scroll: false });
    void load(name);
  }

  return (
    <div className="container-x">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PROVINCES.map((p) => {
          const count = initialCounts[p.name] || 0;
          const isActive = active === p.name;
          return (
            <button
              key={p.slug}
              onClick={() => handleSelect(p.name, p.slug)}
              className={`card group relative flex items-center justify-between overflow-hidden p-6 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isActive ? "border-brand-500 ring-2 ring-brand-500/30" : ""
              }`}
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600">
                  {p.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {count} startup{count === 1 ? "" : "s"}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  isActive
                    ? "bg-brand-600 text-white"
                    : "bg-brand-50 text-brand-600 group-hover:bg-brand-600 group-hover:text-white"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </button>
          );
        })}
      </div>

      <div ref={resultsRef} className="mt-10 scroll-mt-24">
        {active && (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                Startups in {active}
                <span className="ml-2 text-sm font-medium text-slate-400">
                  ({startups.length})
                </span>
              </h3>
              <button
                onClick={() => {
                  setActive(null);
                  setStartups([]);
                  router.replace("/", { scroll: false });
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                Clear filter
              </button>
            </div>
            {loading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="card h-72 animate-pulse bg-slate-100" />
                ))}
              </div>
            ) : error ? (
              <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>
            ) : startups.length === 0 ? (
              <EmptyState
                scene="province"
                title={`No registered startups in ${active} yet`}
                description="This province is waiting to be put on the map. Explore other provinces or check the news for upcoming startup activity."
                actions={[
                  { label: "Browse all startups", href: "/startups", variant: "primary" },
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
          </>
        )}
      </div>
    </div>
  );
}
