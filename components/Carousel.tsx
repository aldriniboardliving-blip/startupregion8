"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/types";

interface CarouselProps {
  items: ContentItem[];
}

export default function Carousel({ items }: CarouselProps) {
  const [index, setIndex] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (i: number) => {
      setIndex(((i % items.length) + items.length) % items.length);
    },
    [items.length]
  );

  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  useEffect(() => {
    if (items.length <= 1) return;
    timerRef.current = setInterval(() => setIndex((i) => (i + 1) % items.length), 6000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="relative overflow-hidden bg-slate-900">
      <div className="carousel-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {items.map((item) => (
          <div key={item._id} className="relative min-w-full">
            <div className="relative h-[520px] w-full overflow-hidden sm:h-[620px] lg:h-[680px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.image || "/images/hero-placeholder.svg"}
                alt={item.title}
                className="kenburns absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/images/hero-placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
              <div className="container-x absolute inset-x-0 bottom-0 pb-12 sm:pb-16">
                <div className="max-w-2xl">
                  {item.subtitle && (
                    <span className="mb-3 inline-block rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                      {item.subtitle}
                    </span>
                  )}
                  <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                    {item.title}
                  </h2>
                  {item.link && (
                    <Link
                      href={item.link}
                      className="btn-primary mt-6"
                      target={item.link.startsWith("http") ? "_blank" : undefined}
                      rel="noreferrer"
                    >
                      Learn more
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            onClick={() => goTo(index - 1)}
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
            aria-label="Previous slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur transition hover:bg-white/40"
            aria-label="Next slide"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="absolute bottom-5 right-1/2 flex translate-x-1/2 gap-2">
            {items.map((item, i) => (
              <button
                key={item._id}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  i === index ? "w-8 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
