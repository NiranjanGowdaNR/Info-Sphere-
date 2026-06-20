import { describe, expect, it } from "vitest";
import { fetchNews } from "./news-api.server";

function response(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe("fetchNews", () => {
  it("returns a configuration error when the API key is missing", async () => {
    const result = await fetchNews(
      "/everything",
      { q: "unit-missing-key" },
      { apiKey: "" },
    );

    expect(result.success).toBe(false);
    expect(result.status).toBe(500);
  });

  it("maps successful NewsAPI responses", async () => {
    const result = await fetchNews(
      "/everything",
      { q: "unit-success" },
      {
        apiKey: "test-key",
        fetcher: async () =>
          response(200, {
            articles: [{ title: "Story" }],
            totalResults: 1,
          }),
      },
    );

    expect(result.success).toBe(true);
    expect(result.data.totalResults).toBe(1);
  });

  it("handles rate limits gracefully", async () => {
    const result = await fetchNews(
      "/everything",
      { q: "unit-rate-limit" },
      {
        apiKey: "test-key",
        fetcher: async () => response(429, { message: "Too many requests" }),
      },
    );

    expect(result.rateLimited).toBe(true);
    expect(result.status).toBe(429);
  });
});
