/**
 * Domain Entity: History
 * Core business entity representing article history
 */

import type { Article } from "@/features/news";

export type HistoryItem = Article;

export interface HistoryCollection {
  items: HistoryItem[];
  maxSize: number;
}
