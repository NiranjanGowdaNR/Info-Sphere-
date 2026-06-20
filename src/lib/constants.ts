/**
 * Application Constants
 * Centralized configuration values
 * Follows DRY (Don't Repeat Yourself) principle
 */

// API Configuration
export const API_CONFIG = {
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  FRESH_TTL: 5 * 60 * 1000, // 5 minutes
  STALE_TTL: 60 * 60 * 1000, // 60 minutes
  MAX_ENTRIES: 100,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 100,
  MAX_PAGES: 50,
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  BOOKMARKS: "news-bookmarks",
  HISTORY: "news-history",
  ENGAGEMENT: "news-engagement",
  THEME: "theme",
  READING_TIME: "reading-time",
} as const;

// Theme
export const THEME = {
  LIGHT: "light",
  DARK: "dark",
} as const;

// Trending Topics
export const TRENDING_TOPICS = [
  "Technology",
  "AI",
  "Climate",
  "Politics",
  "Sports",
  "Business",
  "Health",
  "Science",
] as const;

// Mobile Breakpoint
export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1280,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  API_ERROR: "Failed to fetch news. Please try again later.",
  RATE_LIMIT: "Rate limit exceeded. Please try again after a short break.",
  TIMEOUT: "Request timeout. Please try again.",
  UNKNOWN: "An unexpected error occurred.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  BOOKMARK_ADDED: "Article bookmarked successfully",
  BOOKMARK_REMOVED: "Bookmark removed",
  SHARE_SUCCESS: "Article shared successfully",
} as const;

// Reading Time
export const READING_TIME = {
  WORDS_PER_MINUTE: 200,
  IMAGE_READ_TIME: 12, // seconds per image
} as const;

// Article Engagement
export const ENGAGEMENT = {
  VIEW_WEIGHT: 1,
  SHARE_WEIGHT: 3,
  BOOKMARK_WEIGHT: 2,
} as const;
