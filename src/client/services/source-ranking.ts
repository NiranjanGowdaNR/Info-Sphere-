import type { Article } from "@/shared/models/news";

export type RankingMode = "trending" | "latest" | "coverage";

export interface SourceScore {
  name: string;
  count: number;
  latest: number;
  latestTitle: string;
  score: number;
}

export function getSourceRankings(
  articles: Article[],
  mode: RankingMode,
  now = Date.now(),
) {
  const sources = new Map<string, SourceScore>();

  for (const article of articles) {
    const name = article.source?.name?.trim();
    if (!name) continue;

    const publishedAt = new Date(article.publishedAt).getTime();
    const latest = Number.isFinite(publishedAt) ? publishedAt : 0;
    const hoursOld = latest ? Math.max(1, (now - latest) / 36e5) : 72;
    const recencyBoost = 1 / Math.sqrt(hoursOld);
    const existing = sources.get(name) ?? {
      name,
      count: 0,
      latest: 0,
      latestTitle: "",
      score: 0,
    };

    existing.count += 1;
    if (latest >= existing.latest) {
      existing.latest = latest;
      existing.latestTitle = article.title;
    }
    existing.score += 1 + recencyBoost;
    sources.set(name, existing);
  }

  return Array.from(sources.values())
    .sort((a, b) => {
      if (mode === "latest") return b.latest - a.latest || b.count - a.count;
      if (mode === "coverage") return b.count - a.count || b.latest - a.latest;
      return b.score - a.score || b.count - a.count;
    })
    .slice(0, 5);
}

export function getRelativeTime(timestamp: number, now = Date.now()) {
  if (!timestamp) return "recently";

  const diffMinutes = Math.max(1, Math.round((now - timestamp) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return `${Math.round(diffHours / 24)}d ago`;
}
