import type { NewsResponse } from "@/shared/models/news";

export interface CacheEntry {
  response: NewsResponse;
  savedAt: number;
}

export interface NewsCacheOptions {
  freshTtlMs: number;
  staleTtlMs: number;
}

export function createCacheKey(
  path: string,
  params: Record<string, string | number>,
) {
  const sortedParams = Object.entries(params).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `${path}?${new URLSearchParams(
    sortedParams.map(([key, value]) => [key, String(value)]),
  ).toString()}`;
}

export function withCacheMeta(
  entry: CacheEntry,
  now = Date.now(),
  stale = false,
): NewsResponse {
  return {
    ...entry.response,
    cached: true,
    stale,
    cacheAgeSeconds: Math.round((now - entry.savedAt) / 1000),
    message: stale
      ? entry.response.message ||
        "Showing recently cached news while live updates recover."
      : entry.response.message,
  };
}

export function getCachedResponse(
  cache: Map<string, CacheEntry>,
  key: string,
  options: NewsCacheOptions,
  now = Date.now(),
) {
  const entry = cache.get(key);
  if (!entry) return null;

  const age = now - entry.savedAt;
  if (age <= options.freshTtlMs) return withCacheMeta(entry, now);
  if (age <= options.staleTtlMs) return withCacheMeta(entry, now, true);

  cache.delete(key);
  return null;
}
