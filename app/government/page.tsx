import type { Metadata } from "next";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getGovernmentPages } from "@/lib/data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Government",
  description:
    "Government programs and support for startups in Eastern Visayas — DTI, DOST TBI, funding, and incubation initiatives.",
};

export default async function GovernmentPage() {
  const pages = await getGovernmentPages();
  return (
    <div className="container-x py-14">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Programs & Support
        </p>
        <h1 className="section-title mt-1">Government Initiatives</h1>
        <p className="mt-3 text-slate-500">
          Discover government programs, policies, and support systems for startups in Region 8.
        </p>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          scene="government"
          eyebrow="Programs & Support"
          title="Government information is being prepared"
          description="We're compiling programs, policies, and support systems for startups in Region 8. Subscribe to get notified as soon as they're published."
          actions={[
            { label: "Browse startups", href: "/startups", variant: "primary" },
            { label: "Read the news", href: "/news" },
          ]}
          notify
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pages.map((p) => (
            <Link
              key={p._id}
              href={`/government/${p.slug}`}
              className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="relative h-44 overflow-hidden bg-slate-100">
                <ImageWithFallback
                  src={p.image}
                  fallback="/images/hero-placeholder.svg"
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-bold text-slate-900 group-hover:text-brand-600">{p.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-500">
                  <span
                    className="line-clamp-3"
                    dangerouslySetInnerHTML={{
                      __html: p.content?.replace(/<[^>]+>/g, " ").slice(0, 200) || "",
                    }}
                  />
                </p>
                <span className="mt-4 text-sm font-semibold text-brand-600">Read more →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
