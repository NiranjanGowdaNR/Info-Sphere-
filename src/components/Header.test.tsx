import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Header } from "./Header";

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

describe("Header", () => {
  it("renders the logo", () => {
    render(<Header />);
    expect(screen.getByText(/Info/)).toBeInTheDocument();
    expect(screen.getByText(/Sphere/)).toBeInTheDocument();
  });

  it("displays reading time", () => {
    render(<Header />);
    expect(screen.getByText(/Read 1h/)).toBeInTheDocument();
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
});
