/**
 * Presentation Hook: useHistory
 * React hook for history management
 */

import { useEffect, useState } from "react";
import type { HistoryItem } from "../../domain/entities/History";
import { HistoryStorage } from "../../infrastructure/storage/HistoryStorage";

const storage = new HistoryStorage();

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    // Load initial history
    setItems(storage.getAll());

    // Subscribe to changes
    const unsubscribe = storage.subscribe(() => {
      setItems(storage.getAll());
    });

    return unsubscribe;
  }, []);

  const clear = (): void => {
    storage.clear();
    setItems([]);
  };

  return {
    items,
    clear,
  };
}

/**
 * Helper function to add item to history
 * Can be called from anywhere without hook
 */
export function pushHistory(item: HistoryItem): void {
  storage.add(item);
}
