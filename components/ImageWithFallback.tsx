"use client";

import { useState } from "react";
import type { ImgHTMLAttributes } from "react";

interface ImageWithFallbackProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export default function ImageWithFallback({
  src,
  fallback = "/images/card-placeholder.svg",
  alt = "",
  className = "",
  ...props
}: ImageWithFallbackProps) {
  const [current, setCurrent] = useState<string>(src || fallback);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={current}
      alt={alt}
      className={className}
      onError={() => current !== fallback && setCurrent(fallback)}
      loading="lazy"
      {...props}
    />
  );
}
