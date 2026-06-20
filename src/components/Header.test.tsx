import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

let mockUseWidgetEnabled = (widgetId: string) => true;

// Mock dependencies
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
  useNavigate: () => vi.fn(),
}));

vi.mock("@/lib/local-store", () => ({
  useReadingTime: () => 3600,
  formatReadingTime: (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h`;
  },
}));

vi.mock("@/lib/types", () => ({
  CATEGORIES: ["business", "technology", "sports"],
  COUNTRIES: [
    { iso: "us", name: "United States", flag: "🇺🇸" },
    { iso: "gb", name: "United Kingdom", flag: "🇬🇧" },
  ],
}));

vi.mock("./ThemeToggle", () => ({
  ThemeToggle: () => <button>Theme Toggle</button>,
}));

vi.mock("./WeatherIcon", () => ({
  WeatherIcon: () => <div data-testid="weather-icon">Weather Icon</div>,
}));

vi.mock("./DashboardCustomizer", () => ({
  DashboardCustomizer: () => <button>Dashboard Customizer</button>,
  useWidgetEnabled: (widgetId: string) => mockUseWidgetEnabled(widgetId),
}));

vi.mock("./ThemeScheduler", () => ({
  ThemeScheduler: () => <div>Theme Scheduler</div>,
}));

vi.mock("./AdvancedThemes", () => ({
  AdvancedThemes: ({ trigger }: { trigger?: React.ReactNode }) => (
    <div>{trigger || "Advanced Themes"}</div>
  ),
}));

describe("Header", () => {
  afterEach(() => {
    vi.clearAllMocks();
    mockUseWidgetEnabled = (widgetId: string) => true;
  });

  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getByText(/Info/)).toBeInTheDocument();
    expect(screen.getByText(/Sphere/)).toBeInTheDocument();
  });

  it("displays reading time when reading-time widget is enabled", () => {
    mockUseWidgetEnabled = (widgetId: string) => true;
    render(<Header />);
    expect(screen.getByText(/Read 1h/)).toBeInTheDocument();
  });

  it("hides reading time when reading-time widget is disabled", () => {
    mockUseWidgetEnabled = (widgetId: string) => widgetId !== "reading-time";
    render(<Header />);
    expect(screen.queryByText(/Read 1h/)).not.toBeInTheDocument();
  });

  it("displays weather widget when weather widget is enabled", () => {
    mockUseWidgetEnabled = (widgetId: string) => true;
    render(<Header />);
    expect(screen.getByTestId("weather-icon")).toBeInTheDocument();
  });

  it("hides weather widget when weather widget is disabled", () => {
    mockUseWidgetEnabled = (widgetId: string) => widgetId !== "weather";
    render(<Header />);
    expect(screen.queryByTestId("weather-icon")).not.toBeInTheDocument();
  });

  it("renders search input", () => {
    render(<Header />);
    const searchInputs = screen.getAllByPlaceholderText(/Search news/i);
    expect(searchInputs.length).toBeGreaterThan(0);
  });

  it("renders category dropdown", () => {
    render(<Header />);
    const categorySelects = screen.getAllByRole("combobox");
    expect(categorySelects.length).toBeGreaterThan(0);
  });

  it("renders navigation links", () => {
    render(<Header />);
    expect(screen.getByLabelText(/Bookmarks/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/History/i)).toBeInTheDocument();
  });

  it("renders theme toggle", () => {
    render(<Header />);
    expect(screen.getAllByText(/Theme Toggle/i).length).toBeGreaterThan(0);
  });

  it("renders dashboard customizer button", () => {
    render(<Header />);
    expect(
      screen.getAllByText(/Dashboard Customizer|Customizable dashboard/i)
        .length,
    ).toBeGreaterThan(0);
  });
});
