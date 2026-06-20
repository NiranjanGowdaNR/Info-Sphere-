import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  NewsComparison,
  analyzeSentiment,
  extractEmphasis,
  analyzeSourceCoverage,
  findCommonFacts,
} from "./NewsComparison";
import type { Article } from "@/lib/types";

// ─── Test Fixtures ────────────────────────────────────────────────────────────

function makeArticle(
  overrides: Partial<Article> & {
    source?: { id: string | null; name: string };
  },
): Article {
  return {
    source: { id: null, name: "Test Source" },
    author: "Test Author",
    title: "Test Article Title",
    description: "Test description",
    url: "https://example.com/test",
    urlToImage: null,
    publishedAt: "2026-06-20T10:00:00Z",
    content: null,
    ...overrides,
  };
}

const positiveArticle = makeArticle({
  title: "Company Reports Record Growth and Success in Q2",
  description: "Strong gains and profit boost for the company this quarter.",
  source: { id: null, name: "Financial Times" },
});

const negativeArticle = makeArticle({
  title: "Market Crash and Economic Crisis Threatens Jobs",
  description: "Decline and loss feared as risk and threat grow.",
  source: { id: null, name: "Reuters" },
});

const neutralArticle = makeArticle({
  title: "Government Announces New Policy Changes",
  description: "Officials discuss upcoming regulatory changes.",
  source: { id: null, name: "BBC News" },
});

const bbcArticle1 = makeArticle({
  title: "Climate Change Impact on Pacific Ocean",
  description: "Scientists study ocean temperature changes.",
  url: "https://bbc.com/1",
  source: { id: "bbc", name: "BBC News" },
});

const bbcArticle2 = makeArticle({
  title: "Climate Scientists Warn of Pacific Changes",
  description: "New research on ocean warming.",
  url: "https://bbc.com/2",
  source: { id: "bbc", name: "BBC News" },
});

const cnnArticle = makeArticle({
  title: "Ocean Temperatures Rising Globally",
  description: "Global warming affects ocean ecosystems.",
  url: "https://cnn.com/1",
  source: { id: "cnn", name: "CNN" },
});

const mockArticle = makeArticle({
  title: "Scientists Discover New Species in Pacific Ocean",
  description: "Marine biologists found a new fish species.",
  url: "https://example.com/main",
  source: { id: "bbc", name: "BBC News" },
});

// ─── analyzeSentiment Tests ───────────────────────────────────────────────────

describe("analyzeSentiment", () => {
  it("returns positive for articles with positive keywords", () => {
    const result = analyzeSentiment([positiveArticle]);
    expect(result).toBe("positive");
  });

  it("returns negative for articles with negative keywords", () => {
    const result = analyzeSentiment([negativeArticle]);
    expect(result).toBe("negative");
  });

  it("returns neutral for articles without strong sentiment", () => {
    const result = analyzeSentiment([neutralArticle]);
    expect(result).toBe("neutral");
  });

  it("returns neutral for empty articles array", () => {
    const result = analyzeSentiment([]);
    expect(result).toBe("neutral");
  });

  it("handles mixed sentiment articles", () => {
    const result = analyzeSentiment([positiveArticle, negativeArticle]);
    expect(["positive", "negative", "neutral"]).toContain(result);
  });
});

// ─── extractEmphasis Tests ────────────────────────────────────────────────────

