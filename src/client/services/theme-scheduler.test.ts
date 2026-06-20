import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  getThemeSchedule,
  setThemeSchedule,
  shouldUseDarkMode,
  isValidTimeFormat,
  type ThemeSchedule,
} from "./theme-scheduler";

describe("Theme Scheduler Service", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe("getThemeSchedule", () => {
    it("should return default schedule when not set", () => {
      const schedule = getThemeSchedule();
      expect(schedule.enabled).toBe(false);
      expect(schedule.lightModeStart).toBe("06:00");
      expect(schedule.darkModeStart).toBe("18:00");
    });

    it("should return stored schedule", () => {
      const customSchedule: ThemeSchedule = {
        enabled: true,
        lightModeStart: "07:00",
        darkModeStart: "19:00",
      };
      localStorage.setItem(
        "info-sphere:theme-schedule",
        JSON.stringify(customSchedule),
      );

      const schedule = getThemeSchedule();
      expect(schedule).toEqual(customSchedule);
    });
  });

  describe("setThemeSchedule", () => {
    it("should store schedule in localStorage", () => {
      const schedule: ThemeSchedule = {
        enabled: true,
        lightModeStart: "08:00",
        darkModeStart: "20:00",
      };

      setThemeSchedule(schedule);

      const stored = localStorage.getItem("info-sphere:theme-schedule");
      expect(stored).toBe(JSON.stringify(schedule));
    });

    it("should dispatch custom event", () => {
      let eventFired = false;
      window.addEventListener("ls:theme-schedule-updated", () => {
        eventFired = true;
      });

      const schedule: ThemeSchedule = {
        enabled: true,
        lightModeStart: "06:00",
        darkModeStart: "18:00",
      };

      setThemeSchedule(schedule);
      expect(eventFired).toBe(true);
    });
  });

  describe("shouldUseDarkMode", () => {
    it("should return false when scheduler is disabled", () => {
      const schedule: ThemeSchedule = {
        enabled: false,
        lightModeStart: "06:00",
        darkModeStart: "18:00",
      };

      expect(shouldUseDarkMode(schedule)).toBe(false);
    });

    it("should return true during dark mode hours", () => {
      // Set time to 20:00 (8 PM)
      vi.setSystemTime(new Date("2024-01-01T20:00:00"));

      const schedule: ThemeSchedule = {
        enabled: true,
        lightModeStart: "06:00",
        darkModeStart: "18:00",
      };

      expect(shouldUseDarkMode(schedule)).toBe(true);
    });

    it("should return false during light mode hours", () => {
      // Set time to 10:00 (10 AM)
      vi.setSystemTime(new Date("2024-01-01T10:00:00"));

      const schedule: ThemeSchedule = {
        enabled: true,
        lightModeStart: "06:00",
        darkModeStart: "18:00",
      };

      expect(shouldUseDarkMode(schedule)).toBe(false);
    });

    it("should handle midnight transitions correctly", () => {
      // Set time to 02:00 (2 AM) - should be dark mode
      vi.setSystemTime(new Date("2024-01-01T02:00:00"));

      const schedule: ThemeSchedule = {
        enabled: true,
        lightModeStart: "06:00",
        darkModeStart: "18:00",
      };

      expect(shouldUseDarkMode(schedule)).toBe(true);
    });
  });

  describe("isValidTimeFormat", () => {
    it("should validate correct time formats", () => {
      expect(isValidTimeFormat("00:00")).toBe(true);
      expect(isValidTimeFormat("12:30")).toBe(true);
      expect(isValidTimeFormat("23:59")).toBe(true);
      expect(isValidTimeFormat("06:00")).toBe(true);
    });

    it("should reject invalid time formats", () => {
      expect(isValidTimeFormat("24:00")).toBe(false);
      expect(isValidTimeFormat("12:60")).toBe(false);
      expect(isValidTimeFormat("1:30")).toBe(false);
      expect(isValidTimeFormat("12:3")).toBe(false);
      expect(isValidTimeFormat("invalid")).toBe(false);
      expect(isValidTimeFormat("")).toBe(false);
    });
  });
});
