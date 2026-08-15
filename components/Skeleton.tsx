import type { HTMLAttributes } from "react";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Base pulsing block used to build every loading state on the site.
 * Safe to render from both server components (loading.tsx) and client ones.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cx("animate-pulse rounded-lg bg-slate-200/80", className)}
      {...props}
    />
  );
}

export function SkeletonStartupCard() {
  return (
    <div className="card flex flex-col overflow-hidden">
      <Skeleton className="h-36 rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="mt-1 flex flex-wrap gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
        <Skeleton className="mt-2 h-4 w-2/5" />
      </div>
    </div>
  );
}

export function SkeletonArticleCard({ variant = "default" }: { variant?: "default" | "wide" }) {
  if (variant === "wide") {
    return (
      <div className="card flex flex-col overflow-hidden md:flex-row">
        <Skeleton className="h-52 w-full rounded-none md:h-auto md:w-1/2" />
        <div className="flex flex-1 flex-col gap-3 p-6">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-5/6" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="mt-auto h-3 w-40" />
        </div>
      </div>
    );
  }
  return (
    <div className="card flex flex-col overflow-hidden">
      <Skeleton className="h-44 rounded-none" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="mt-1 h-3 w-32" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 6,
  type = "startup",
}: {
  count?: number;
  type?: "startup" | "article";
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, i) =>
        type === "startup" ? (
          <SkeletonStartupCard key={i} />
        ) : (
          <SkeletonArticleCard key={i} />
        )
      )}
    </div>
  );
}

export function SkeletonTable({ columns = 5, rows = 6 }: { columns?: number; rows?: number }) {
  const widths = Array.from({ length: columns }, (_, i) => {
    const w = [32, 24, 16, 20, 14, 28, 18][i % 7];
    return `${w}%`;
  });
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <Skeleton className="h-4 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24 rounded-lg" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-3">
        <div className="flex gap-6">
          {widths.map((w, i) => (
            <Skeleton key={i} className="h-3" style={{ width: w }} />
          ))}
        </div>
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-6 border-b border-slate-100 px-5 py-4">
          {widths.map((w, i) => (
            <Skeleton key={i} className="h-3.5" style={{ width: w }} />
          ))}
          <div className="ml-auto flex gap-2">
            <Skeleton className="h-8 w-14 rounded-lg" />
            <Skeleton className="h-8 w-14 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ lines = 6 }: { lines?: number }) {
  return (
    <div className="card space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-lg" />
          <Skeleton className="h-10 w-28 rounded-lg" />
        </div>
      </div>
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className={cx("h-10 rounded-lg", i % 3 === 2 && "h-32")} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonStatCards({ count = 4 }: { count?: number }) {
  return (
    <div className={cx("grid gap-4", count > 3 ? "sm:grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-3")}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card p-5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="mt-3 h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <SkeletonStatCards count={4} />
      <div className="grid gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="card p-6">
            <Skeleton className="h-5 w-44" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }, (_, r) => (
                <div key={r}>
                  <div className="mb-1 flex justify-between">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <Skeleton className="h-5 w-48" />
          <div className="mt-6 flex h-48 items-end gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <Skeleton key={i} className="flex-1" style={{ height: `${25 + ((i * 37) % 60)}%` }} />
            ))}
          </div>
        </div>
        <div className="card p-6">
          <Skeleton className="h-5 w-48" />
          <div className="mt-6 space-y-5">
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-3.5 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-5 w-12" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonDetailArticle() {
  return (
    <div className="container-x py-12">
      <div className="mx-auto max-w-3xl">
        <Skeleton className="h-3.5 w-56" />
        <Skeleton className="mt-6 h-8 w-4/5" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-8 h-72 w-full rounded-2xl" />
        <div className="mt-8 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStartupDetail() {
  return (
    <article className="container-x py-12">
      <Skeleton className="h-3.5 w-64" />
      <div className="card mt-8 overflow-hidden">
        <Skeleton className="h-56 w-full rounded-none sm:h-72" />
        <div className="grid gap-10 p-8 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <div className="space-y-6">
            <div className="rounded-xl bg-slate-50 p-6">
              <Skeleton className="h-3.5 w-24" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-6">
              <Skeleton className="h-3.5 w-20" />
              <div className="mt-4 space-y-3">
                <Skeleton className="h-10 w-full rounded-full" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function SkeletonHero() {
  return (
    <div className="relative overflow-hidden bg-slate-100">
      <Skeleton className="h-[520px] w-full rounded-none sm:h-[620px] lg:h-[680px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-200/60 to-transparent" />
      <div className="container-x absolute inset-x-0 bottom-0 pb-14">
        <div className="max-w-2xl space-y-4">
          <Skeleton className="h-6 w-28 rounded-full" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-10 w-3/5" />
          <Skeleton className="h-11 w-40 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonHome() {
  return (
    <>
      <SkeletonHero />
      <section className="border-b border-slate-200 bg-white py-6">
        <div className="container-x flex items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-80" />
            <Skeleton className="h-3.5 w-96" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-36 rounded-full" />
            <Skeleton className="h-10 w-40 rounded-lg" />
          </div>
        </div>
      </section>
      <section className="container-x py-16">
        <Skeleton className="mb-8 h-4 w-40" />
        <Skeleton className="mb-8 h-8 w-64" />
        <SkeletonGrid count={6} type="startup" />
      </section>
    </>
  );
}