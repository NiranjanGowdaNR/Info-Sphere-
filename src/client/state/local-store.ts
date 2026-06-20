import { useEffect, useState } from "react";
import type { Article } from "@/shared/models/news";

const BOOKMARKS_KEY = "info-sphere:bookmarks";
const HISTORY_KEY = "info-sphere:history";
const READING_TIME_KEY = "info-sphere:reading-time-seconds";
const ARTICLE_ENGAGEMENT_KEY = "info-sphere:article-engagement";
const MAX_HISTORY = 30;

export interface ArticleEngagement {
  url: string;
  title: string;
  sourceName: string;
  views: number;
  shares: number;
  lastViewedAt: number;
  lastSharedAt: number;
}

function read<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (err) {
    console.error(`[local-store] read ${key} failed:`, err);
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(`ls:${key}`));
  } catch (err) {
    console.error(`[local-store] write ${key} failed:`, err);
  }
}

function useLocal<T>(key: string, fallback: T): [T, (v: T) => void] {
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    setVal(read<T>(key, fallback));
    const handler = () => setVal(read<T>(key, fallback));
    window.addEventListener(`ls:${key}`, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(`ls:${key}`, handler);
      window.removeEventListener("storage", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const update = (v: T) => {
    setVal(v);
    write(key, v);
  };
  return [val, update];
}

export function useBookmarks() {
  const [items, setItems] = useLocal<Article[]>(BOOKMARKS_KEY, []);
  const isBookmarked = (url: string) => items.some((a) => a.url === url);
  const toggle = (article: Article) => {
    try {
      if (isBookmarked(article.url)) {
        setItems(items.filter((a) => a.url !== article.url));
      } else {
        setItems([article, ...items]);
      }
    } catch (err) {
      console.error("[bookmarks] toggle failed:", err);
    }
  };
  const clear = () => setItems([]);
  return { items, isBookmarked, toggle, clear };
}

export function useHistory() {
  const [items, setItems] = useLocal<Article[]>(HISTORY_KEY, []);
  const clear = () => setItems([]);
  return { items, clear };
}

export function pushHistory(article: Article) {
  try {
    const list = read<Article[]>(HISTORY_KEY, []);
    const filtered = list.filter((a) => a.url !== article.url);
    const next = [article, ...filtered].slice(0, MAX_HISTORY);
    write(HISTORY_KEY, next);
  } catch (err) {
    console.error("[history] push failed:", err);
  }
}

function updateArticleEngagement(
  article: Article,
  update: (item: ArticleEngagement) => ArticleEngagement,
) {
  try {
    const items = read<ArticleEngagement[]>(ARTICLE_ENGAGEMENT_KEY, []);
    const existing = items.find((item) => item.url === article.url) ?? {
      url: article.url,
      title: article.title,
      sourceName: article.source?.name ?? "Unknown Source",
      views: 0,
      shares: 0,
      lastViewedAt: 0,
      lastSharedAt: 0,
    };
    const nextItem = update({
      ...existing,
      title: article.title,
      sourceName: article.source?.name ?? existing.sourceName,
    });
    const next = [
      nextItem,
      ...items.filter((item) => item.url !== article.url),
    ].slice(0, 100);
    write(ARTICLE_ENGAGEMENT_KEY, next);
  } catch (err) {
    console.error("[engagement] update failed:", err);
  }
}

export function recordArticleView(article: Article) {
  updateArticleEngagement(article, (item) => ({
    ...item,
    views: item.views + 1,
    lastViewedAt: Date.now(),
  }));
}

export function recordArticleShare(article: Article) {
  updateArticleEngagement(article, (item) => ({
    ...item,
    shares: item.shares + 1,
    lastSharedAt: Date.now(),
  }));
}

export function useArticleEngagement() {
  return useLocal<ArticleEngagement[]>(ARTICLE_ENGAGEMENT_KEY, [])[0];
}

export function useReadingTime() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setSeconds(read<number>(READING_TIME_KEY, 0));

    const sync = () => setSeconds(read<number>(READING_TIME_KEY, 0));
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      setSeconds((current) => {
        const next = current + 1;
        write(READING_TIME_KEY, next);
        return next;
      });
    };

    const interval = window.setInterval(tick, 1000);
    window.addEventListener(`ls:${READING_TIME_KEY}`, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(`ls:${READING_TIME_KEY}`, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return seconds;
}

export function formatReadingTime(seconds: number) {
  if (seconds < 60) return `${seconds}s`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export const TRENDING_TOPICS = [
  "AI",
  "Climate",
  "Bitcoin",
  "Elections",
  "SpaceX",
  "Apple",
  "Stock Market",
  "World Cup",
  "Health",
  "Startups",
];
