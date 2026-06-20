/**
 * DashboardCustomizer Component
 * Allows users to customize their dashboard layout and visible widgets
 * Persists preferences to localStorage
 */

import { useState, useEffect, type ReactNode } from "react";
import { Settings, X, GripVertical, Eye, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/* eslint-disable react-refresh/only-export-components */
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface DashboardWidget {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  order: number;
}

const DEFAULT_WIDGETS: DashboardWidget[] = [
  {
    id: "trending",
    label: "Trending Topics",
    description: "Show trending topic chips at the top",
    enabled: true,
    order: 0,
  },
  {
    id: "popular",
    label: "Popular Articles",
    description: "Show most-viewed articles section",
    enabled: true,
    order: 1,
  },
  {
    id: "source-rankings",
    label: "Source Rankings",
    description: "Show top news sources panel",
    enabled: true,
    order: 2,
  },
  {
    id: "weather",
    label: "Weather Widget",
    description: "Show weather icon in header",
    enabled: true,
    order: 3,
  },
  {
    id: "reading-time",
    label: "Reading Time Tracker",
    description: "Show total reading time in header",
    enabled: true,
    order: 4,
  },
];

const STORAGE_KEY = "info-sphere:dashboard-widgets";

export function getDashboardWidgets(): DashboardWidget[] {
  try {
    if (typeof window === "undefined") return DEFAULT_WIDGETS;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_WIDGETS;
    const parsed = JSON.parse(stored) as DashboardWidget[];
    // Merge with defaults to handle new widgets added in updates
    const storedIds = new Set(parsed.map((w) => w.id));
    const newDefaults = DEFAULT_WIDGETS.filter((w) => !storedIds.has(w.id));
    return [...parsed, ...newDefaults].sort((a, b) => a.order - b.order);
  } catch {
    return DEFAULT_WIDGETS;
  }
}

export function saveDashboardWidgets(widgets: DashboardWidget[]): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widgets));
    window.dispatchEvent(new CustomEvent("ls:dashboard-widgets-updated"));
  } catch (err) {
    console.error("[dashboard] Failed to save widgets:", err);
  }
}

export function isWidgetEnabled(widgetId: string): boolean {
  const widgets = getDashboardWidgets();
  const widget = widgets.find((w) => w.id === widgetId);
  return widget?.enabled ?? true;
}

export function useDashboardWidgets(): DashboardWidget[] {
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() =>
    getDashboardWidgets(),
  );

  useEffect(() => {
    const handleUpdate = () => setWidgets(getDashboardWidgets());
    window.addEventListener("ls:dashboard-widgets-updated", handleUpdate);
    return () => {
      window.removeEventListener("ls:dashboard-widgets-updated", handleUpdate);
    };
  }, []);

  return widgets;
}

export function useWidgetEnabled(widgetId: string): boolean {
  const widgets = useDashboardWidgets();
  return widgets.find((w) => w.id === widgetId)?.enabled ?? true;
}

interface DashboardCustomizerProps {
  trigger?: ReactNode;
}

export function DashboardCustomizer({ trigger }: DashboardCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(DEFAULT_WIDGETS);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    setWidgets(getDashboardWidgets());

    const handleUpdate = () => setWidgets(getDashboardWidgets());
    window.addEventListener("ls:dashboard-widgets-updated", handleUpdate);
    return () => {
      window.removeEventListener("ls:dashboard-widgets-updated", handleUpdate);
    };
  }, []);

  const toggleWidget = (id: string) => {
    const updated = widgets.map((w) =>
      w.id === id ? { ...w, enabled: !w.enabled } : w,
    );
    setWidgets(updated);
    saveDashboardWidgets(updated);
  };

  const moveWidget = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= widgets.length) return;
    const updated = [...widgets];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    const reordered = updated.map((w, i) => ({ ...w, order: i }));
    setWidgets(reordered);
    saveDashboardWidgets(reordered);
  };

  const resetToDefaults = () => {
    setWidgets(DEFAULT_WIDGETS);
    saveDashboardWidgets(DEFAULT_WIDGETS);
  };

  const enabledCount = widgets.filter((w) => w.enabled).length;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button
            className="rounded-md border border-border p-2 hover:bg-muted"
            aria-label="Customize dashboard"
            title="Customize Dashboard"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Customize Dashboard
          </DialogTitle>
          <DialogDescription>
            Toggle widgets on/off and reorder them to personalize your news
            feed. Changes are saved automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 py-2">
          <div className="mb-3 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {enabledCount} of {widgets.length} widgets enabled
            </span>
            <button
              onClick={resetToDefaults}
              className="text-xs text-[color:var(--heading)] hover:underline"
            >
              Reset to defaults
            </button>
          </div>

          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragIndex !== null && dragIndex !== index) {
                  moveWidget(dragIndex, index);
                  setDragIndex(index);
                }
              }}
              onDragEnd={() => setDragIndex(null)}
              className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                dragIndex === index
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:bg-muted/40"
              } ${!widget.enabled ? "opacity-60" : ""}`}
            >
              <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground active:cursor-grabbing" />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {widget.enabled ? (
                    <Eye className="h-3.5 w-3.5 text-[color:var(--heading)]" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                  <Label
                    htmlFor={`widget-${widget.id}`}
                    className="cursor-pointer text-sm font-medium"
                  >
                    {widget.label}
                  </Label>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {widget.description}
                </p>
              </div>

              <Switch
                id={`widget-${widget.id}`}
                checked={widget.enabled}
                onCheckedChange={() => toggleWidget(widget.id)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-between gap-2 pt-2">
          <p className="text-xs text-muted-foreground self-center">
            Drag to reorder widgets
          </p>
          <Button onClick={() => setOpen(false)}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
