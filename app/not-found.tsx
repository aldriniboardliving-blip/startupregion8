import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">
          Error 404
        </p>
        <h1 className="mt-2 text-6xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          404
        </h1>
        <p className="section-title mt-4">Page not found</p>
        <p className="mt-4 leading-relaxed text-slate-600">
          The page you&apos;re looking for doesn&apos;t exist or may have been
          moved. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">
            Back to home
          </Link>
          <Link href="/startups" className="btn-secondary">
            Browse startups
          </Link>
        </div>
      </div>
    </section>
  );
}
