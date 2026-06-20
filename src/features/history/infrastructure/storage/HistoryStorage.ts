/**
 * Infrastructure: History Storage
 * Handles localStorage operations for article history
 */

import type { HistoryItem } from "../../domain/entities/History";

const HISTORY_KEY = "info-sphere:history";
const MAX_HISTORY = 30;

export class HistoryStorage {
  /**
   * Get all history items from storage
   */
  getAll(): HistoryItem[] {
    try {
      if (typeof window === "undefined") return [];
      const raw = window.localStorage.getItem(HISTORY_KEY);
      return raw ? (JSON.parse(raw) as HistoryItem[]) : [];
    } catch (err) {
      console.error("[HistoryStorage] getAll failed:", err);
      return [];
    }
  }

  /**
   * Save history items to storage
   */
  save(items: HistoryItem[]): void {
    try {
      window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
      window.dispatchEvent(new CustomEvent(`ls:${HISTORY_KEY}`));
    } catch (err) {
      console.error("[HistoryStorage] save failed:", err);
    }
  }

  /**
   * Add an item to history
   */
  add(item: HistoryItem): void {
    try {
      const items = this.getAll();
      // Remove existing entry if present
      const filtered = items.filter((h) => h.url !== item.url);
      // Add to front and limit size
      const updated = [item, ...filtered].slice(0, MAX_HISTORY);
      this.save(updated);
    } catch (err) {
      console.error("[HistoryStorage] add failed:", err);
    }
  }

  /**
   * Clear all history
   */
  clear(): void {
    this.save([]);
  }

  /**
   * Subscribe to storage changes
   */
  subscribe(callback: () => void): () => void {
    const handler = () => callback();
    window.addEventListener(`ls:${HISTORY_KEY}`, handler);
    window.addEventListener("storage", handler);

    return () => {
      window.removeEventListener(`ls:${HISTORY_KEY}`, handler);
      window.removeEventListener("storage", handler);
    };
  }
}
