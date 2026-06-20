import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { AISummary, extractiveSummarize, extractKeyPoints } from "./AISummary";
import type { Article } from "@/lib/types";

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const mockArticle: Article = {
  source: { id: "bbc-news", name: "BBC News" },
  author: "John Smith",
  title: "Scientists Discover New Species of Deep Sea Fish in Pacific Ocean",
  description:
    "Marine biologists have discovered a remarkable new species of bioluminescent fish living at depths of over 3,000 meters in the Pacific Ocean. The discovery could reshape our understanding of deep sea ecosystems.",
  url: "https://bbc.com/news/science-12345",
  urlToImage: null,
  publishedAt: "2026-06-20T10:00:00Z",
  content:
    "A team of marine biologists from the University of California has made a groundbreaking discovery. The new species, named Luminaris pacificus, was found during a deep-sea expedition. The fish uses bioluminescence to attract prey in the dark depths. Scientists believe this discovery will help us understand how life adapts to extreme environments. The expedition used advanced submersible technology to reach the depths where the fish was found. [+500 chars]",
};

const shortArticle: Article = {
  source: { id: null, name: "Test Source" },
  author: null,
  title: "Short Article",
  description: "Brief description.",
  url: "https://example.com/short",
  urlToImage: null,
  publishedAt: "2026-06-20T10:00:00Z",
  content: null,
};

const noDescriptionArticle: Article = {
  source: { id: null, name: "Test Source" },
  author: null,
  title: "Article Without Description",
  description: null,
  url: "https://example.com/no-desc",
  urlToImage: null,
  publishedAt: "2026-06-20T10:00:00Z",
  content: null,
};

// ─── extractiveSummarize Tests ────────────────────────────────────────────────

