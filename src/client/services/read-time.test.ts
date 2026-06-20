import { describe, expect, it } from "vitest";
import { estimateReadMinutes } from "./read-time";
import type { Article } from "@/shared/models/news";

const article: Article = {
  source: { id: null, name: "Example" },
  author: null,
  title: "Short news",
  description: "A compact preview.",
  url: "https://example.com/story",
  urlToImage: null,
  publishedAt: "2026-01-01T00:00:00Z",
  content: "Preview text. [+2600 chars]",
};

describe("estimateReadMinutes", () => {
  it("uses NewsAPI hidden character counts for realistic estimates", () => {
    expect(estimateReadMinutes(article)).toBe(3);
  });

  it("never returns less than one minute", () => {
    expect(
      estimateReadMinutes({ ...article, content: null, description: null }),
    ).toBe(1);
  });

  it("caps very large estimates", () => {
    expect(
      estimateReadMinutes({ ...article, content: "Preview. [+99999 chars]" }),
    ).toBe(15);
  });
});
