import { describe, expect, it } from "vitest";
import { createArticleShareLinks } from "./share";
import type { Article } from "@/shared/models/news";

const article: Article = {
  source: { id: null, name: "Example" },
  author: null,
  title: "Market update",
  description: "Stocks moved higher.",
  url: "https://example.com/market",
  urlToImage: null,
  publishedAt: "2026-01-01T00:00:00Z",
  content: null,
};

describe("createArticleShareLinks", () => {
  it("creates platform URLs and copy content from article data", () => {
    const links = createArticleShareLinks(article);

    expect(links.copyText).toContain(article.title);
    expect(links.copyText).toContain(article.url);
    expect(links.email).toContain("mailto:");
    expect(links.linkedin).toContain("linkedin.com");
    expect(links.twitter).toContain("twitter.com");
    expect(links.whatsapp).toContain("web.whatsapp.com/send");
  });
});
