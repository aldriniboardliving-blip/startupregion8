import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageWithFallback from "@/components/ImageWithFallback";
import LocationMap from "@/components/LocationMap";
import StartupCard from "@/components/StartupCard";
import { getStartups } from "@/lib/data";
import { formatCurrency, formatDate, startupSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const startup = await getStartups({ slug: params.slug });
  if (!startup) return {};

  const summary = startup.description
    ? startup.description.slice(0, 160)
    : `${startup.productName || startup.companyName} — an Eastern Visayas startup in ${startup.province}.`;
  const canonical = `${SITE_URL}/startups/${startup.slug}`;

  return {
    title: startup.companyName,
    description: summary,
    alternates: { canonical },
    openGraph: {
      title: startup.companyName,
      description: summary,
      type: "website",
      url: canonical,
      siteName: "Region 8 Startups",
      locale: "en_PH",
      images: startup.logo
        ? [{ url: startup.logo, alt: `${startup.companyName} logo` }]
        : undefined,
    },
    twitter: {
      card: "summary",
      title: `${startup.companyName} | Region 8 Startups`,
      description: summary,
      images: startup.logo ? [startup.logo] : undefined,
    },
  };
}

export default async function StartupDetailPage({ params }: PageProps) {
  const startup = await getStartups({ slug: params.slug });
  if (!startup) notFound();

  const more = await getStartups({ province: startup.province, limit: 4 });
  const related = more.filter((s) => s._id !== startup._id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: startup.companyName,
    description: startup.description || undefined,
    url: `${SITE_URL}/startups/${startup.slug}`,
    image: startup.logo || undefined,
    address: startup.address
      ? {
          "@type": "PostalAddress",
          streetAddress: startup.address,
          addressRegion: startup.province || "Eastern Visayas",
          addressCountry: "PH",
        }
      : undefined,
    geo:
      startup.lat != null && startup.lng != null
        ? { "@type": "GeoCoordinates", latitude: startup.lat, longitude: startup.lng }
        : undefined,
    memberOf: {
      "@type": "Organization",
      name: "Region 8 Startups",
    },
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
          <Link href="/startups" className="hover:text-brand-600">Startups</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-800">{startup.companyName}</span>
        </nav>

      <div className="card overflow-hidden">
        <div className="relative h-56 bg-slate-900 sm:h-72">
          <ImageWithFallback
            src={startup.logo}
            fallback="/images/startup-placeholder.svg"
            alt={startup.companyName}
            className="h-full w-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
          <div className="absolute bottom-0 p-8">
            <div className="flex flex-wrap items-center gap-2">
              {startup.featured && (
                <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-900">
                  Featured
                </span>
              )}
              {startup.province && (
                <span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {startup.province}
                </span>
              )}
              {startup.address && (
                <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {startup.address}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
              {startup.companyName}
            </h1>
            {startup.productName && (
              <p className="mt-1 text-lg font-medium text-brand-200">{startup.productName}</p>
            )}
          </div>
        </div>

        <div className="grid gap-10 p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">About the Startup</h2>
            <p className="mt-4 whitespace-pre-line leading-relaxed text-slate-600">
              {startup.description || "No description provided."}
            </p>

            {startup.website && (
              <a
                href={
                  startup.website.startsWith("http")
                    ? startup.website
                    : `https://${startup.website}`
                }
                target="_blank"
                rel="noreferrer"
                className="btn-primary mt-6"
              >
                Visit Website
              </a>
            )}

            

            <div className="rounded-xl bg-slate-50 p-6 mt-10">
              <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
                <svg className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Location
              </h3>
              <LocationMap
                lat={startup.lat}
                lng={startup.lng}
                address={startup.address}
                title={`${startup.companyName} location`}
                heightClass="h-56"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 p-6">
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                Quick Info
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {startup.productName && (
                  <div>
                    <dt className="text-slate-400">Product</dt>
                    <dd className="font-medium text-slate-800">{startup.productName}</dd>
                  </div>
                )}
                {startup.dateFounded && (
                  <div>
                    <dt className="text-slate-400">Founded</dt>
                    <dd className="font-medium text-slate-800">{formatDate(startup.dateFounded)}</dd>
                  </div>
                )}
                {startup.employeeRange && (
                  <div>
                    <dt className="text-slate-400">Employees</dt>
                    <dd className="font-medium text-slate-800">{startup.employeeRange}</dd>
                  </div>
                )}
              </dl>
            </div>

            {startup.founders?.length > 0 && (
              <div className="rounded-xl bg-slate-50 p-6">
                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
                  Founders
                </h3>
                <ul className="mt-4 space-y-3">
                  {startup.founders.map((f, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                        {f.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-medium text-slate-800">{f.name}</p>
                        <p className="text-xs text-slate-400">{f.position || "Founder"}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {startup.fundings?.length > 0 && (
        <div className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
                Grants & Recognition
              </p>
              <h2 className="section-title mt-1">Fundings & Awards</h2>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {formatCurrency(startup.totalFunding)}
              <span className="ml-1 text-sm font-normal text-slate-400">total raised</span>
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {startup.fundings.map((f, i) => (
              <div key={i} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{f.name}</h3>
                    {f.from && <p className="mt-0.5 text-sm text-slate-500">{f.from}</p>}
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                    {formatCurrency(f.amount)}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  {f.dateAwarded ? (
                    <span className="text-slate-500">Awarded {formatDate(f.dateAwarded)}</span>
                  ) : (
                    <span />
                  )}
                  {f.link && (
                    <a
                      href={f.link.startsWith("http") ? f.link : `https://${f.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-brand-600 hover:text-brand-700"
                    >
                      Details →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="section-title mb-6">More from {startup.province}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((s) => (
              <StartupCard key={s._id} startup={s} />
            ))}
          </div>
        </div>
      )}
    </article>
    </>
  );
}