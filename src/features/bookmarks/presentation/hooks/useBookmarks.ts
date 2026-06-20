/**
 * Presentation Hook: useBookmarks
 * React hook for bookmark management
 */

import { useEffect, useState } from "react";
import type { Bookmark } from "../../domain/entities/Bookmark";
import { BookmarkStorage } from "../../infrastructure/storage/BookmarkStorage";

const storage = new BookmarkStorage();

export function useBookmarks() {
  const [items, setItems] = useState<Bookmark[]>([]);

  useEffect(() => {
    // Load initial bookmarks
    setItems(storage.getAll());

    // Subscribe to changes
    const unsubscribe = storage.subscribe(() => {
      setItems(storage.getAll());
    });

    return unsubscribe;
  }, []);

  const isBookmarked = (url: string): boolean => {
    return storage.isBookmarked(url);
  };

  const toggle = (bookmark: Bookmark): void => {
    if (storage.isBookmarked(bookmark.url)) {
      storage.remove(bookmark.url);
    } else {
      storage.add(bookmark);
    }
    setItems(storage.getAll());
  };

  const clear = (): void => {
    storage.clear();
    setItems([]);
  };

  return {
    items,
    isBookmarked,
    toggle,
    clear,
  };
}
