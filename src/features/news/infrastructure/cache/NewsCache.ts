/**
 * Infrastructure: News Cache
 * Handles caching logic for news data
 * Isolated from business logic
 */

import type { NewsResult } from "../../domain/entities/Article";

export interface CacheEntry {
  data: NewsResult;
  savedAt: number;
}

export interface CacheOptions {
  freshTtlMs: number;
  staleTtlMs: number;
}

export interface CacheMetadata {
  cached: boolean;
  stale: boolean;
  cacheAgeSeconds: number;
}

/**
 * In-memory cache for news data
 * Supports fresh and stale cache strategies
 */
export class NewsCache {
  private cache = new Map<string, CacheEntry>();

  /**
   * Create a cache key from path and parameters
   */
  createKey(path: string, params: Record<string, string | number>): string {
    const sortedParams = Object.entries(params).sort(([a], [b]) =>
      a.localeCompare(b),
    );
    return `${path}?${new URLSearchParams(
      sortedParams.map(([key, value]) => [key, String(value)]),
    ).toString()}`;
  }

  /**
   * Get cached data if available and not expired
   */
  get(
    key: string,
    options: CacheOptions,
    now = Date.now(),
  ): { data: NewsResult; metadata: CacheMetadata } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = now - entry.savedAt;

    // Fresh cache
    if (age <= options.freshTtlMs) {
      return {
        data: entry.data,
        metadata: {
          cached: true,
          stale: false,
          cacheAgeSeconds: Math.round(age / 1000),
        },
      };
    }

    // Stale cache (can be used as fallback)
    if (age <= options.staleTtlMs) {
      return {
        data: entry.data,
        metadata: {
          cached: true,
          stale: true,
          cacheAgeSeconds: Math.round(age / 1000),
        },
      };
    }

    // Expired - remove from cache
    this.cache.delete(key);
    return null;
  }

  /**
   * Set cache entry
   */
  set(key: string, data: NewsResult, now = Date.now()): void {
    this.cache.set(key, { data, savedAt: now });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }
}
