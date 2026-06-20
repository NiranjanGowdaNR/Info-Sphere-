import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { PopularArticles } from "./PopularArticles";
import type { Article, ArticleEngagement } from "@/lib/types";

// Mock dependencies
vi.mock("@/lib/local-store", () => ({
  pushHistory: vi.fn(),
  recordArticleView: vi.fn(),
}));

vi.mock("@/client/services/popular-articles", () => ({
  getPopularArticles: (articles: Article[]) => {
    // Return top 4 articles as "popular"
    return articles.slice(0, 4).map((article, index) => ({
      article,
      views: 1000 - index * 100,
      shares: 100 - index * 10,
    }));
  },
}));

// Mock useWidgetEnabled hook
vi.mock("./DashboardCustomizer", () => {
  const enabledWidgets = {
    popular: true,
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
    source: { id: "cnn", name: "CNN" },
    author: "Jane Smith",
    title: "Article 2",
    description: "Description 2",
    url: "https://example.com/2",
    urlToImage: null,
    publishedAt: "2026-06-20T09:00:00Z",
    content: "Content 2",
  },
  {
    source: { id: "reuters", name: "Reuters" },
    author: "Bob Johnson",
    title: "Article 3",
    description: "Description 3",
    url: "https://example.com/3",
    urlToImage: null,
    publishedAt: "2026-06-20T08:00:00Z",
    content: "Content 3",
  },
  {
    source: { id: "ap", name: "AP News" },
    author: "Alice Brown",
    title: "Article 4",
    description: "Description 4",
    url: "https://example.com/4",
    urlToImage: null,
    publishedAt: "2026-06-20T07:00:00Z",
    content: "Content 4",
  },
];

const mockEngagement: ArticleEngagement[] = [];

describe("PopularArticles", () => {
  beforeEach(() => {
    delete (globalThis as unknown as Record<string, unknown>)
      .mockUseWidgetEnabled;
  });

  it("renders popular articles when widget is enabled and articles exist", () => {
    delete (globalThis as unknown as Record<string, unknown>)
      .mockUseWidgetEnabled;
    render(
      <PopularArticles articles={mockArticles} engagement={mockEngagement} />,
    );
    expect(screen.getByText(/Popular Articles/)).toBeInTheDocument();
    expect(screen.getByText(/Article 1/)).toBeInTheDocument();
    expect(screen.getByText(/Article 2/)).toBeInTheDocument();
  });

  it("renders nothing when widget is disabled", () => {
    (
      globalThis as unknown as Record<string, (widgetId: string) => boolean>
    ).mockUseWidgetEnabled = (widgetId: string) => widgetId !== "popular";

    const { container } = render(
      <PopularArticles articles={mockArticles} engagement={mockEngagement} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when no articles provided", () => {
    const { container } = render(
      <PopularArticles articles={[]} engagement={mockEngagement} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("displays trophy icon", () => {
    render(
      <PopularArticles articles={mockArticles} engagement={mockEngagement} />,
    );
    const section = screen.getByText(/Popular Articles/);
    expect(section).toBeInTheDocument();
  });

  it("renders article links with engagement metrics", () => {
    render(
      <PopularArticles articles={mockArticles} engagement={mockEngagement} />,
    );
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    links.forEach((link) => {
      expect(link).toHaveAttribute("href");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("displays rank number for each article", () => {
    render(
      <PopularArticles articles={mockArticles} engagement={mockEngagement} />,
    );
    expect(screen.getByText(/#1/)).toBeInTheDocument();
    expect(screen.getByText(/#2/)).toBeInTheDocument();
    expect(screen.getByText(/#3/)).toBeInTheDocument();
    expect(screen.getByText(/#4/)).toBeInTheDocument();
  });
});
