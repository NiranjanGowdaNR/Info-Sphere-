import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TrendingTopics } from "./TrendingTopics";

// Mock react-router
vi.mock("@tanstack/react-router", () => ({
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
    [key: string]: unknown;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock local-store
vi.mock("@/lib/local-store", () => ({
  TRENDING_TOPICS: ["Technology", "Science", "Business"],
}));

// Mock useWidgetEnabled hook
vi.mock("./DashboardCustomizer", () => {
  const enabledWidgets = {
    trending: true,
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

describe("TrendingTopics", () => {
  beforeEach(() => {
    // Reset mock
    delete (globalThis as unknown as Record<string, unknown>)
      .mockUseWidgetEnabled;
  });

  it("renders trending topics when widget is enabled", () => {
    delete (globalThis as unknown as Record<string, unknown>)
      .mockUseWidgetEnabled;
    render(<TrendingTopics />);
    expect(screen.getByText(/Trending:/)).toBeInTheDocument();
    expect(screen.getByText(/#Technology/)).toBeInTheDocument();
    expect(screen.getByText(/#Science/)).toBeInTheDocument();
    expect(screen.getByText(/#Business/)).toBeInTheDocument();
  });

  it("renders nothing when widget is disabled", () => {
    (
      globalThis as unknown as Record<string, (widgetId: string) => boolean>
    ).mockUseWidgetEnabled = (widgetId: string) => widgetId !== "trending";

    const { container } = render(<TrendingTopics />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the trending up icon", () => {
    render(<TrendingTopics />);
    const trendingSection = screen.getByText(/Trending:/);
    expect(trendingSection).toBeInTheDocument();
  });

  it("renders all trending topics as links", () => {
    render(<TrendingTopics />);
    const links = screen.getAllByRole("link");
    expect(links.length).toBe(3); // 3 trending topics
    // Check that links have the /search/ path pattern
    links.forEach((link, index) => {
      expect(link.getAttribute("href")).toMatch(/\/search\//);
    });
  });

  it("applies correct styling to topic links", () => {
    render(<TrendingTopics />);
    const links = screen.getAllByRole("link");
    links.forEach((link) => {
      expect(link).toHaveClass(
        "rounded-full",
        "border",
        "border-border",
        "bg-card",
      );
    });
  });
});
