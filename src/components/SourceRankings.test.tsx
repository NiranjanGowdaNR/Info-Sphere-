import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SourceRankings } from "./SourceRankings";
import type { Article } from "@/lib/types";

// Mock dependencies
vi.mock("@/client/services/source-ranking", () => ({
  getSourceRankings: (articles: Article[]) => {
    // Group by source and return rankings
    const sourceMap: Record<
      string,
      { name: string; count: number; latest: string }
    > = {};

    articles.forEach((article) => {
      const sourceName = article.source?.name || "Unknown";
      if (!sourceMap[sourceName]) {
        sourceMap[sourceName] = {
          name: sourceName,
          count: 0,
          latest: article.publishedAt,
        };
      }
      sourceMap[sourceName].count += 1;
      if (article.publishedAt > sourceMap[sourceName].latest) {
        sourceMap[sourceName].latest = article.publishedAt;
      }
    });

    return Object.values(sourceMap).sort((a, b) => b.count - a.count);
  },
  getRelativeTime: (date: string) => "2 hours ago",
}));

// Mock useWidgetEnabled hook
vi.mock("./DashboardCustomizer", () => {
  const enabledWidgets = {
    "source-rankings": true,
  };
  return {
    useWidgetEnabled: (widgetId: string) => {
      if (
        typeof globalThis !== "undefined" &&
        "mockUseWidgetEnabled" in globalThis
      ) {
        return (
          globalThis as unknown as Record<string, (widgetId: string) => boolean>
        ).mockUseWidgetEnabled(widgetId);
      }
      return enabledWidgets[widgetId as keyof typeof enabledWidgets] ?? true;
    },
  };
});

const mockArticles: Article[] = [
  {
    source: { id: "bbc", name: "BBC News" },
    author: "John Doe",
    title: "Article 1",
    description: "Description 1",
    url: "https://example.com/1",
    urlToImage: null,
    publishedAt: "2026-06-20T10:00:00Z",
    content: "Content 1",
  },
  {
    source: { id: "bbc", name: "BBC News" },
    author: "Jane Smith",
    title: "Article 2",
    description: "Description 2",
    url: "https://example.com/2",
    urlToImage: null,
    publishedAt: "2026-06-20T09:00:00Z",
    content: "Content 2",
  },
  {
    source: { id: "cnn", name: "CNN" },
    author: "Bob Johnson",
    title: "Article 3",
    description: "Description 3",
    url: "https://example.com/3",
    urlToImage: null,
    publishedAt: "2026-06-20T08:00:00Z",
    content: "Content 3",
  },
];

describe("SourceRankings", () => {
  beforeEach(() => {
    delete (globalThis as unknown as Record<string, unknown>)
      .mockUseWidgetEnabled;
  });

  it("renders source rankings when widget is enabled and articles exist", () => {
    delete (globalThis as unknown as Record<string, unknown>)
      .mockUseWidgetEnabled;
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/Top News Sources/)).toBeInTheDocument();
    expect(screen.getByText(/BBC News/)).toBeInTheDocument();
    expect(screen.getByText(/CNN/)).toBeInTheDocument();
  });

  it("renders nothing when widget is disabled", () => {
    (
      globalThis as unknown as Record<string, (widgetId: string) => boolean>
    ).mockUseWidgetEnabled = (widgetId: string) =>
      widgetId !== "source-rankings";

    const { container } = render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no articles provided", () => {
    const { container } = render(
      <SourceRankings
        articles={[]}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("displays radio icon header", () => {
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );
    expect(screen.getByText(/Top News Sources/)).toBeInTheDocument();
  });

  it("displays mode selection buttons (Trending, Latest, Coverage)", () => {
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /Trending/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Latest/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Coverage/i }),
    ).toBeInTheDocument();
  });

  it("calls onSourceSelect when a source button is clicked", () => {
    const onSourceSelect = vi.fn();
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={onSourceSelect}
      />,
    );

    const bbcButton = screen.getByText(/BBC News/);
    fireEvent.click(bbcButton);

    expect(onSourceSelect).toHaveBeenCalledWith("BBC News");
  });

  it("highlights selected source", () => {
    const onSourceSelect = vi.fn();
    const { rerender } = render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={onSourceSelect}
      />,
    );

    rerender(
      <SourceRankings
        articles={mockArticles}
        selectedSource="BBC News"
        onSourceSelect={onSourceSelect}
      />,
    );

    const bbcButton = screen.getByText(/BBC News/).closest("button");
    expect(bbcButton).toHaveClass("border-primary", "bg-primary/10");
  });

  it("deselects source when clicking selected source button", () => {
    const onSourceSelect = vi.fn();
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource="BBC News"
        onSourceSelect={onSourceSelect}
      />,
    );

    const bbcButton = screen.getByText(/BBC News/);
    fireEvent.click(bbcButton);

    expect(onSourceSelect).toHaveBeenCalledWith(null);
  });

  it("displays story count for each source", () => {
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/2 stories/)).toBeInTheDocument();
    expect(screen.getByText(/1 stories/)).toBeInTheDocument();
  });

  it("displays rank number for each source", () => {
    render(
      <SourceRankings
        articles={mockArticles}
        selectedSource={null}
        onSourceSelect={vi.fn()}
      />,
    );

    expect(screen.getByText(/#1/)).toBeInTheDocument();
    expect(screen.getByText(/#2/)).toBeInTheDocument();
  });
});
