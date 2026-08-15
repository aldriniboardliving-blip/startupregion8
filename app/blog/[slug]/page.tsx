import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageWithFallback from "@/components/ImageWithFallback";
import ArticleCard from "@/components/ArticleCard";
import { getBySlug, getBlogs } from "@/lib/data";
import { collections } from "@/lib/mongodb";
import { formatDate } from "@/lib/utils";
import { normalizeContentHtml } from "@/lib/content";

export const dynamic = "force-dynamic";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const item = await getBySlug(collections.blogs, params.slug);
  if (!item) return {};
  const summary = item.excerpt || item.subtitle || `${item.title} — a story from Eastern Visayas.`;
  const canonical = `${SITE_URL}/blog/${item.slug}`;
  return {
    title: item.title,
    description: summary,
    alternates: { canonical },
    openGraph: {
      title: item.title,
      description: summary,
      type: "article",
      url: canonical,
      siteName: "Region 8 Startups",
      locale: "en_PH",
      publishedTime: item.createdAt,
      images: item.image ? [{ url: item.image, alt: item.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: item.title,
      description: summary,
      images: item.image ? [item.image] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const item = await getBySlug(collections.blogs, params.slug);
  if (!item) notFound();

  const more = await getBlogs({ limit: 3 });
  const related = more.filter((b) => b._id !== item._id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: item.title,
    description: item.excerpt || item.subtitle || undefined,
    image: item.image || undefined,
    datePublished: item.createdAt,
    dateModified: item.updatedAt,
    author: { "@type": "Organization", name: item.author || "Region 8 Startups" },
    publisher: { "@type": "Organization", name: "Region 8 Startups" },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${item.slug}` },
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
        <Link href="/blog" className="hover:text-brand-600">Blog</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-800">{item.title}</span>
      </nav>

      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
          {item.title}
        </h1>
        <div className="mt-4 flex items-center gap-3 text-sm text-slate-400">
          <span>{formatDate(item.createdAt)}</span>
          {item.author && (
            <>
              <span>•</span>
              <span>By {item.author}</span>
            </>
          )}
        </div>

        {item.image && (
          <ImageWithFallback
            src={item.image}
            fallback="/images/card-placeholder.svg"
            alt={item.title}
            className="mt-8 h-72 w-full rounded-2xl object-cover"
          />
        )}

        <div
          className="prose-content mt-8"
          dangerouslySetInnerHTML={{ __html: normalizeContentHtml(item.content || "") }}
        />
      </div>

      {related.length > 0 && (
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="section-title mb-6">More Blogs</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {related.map((b) => (
              <ArticleCard key={b._id} item={b} type="blog" />
            ))}
          </div>
        </div>
      )}
    </article>
    </>
  );
}
