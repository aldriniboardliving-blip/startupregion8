"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <section className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Error 500
        </p>
        <h1 className="mt-2 text-6xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          500
        </h1>
        <p className="section-title mt-4">Something went wrong</p>
        <p className="mt-4 leading-relaxed text-slate-600">
          An unexpected error occurred while rendering this page. Please try
          again, or head back home.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button type="button" onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-secondary">
            Back to home
          </Link>
        </div>
      </div>
    </section>
  );
}
