/**
 * History Feature Module
 * Public API for the history feature
 */

// Domain Entities
export type { HistoryItem, HistoryCollection } from "./domain/entities/History";

// Presentation Hooks
export { useHistory, pushHistory } from "./presentation/hooks/useHistory";

// Infrastructure
export { HistoryStorage } from "./infrastructure/storage/HistoryStorage";
