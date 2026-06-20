import { Link } from "@tanstack/react-router";
import { TrendingUp } from "lucide-react";
import { TRENDING_TOPICS } from "@/lib/local-store";
import { useWidgetEnabled } from "./DashboardCustomizer";

export function TrendingTopics() {
  const enabled = useWidgetEnabled("trending");

  if (!enabled) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
          <TrendingUp className="h-4 w-4 text-[color:var(--heading)]" />{" "}
          Trending:
        </span>
        {TRENDING_TOPICS.map((t) => (
          <Link
            key={t}
            to="/search/$query"
            params={{ query: t }}
            className="rounded-full border border-border bg-card px-3 py-1 text-xs transition hover:bg-muted"
          >
            #{t}
          </Link>
        ))}
      </div>
    </section>
  );
}
