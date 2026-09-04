/**
 * Simple in-memory token-bucket rate limiter.
 *
 * Serverless functions are stateless and short-lived; this implementation
 * effectively rate-limits per cold-start lifetime, which is sufficient for
 * the login endpoint under typical abuse. For multi-instance deployments
 * swap for an Upstash/Redis-backed implementation (see docs/SECURITY.md).
 *
 * Keys are derived from (route, ip). Bucket refills at a fixed rate.
 */
interface Bucket {
  tokens: number;
  updated: number;
}

const buckets = new Map<string, Bucket>();

interface RateLimitConfig {
  capacity: number;
  refillPerSec: number;
}

export function rateLimit(key: string, cfg: RateLimitConfig): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens: cfg.capacity, updated: now };
  const elapsed = (now - bucket.updated) / 1000;
  const refilled = Math.min(cfg.capacity, bucket.tokens + elapsed * cfg.refillPerSec);
  bucket.tokens = refilled;
  bucket.updated = now;
  buckets.set(key, bucket);
  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return { allowed: true, retryAfterSec: 0 };
  }
  const deficit = 1 - bucket.tokens;
  return { allowed: false, retryAfterSec: Math.ceil(deficit / cfg.refillPerSec) };
}

export function clientIp(headers: { [k: string]: string | string[] | undefined }): string {
  const xff = headers["x-forwarded-for"];
  if (typeof xff === "string") return xff.split(",")[0]?.trim() ?? "unknown";
  return String(headers["x-real-ip"] ?? "unknown");
}