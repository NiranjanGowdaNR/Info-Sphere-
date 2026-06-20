/**
 * Infrastructure: Bookmark Storage
 * Handles localStorage operations for bookmarks
 */

import type { Bookmark } from "../../domain/entities/Bookmark";

const BOOKMARKS_KEY = "info-sphere:bookmarks";

export class BookmarkStorage {
  /**
   * Get all bookmarks from storage
   */
  getAll(): Bookmark[] {
    try {
      if (typeof window === "undefined") return [];
      const raw = window.localStorage.getItem(BOOKMARKS_KEY);
      return raw ? (JSON.parse(raw) as Bookmark[]) : [];
    } catch (err) {
      console.error("[BookmarkStorage] getAll failed:", err);
      return [];
    }
  }

  /**
   * Save bookmarks to storage
   */
  save(bookmarks: Bookmark[]): void {
    try {
      window.localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      window.dispatchEvent(new CustomEvent(`ls:${BOOKMARKS_KEY}`));
    } catch (err) {
      console.error("[BookmarkStorage] save failed:", err);
    }
  }

  /**
   * Add a bookmark
   */
  add(bookmark: Bookmark): void {
    const bookmarks = this.getAll();
    const exists = bookmarks.some((b) => b.url === bookmark.url);
    if (!exists) {
      this.save([bookmark, ...bookmarks]);
    }
  }

  /**
   * Remove a bookmark by URL
   */
  remove(url: string): void {
    const bookmarks = this.getAll();
    this.save(bookmarks.filter((b) => b.url !== url));
  }

  /**
   * Check if a URL is bookmarked
   */
  isBookmarked(url: string): boolean {
    return this.getAll().some((b) => b.url === url);
  }

  /**
   * Clear all bookmarks
   */
  clear(): void {
    this.save([]);
  }

  /**
   * Subscribe to storage changes
   */
  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(`ls:${BOOKMARKS_KEY}`, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(`ls:${BOOKMARKS_KEY}`, handler);
      window.removeEventListener("storage", handler);
    };
  }
}
