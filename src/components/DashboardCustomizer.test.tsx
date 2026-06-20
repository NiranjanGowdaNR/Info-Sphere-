import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  DashboardCustomizer,
  getDashboardWidgets,
  saveDashboardWidgets,
  isWidgetEnabled,
  useDashboardWidgets,
  useWidgetEnabled,
  type DashboardWidget,
} from "./DashboardCustomizer";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
      window.dispatchEvent(new CustomEvent("ls:dashboard-widgets-updated"));
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("DashboardCustomizer Functions", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("getDashboardWidgets", () => {
    it("returns default widgets when nothing is stored", () => {
      const widgets = getDashboardWidgets();
      expect(widgets).toHaveLength(5);
      expect(widgets.map((w) => w.id)).toEqual([
        "trending",
        "popular",
        "source-rankings",
        "weather",
        "reading-time",
      ]);
    });

    it("returns all widgets enabled by default", () => {
      const widgets = getDashboardWidgets();
      expect(widgets.every((w) => w.enabled)).toBe(true);
    });

    it("returns stored widgets from localStorage", () => {
      const customWidgets: DashboardWidget[] = [
        {
          id: "trending",
          label: "Trending Topics",
          description: "Show trending topic chips at the top",
          enabled: false,
          order: 0,
        },
        {
          id: "popular",
          label: "Popular Articles",
          description: "Show most-viewed articles section",
          enabled: true,
          order: 1,
        },
      ];
      localStorage.setItem(
        "info-sphere:dashboard-widgets",
        JSON.stringify(customWidgets),
      );

      const widgets = getDashboardWidgets();
      expect(widgets.find((w) => w.id === "trending")?.enabled).toBe(false);
      expect(widgets.find((w) => w.id === "popular")?.enabled).toBe(true);
    });

    it("merges stored widgets with new defaults", () => {
      const customWidgets: DashboardWidget[] = [
        {
          id: "trending",
          label: "Trending Topics",
          description: "Show trending topic chips at the top",
          enabled: false,
          order: 0,
        },
      ];
      localStorage.setItem(
        "info-sphere:dashboard-widgets",
        JSON.stringify(customWidgets),
      );

      const widgets = getDashboardWidgets();
      // Should have all 5 widgets including the new ones added to defaults
      expect(widgets.length).toBe(5);
    });
  });

  describe("saveDashboardWidgets", () => {
    it("saves widgets to localStorage", () => {
      const widgets = getDashboardWidgets();
      const updated = widgets.map((w) =>
        w.id === "trending" ? { ...w, enabled: false } : w,
      );

      saveDashboardWidgets(updated);

      const stored = JSON.parse(
        localStorage.getItem("info-sphere:dashboard-widgets")!,
      );
      expect(
        stored.find((w: DashboardWidget) => w.id === "trending")?.enabled,
      ).toBe(false);
    });

    it("dispatches custom event after saving", async () => {
      const eventListener = vi.fn();
      window.addEventListener("ls:dashboard-widgets-updated", eventListener);

      const widgets = getDashboardWidgets();
      saveDashboardWidgets(widgets);

      await waitFor(() => {
        expect(eventListener).toHaveBeenCalled();
      });

      window.removeEventListener("ls:dashboard-widgets-updated", eventListener);
    });
  });

  describe("isWidgetEnabled", () => {
    it("returns true for enabled widgets", () => {
      expect(isWidgetEnabled("trending")).toBe(true);
      expect(isWidgetEnabled("popular")).toBe(true);
    });

    it("returns false for disabled widgets", () => {
      const widgets = getDashboardWidgets();
      const updated = widgets.map((w) =>
        w.id === "trending" ? { ...w, enabled: false } : w,
      );
      saveDashboardWidgets(updated);

      expect(isWidgetEnabled("trending")).toBe(false);
    });

    it("returns true for unknown widgets (safe default)", () => {
      expect(isWidgetEnabled("unknown-widget")).toBe(true);
    });
  });
});

describe("DashboardCustomizer Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the customize dashboard dialog trigger", () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    expect(button).toBeInTheDocument();
  });

  it("opens the dialog when trigger is clicked", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });

    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Customize Dashboard/i)).toBeInTheDocument();
      expect(
        screen.getByText(
          /Toggle widgets on\/off and reorder them to personalize your news feed/i,
        ),
      ).toBeInTheDocument();
    });
  });

  it("displays all 5 widgets in the dialog", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Trending Topics/)).toBeInTheDocument();
      expect(screen.getByText(/Popular Articles/)).toBeInTheDocument();
      expect(screen.getByText(/Source Rankings/)).toBeInTheDocument();
      expect(screen.getByText(/Weather Widget/)).toBeInTheDocument();
      expect(screen.getByText(/Reading Time Tracker/)).toBeInTheDocument();
    });
  });

  it("toggles widget enabled state when switch is clicked", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      const trendingSwitch = screen.getByRole("switch", {
        name: /Trending Topics/i,
      });
      expect(trendingSwitch).toHaveAttribute("aria-checked", "true");

      fireEvent.click(trendingSwitch);

      expect(trendingSwitch).toHaveAttribute("aria-checked", "false");
    });
  });

  it("persists widget state changes to localStorage", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      const trendingSwitch = screen.getByRole("switch", {
        name: /Trending Topics/i,
      });
      fireEvent.click(trendingSwitch);
    });

    const stored = JSON.parse(
      localStorage.getItem("info-sphere:dashboard-widgets")!,
    );
    expect(
      stored.find((w: DashboardWidget) => w.id === "trending")?.enabled,
    ).toBe(false);
  });

  it("displays enabled widget count", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/5 of 5 widgets enabled/)).toBeInTheDocument();
    });
  });

  it("updates widget count when toggle is changed", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      const trendingSwitch = screen.getByRole("switch", {
        name: /Trending Topics/i,
      });
      fireEvent.click(trendingSwitch);
    });

    await waitFor(() => {
      expect(screen.getByText(/4 of 5 widgets enabled/)).toBeInTheDocument();
    });
  });

  it("resets widgets to defaults when reset button is clicked", async () => {
    // First disable a widget
    const widgets = getDashboardWidgets();
    const updated = widgets.map((w) =>
      w.id === "trending" ? { ...w, enabled: false } : w,
    );
    saveDashboardWidgets(updated);

    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      const resetButton = screen.getByRole("button", {
        name: /Reset to defaults/i,
      });
      fireEvent.click(resetButton);
    });

    await waitFor(() => {
      expect(isWidgetEnabled("trending")).toBe(true);
      expect(screen.getByText(/5 of 5 widgets enabled/)).toBeInTheDocument();
    });
  });

  it("renders custom trigger when provided", () => {
    const customTrigger = (
      <button data-testid="custom-trigger">Custom Dashboard Button</button>
    );
    render(<DashboardCustomizer trigger={customTrigger} />);

    expect(screen.getByTestId("custom-trigger")).toBeInTheDocument();
  });

  it("closes dialog when Done button is clicked", async () => {
    render(<DashboardCustomizer />);
    const button = screen.getByRole("button", { name: /customize dashboard/i });
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Customize Dashboard/i)).toBeInTheDocument();
    });

    const doneButton = screen.getByRole("button", { name: /Done/i });
    fireEvent.click(doneButton);

    await waitFor(() => {
      expect(
        screen.queryByText(/Customize Dashboard/i),
      ).not.toBeInTheDocument();
    });
  });
});
