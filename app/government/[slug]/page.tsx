import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageWithFallback from "@/components/ImageWithFallback";
import { getBySlug, getGovernmentPages } from "@/lib/data";
import { collections } from "@/lib/mongodb";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getBySlug(collections.government, params.slug);
  if (!item) return {};
  const plain = item.excerpt || item.subtitle || item.content?.replace(/<[^>]+>/g, " ").trim() || "";
  const summary = plain.slice(0, 160);
  const canonical = `${SITE_URL}/government/${item.slug}`;
  return {
    title: item.title,
    description: summary,
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description: summary,
      type: "website",
      url: canonical,
      siteName: "Region 8 Startups",
      locale: "en_PH",
      images: item.image ? [{ url: item.image, alt: item.title }] : undefined,
    },
    twitter: {
      card: "summary",
      title: item.title,
      description: summary,
      images: item.image ? [item.image] : undefined,
    },
  };
}

export default async function GovernmentDetailPage({ params }: PageProps) {
  const item = await getBySlug(collections.government, params.slug);
  if (!item) notFound();

  const all = await getGovernmentPages();
  const related = all.filter((g) => g._id !== item._id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GovernmentService",
    name: item.title,
    description: item.excerpt || item.subtitle || undefined,
    provider: { "@type": "GovernmentOrganization", name: "Region 8 Startups" },
    areaServed: "Eastern Visayas (Region 8), Philippines",
    url: `${SITE_URL}/government/${item.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="container-x py-12">
      <nav className="mb-8 text-sm text-slate-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link href="/government" className="hover:text-brand-600">Government</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{item.title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {item.title}
        </h1>
        <p className="mt-3 text-sm text-slate-400">
          Updated {formatDate(item.createdAt)}
        </p>
        {item.image && (
          <ImageWithFallback
            src={item.image}
            fallback="/images/hero-placeholder.svg"
            alt={item.title}
            className="mt-8 h-72 w-full rounded-2xl object-cover"
          />
        )}
        <div
          className="prose-content mt-8"
          dangerouslySetInnerHTML={{ __html: item.content || "" }}
        />
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="section-title mb-6">Other Programs</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((g) => (
              <Link
                key={g._id}
                href={`/government/${g.slug}`}
                className="card group p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600">{g.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: g.content?.replace(/<[^>]+>/g, " ").slice(0, 140) || "",
                    }}
                  />
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
    </>
  );
}
