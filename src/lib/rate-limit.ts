import { NextResponse } from "next/server";

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

export interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
  statusCode?: number;
}

const defaultOptions: Required<RateLimitOptions> = {
  windowMs: 60 * 1000,
  max: 60,
  message: "Too many requests, please try again later.",
  statusCode: 429,
};

export function rateLimit(options?: RateLimitOptions) {
  const opts = { ...defaultOptions, ...options };

  return function rateLimitMiddleware(req: Request): NextResponse | null {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
    const url = req.url || "";
    const pathname = url ? new URL(url).pathname : "/";
    const key = `${ip}:${pathname}`;
    const now = Date.now();

    if (Math.random() < 0.01) {
      Object.keys(store).forEach((k) => {
        if (store[k].resetTime < now) {
          delete store[k];
        }
      });
    }

    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + opts.windowMs,
      };
      return null;
    }

    store[key].count++;

    if (store[key].count > opts.max) {
      return NextResponse.json(
        { error: opts.message },
        { status: opts.statusCode }
      );
    }

    return null;
  };
}

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many authentication attempts, please try again later.",
});

export const apiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: "API rate limit exceeded.",
});

export const bookingRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  message: "Too many booking attempts, please slow down.",
});