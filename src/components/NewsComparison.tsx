/**
 * News Comparison Component
 * Compare coverage of the same topic across different news sources
 * Uses existing NewsAPI search to find related articles
 */

import { useState, useCallback, useMemo } from "react";
import {
  GitCompare,
  Loader2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import type { Article } from "@/lib/types";

/* eslint-disable react-refresh/only-export-components */

interface SourceCoverage {
  source: string;
  articles: Article[];
  sentiment: "positive" | "negative" | "neutral";
  emphasis: string;
}

interface ComparisonResult {
  topic: string;
  sources: SourceCoverage[];
  commonFacts: string[];
  divergingPoints: string[];
}

// ─── Analysis Helpers ─────────────────────────────────────────────────────────

const POSITIVE_WORDS = new Set([
  "success",
  "growth",
  "win",
  "improve",
  "gain",
  "rise",
  "boost",
  "achieve",
  "breakthrough",
  "advance",
  "record",
  "surge",
  "rally",
  "recover",
  "profit",
  "benefit",
  "positive",
  "strong",
  "better",
  "best",
  "good",
  "great",
  "excellent",
  "approve",
  "support",
  "agree",
  "deal",
  "peace",
  "safe",
]);

const NEGATIVE_WORDS = new Set([
  "fail",
  "loss",
  "decline",
  "crisis",
  "fall",
  "drop",
  "concern",
  "risk",
  "threat",
  "problem",
  "issue",
  "warn",
  "crash",
  "collapse",
  "attack",
  "death",
  "kill",
  "war",
  "conflict",
  "disaster",
  "emergency",
  "danger",
  "fear",
  "worry",
  "bad",
  "worst",
  "terrible",
  "awful",
  "negative",
  "oppose",
  "reject",
  "ban",
  "cut",
  "layoff",
]);

export function analyzeSentiment(
  articles: Article[],
): "positive" | "negative" | "neutral" {
  let positiveScore = 0;
  let negativeScore = 0;

  for (const article of articles) {
    const text = `${article.title} ${article.description ?? ""}`.toLowerCase();
    const words = text.split(/\W+/);
    words.forEach((w) => {
      if (POSITIVE_WORDS.has(w)) positiveScore++;
      if (NEGATIVE_WORDS.has(w)) negativeScore++;
    });
  }

  if (positiveScore > negativeScore + 1) return "positive";
  if (negativeScore > positiveScore + 1) return "negative";
  return "neutral";
}

export function extractEmphasis(articles: Article[]): string {
  if (articles.length === 0) return "General coverage";

  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "has",
    "have",
    "had",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "as",
    "it",
    "its",
    "this",
    "that",
    "these",
    "those",
    "says",
    "said",
    "after",
    "over",
    "new",
    "more",
    "than",
    "about",
  ]);

  const wordFreq = new Map<string, number>();

  for (const article of articles) {
    const words = article.title
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .split(/\s+/)
      .filter((w) => w.length > 3 && !stopWords.has(w));
    words.forEach((w) => wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1));
  }

  const topWords = Array.from(wordFreq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word[0].toUpperCase() + word.slice(1));

  return topWords.length > 0 ? topWords.join(", ") : "General coverage";
}

export function analyzeSourceCoverage(articles: Article[]): SourceCoverage[] {
  const bySource = new Map<string, Article[]>();

  for (const article of articles) {
    const source = article.source?.name?.trim() || "Unknown";
    if (!bySource.has(source)) {
      bySource.set(source, []);
    }
    bySource.get(source)!.push(article);
  }

  return Array.from(bySource.entries())
    .filter(([, arts]) => arts.length > 0)
    .map(([source, arts]) => ({
      source,
      articles: arts,
      sentiment: analyzeSentiment(arts),
      emphasis: extractEmphasis(arts),
    }))
    .sort((a, b) => b.articles.length - a.articles.length)
    .slice(0, 6);
}

