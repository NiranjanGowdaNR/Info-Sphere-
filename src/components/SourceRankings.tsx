import { useMemo, useState } from "react";
import { Clock3, Flame, Radio } from "lucide-react";
import {
  getRelativeTime,
  getSourceRankings,
  type RankingMode,
} from "@/client/services/source-ranking";
import type { Article } from "@/lib/types";
import { useWidgetEnabled } from "./DashboardCustomizer";

const modes: { value: RankingMode; label: string }[] = [
  { value: "trending", label: "Trending" },
  { value: "latest", label: "Latest" },
  { value: "coverage", label: "Coverage" },
];

export function SourceRankings({
  articles,
  selectedSource,
  onSourceSelect,
}: {
  articles: Article[];
  selectedSource: string | null;
  onSourceSelect: (source: string | null) => void;
}) {
  const [mode, setMode] = useState<RankingMode>("trending");
  const enabled = useWidgetEnabled("source-rankings");
  const rankings = useMemo(
    () => getSourceRankings(articles, mode),
    [articles, mode],
  );

  if (!enabled || rankings.length === 0) return null;

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Radio className="h-4 w-4 text-[color:var(--heading)]" />
            Top News Sources
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ranked from the articles currently loaded on this page.
          </p>
        </div>
        <div className="inline-flex w-fit overflow-hidden rounded-md border border-border">
          {modes.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setMode(item.value)}
              className={`px-3 py-1.5 text-xs font-medium transition ${
                mode === item.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {rankings.map((source, index) => {
          const selected = selectedSource === source.name;

          return (
            <button
              key={source.name}
              type="button"
              onClick={() => onSourceSelect(selected ? null : source.name)}
              className={`flex min-h-24 flex-col justify-between rounded-md border p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                selected
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-muted/50"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 text-sm font-medium">
                  {source.name}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  #{index + 1}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5" />
                  {source.count} stories
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3.5 w-3.5" />
                  {getRelativeTime(source.latest)}
                </span>
              </div>
              {mode === "latest" && source.latestTitle && (
                <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
                  {source.latestTitle}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