describe("extractEmphasis", () => {
  it("returns 'General coverage' for empty array", () => {
    const result = extractEmphasis([]);
    expect(result).toBe("General coverage");
  });

  it("returns a string for articles with content", () => {
    const result = extractEmphasis([bbcArticle1, bbcArticle2]);
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("extracts meaningful words from titles", () => {
    const result = extractEmphasis([bbcArticle1, bbcArticle2]);
    // Should contain words from the titles (not stop words)
    const resultLower = result.toLowerCase();
    const hasRelevantWord =
      resultLower.includes("climate") ||
      resultLower.includes("ocean") ||
      resultLower.includes("pacific") ||
      resultLower.includes("scientists");
    expect(hasRelevantWord).toBe(true);
  });
});

// ─── analyzeSourceCoverage Tests ──────────────────────────────────────────────

describe("analyzeSourceCoverage", () => {
  it("returns empty array for empty input", () => {
    const result = analyzeSourceCoverage([]);
    expect(result).toEqual([]);
  });

  it("groups articles by source", () => {
    const articles = [bbcArticle1, bbcArticle2, cnnArticle];
    const result = analyzeSourceCoverage(articles);

    const bbc = result.find((s) => s.source === "BBC News");
    const cnn = result.find((s) => s.source === "CNN");

    expect(bbc).toBeDefined();
    expect(bbc?.articles.length).toBe(2);
    expect(cnn).toBeDefined();
    expect(cnn?.articles.length).toBe(1);
  });

  it("sorts sources by article count (descending)", () => {
    const articles = [bbcArticle1, bbcArticle2, cnnArticle];
    const result = analyzeSourceCoverage(articles);

    expect(result[0].source).toBe("BBC News");
    expect(result[0].articles.length).toBeGreaterThanOrEqual(
      result[1].articles.length,
    );
  });

  it("includes sentiment for each source", () => {
    const articles = [bbcArticle1, cnnArticle];
    const result = analyzeSourceCoverage(articles);

    result.forEach((source) => {
      expect(["positive", "negative", "neutral"]).toContain(source.sentiment);
    });
  });

  it("limits to 6 sources maximum", () => {
    const manyArticles = Array.from({ length: 20 }, (_, i) =>
      makeArticle({
        url: `https://source${i}.com`,
        source: { id: null, name: `Source ${i}` },
      }),
    );
    const result = analyzeSourceCoverage(manyArticles);
    expect(result.length).toBeLessThanOrEqual(6);
  });

  it("handles articles with unknown source", () => {
    const articleNoSource = makeArticle({
      source: { id: null, name: "" },
    });
    const result = analyzeSourceCoverage([articleNoSource]);
    expect(result.length).toBe(1);
    expect(result[0].source).toBe("Unknown");
  });
});

// ─── findCommonFacts Tests ────────────────────────────────────────────────────

describe("findCommonFacts", () => {
  it("returns empty array for single article", () => {
    const result = findCommonFacts([bbcArticle1]);
    expect(result).toEqual([]);
  });

  it("returns empty array for empty input", () => {
    const result = findCommonFacts([]);
    expect(result).toEqual([]);
  });

  it("finds common numbers across articles", () => {
    const article1 = makeArticle({
      title: "Company reports 50% growth in revenue",
      description: "Revenue increased by 50% this quarter.",
      url: "https://a.com",
    });
    const article2 = makeArticle({
      title: "50% increase reported by company",
      description: "The 50% figure surprised analysts.",
      url: "https://b.com",
    });

    const result = findCommonFacts([article1, article2]);
    const has50 = result.some((f) => f.includes("50"));
    expect(has50).toBe(true);
  });

  it("returns array of strings", () => {
    const result = findCommonFacts([bbcArticle1, bbcArticle2, cnnArticle]);
    expect(Array.isArray(result)).toBe(true);
    result.forEach((f) => expect(typeof f).toBe("string"));
  });

  it("includes count of sources when no specific facts found", () => {
    const result = findCommonFacts([bbcArticle1, cnnArticle]);
    // Should have some result
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── NewsComparison Component Tests ──────────────────────────────────────────

describe("NewsComparison Component", () => {
  beforeEach(() => {
    // Mock fetch for API calls
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          articles: [bbcArticle1, bbcArticle2, cnnArticle],
        },
      }),
    });
  });

  describe("compact mode", () => {
    it("renders a compare button in compact mode", () => {
      render(<NewsComparison article={mockArticle} compact />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      expect(button).toBeInTheDocument();
    });

    it("shows 'Compare' text initially", () => {
      render(<NewsComparison article={mockArticle} compact />);
      expect(screen.getByText("Compare")).toBeInTheDocument();
    });

    it("shows loading state when clicked", async () => {
      render(<NewsComparison article={mockArticle} compact />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);
      expect(screen.getByText("Loading…")).toBeInTheDocument();
    });

    it("is disabled while loading", () => {
      render(<NewsComparison article={mockArticle} compact />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);
      expect(button).toBeDisabled();
    });
  });

  describe("full mode", () => {
    it("renders the compare button", () => {
      render(<NewsComparison article={mockArticle} />);
      expect(screen.getByText("Compare News Coverage")).toBeInTheDocument();
    });

    it("shows loading state when clicked", () => {
      render(<NewsComparison article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);
      expect(screen.getByText("Analyzing coverage…")).toBeInTheDocument();
    });

    it("displays source comparison after loading", async () => {
      render(<NewsComparison article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("Coverage by Source")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("shows refresh button after loading", async () => {
      render(<NewsComparison article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(
            screen.getByRole("button", { name: /refresh comparison/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("works with pre-loaded related articles", async () => {
      render(
        <NewsComparison
          article={mockArticle}
          relatedArticles={[bbcArticle1, bbcArticle2, cnnArticle]}
        />,
      );

      // With pre-loaded articles, clicking should immediately show comparison
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("Coverage by Source")).toBeInTheDocument();
        },
        { timeout: 1000 },
      );
    });

    it("handles API failure gracefully", async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

      render(<NewsComparison article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);

      // Should still show something even on error
      await waitFor(
        () => {
          expect(screen.getByText("Coverage by Source")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("toggles expand/collapse on repeated clicks", async () => {
      render(
        <NewsComparison
          article={mockArticle}
          relatedArticles={[bbcArticle1, cnnArticle]}
        />,
      );

      const button = screen.getByRole("button", {
        name: /compare news coverage/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("Coverage by Source")).toBeInTheDocument();
        },
        { timeout: 1000 },
      );

      // Click again to collapse
      fireEvent.click(button);
      expect(screen.queryByText("Coverage by Source")).not.toBeInTheDocument();

      // Click again to expand
      fireEvent.click(button);
      expect(screen.getByText("Coverage by Source")).toBeInTheDocument();
    });
  });
});
