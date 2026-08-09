"use client";

import { useEffect, useState } from "react";
import type { TrafficData } from "@/lib/types";

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
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/analytics/traffic")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load traffic analytics");
        return (await res.json()) as TrafficData;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card h-32 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</p>;
  }

  if (!data) return null;

  const { totalVisits, uniqueVisitors, avgSessionMs, pages } = data;
  const maxViews = Math.max(1, ...pages.map((p) => p.views));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Visitor Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Website traffic, most-visited pages, and time spent per page.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Unique Visitors</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{uniqueVisitors}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Total Visits</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalVisits}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Avg Time on Site</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {formatDuration(avgSessionMs)}
          </p>
        </div>
      </div>

      {/* Most visited pages */}
      <div className="card p-6">
        <h2 className="mb-5 text-lg font-bold text-slate-900">Most Visited Pages</h2>
        {pages.length === 0 ? (
          <p className="text-sm text-slate-400">
            No traffic recorded yet. Visits are counted automatically as visitors
            browse the site.
          </p>
        ) : (
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
                {pages.map((p) => (
                  <tr key={p.path}>
                    <td className="py-3 pr-4">
                      <span className="font-mono text-xs text-brand-700">{p.path}</span>
                      <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-brand-600"
                          style={{ width: `${(p.views / maxViews) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-slate-900">{p.views}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatDuration(p.avgDurationMs)}</td>
                    <td className="py-3 text-slate-600">{formatDuration(p.totalDurationMs)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
