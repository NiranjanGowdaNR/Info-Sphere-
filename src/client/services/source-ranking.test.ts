import { describe, expect, it } from "vitest";
import { getRelativeTime, getSourceRankings } from "./source-ranking";
import type { Article } from "@/shared/models/news";

function article(source: string, publishedAt: string, title = source): Article {
  return {
    source: { id: null, name: source },
    author: null,
    title,
    description: null,
    url: `https://example.com/${source}/${publishedAt}`,
    urlToImage: null,
    publishedAt,
    content: null,
  };
}

describe("getSourceRankings", () => {
  const now = new Date("2026-01-02T00:00:00Z").getTime();
  const articles = [
    article("A", "2026-01-01T23:00:00Z", "A latest"),
    article("A", "2026-01-01T10:00:00Z"),
    article("B", "2026-01-01T23:30:00Z", "B latest"),
  ];

  it("ranks latest mode by freshest source", () => {
    expect(getSourceRankings(articles, "latest", now)[0].name).toBe("B");
  });

  it("ranks coverage mode by article count", () => {
    expect(getSourceRankings(articles, "coverage", now)[0].name).toBe("A");
  });

  it("formats relative time", () => {
    expect(
      getRelativeTime(new Date("2026-01-01T23:30:00Z").getTime(), now),
    ).toBe("30m ago");
  });
});
