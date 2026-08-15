import { NextResponse } from "next/server";

/**
 * Lightweight in-memory fixed-window rate limiter for API route handlers.
 *
 * The bucket map is attached to `globalThis` so every bundled copy of this
 * module shares the same state within a single process. When the app is
 * deployed with `next start` (a long-running Node process) this gives real,
 * shared rate limiting across all requests and routes.
 *
 * NOTE: On serverless platforms (e.g. Vercel Edge / Serverless) memory is not
 * shared between instances and may reset between cold starts, so this is a
 * best-effort defense. For production-scale protection on serverless, swap in
 * an external store (Upstash Redis / rate-limiter-flexible + Redis).
 */

interface Bucket {
  count: number;
  resetAt: number;
}

type GlobalBucketState = {
  buckets: Map<string, Bucket>;
  timer: ReturnType<typeof setInterval> | null;
};

function getGlobalState(): GlobalBucketState {
  const g = globalThis as typeof globalThis & {
    __sr8RateLimit?: GlobalBucketState;
  };
  if (!g.__sr8RateLimit) {
    const state: GlobalBucketState = { buckets: new Map(), timer: null };
    state.timer = setInterval(() => {
      const now = Date.now();
      state.buckets.forEach((b, key) => {
        if (b.resetAt <= now) state.buckets.delete(key);
      });
    }, 60_000);
    if (typeof state.timer.unref === "function") state.timer.unref();
    g.__sr8RateLimit = state;
  }
  return g.__sr8RateLimit;
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed within the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  limited: boolean;
  remaining: number;
  retryAfterMs: number;
}

function getIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const first = fwd.split(",")[0].trim();
    if (first) return first;
  }
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export function rateLimit(
  req: Request,
  { limit, windowMs }: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const ip = getIp(req);

  let path = "unknown";
  try {
    path = new URL(req.url).pathname;
  } catch {
    /* ignore malformed URL */
  }

  const key = `${ip}:${path}:${req.method}`;
  const { buckets } = getGlobalState();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { limited: false, remaining: limit - 1, retryAfterMs: windowMs };
  }

  if (bucket.count >= limit) {
    return {
      limited: true,
      remaining: 0,
      retryAfterMs: Math.max(0, bucket.resetAt - now),
    };
  }

  bucket.count += 1;
  return {
    limited: false,
    remaining: limit - bucket.count,
    retryAfterMs: Math.max(0, bucket.resetAt - now),
  };
}

/**
 * Guard helper for route handlers. Returns a 429 NextResponse when the caller
 * has exceeded the limit for the current route+method, otherwise null.
 */
export function withRateLimit(
  req: Request,
  options: RateLimitOptions
): NextResponse | null {
  const result = rateLimit(req, options);
  if (!result.limited) return null;
  return NextResponse.json(
    { error: "Too many requests. Please slow down and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(Math.max(1, Math.ceil(result.retryAfterMs / 1000))),
        "X-RateLimit-Limit": String(options.limit),
        "X-RateLimit-Remaining": String(result.remaining),
        "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.retryAfterMs) / 1000)),
      },
    }
  );
}

/** Route-specific limits (per IP per route+method). */
export const RATE_LIMITS = {
  /** Login attempts — tight to stop credential brute-forcing. */
  login: { limit: 5, windowMs: 15 * 60_000 },
  /** Analytics beacon — generous but still capped against scripted spam. */
  track: { limit: 30, windowMs: 60_000 },
  /** AI assistant — each call runs several DB queries. */
  assistant: { limit: 10, windowMs: 60_000 },
  /** Image uploads — costly disk/network writes. */
  upload: { limit: 20, windowMs: 15 * 60_000 },
  /** Public read endpoints that don't require auth. */
  publicGet: { limit: 120, windowMs: 60_000 },
  /** Authenticated write endpoints (defense in depth on top of the session check). */
  mutation: { limit: 60, windowMs: 60_000 },
  /** Authenticated admin read endpoints. */
  adminGet: { limit: 120, windowMs: 60_000 },
} as const;
