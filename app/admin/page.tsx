"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PROVINCES } from "@/lib/utils";
import type { AnalyticsData } from "@/lib/types";

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load analytics");
        return (await res.json()) as AnalyticsData;
      })
      .then(setData)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card h-32 animate-pulse bg-slate-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="rounded-xl bg-red-50 p-6 text-sm text-red-600">{error}</p>;
  }

  if (!data) return null;

  const { totals, byProvince, byEmployeeRange, byYear, featured, inactive, recent } = data;
  const maxProvince = Math.max(1, ...Object.values(byProvince));
  const maxRange = Math.max(1, ...Object.values(byEmployeeRange));
  const years = Object.keys(byYear).sort();
  const maxYear = Math.max(1, ...Object.values(byYear));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of the Region 8 startup ecosystem.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/startups" className="card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Startups</p>
            <span className="text-xl">🚀</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totals.startups}</p>
        </Link>
        <Link href="/admin/news" className="card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">News</p>
            <span className="text-xl">📰</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totals.news}</p>
        </Link>
        <Link href="/admin/blogs" className="card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Blogs</p>
            <span className="text-xl">✍️</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totals.blogs}</p>
        </Link>
        <Link href="/admin/carousel" className="card p-5 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Carousel Items</p>
            <span className="text-xl">🎠</span>
          </div>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totals.carousel}</p>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Founders</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totals.founders}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Government Pages</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totals.government}</p>
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-slate-500">Featured / Inactive Startups</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            <span className="text-amber-500">{featured}</span>
            <span className="mx-1 text-slate-300">/</span>
            <span className="text-red-500">{inactive}</span>
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Startups by Province</h2>
          <div className="space-y-3">
            {PROVINCES.map((p) => (
              <div key={p.slug}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{p.name}</span>
                  <span className="font-semibold text-slate-900">{byProvince[p.name] || 0}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600 transition-all duration-700"
                    style={{ width: `${((byProvince[p.name] || 0) / maxProvince) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Startups by Employee Size</h2>
          <div className="space-y-3">
            {Object.entries(byEmployeeRange).length === 0 && (
              <p className="text-sm text-slate-400">No data yet.</p>
            )}
            {Object.entries(byEmployeeRange).map(([range, count]) => (
              <div key={range}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-600">{range}</span>
                  <span className="font-semibold text-slate-900">{count}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                    style={{ width: `${(count / maxRange) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Startups Founded by Year</h2>
          {years.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet.</p>
          ) : (
            <div className="flex h-48 items-end gap-3">
              {years.map((y) => {
                const count = byYear[y];
                const h = Math.max(8, (count / maxYear) * 160);
                return (
                  <div key={y} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-sm font-semibold text-slate-700">{count}</span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-brand-700 to-brand-500 transition-all duration-700"
                      style={{ height: `${h}px` }}
                    />
                    <span className="text-xs text-slate-500">{y}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <h2 className="mb-5 text-lg font-bold text-slate-900">Recently Added Startups</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-slate-400">No startups yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {recent.map((s) => (
                <li key={s._id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-slate-800">{s.companyName}</p>
                    <p className="text-xs text-slate-400">{s.province || "N/A"}</p>
                  </div>
                  <Link
                    href={`/admin/startups/${s._id}/edit`}
                    className="text-sm font-medium text-brand-600 hover:text-brand-700"
                  >
                    Edit →
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
