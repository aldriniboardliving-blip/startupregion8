import Link from "next/link";
import EmptyStateNotify from "@/components/EmptyStateNotify";
import EmptyScene from "@/components/EmptyScene";

export type EmptySceneName = "home" | "startup" | "news" | "blog" | "government" | "province";

export interface EmptyStateAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

export interface EmptyStateProps {
  scene?: EmptySceneName;
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: EmptyStateAction[];
  notify?: boolean;
}

export default function EmptyState({
  scene = "home",
  eyebrow,
  title,
  description,
  actions = [],
  notify = false,
}: EmptyStateProps) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
      <div className="relative h-52 w-full max-w-md">
        <div className="absolute inset-x-8 bottom-0 top-6">
          <EmptyScene name={scene} />
        </div>
      </div>

      {eyebrow && (
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-brand-600">{eyebrow}</p>
      )}
      <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">{title}</h3>
      {description && (
        <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{description}</p>
      )}

      {actions.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions.map((a) =>
            a.variant === "primary" ? (
              <Link key={a.href} href={a.href} className="btn-primary">
                {a.label}
              </Link>
            ) : (
              <Link key={a.href} href={a.href} className="btn-secondary">
                {a.label}
              </Link>
            )
          )}
        </div>
      )}

      {notify && <EmptyStateNotify label={title.split(" ").slice(0, 2).join(" ")} />}
    </div>
  );
}