export function findCommonFacts(articles: Article[]): string[] {
  if (articles.length < 2) return [];

  const facts: string[] = [];

  // Find numbers/figures mentioned in multiple articles
  const numberPattern =
    /\b(\d+(?:\.\d+)?(?:%|billion|million|thousand|trillion)?)\b/gi;
  const numberFreq = new Map<string, number>();

  for (const article of articles) {
    const text = `${article.title} ${article.description ?? ""}`;
    const seen = new Set<string>();
    let match;
    while ((match = numberPattern.exec(text)) !== null) {
      const key = match[1].toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        numberFreq.set(key, (numberFreq.get(key) ?? 0) + 1);
      }
    }
  }

  const commonNumbers = Array.from(numberFreq.entries())
    .filter(([, count]) => count >= Math.min(2, articles.length))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([num, count]) => `Figure "${num}" mentioned in ${count} sources`);

  facts.push(...commonNumbers);

  // Find common named entities (capitalized phrases)
  const entityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const entityFreq = new Map<string, number>();

  for (const article of articles) {
    const text = `${article.title} ${article.description ?? ""}`;
    const seen = new Set<string>();
    let match;
    while ((match = entityPattern.exec(text)) !== null) {
      const entity = match[1];
      if (entity.length > 3 && !seen.has(entity)) {
        seen.add(entity);
        entityFreq.set(entity, (entityFreq.get(entity) ?? 0) + 1);
      }
    }
  }

  const commonEntities = Array.from(entityFreq.entries())
    .filter(([, count]) => count >= Math.min(3, articles.length))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([entity]) => `"${entity}" covered by multiple sources`);

  facts.push(...commonEntities);

  if (facts.length === 0 && articles.length > 1) {
    facts.push(`${articles.length} articles found across different sources`);
  }

  return facts;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NewsComparisonProps {
  article: Article;
  relatedArticles?: Article[];
  compact?: boolean;
}

