import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatDate } from "@/lib/utils";
import type { ContentItem } from "@/lib/types";

interface ArticleCardProps {
  item: ContentItem;
  type: "blog" | "news";
  variant?: "default" | "wide";
}

export default function ArticleCard({ item, type, variant = "default" }: ArticleCardProps) {
  const href = `/${type}/${item.slug}`;
  const fallback =
    type === "blog" ? "/images/card-placeholder.svg" : "/images/hero-placeholder.svg";

  if (variant === "wide") {
    return (
      <Link
        href={href}
        className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg md:flex-row"
      >
        <div className="relative h-52 w-full overflow-hidden md:h-auto md:w-1/2">
          <ImageWithFallback
            src={item.image}
            fallback={fallback}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-1 flex-col p-6">
          {item.category && (
            <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
              {item.category}
            </span>
          )}
          <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-600">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
              {item.excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span>{formatDate(item.createdAt)}</span>
            {item.author && (
              <>
                <span>•</span>
                <span>{item.author}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={item.image}
          fallback={fallback}
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {item.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        {item.category && (
          <span className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-600">
            {item.category}
          </span>
        )}
        <h3 className="font-bold leading-snug text-slate-900 group-hover:text-brand-600">
          {item.title}
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
          {item.excerpt || item.subtitle}
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span>{formatDate(item.createdAt)}</span>
          {item.author && (
            <>
              <span>•</span>
              <span>{item.author}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
