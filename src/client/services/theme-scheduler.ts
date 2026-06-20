/**
 * Theme Scheduler Service
 * Automatically switches between light and dark themes based on time of day
 */

export interface ThemeSchedule {
  enabled: boolean;
  lightModeStart: string; // HH:MM format (24-hour)
  darkModeStart: string; // HH:MM format (24-hour)
}

const DEFAULT_SCHEDULE: ThemeSchedule = {
  enabled: false,
  lightModeStart: "06:00",
  darkModeStart: "18:00",
};

const SCHEDULE_KEY = "info-sphere:theme-schedule";

/**
 * Get theme schedule from localStorage
 */
export function getThemeSchedule(): ThemeSchedule {
  try {
    if (typeof window === "undefined") return DEFAULT_SCHEDULE;
    const stored = localStorage.getItem(SCHEDULE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_SCHEDULE;
  } catch (error) {
    console.error("[theme-scheduler] Failed to get schedule:", error);
    return DEFAULT_SCHEDULE;
  }
}

/**
 * Save theme schedule to localStorage
 */
export function setThemeSchedule(schedule: ThemeSchedule): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(schedule));
    window.dispatchEvent(new CustomEvent("ls:theme-schedule-updated"));
  } catch (error) {
    console.error("[theme-scheduler] Failed to save schedule:", error);
  }
}

/**
 * Parse time string (HH:MM) to minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Get current time in minutes since midnight
 */
function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Determine if dark mode should be active based on schedule
 */
export function shouldUseDarkMode(schedule: ThemeSchedule): boolean {
  if (!schedule.enabled) return false;

  const currentMinutes = getCurrentMinutes();
  const lightStart = parseTimeToMinutes(schedule.lightModeStart);
  const darkStart = parseTimeToMinutes(schedule.darkModeStart);

  // Handle cases where dark mode spans midnight
  if (darkStart > lightStart) {
    // Normal case: dark mode is between darkStart and lightStart
    return currentMinutes >= darkStart || currentMinutes < lightStart;
  } else {
    // Edge case: light mode spans midnight
    return currentMinutes >= darkStart && currentMinutes < lightStart;
  }
}

/**
 * Apply theme based on schedule
 */
export function applyScheduledTheme(): void {
  try {
    const schedule = getThemeSchedule();
    if (!schedule.enabled) return;

    const useDark = shouldUseDarkMode(schedule);
    const currentTheme = document.documentElement.classList.contains("dark");

    if (useDark !== currentTheme) {
      document.documentElement.classList.toggle("dark", useDark);
      localStorage.setItem("theme", useDark ? "dark" : "light");
      console.log(
        `[theme-scheduler] Auto-switched to ${useDark ? "dark" : "light"} mode`,
      );
    }
  } catch (error) {
    console.error("[theme-scheduler] Failed to apply scheduled theme:", error);
  }
}

/**
 * Start theme scheduler
 * Checks every minute if theme should be switched
 */
export function startThemeScheduler(): () => void {
  // Apply immediately
  applyScheduledTheme();

  // Check every minute
  const interval = setInterval(applyScheduledTheme, 60 * 1000);

  // Listen for schedule updates
  const handleUpdate = () => applyScheduledTheme();
  window.addEventListener("ls:theme-schedule-updated", handleUpdate);

  // Return cleanup function
  return () => {
    clearInterval(interval);
    window.removeEventListener("ls:theme-schedule-updated", handleUpdate);
  };
}

/**
 * Get next theme change time
 */
export function getNextThemeChange(schedule: ThemeSchedule): {
  time: string;
  theme: "light" | "dark";
} | null {
  if (!schedule.enabled) return null;

  const currentMinutes = getCurrentMinutes();
  const lightStart = parseTimeToMinutes(schedule.lightModeStart);
  const darkStart = parseTimeToMinutes(schedule.darkModeStart);

  const useDark = shouldUseDarkMode(schedule);

  if (useDark) {
    // Currently dark, next change is to light
    return {
      time: schedule.lightModeStart,
      theme: "light",
    };
  } else {
    // Currently light, next change is to dark
    return {
      time: schedule.darkModeStart,
      theme: "dark",
    };
  }
}

/**
 * Validate time format (HH:MM)
 */
export function isValidTimeFormat(time: string): boolean {
  const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(time);
}
