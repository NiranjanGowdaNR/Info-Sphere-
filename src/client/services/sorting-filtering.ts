/**
 * Sorting and Filtering Service
 * Provides advanced sorting and filtering capabilities for news articles
 */

import type { Article } from "@/shared/models/news";

export type SortOption =
  | "newest"
  | "oldest"
  | "popular"
  | "source-asc"
  | "source-desc";

export interface SortConfig {
  option: SortOption;
  label: string;
}

export const SORT_OPTIONS: SortConfig[] = [
  { option: "newest", label: "Newest First" },
  { option: "oldest", label: "Oldest First" },
  { option: "popular", label: "Most Popular" },
  { option: "source-asc", label: "Source (A-Z)" },
  { option: "source-desc", label: "Source (Z-A)" },
];

export interface FilterConfig {
  sources: string[];
  dateFrom?: Date;
  dateTo?: Date;
  searchTerm?: string;
}

/**
 * Sort articles based on the selected option
 */
export function sortArticles(
  articles: Article[],
  sortOption: SortOption,
  engagementData?: Map<string, { views: number; shares: number }>,
): Article[] {
  const sorted = [...articles];

  switch (sortOption) {
    case "newest":
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

    case "oldest":
      return sorted.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      );

    case "popular":
      if (!engagementData) return sorted;
      return sorted.sort((a, b) => {
        const aData = engagementData.get(a.url) || { views: 0, shares: 0 };
        const bData = engagementData.get(b.url) || { views: 0, shares: 0 };
        const aScore = aData.views + aData.shares * 2;
        const bScore = bData.views + bData.shares * 2;
        return bScore - aScore;
      });

    case "source-asc":
      return sorted.sort((a, b) =>
        (a.source?.name || "").localeCompare(b.source?.name || ""),
      );

    case "source-desc":
      return sorted.sort((a, b) =>
        (b.source?.name || "").localeCompare(a.source?.name || ""),
      );

    default:
      return sorted;
  }
}

/**
 * Filter articles based on filter configuration
 */
export function filterArticles(
  articles: Article[],
  filter: FilterConfig,
): Article[] {
  let filtered = [...articles];

  // Filter by sources
  if (filter.sources.length > 0) {
    filtered = filtered.filter((article) =>
      filter.sources.includes(article.source?.name || ""),
    );
  }

  // Filter by date range
  if (filter.dateFrom) {
    filtered = filtered.filter(
      (article) => new Date(article.publishedAt) >= filter.dateFrom!,
    );
  }

  if (filter.dateTo) {
    filtered = filtered.filter(
      (article) => new Date(article.publishedAt) <= filter.dateTo!,
    );
  }

  // Filter by search term
  if (filter.searchTerm && filter.searchTerm.trim()) {
    const term = filter.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (article) =>
        article.title.toLowerCase().includes(term) ||
        article.description?.toLowerCase().includes(term) ||
        article.content?.toLowerCase().includes(term) ||
        article.source?.name.toLowerCase().includes(term),
    );
  }

  return filtered;
}

/**
 * Get unique sources from articles
 */
export function getUniqueSources(articles: Article[]): string[] {
  const sources = new Set<string>();
  articles.forEach((article) => {
    if (article.source?.name) {
      sources.add(article.source.name);
    }
  });
  return Array.from(sources).sort();
}

/**
 * Get saved sort preference
 */
export function getSavedSortOption(): SortOption {
  try {
    if (typeof window === "undefined") return "newest";
    const saved = localStorage.getItem("info-sphere:sort-option");
    return (saved as SortOption) || "newest";
  } catch {
    return "newest";
  }
}

/**
 * Save sort preference
 */
export function saveSortOption(option: SortOption): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("info-sphere:sort-option", option);
    window.dispatchEvent(
      new CustomEvent("ls:info-sphere:sort-option", { detail: option }),
    );
  } catch (error) {
    console.error("[sorting] Failed to save sort option:", error);
  }
}

/**
 * Get saved filter configuration
 */
export function getSavedFilter(): FilterConfig {
  try {
    if (typeof window === "undefined")
      return { sources: [], searchTerm: undefined };
    const saved = localStorage.getItem("info-sphere:filter-config");
    if (!saved) return { sources: [], searchTerm: undefined };

    const parsed = JSON.parse(saved);
    return {
      sources: parsed.sources || [],
      dateFrom: parsed.dateFrom ? new Date(parsed.dateFrom) : undefined,
      dateTo: parsed.dateTo ? new Date(parsed.dateTo) : undefined,
      searchTerm: parsed.searchTerm,
    };
  } catch {
    return { sources: [], searchTerm: undefined };
  }
}

/**
 * Save filter configuration
 */
export function saveFilter(filter: FilterConfig): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("info-sphere:filter-config", JSON.stringify(filter));
    window.dispatchEvent(new CustomEvent("ls:info-sphere:filter-updated"));
  } catch (error) {
    console.error("[filtering] Failed to save filter:", error);
  }
}

/**
 * Clear all filters
 */
export function clearFilters(): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.removeItem("info-sphere:filter-config");
    window.dispatchEvent(new CustomEvent("ls:info-sphere:filter-updated"));
  } catch (error) {
    console.error("[filtering] Failed to clear filters:", error);
  }
}
