/**
 * AdvancedThemes Component
 * Provides custom color scheme selection and theme presets
 * Persists theme preferences to localStorage
 */

import { useState, useEffect } from "react";
import { Palette, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  light: {
    background: string;
    foreground: string;
    primary: string;
    heading: string;
    card: string;
  };
  dark: {
    background: string;
    foreground: string;
    primary: string;
    heading: string;
    card: string;
  };
  preview: string; // CSS gradient for preview swatch
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "default-blue",
    name: "Ocean Blue",
    description: "The classic Info-Sphere blue theme",
    light: {
      background: "oklch(0.97 0.025 240)",
      foreground: "oklch(0.15 0.02 240)",
      primary: "oklch(0.208 0.042 265.755)",
      heading: "oklch(0.55 0.18 240)",
      card: "oklch(1 0 0)",
    },
    dark: {
      background: "oklch(0.18 0.05 245)",
      foreground: "oklch(0.985 0.005 240)",
      primary: "oklch(0.929 0.013 255.508)",
      heading: "oklch(0.75 0.15 240)",
      card: "oklch(0.208 0.042 265.755)",
    },
    preview: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 50%, #93c5fd 100%)",
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Calm and natural green tones",
    light: {
      background: "oklch(0.97 0.02 145)",
      foreground: "oklch(0.15 0.02 145)",
      primary: "oklch(0.25 0.08 145)",
      heading: "oklch(0.45 0.15 145)",
      card: "oklch(1 0 0)",
    },
    dark: {
      background: "oklch(0.18 0.04 145)",
      foreground: "oklch(0.985 0.005 145)",
      primary: "oklch(0.85 0.12 145)",
      heading: "oklch(0.72 0.14 145)",
      card: "oklch(0.22 0.05 145)",
    },
    preview: "linear-gradient(135deg, #14532d 0%, #22c55e 50%, #86efac 100%)",
  },
  {
    id: "sunset-orange",
    name: "Sunset Orange",
    description: "Warm and energetic orange palette",
    light: {
      background: "oklch(0.97 0.02 50)",
      foreground: "oklch(0.15 0.02 50)",
      primary: "oklch(0.25 0.1 50)",
      heading: "oklch(0.5 0.2 50)",
      card: "oklch(1 0 0)",
    },
    dark: {
      background: "oklch(0.18 0.04 50)",
      foreground: "oklch(0.985 0.005 50)",
      primary: "oklch(0.85 0.15 50)",
      heading: "oklch(0.75 0.18 50)",
      card: "oklch(0.22 0.05 50)",
    },
    preview: "linear-gradient(135deg, #7c2d12 0%, #f97316 50%, #fed7aa 100%)",
  },
  {
    id: "royal-purple",
    name: "Royal Purple",
    description: "Elegant and sophisticated purple",
    light: {
      background: "oklch(0.97 0.02 300)",
      foreground: "oklch(0.15 0.02 300)",
      primary: "oklch(0.25 0.1 300)",
      heading: "oklch(0.45 0.2 300)",
      card: "oklch(1 0 0)",
    },
    dark: {
      background: "oklch(0.18 0.04 300)",
      foreground: "oklch(0.985 0.005 300)",
      primary: "oklch(0.85 0.15 300)",
      heading: "oklch(0.72 0.18 300)",
      card: "oklch(0.22 0.05 300)",
    },
    preview: "linear-gradient(135deg, #4c1d95 0%, #a855f7 50%, #d8b4fe 100%)",
  },
  {
    id: "rose-pink",
    name: "Rose Pink",
    description: "Soft and modern rose tones",
    light: {
      background: "oklch(0.97 0.02 0)",
      foreground: "oklch(0.15 0.02 0)",
      primary: "oklch(0.25 0.1 0)",
      heading: "oklch(0.5 0.2 0)",
      card: "oklch(1 0 0)",
    },
    dark: {
      background: "oklch(0.18 0.04 0)",
      foreground: "oklch(0.985 0.005 0)",
      primary: "oklch(0.85 0.15 0)",
      heading: "oklch(0.72 0.18 0)",
      card: "oklch(0.22 0.05 0)",
    },
    preview: "linear-gradient(135deg, #881337 0%, #f43f5e 50%, #fda4af 100%)",
  },
  {
    id: "slate-mono",
    name: "Slate Mono",
    description: "Clean and minimal monochrome",
    light: {
      background: "oklch(0.97 0.005 240)",
      foreground: "oklch(0.15 0.005 240)",
      primary: "oklch(0.25 0.01 240)",
      heading: "oklch(0.35 0.01 240)",
      card: "oklch(1 0 0)",
    },
    dark: {
      background: "oklch(0.15 0.005 240)",
      foreground: "oklch(0.985 0.002 240)",
      primary: "oklch(0.85 0.005 240)",
      heading: "oklch(0.75 0.005 240)",
      card: "oklch(0.2 0.005 240)",
    },
    preview: "linear-gradient(135deg, #1e293b 0%, #64748b 50%, #cbd5e1 100%)",
  },
];

