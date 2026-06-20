import { describe, expect, it } from "vitest";
import { getPopularArticles } from "./popular-articles";
import type { Article } from "@/shared/models/news";

function article(title: string): Article {
  return {
    source: { id: null, name: "Example" },
    author: null,
    title,
    description: null,
    url: `https://example.com/${title}`,
    urlToImage: null,
    publishedAt: "2026-01-01T00:00:00Z",
    content: null,
  };
}

describe("getPopularArticles", () => {
  it("ranks articles by local view and share engagement", () => {
    const first = article("first");
    const second = article("second");
    const popular = getPopularArticles(
      [first, second],
      [
        {
          url: first.url,
          title: first.title,
          sourceName: "Example",
          views: 1,
          shares: 0,
          lastViewedAt: 1,
          lastSharedAt: 0,
        },
        {
          url: second.url,
          title: second.title,
          sourceName: "Example",
          views: 0,
          shares: 1,
          lastViewedAt: 0,
          lastSharedAt: 1,
        },
      ],
    );

    expect(popular[0].article.title).toBe("second");
  });
});
