import { NextRequest } from 'next/server';

interface RateLimitBucket {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  request: NextRequest;
  keyPrefix: string;
  maxRequests: number;
  windowMs: number;
  identifier?: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter: number;
  limit: number;
  resetAt: number;
}

const MAX_TRACKED_KEYS = 5000;

function getStore(): Map<string, RateLimitBucket> {
  const globalWithStore = globalThis as typeof globalThis & {
    __gmbRateLimitStore?: Map<string, RateLimitBucket>;
  };

  if (!globalWithStore.__gmbRateLimitStore) {
    globalWithStore.__gmbRateLimitStore = new Map<string, RateLimitBucket>();
  }

  return globalWithStore.__gmbRateLimitStore;
}

function compactStore(store: Map<string, RateLimitBucket>, now: number) {
  if (store.size < MAX_TRACKED_KEYS) {
    return;
  }

  for (const [key, bucket] of store.entries()) {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  }

  if (store.size < MAX_TRACKED_KEYS) {
    return;
  }

  const overflow = store.size - MAX_TRACKED_KEYS;
  const keys = Array.from(store.keys());
  for (let i = 0; i < overflow; i += 1) {
    const key = keys[i];
    if (key) {
      store.delete(key);
    }
  }
}

export function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) {
    return cfIp.trim();
  }

  return 'unknown';
}

export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const store = getStore();

  compactStore(store, now);

  const ip = getClientIp(options.request);
  const identifier = String(options.identifier || '').trim().toLowerCase();
  const key = identifier
    ? `${options.keyPrefix}:${ip}:${identifier}`
    : `${options.keyPrefix}:${ip}`;

  const existing = store.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + options.windowMs;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      remaining: Math.max(0, options.maxRequests - 1),
      retryAfter: 0,
      limit: options.maxRequests,
      resetAt,
    };
  }

  if (existing.count >= options.maxRequests) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfter,
      limit: options.maxRequests,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  store.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, options.maxRequests - existing.count),
    retryAfter: 0,
    limit: options.maxRequests,
    resetAt: existing.resetAt,
  };
}