describe("extractiveSummarize", () => {
  it("returns a non-empty string for a full article", () => {
    const result = extractiveSummarize(mockArticle);
    expect(result).toBeTruthy();
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("returns description when content is too short", () => {
    const result = extractiveSummarize(shortArticle);
    expect(result).toBe(shortArticle.description);
  });

  it("returns title when both description and content are null", () => {
    const result = extractiveSummarize(noDescriptionArticle);
    expect(result).toBe(noDescriptionArticle.title);
  });

  it("removes [+N chars] truncation markers from content", () => {
    const result = extractiveSummarize(mockArticle);
    expect(result).not.toContain("[+");
    expect(result).not.toContain("chars]");
  });

  it("respects maxSentences parameter", () => {
    const result1 = extractiveSummarize(mockArticle, 1);
    const result3 = extractiveSummarize(mockArticle, 3);
    expect(result3.length).toBeGreaterThanOrEqual(result1.length);
  });

  it("returns meaningful content related to the article topic", () => {
    const result = extractiveSummarize(mockArticle);
    const articleWords = mockArticle.title.toLowerCase().split(" ");
    const resultLower = result.toLowerCase();
    const hasRelevantContent = articleWords.some(
      (word) => word.length > 4 && resultLower.includes(word),
    );
    expect(hasRelevantContent).toBe(true);
  });

  it("handles articles with only description (no content)", () => {
    const articleNoContent: Article = { ...mockArticle, content: null };
    const result = extractiveSummarize(articleNoContent);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
  });
});

// ─── extractKeyPoints Tests ───────────────────────────────────────────────────

describe("extractKeyPoints", () => {
  it("returns an array of strings", () => {
    const points = extractKeyPoints(mockArticle);
    expect(Array.isArray(points)).toBe(true);
    points.forEach((p) => expect(typeof p).toBe("string"));
  });

  it("includes source information when available", () => {
    const points = extractKeyPoints(mockArticle);
    const hasSource = points.some((p) => p.includes("BBC News"));
    expect(hasSource).toBe(true);
  });

  it("includes publication date", () => {
    const points = extractKeyPoints(mockArticle);
    const hasDate = points.some((p) => p.includes("2026"));
    expect(hasDate).toBe(true);
  });

  it("includes reading time estimate", () => {
    const points = extractKeyPoints(mockArticle);
    const hasReadTime = points.some((p) => p.includes("read time"));
    expect(hasReadTime).toBe(true);
  });

  it("returns at most 4 points", () => {
    const points = extractKeyPoints(mockArticle);
    expect(points.length).toBeLessThanOrEqual(4);
  });

  it("handles article without source name", () => {
    const articleNoSource: Article = {
      ...mockArticle,
      source: { id: null, name: "" },
    };
    const points = extractKeyPoints(articleNoSource);
    expect(Array.isArray(points)).toBe(true);
  });
});

// ─── AISummary Component Tests ────────────────────────────────────────────────

describe("AISummary Component", () => {
  // Use real timers for component tests since the component uses setTimeout internally
  describe("compact mode", () => {
    it("renders a button in compact mode", () => {
      render(<AISummary article={mockArticle} compact />);
      const button = screen.getByRole("button", { name: /ai summary/i });
      expect(button).toBeInTheDocument();
    });

    it("shows 'AI Summary' text initially", () => {
      render(<AISummary article={mockArticle} compact />);
      expect(screen.getByText("AI Summary")).toBeInTheDocument();
    });

    it("shows loading state when clicked", () => {
      render(<AISummary article={mockArticle} compact />);
      const button = screen.getByRole("button", { name: /ai summary/i });
      fireEvent.click(button);
      expect(screen.getByText("Summarizing...")).toBeInTheDocument();
    });

    it("is disabled while loading", () => {
      render(<AISummary article={mockArticle} compact />);
      const button = screen.getByRole("button", { name: /ai summary/i });
      fireEvent.click(button);
      expect(button).toBeDisabled();
    });
  });

  describe("full mode", () => {
    it("renders the generate button", () => {
      render(<AISummary article={mockArticle} />);
      expect(screen.getByText("Generate AI Summary")).toBeInTheDocument();
    });

    it("shows loading state when clicked", () => {
      render(<AISummary article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(button);
      expect(screen.getByText("Generating summary…")).toBeInTheDocument();
    });

    it("displays summary after generation", async () => {
      render(<AISummary article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(button);

      // Wait for the real setTimeout (50ms) to complete
      await waitFor(
        () => {
          expect(screen.getByText("TL;DR")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("displays key points after generation", async () => {
      render(<AISummary article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("Key Points")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("shows close button when expanded", async () => {
      render(<AISummary article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(
            screen.getByRole("button", { name: /close summary/i }),
          ).toBeInTheDocument();
        },
        { timeout: 3000 },
      );
    });

    it("collapses when close button is clicked", async () => {
      render(<AISummary article={mockArticle} />);
      const generateButton = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(generateButton);

      await waitFor(
        () => {
          expect(screen.getByText("TL;DR")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      const closeButton = screen.getByRole("button", {
        name: /close summary/i,
      });
      fireEvent.click(closeButton);

      expect(screen.queryByText("TL;DR")).not.toBeInTheDocument();
    });

    it("toggles expand/collapse on repeated header clicks", async () => {
      render(<AISummary article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("TL;DR")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Click header to collapse
      const summaryButton = screen.getByRole("button", {
        name: /ai summary/i,
      });
      fireEvent.click(summaryButton);
      expect(screen.queryByText("TL;DR")).not.toBeInTheDocument();

      // Click again to expand
      fireEvent.click(summaryButton);
      expect(screen.getByText("TL;DR")).toBeInTheDocument();
    });

    it("resets when article URL changes", async () => {
      const { rerender } = render(<AISummary article={mockArticle} />);
      const button = screen.getByRole("button", {
        name: /generate ai summary/i,
      });
      fireEvent.click(button);

      await waitFor(
        () => {
          expect(screen.getByText("TL;DR")).toBeInTheDocument();
        },
        { timeout: 3000 },
      );

      // Change article
      rerender(<AISummary article={shortArticle} />);

      // Should reset to initial state
      expect(screen.queryByText("TL;DR")).not.toBeInTheDocument();
      expect(screen.getByText("Generate AI Summary")).toBeInTheDocument();
    });
  });
});
