import type { Metadata } from "next";
import Link from "next/link";
import { PROVINCES } from "@/lib/utils";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "About Region 8 Startups — a hub celebrating and connecting the startup ecosystem of Eastern Visayas.",
};

export default function AboutPage() {
  return (
    <>
      <section className="container-x py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
            About Us
          </p>
          <h1 className="section-title mt-1">
            Building the Future of Eastern Visayas, One Startup at a Time
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-slate-600">
            Region 8 Startups is a platform dedicated to promoting, connecting, and
            supporting the startup ecosystem of Eastern Visayas. We showcase the
            innovative companies, founders, and programs driving economic growth
            across the region.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: "🚀",
              title: "Discover",
              text: "Explore startups, their products, founders, and stories from across all six provinces of Region 8.",
            },
            {
              icon: "🤝",
              title: "Connect",
              text: "Bridge the gap between founders, investors, mentors, and government support programs.",
            },
            {
              icon: "📈",
              title: "Grow",
              text: "Help the region's ecosystem flourish through visibility, information, and community.",
            },
          ].map((c) => (
            <div key={c.title} className="card p-8 text-center">
              <span className="text-4xl">{c.icon}</span>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="container-x">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                The Region
              </p>
              <h2 className="section-title mt-1">Eastern Visayas (Region 8)</h2>
              <p className="mt-4 leading-relaxed text-slate-600">
                Region 8 is composed of six provinces — Leyte, Southern Leyte, Biliran,
                Samar, Northern Samar, and Eastern Samar. It is home to growing hubs of
                innovation in agriculture, technology, tourism, and social enterprise.
              </p>
              <p className="mt-4 leading-relaxed text-slate-600">
                From the bustling centers of Tacloban and Ormoc to the coastal towns of
                Samar and Biliran, a new generation of founders is building solutions to
                local and national challenges.
              </p>
              <Link href="/startups" className="btn-primary mt-6">
                See the startups
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {PROVINCES.map((p, i) => (
                <div
                  key={p.slug}
                  className="card flex items-center gap-3 p-5"
                  style={{ backgroundColor: i % 2 === 0 ? undefined : "#f8fafc" }}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-lg font-bold text-brand-700">
                    {i + 1}
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-900">{p.name}</h4>
                    <p className="text-xs text-slate-500">Province</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
