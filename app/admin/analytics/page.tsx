"use client";

import { useCallback, useEffect, useState } from "react";
import type { TrafficData, TrafficRange } from "@/lib/types";

const RANGE_OPTIONS: { value: TrafficRange; label: string }[] = [
  { value: "day", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "year", label: "This Year" },
  { value: "all", label: "All Time" },
];

const PAGE_SIZE = 10;

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  if (minutes < 60) return `${minutes}m ${seconds}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export default function AdminTrafficPage() {
  const [data, setData] = useState<TrafficData | null>(null);
  const [range, setRange] = useState<TrafficRange>("all");
  const [page, setPage] = useState<number>(1);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const load = useCallback(
    (r: TrafficRange, p: number) => {
      setLoading(true);
      setError("");
      fetch(`/api/analytics/traffic?range=${r}&page=${p}&pageSize=${PAGE_SIZE}`)
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to load traffic analytics");
          return (await res.json()) as TrafficData;
        })
        .then(setData)
        .catch((e: Error) => setError(e.message))
        .finally(() => setLoading(false));
    },
    []
  );

  useEffect(() => {
    load(range, page);
  }, [range, page, load]);

  const handleRange = (r: TrafficRange) => {
    setRange(r);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil((data?.totalPages || 0) / PAGE_SIZE));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visitor Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Website traffic, most-visited pages, and time spent per page.
        </p>
      </div>

      {/* Range filter */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-medium text-slate-500">Period:</span>
        {RANGE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => handleRange(opt.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              range === opt.value
                ? "bg-brand-600 text-white shadow"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && !data ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card h-32 animate-pulse bg-slate-100" />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</p>
      ) : !data ? null : (
        <>
          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card p-5">
              <p className="text-sm font-medium text-slate-500">Unique Visitors</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data.uniqueVisitors}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm font-medium text-slate-500">Total Visits</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{data.totalVisits}</p>
            </div>
            <div className="card p-5">
              <p className="text-sm font-medium text-slate-500">Avg Time on Site</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {formatDuration(data.avgSessionMs)}
              </p>
            </div>
          </div>

          {/* Most visited pages */}
          <div className="card p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">Most Visited Pages</h2>
              <span className="text-xs text-slate-400">
                {data.totalPages} page(s) · page {data.page} of {totalPages}
              </span>
            </div>
            {data.pages.length === 0 ? (
              <p className="text-sm text-slate-400">
                No traffic recorded for this period. Visits are counted automatically as
                visitors browse the site.
              </p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wider text-slate-400">
                        <th className="pb-3 pr-4 font-medium">Page</th>
                        <th className="pb-3 pr-4 font-medium">Visits</th>
                        <th className="pb-3 pr-4 font-medium">Avg Time</th>
                        <th className="pb-3 font-medium">Total Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.pages.map((p) => (
                        <tr key={p.path} className="transition-colors hover:bg-slate-50">
                          <td className="py-3 pr-4">
                            <span className="font-mono text-xs text-brand-700">{p.path}</span>
                            <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-brand-600 transition-all duration-500"
                                style={{
                                  width: `${
                                    (p.views / Math.max(1, data.pages[0]?.views)) * 100
                                  }%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="py-3 pr-4 font-semibold text-slate-900">{p.views}</td>
                          <td className="py-3 pr-4 text-slate-600">
                            {formatDuration(p.avgDurationMs)}
                          </td>
                          <td className="py-3 text-slate-600">
                            {formatDuration(p.totalDurationMs)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-xs text-slate-400">
                    Page {data.page} of {totalPages}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      ← Prev
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                      .reduce<number[]>((acc, n) => {
                        if (acc[acc.length - 1] !== n) acc.push(n);
                        return acc;
                      }, [])
                      .map((n, i, arr) => {
                        const gap = i > 0 && n !== arr[i - 1] + 1;
                        return (
                          <span key={n} className="flex items-center gap-2">
                            {gap && <span className="text-slate-400">…</span>}
                            <button
                              onClick={() => setPage(n)}
                              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                page === n
                                  ? "bg-brand-600 text-white"
                                  : "text-slate-600 hover:bg-slate-100"
                              }`}
                            >
                              {n}
                            </button>
                          </span>
                        );
                      })}
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page >= totalPages}
                      className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
