/**
 * Domain Entity: Bookmark
 * Core business entity representing a bookmarked article
 */

import type { Article } from "@/features/news";

export type Bookmark = Article;

export interface BookmarkCollection {
  items: Bookmark[];
}
