import { describe, expect, it } from "vitest";
import { createCacheKey, getCachedResponse } from "./news-cache.server";

describe("news cache service", () => {
  it("creates stable keys regardless of param order", () => {
    expect(createCacheKey("/everything", { b: 2, a: 1 })).toBe(
      createCacheKey("/everything", { a: 1, b: 2 }),
    );
  });

  it("returns fresh cached responses with age metadata", () => {
    const cache = new Map([
      [
        "key",
        {
          savedAt: 1000,
          response: {
            status: 200,
            success: true,
            message: "",
            data: { articles: [], totalResults: 0 },
          },
        },
      ],
    ]);

    const response = getCachedResponse(
      cache,
      "key",
      { freshTtlMs: 5000, staleTtlMs: 10000 },
      4000,
    );

    expect(response?.cached).toBe(true);
    expect(response?.stale).toBe(false);
    expect(response?.cacheAgeSeconds).toBe(3);
  });

  it("deletes expired entries", () => {
    const cache = new Map([
      [
        "key",
        {
          savedAt: 1000,
          response: {
            status: 200,
            success: true,
            message: "",
            data: { articles: [], totalResults: 0 },
          },
        },
      ],
    ]);

    expect(
      getCachedResponse(
        cache,
        "key",
        { freshTtlMs: 1000, staleTtlMs: 2000 },
        5000,
      ),
    ).toBeNull();
    expect(cache.has("key")).toBe(false);
  });
});
