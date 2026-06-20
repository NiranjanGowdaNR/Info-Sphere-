import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, RefreshCw, ArrowUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { NewsCard } from "./NewsCard";
import { PopularArticles } from "./PopularArticles";
import { SourceRankings } from "./SourceRankings";
import { PAGE_SIZE, type NewsApiResponse } from "@/lib/types";
import { useArticleEngagement } from "@/lib/local-store";
import {
  sortArticles,
  getSavedSortOption,
  saveSortOption,
  SORT_OPTIONS,
  type SortOption,
} from "@/client/services/sorting-filtering";

interface Props {
  title: string;
  endpoint: string; // server route path
  extraParams?: Record<string, string>;
}

export function NewsList({ title, endpoint, extraParams = {} }: Props) {
  const [page, setPage] = useState(1);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const engagement = useArticleEngagement();
  const extraParamsKey = useMemo(
    () => JSON.stringify(extraParams),
    [extraParams],
  );

  // Load saved sort option on mount
  useEffect(() => {
    setSortOption(getSavedSortOption());
  }, []);

  // Reset page when endpoint or params change
  useEffect(() => {
    setPage(1);
    setSelectedSource(null);
  }, [endpoint, extraParamsKey]);

  // Handle sort option change
  const handleSortChange = (newOption: SortOption) => {
    setSortOption(newOption);
    saveSortOption(newOption);
  };

  const url = (() => {
    const u = new URL(
      endpoint,
      typeof window !== "undefined"
        ? window.location.origin
        : "http://localhost",
    );
    u.searchParams.set("page", String(page));
    u.searchParams.set("pageSize", String(PAGE_SIZE));
    for (const [k, v] of Object.entries(extraParams)) u.searchParams.set(k, v);
    return u.pathname + "?" + u.searchParams.toString();
  })();

  const { data, isLoading, isError, error, isFetching, refetch } =
    useQuery<NewsApiResponse>({
      queryKey: [endpoint, page, extraParamsKey],
      queryFn: async () => {
        const res = await fetch(url);
        const json = (await res.json()) as NewsApiResponse;
        if (!res.ok) {
          const message =
            json.message ||
            (res.status === 429
              ? "NewsAPI rate limit reached. Please try again after a short break."
              : `Failed to load news (${res.status}).`);
          throw new Error(message);
        }
        return json;
      },
      retry: (failureCount, err) => {
        if ((err as Error).message.toLowerCase().includes("rate limit"))
          return false;
        return failureCount < 2;
      },
      staleTime: 2 * 60 * 1000,
    });

  const articles = useMemo(
    () => data?.data.articles ?? [],
    [data?.data.articles],
  );

  // Create engagement map for sorting
  const engagementMap = useMemo(() => {
    const map = new Map<string, { views: number; shares: number }>();
    engagement.forEach((item) => {
      map.set(item.url, { views: item.views, shares: item.shares });
    });
    return map;
  }, [engagement]);

  // Apply sorting and filtering
  const sortedArticles = useMemo(
    () => sortArticles(articles, sortOption, engagementMap),
    [articles, sortOption, engagementMap],
  );

  const visibleArticles = selectedSource
    ? sortedArticles.filter(
        (article) => article.source?.name === selectedSource,
      )
    : sortedArticles;
  const total = data?.data.totalResults ?? 0;
  const totalPages = Math.max(1, Math.min(Math.ceil(total / PAGE_SIZE), 50));

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">{title}</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="h-10 w-10 animate-spin text-[color:var(--heading)]" />
        </div>
      )}

      {isError && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="font-medium">News could not be loaded</p>
                <p className="mt-1 text-muted-foreground">
                  {(error as Error).message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => refetch()}
              className="inline-flex w-fit items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      )}

      {!isLoading && !isError && articles.length === 0 && (
        <p className="py-12 text-center opacity-70">No articles found.</p>
      )}

      {articles.length > 0 && (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sort by:</span>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="rounded-md border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.option} value={opt.option}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <PopularArticles articles={sortedArticles} engagement={engagement} />

          <SourceRankings
            articles={sortedArticles}
            selectedSource={selectedSource}
            onSourceSelect={setSelectedSource}
          />

          {selectedSource && (
            <div className="mb-4 flex flex-col gap-2 rounded-md border border-border bg-muted/40 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {visibleArticles.length} stories from{" "}
                <strong>{selectedSource}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedSource(null)}
                className="w-fit rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                Show all sources
              </button>
            </div>
          )}

          {visibleArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibleArticles.map((a, i) => (
                <NewsCard key={`${a.url}-${i}`} article={a} />
              ))}
            </div>
          ) : (
            <p className="rounded-md border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No stories from this source are available on the current page.
            </p>
          )}

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => {
                setPage((p) => Math.max(1, p - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page <= 1 || isFetching}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-sm opacity-80">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => {
                setPage((p) => Math.min(totalPages, p + 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page >= totalPages || isFetching}
              className="rounded-md border border-border bg-card px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </section>
  );
}
