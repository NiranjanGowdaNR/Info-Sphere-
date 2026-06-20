import type { NewsResponse } from "@/shared/models/news";
import {
  createCacheKey,
  getCachedResponse,
  type CacheEntry,
} from "./news-cache.server";

const BASE = "https://newsapi.org/v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const STALE_TTL_MS = 60 * 60 * 1000;

const cache = new Map<string, CacheEntry>();

export interface NewsApiServiceOptions {
  apiKey?: string;
  fetcher?: typeof fetch;
}

function createEmptyResponse(
  status: number,
  message: string,
  extra?: Partial<NewsResponse>,
): NewsResponse {
  return {
    status,
    success: false,
    message,
    data: { articles: [], totalResults: 0 },
    ...extra,
  };
}

export async function fetchNews(
  path: string,
  params: Record<string, string | number>,
  options: NewsApiServiceOptions = {},
): Promise<NewsResponse> {
  const apiKey = options.apiKey ?? process.env.NEWS_API_KEY;
  const fetcher = options.fetcher ?? fetch;
  const cacheKey = createCacheKey(path, params);
  const cached = getCachedResponse(cache, cacheKey, {
    freshTtlMs: CACHE_TTL_MS,
    staleTtlMs: STALE_TTL_MS,
  });

  if (cached && !cached.stale) return cached;

  if (!apiKey) {
    return cached ?? createEmptyResponse(500, "NEWS_API_KEY is not configured");
  }

  const url = new URL(`${BASE}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, String(value));
  }
  url.searchParams.set("apiKey", apiKey);

  try {
    const res = await fetcher(url.toString(), {
      headers: { "User-Agent": "info-sphere/1.0" },
    });
    const json = (await res.json()) as {
      articles?: unknown[];
      totalResults?: number;
      message?: string;
    };

    if (!res.ok) {
      if (res.status === 429) {
        return (
          cached ??
          createEmptyResponse(
            429,
            json.message ||
              "NewsAPI rate limit reached. Please wait a bit before refreshing.",
            { rateLimited: true },
          )
        );
      }

      return (
        cached ??
        createEmptyResponse(
          res.status,
          json.message || `NewsAPI error ${res.status}`,
        )
      );
    }

    const response: NewsResponse = {
      status: 200,
      success: true,
      message: "",
      data: {
        articles: json.articles ?? [],
        totalResults: json.totalResults ?? 0,
      },
    };
    cache.set(cacheKey, { response, savedAt: Date.now() });
    return response;
  } catch (error) {
    return (
      cached ??
      createEmptyResponse(
        500,
        error instanceof Error ? error.message : String(error),
      )
    );
  }
}
