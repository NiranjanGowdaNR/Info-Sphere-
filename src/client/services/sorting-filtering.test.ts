import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  sortArticles,
  filterArticles,
  getUniqueSources,
  getSavedSortOption,
  saveSortOption,
  SORT_OPTIONS,
  type SortOption,
} from "./sorting-filtering";
import type { Article } from "@/shared/models/news";

const mockArticles: Article[] = [
  {
    source: { id: "1", name: "BBC News" },
    author: "John Doe",
    title: "Article 1",
    description: "Description 1",
    url: "https://example.com/1",
    urlToImage: null,
    publishedAt: "2024-01-01T10:00:00Z",
    content: "Content 1",
  },
  {
    source: { id: "2", name: "CNN" },
    author: "Jane Smith",
    title: "Article 2",
    description: "Description 2",
    url: "https://example.com/2",
    urlToImage: null,
    publishedAt: "2024-01-02T10:00:00Z",
    content: "Content 2",
  },
  {
    source: { id: "3", name: "ABC News" },
    author: "Bob Johnson",
    title: "Article 3",
    description: "Description 3",
    url: "https://example.com/3",
    urlToImage: null,
    publishedAt: "2024-01-03T10:00:00Z",
    content: "Content 3",
  },
];

describe("Sorting and Filtering Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("sortArticles", () => {
    it("should sort by newest first", () => {
      const sorted = sortArticles(mockArticles, "newest");
      expect(sorted[0].title).toBe("Article 3");
      expect(sorted[2].title).toBe("Article 1");
    });

    it("should sort by oldest first", () => {
      const sorted = sortArticles(mockArticles, "oldest");
      expect(sorted[0].title).toBe("Article 1");
      expect(sorted[2].title).toBe("Article 3");
    });

    it("should sort by source A-Z", () => {
      const sorted = sortArticles(mockArticles, "source-asc");
      expect(sorted[0].source.name).toBe("ABC News");
      expect(sorted[1].source.name).toBe("BBC News");
      expect(sorted[2].source.name).toBe("CNN");
    });

    it("should sort by source Z-A", () => {
      const sorted = sortArticles(mockArticles, "source-desc");
      expect(sorted[0].source.name).toBe("CNN");
      expect(sorted[1].source.name).toBe("BBC News");
      expect(sorted[2].source.name).toBe("ABC News");
    });

    it("should sort by popularity when engagement data provided", () => {
      const engagementMap = new Map([
        ["https://example.com/1", { views: 10, shares: 2 }],
        ["https://example.com/2", { views: 5, shares: 1 }],
        ["https://example.com/3", { views: 20, shares: 5 }],
      ]);

      const sorted = sortArticles(mockArticles, "popular", engagementMap);
      expect(sorted[0].url).toBe("https://example.com/3"); // 20 + 5*2 = 30
      expect(sorted[1].url).toBe("https://example.com/1"); // 10 + 2*2 = 14
      expect(sorted[2].url).toBe("https://example.com/2"); // 5 + 1*2 = 7
    });

    it("should not modify original array", () => {
      const original = [...mockArticles];
      sortArticles(mockArticles, "newest");
      expect(mockArticles).toEqual(original);
    });
  });

  describe("filterArticles", () => {
    it("should filter by sources", () => {
      const filtered = filterArticles(mockArticles, {
        sources: ["BBC News", "CNN"],
      });
      expect(filtered.length).toBe(2);
      expect(
        filtered.every((a) => ["BBC News", "CNN"].includes(a.source.name)),
      ).toBe(true);
    });

    it("should filter by search term", () => {
      const filtered = filterArticles(mockArticles, {
        sources: [],
        searchTerm: "Article 2",
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].title).toBe("Article 2");
    });

    it("should return all articles when no filters applied", () => {
      const filtered = filterArticles(mockArticles, { sources: [] });
      expect(filtered.length).toBe(mockArticles.length);
    });
  });

  describe("getUniqueSources", () => {
    it("should return unique source names", () => {
      const sources = getUniqueSources(mockArticles);
      expect(sources).toEqual(["ABC News", "BBC News", "CNN"]);
    });

    it("should return sorted sources", () => {
      const sources = getUniqueSources(mockArticles);
      const sorted = [...sources].sort();
      expect(sources).toEqual(sorted);
    });
  });

  describe("getSavedSortOption", () => {
    it("should return default sort option when not set", () => {
      const option = getSavedSortOption();
      expect(option).toBe("newest");
    });

    it("should return stored sort option", () => {
      localStorage.setItem("info-sphere:sort-option", "popular");
      const option = getSavedSortOption();
      expect(option).toBe("popular");
    });
  });

  describe("saveSortOption", () => {
    it("should store sort option", () => {
      saveSortOption("oldest");
      const stored = localStorage.getItem("info-sphere:sort-option");
      expect(stored).toBe("oldest");
    });

    it("should dispatch custom event", () => {
      let eventFired = false;
      window.addEventListener("ls:info-sphere:sort-option", () => {
        eventFired = true;
      });

      saveSortOption("popular");
      expect(eventFired).toBe(true);
    });
  });

  describe("SORT_OPTIONS", () => {
    it("should have 5 sort options", () => {
      expect(SORT_OPTIONS.length).toBe(5);
    });

    it("should include all expected options", () => {
      const options = SORT_OPTIONS.map((o) => o.option);
      expect(options).toContain("newest");
      expect(options).toContain("oldest");
      expect(options).toContain("popular");
      expect(options).toContain("source-asc");
      expect(options).toContain("source-desc");
    });
  });
});
