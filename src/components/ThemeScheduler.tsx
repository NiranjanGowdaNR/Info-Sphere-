import { useState, useEffect } from "react";
import { Clock, Sun, Moon } from "lucide-react";
import {
  getThemeSchedule,
  setThemeSchedule,
  getNextThemeChange,
  isValidTimeFormat,
  type ThemeSchedule,
} from "@/client/services/theme-scheduler";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function ThemeScheduler() {
  const [schedule, setScheduleState] = useState<ThemeSchedule>({
    enabled: false,
    lightModeStart: "06:00",
    darkModeStart: "18:00",
  });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setScheduleState(getThemeSchedule());

    const handleUpdate = () => setScheduleState(getThemeSchedule());
    window.addEventListener("ls:theme-schedule-updated", handleUpdate);

    return () => {
      window.removeEventListener("ls:theme-schedule-updated", handleUpdate);
    };
  }, []);

  const handleSave = () => {
    if (
      !isValidTimeFormat(schedule.lightModeStart) ||
      !isValidTimeFormat(schedule.darkModeStart)
    ) {
      alert("Please enter valid time in HH:MM format");
      return;
    }
    setThemeSchedule(schedule);
    setOpen(false);
  };

  const nextChange = getNextThemeChange(schedule);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-md border border-border p-2 hover:bg-muted"
          aria-label="Theme scheduler"
        >
          <Clock className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Theme Scheduler</DialogTitle>
          <DialogDescription>
            Automatically switch between light and dark themes based on time of
            day
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="scheduler-enabled" className="text-sm font-medium">
              Enable automatic theme switching
            </Label>
            <Switch
              id="scheduler-enabled"
              checked={schedule.enabled}
              onCheckedChange={(checked) =>
                setScheduleState({ ...schedule, enabled: checked })
              }
            />
          </div>

          {schedule.enabled && (
            <>
              <div className="space-y-2">
                <Label
                  htmlFor="light-start"
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  Light mode starts at
                </Label>
                <input
                  id="light-start"
                  type="time"
                  value={schedule.lightModeStart}
                  onChange={(e) =>
                    setScheduleState({
                      ...schedule,
                      lightModeStart: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dark-start" className="flex items-center gap-2">
                  <Moon className="h-4 w-4" />
                  Dark mode starts at
                </Label>
                <input
                  id="dark-start"
                  type="time"
                  value={schedule.darkModeStart}
                  onChange={(e) =>
                    setScheduleState({
                      ...schedule,
                      darkModeStart: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              {nextChange && (
                <div className="rounded-md border border-border bg-muted/40 p-3 text-sm">
                  <p className="text-muted-foreground">
                    Next change: Switch to{" "}
                    <strong className="text-foreground">
                      {nextChange.theme} mode
                    </strong>{" "}
                    at{" "}
                    <strong className="text-foreground">
                      {nextChange.time}
                    </strong>
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
