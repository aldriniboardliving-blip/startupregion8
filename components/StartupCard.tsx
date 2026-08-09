import Link from "next/link";
import ImageWithFallback from "@/components/ImageWithFallback";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Startup } from "@/lib/types";

interface StartupCardProps {
  startup: Startup;
}

export default function StartupCard({ startup }: StartupCardProps) {
  return (
    <Link
      href={`/startups/${startup.slug}`}
      className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <ImageWithFallback
          src={startup.logo}
          fallback="/images/startup-placeholder.svg"
          alt={startup.companyName}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {startup.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-900">
            Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-bold text-slate-900 group-hover:text-brand-600">
            {startup.companyName}
          </h3>
        </div>
        {startup.productName && (
          <p className="mt-0.5 text-sm font-medium text-brand-600">{startup.productName}</p>
        )}
        <p className="mt-3 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">
          {startup.description}
        </p>
        {startup.address && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
            <svg className="h-3.5 w-3.5 shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{startup.address}</span>
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          {startup.province && (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">
              {startup.province}
            </span>
          )}
          {startup.employeeRange && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              {startup.employeeRange} employees
            </span>
          )}
          {startup.dateFounded && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
              Founded {formatDate(startup.dateFounded)}
            </span>
          )}
        </div>
        {startup.totalFunding > 0 && (
          <p className="mt-3 border-t border-slate-100 pt-3 text-sm">
            <span className="font-bold text-emerald-600">{formatCurrency(startup.totalFunding)}</span>
            <span className="text-slate-400"> raised</span>
          </p>
        )}
      </div>
    </Link>
  );
}