export function NewsComparison({
  article,
  relatedArticles = [],
  compact = false,
}: NewsComparisonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allArticles, setAllArticles] = useState<Article[]>(relatedArticles);
  const [hasLoaded, setHasLoaded] = useState(relatedArticles.length > 0);
  const [error, setError] = useState<string | null>(null);

  const loadComparison = useCallback(async () => {
    if (hasLoaded) {
      setIsExpanded((prev) => !prev);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Build a focused search query from the article title
      const query = article.title
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 6)
        .join(" ");

      const response = await fetch(
        `/api/search/msg?msg=${encodeURIComponent(query)}&pageSize=30`,
      );

      if (response.ok) {
        const data = (await response.json()) as {
          data: { articles: Article[] };
        };
        const fetched = (data.data?.articles ?? []).filter(
          (a) => a.url !== article.url,
        );
        setAllArticles([article, ...fetched]);
      } else {
        // Even if fetch fails, show analysis of the current article
        setAllArticles([article]);
      }

      setHasLoaded(true);
      setIsExpanded(true);
    } catch (err) {
      console.error("[NewsComparison] Error:", err);
      setAllArticles([article]);
      setHasLoaded(true);
      setIsExpanded(true);
    } finally {
      setIsLoading(false);
    }
  }, [article, hasLoaded]);

  const retry = useCallback(() => {
    setHasLoaded(false);
    setAllArticles([]);
    setError(null);
    loadComparison();
  }, [loadComparison]);

  const comparison = useMemo((): ComparisonResult => {
    const sources = analyzeSourceCoverage(allArticles);
    const commonFacts = findCommonFacts(allArticles);

    const divergingPoints: string[] = [];
    const sentiments = sources.map((s) => s.sentiment);
    const hasPositive = sentiments.includes("positive");
    const hasNegative = sentiments.includes("negative");

    if (hasPositive && hasNegative) {
      divergingPoints.push(
        "Sources differ in tone — some report positively, others negatively",
      );
    }

    const emphases = new Set(sources.map((s) => s.emphasis));
    if (emphases.size > 1) {
      const emphasisList = Array.from(emphases).slice(0, 2);
      divergingPoints.push(
        `Different focus areas: "${emphasisList[0]}" vs "${emphasisList[1]}"`,
      );
    }

    if (sources.length > 1) {
      const maxArticles = Math.max(...sources.map((s) => s.articles.length));
      const minArticles = Math.min(...sources.map((s) => s.articles.length));
      if (maxArticles > minArticles * 2) {
        const topSource = sources[0];
        divergingPoints.push(
          `${topSource.source} has significantly more coverage (${topSource.articles.length} articles)`,
        );
      }
    }

    return {
      topic:
        article.title.slice(0, 80) + (article.title.length > 80 ? "…" : ""),
      sources,
      commonFacts,
      divergingPoints,
    };
  }, [allArticles, article]);

  const sentimentIcon = (sentiment: "positive" | "negative" | "neutral") => {
    if (sentiment === "positive")
      return <TrendingUp className="h-3.5 w-3.5 text-green-500" />;
    if (sentiment === "negative")
      return <TrendingDown className="h-3.5 w-3.5 text-red-500" />;
    return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  };

  const sentimentBadge = (sentiment: "positive" | "negative" | "neutral") => {
    const base = "rounded-full px-1.5 py-0.5 text-[10px] font-medium";
    if (sentiment === "positive")
      return `${base} bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400`;
    if (sentiment === "negative")
      return `${base} bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400`;
    return `${base} bg-muted text-muted-foreground`;
  };

  if (compact) {
    return (
      <button
        onClick={loadComparison}
        disabled={isLoading}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        title="Compare coverage across sources"
        aria-label="Compare news coverage"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <GitCompare className="h-3.5 w-3.5 text-[color:var(--heading)]" />
        )}
        {isLoading ? "Loading…" : "Compare"}
      </button>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/30">
      {/* Header */}
      <button
        onClick={loadComparison}
        disabled={isLoading}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-muted/50 disabled:opacity-50"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[color:var(--heading)]" />
          ) : (
            <GitCompare className="h-4 w-4 text-[color:var(--heading)]" />
          )}
          <span className="text-sm font-medium">
            {isLoading
              ? "Analyzing coverage…"
              : isExpanded
                ? `Source Comparison (${comparison.sources.length} sources)`
                : "Compare News Coverage"}
          </span>
        </div>
        {hasLoaded && !isLoading && (
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                retry();
              }}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Refresh comparison"
              aria-label="Refresh comparison"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="border-t border-border px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Content */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Source breakdown */}
          {comparison.sources.length > 0 ? (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Coverage by Source
              </p>
              <div className="space-y-2">
                {comparison.sources.map((source) => (
                  <div
                    key={source.source}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background p-3"
                  >
                    <div className="mt-0.5 shrink-0">
                      {sentimentIcon(source.sentiment)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold">
                          {source.source}
                        </span>
                        <span className={sentimentBadge(source.sentiment)}>
                          {source.sentiment}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {source.articles.length} article
                          {source.articles.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Focus: {source.emphasis}
                      </p>
                      {source.articles[0] && (
                        <a
                          href={source.articles[0].url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-[10px] text-[color:var(--heading)] hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View latest <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No related articles found. Try searching for this topic to compare
              coverage.
            </p>
          )}

          {/* Common facts */}
          {comparison.commonFacts.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Common Points
              </p>
              <ul className="space-y-1.5">
                {comparison.commonFacts.map((fact, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    <span className="text-muted-foreground">{fact}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Diverging points */}
          {comparison.divergingPoints.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Diverging Coverage
              </p>
              <ul className="space-y-1.5">
                {comparison.divergingPoints.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                    <span className="text-muted-foreground">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/60 italic">
            ⚖️ Analysis based on {allArticles.length} article
            {allArticles.length !== 1 ? "s" : ""} from{" "}
            {comparison.sources.length} source
            {comparison.sources.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
