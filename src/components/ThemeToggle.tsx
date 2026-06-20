import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { startThemeScheduler } from "@/client/services/theme-scheduler";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    // Start theme scheduler
    const cleanup = startThemeScheduler();

    // Listen for theme changes from scheduler
    const handleThemeChange = () => {
      const currentTheme = document.documentElement.classList.contains("dark");
      setDark(currentTheme);
    };

    const observer = new MutationObserver(handleThemeChange);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      cleanup();
      observer.disconnect();
    };
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="relative inline-flex h-7 w-14 items-center rounded-full border border-border bg-card transition-colors"
    >
      <span
        className={`absolute flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform ${
          dark ? "translate-x-7" : "translate-x-0.5"
        }`}
      >
        {dark ? (
          <Moon className="h-3.5 w-3.5" />
        ) : (
          <Sun className="h-3.5 w-3.5" />
        )}
      </span>
    </button>
  );
}
