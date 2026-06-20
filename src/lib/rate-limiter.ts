/**
 * API Rate Limiting Service
 * Implements client-side rate limiting to prevent API abuse
 * Uses token bucket algorithm for smooth rate limiting
 */

export interface RateLimitConfig {
  maxRequests: number; // Maximum requests allowed
  windowMs: number; // Time window in milliseconds
  retryAfterMs?: number; // How long to wait before retrying
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfterMs?: number;
}

export interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockedUntil?: number;
}

const RATE_LIMIT_KEY = "info-sphere:rate-limits";

/**
 * Token Bucket Rate Limiter
 * Allows bursts up to maxRequests, then throttles
 */
export class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem(RATE_LIMIT_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as [string, RateLimitEntry][];
        this.limits = new Map(entries);
        // Clean up expired entries
        this.cleanup();
      }
    } catch {
      // Silently fail
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window === "undefined") return;
      const entries = Array.from(this.limits.entries());
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(entries));
    } catch {
      // Silently fail
    }
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      const windowExpired = now - entry.windowStart > this.config.windowMs;
      const blockExpired =
        entry.blocked && entry.blockedUntil && now > entry.blockedUntil;

      if (windowExpired || blockExpired) {
        this.limits.delete(key);
      }
    }
  }

  /**
   * Check if a request is allowed for the given key
   * @param key - Unique identifier for the rate limit bucket (e.g., "api:news", "api:weather")
   */
  check(key: string): RateLimitResult {
    const now = Date.now();
    this.cleanup();

    let entry = this.limits.get(key);

    // Check if currently blocked
    if (entry?.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        retryAfterMs: entry.blockedUntil - now,
      };
    }

    // Initialize or reset window
    if (!entry || now - entry.windowStart > this.config.windowMs) {
      entry = {
        count: 0,
        windowStart: now,
        blocked: false,
      };
    }

    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      const retryAfter = this.config.retryAfterMs ?? this.config.windowMs;
      entry.blocked = true;
      entry.blockedUntil = now + retryAfter;
      this.limits.set(key, entry);
      this.saveToStorage();

      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        retryAfterMs: retryAfter,
      };
    }

    // Allow request
    entry.count++;
    this.limits.set(key, entry);
    this.saveToStorage();

    const resetAt = entry.windowStart + this.config.windowMs;
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetAt,
    };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.limits.delete(key);
    this.saveToStorage();
  }

  /**
   * Reset all rate limits
   */
  resetAll(): void {
    this.limits.clear();
    this.saveToStorage();
  }

  /**
   * Get current status for a key
   */
  getStatus(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      return {
        allowed: true,
        remaining: this.config.maxRequests,
        resetAt: now + this.config.windowMs,
      };
    }

    if (entry.blocked && entry.blockedUntil && now < entry.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.blockedUntil,
        retryAfterMs: entry.blockedUntil - now,
      };
    }

    const remaining = Math.max(0, this.config.maxRequests - entry.count);
    return {
      allowed: remaining > 0,
      remaining,
      resetAt: entry.windowStart + this.config.windowMs,
    };
  }
}

// ─── Pre-configured Rate Limiters ────────────────────────────────────────────

/**
 * News API rate limiter
 * NewsAPI free tier: 100 requests/day
 * We limit to 50 per hour to be safe
 */
export const newsApiRateLimiter = new RateLimiter({
  maxRequests: 50,
  windowMs: 60 * 60 * 1000, // 1 hour
  retryAfterMs: 5 * 60 * 1000, // 5 minutes
});

/**
 * Weather API rate limiter
 * WeatherAPI free tier: 1M calls/month
 * We limit to 100 per hour
 */
export const weatherApiRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
  retryAfterMs: 60 * 1000, // 1 minute
});

/**
 * Search rate limiter
 * Prevent search spam
 */
export const searchRateLimiter = new RateLimiter({
  maxRequests: 20,
  windowMs: 60 * 1000, // 1 minute
  retryAfterMs: 10 * 1000, // 10 seconds
});

// ─── Rate-Limited Fetch Wrapper ───────────────────────────────────────────────

export interface RateLimitedFetchOptions extends RequestInit {
  rateLimiter?: RateLimiter;
  rateLimitKey?: string;
}

/**
 * Fetch wrapper with rate limiting
 * Automatically checks rate limits before making requests
 */
export async function rateLimitedFetch(
  url: string,
  options: RateLimitedFetchOptions = {},
): Promise<Response> {
  const { rateLimiter, rateLimitKey, ...fetchOptions } = options;

  if (rateLimiter && rateLimitKey) {
    const result = rateLimiter.check(rateLimitKey);

    if (!result.allowed) {
      const retryAfter = result.retryAfterMs
        ? Math.ceil(result.retryAfterMs / 1000)
        : 60;

      throw new RateLimitError(
        `Rate limit exceeded. Please wait ${retryAfter} seconds before retrying.`,
        result.resetAt,
        result.retryAfterMs,
      );
    }
  }

  return fetch(url, fetchOptions);
}

/**
 * Custom error class for rate limit violations
 */
export class RateLimitError extends Error {
  public readonly resetAt: number;
  public readonly retryAfterMs?: number;

  constructor(message: string, resetAt: number, retryAfterMs?: number) {
    super(message);
    this.name = "RateLimitError";
    this.resetAt = resetAt;
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * Format rate limit reset time for display
 */
export function formatRateLimitReset(resetAt: number): string {
  const now = Date.now();
  const diffMs = resetAt - now;

  if (diffMs <= 0) return "now";

  const diffSeconds = Math.ceil(diffMs / 1000);
  if (diffSeconds < 60) return `${diffSeconds}s`;

  const diffMinutes = Math.ceil(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m`;

  const diffHours = Math.ceil(diffMinutes / 60);
  return `${diffHours}h`;
}

/**
 * React hook for rate limit status
 */
export function getRateLimitStatus(
  limiter: RateLimiter,
  key: string,
): {
  isLimited: boolean;
  remaining: number;
  resetIn: string;
} {
  const status = limiter.getStatus(key);
  return {
    isLimited: !status.allowed,
    remaining: status.remaining,
    resetIn: formatRateLimitReset(status.resetAt),
  };
}