const THEME_PRESET_KEY = "info-sphere:theme-preset";

export function getActiveThemePreset(): string {
  try {
    if (typeof window === "undefined") return "default-blue";
    return localStorage.getItem(THEME_PRESET_KEY) || "default-blue";
  } catch {
    return "default-blue";
  }
}

export function applyThemePreset(presetId: string): void {
  const preset = THEME_PRESETS.find((p) => p.id === presetId);
  if (!preset) return;

  const isDark = document.documentElement.classList.contains("dark");
  const colors = isDark ? preset.dark : preset.light;

  const root = document.documentElement;
  root.style.setProperty("--background", colors.background);
  root.style.setProperty("--foreground", colors.foreground);
  root.style.setProperty("--primary", colors.primary);
  root.style.setProperty("--heading", colors.heading);
  root.style.setProperty("--card", colors.card);

  try {
    localStorage.setItem(THEME_PRESET_KEY, presetId);
    window.dispatchEvent(
      new CustomEvent("ls:theme-preset-changed", { detail: presetId }),
    );
  } catch (err) {
    console.error("[themes] Failed to save theme preset:", err);
  }
}

export function AdvancedThemes() {
  const [open, setOpen] = useState(false);
  const [activePreset, setActivePreset] = useState("default-blue");

  useEffect(() => {
    const saved = getActiveThemePreset();
    setActivePreset(saved);
    applyThemePreset(saved);

    // Re-apply theme when dark/light mode changes
    const observer = new MutationObserver(() => {
      const current = getActiveThemePreset();
      applyThemePreset(current);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const handlePresetChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as string;
      setActivePreset(detail);
    };
    window.addEventListener("ls:theme-preset-changed", handlePresetChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("ls:theme-preset-changed", handlePresetChange);
    };
  }, []);

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    applyThemePreset(presetId);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-md border border-border p-2 hover:bg-muted"
          aria-label="Change theme"
          title="Advanced Themes"
        >
          <Palette className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Advanced Themes
          </DialogTitle>
          <DialogDescription>
            Choose a color scheme for your Info-Sphere experience. Works with
            both light and dark mode.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-4 sm:grid-cols-3">
          {THEME_PRESETS.map((preset) => {
            const isActive = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset.id)}
                className={`group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                  isActive
                    ? "border-primary shadow-md"
                    : "border-border hover:border-muted-foreground"
                }`}
              >
                {/* Color preview swatch */}
                <div
                  className="h-16 w-full"
                  style={{ background: preset.preview }}
                />

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                )}

                {/* Theme info */}
                <div className="bg-card p-2 text-left">
                  <p className="text-xs font-semibold leading-tight">
                    {preset.name}
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                    {preset.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3">
          <p className="text-xs text-muted-foreground">
            Theme applies to both light and dark modes
          </p>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
