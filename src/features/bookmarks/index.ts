/**
 * Bookmarks Feature Module
 * Public API for the bookmarks feature
 */

// Domain Entities
export type { Bookmark, BookmarkCollection } from "./domain/entities/Bookmark";

// Presentation Hooks
export { useBookmarks } from "./presentation/hooks/useBookmarks";

// Infrastructure
export { BookmarkStorage } from "./infrastructure/storage/BookmarkStorage";
