interface LocationMapProps {
  lat?: number | null;
  lng?: number | null;
  address?: string;
  title?: string;
  className?: string;
  heightClass?: string;
}

/**
 * Read-only Google Maps embed. Uses the free keyless embed endpoint
 * (https://www.google.com/maps?q=...&output=embed), so it works server-side
 * with no API key and no billing. The embed drops a red pin at the coords.
 */
export default function LocationMap({
  lat,
  lng,
  address,
  title,
  className = "",
  heightClass = "h-64",
}: LocationMapProps) {
  if (lat == null || lng == null) {
    return null;
  }

  const query = `${lat},${lng}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  const openUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}`;
  const label = title || address || "View on Google Maps";

  return (
    <div className={`overflow-hidden rounded-2xl border border-slate-200 ${className}`}>
      <iframe
        title={label}
        src={embedUrl}
        className={`block w-full ${heightClass}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {address && (
        <a
          href={openUrl}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between gap-2 bg-white px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-50"
        >
          <span className="flex min-w-0 items-center gap-2">
            <svg className="h-4 w-4 shrink-0 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="truncate">{address}</span>
          </span>
          <span className="shrink-0 text-xs font-semibold text-brand-600">Open map →</span>
        </a>
      )}
    </div>
  );
}