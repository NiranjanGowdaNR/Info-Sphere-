/**
 * Performance Optimization Utilities
 * Provides debouncing, throttling, memoization, lazy loading, and image optimization
 * Follows Single Responsibility Principle
 */

// ─── Debounce ─────────────────────────────────────────────────────────────────

/**
 * Debounce a function - delays execution until after wait ms have elapsed
 * since the last time it was invoked
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  waitMs: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
      timeoutId = null;
    }, waitMs);
  };
}

// ─── Throttle ─────────────────────────────────────────────────────────────────

/**
 * Throttle a function - ensures it's called at most once per interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  intervalMs: number,
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>) {
    const now = Date.now();
    const remaining = intervalMs - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  };
}

// ─── Memoization ──────────────────────────────────────────────────────────────

/**
 * Memoize a function - caches results based on arguments
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: { maxSize?: number; ttlMs?: number } = {},
): T {
  const cache = new Map<string, { value: ReturnType<T>; timestamp: number }>();
  const maxSize = options.maxSize ?? 100;
  const ttlMs = options.ttlMs;

  return function (...args: Parameters<T>): ReturnType<T> {
    const key = JSON.stringify(args);
    const now = Date.now();

    const cached = cache.get(key);
    if (cached) {
      if (!ttlMs || now - cached.timestamp < ttlMs) {
        return cached.value;
      }
      cache.delete(key);
    }

    const result = fn(...args) as ReturnType<T>;

    // Evict oldest entry if cache is full
    if (cache.size >= maxSize) {
      const firstKey = cache.keys().next().value;
      if (firstKey !== undefined) {
        cache.delete(firstKey);
      }
    }

    cache.set(key, { value: result, timestamp: now });
    return result;
  } as T;
}

// ─── Lazy Loading ─────────────────────────────────────────────────────────────

/**
 * Create an intersection observer for lazy loading
 * Returns a cleanup function
 */
export function createLazyLoader(
  elements: Element[],
  callback: (element: Element) => void,
  options: IntersectionObserverInit = {},
): () => void {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
    // Fallback: load all immediately
    elements.forEach(callback);
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "50px",
      threshold: 0.1,
      ...options,
    },
  );

  elements.forEach((el) => observer.observe(el));

  return () => observer.disconnect();
}

// ─── Image Optimization ───────────────────────────────────────────────────────

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "jpeg" | "png";
}

/**
 * Generate optimized image URL
 * Supports common image CDN patterns
 */
export function getOptimizedImageUrl(
  url: string,
  options: ImageOptimizationOptions = {},
): string {
  if (!url) return url;

  // For placeholder images, return as-is
  if (url.includes("placehold.co")) return url;

  // Add width/height hints for browser optimization
  const params = new URLSearchParams();
  if (options.width) params.set("w", String(options.width));
  if (options.height) params.set("h", String(options.height));
  if (options.quality) params.set("q", String(options.quality));

  // Return original URL if no params
  if (!params.toString()) return url;

  // For URLs that support query params (like Unsplash, Cloudinary)
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.includes("unsplash.com") ||
      parsed.hostname.includes("cloudinary.com") ||
      parsed.hostname.includes("imgix.net")
    ) {
      params.forEach((value, key) => parsed.searchParams.set(key, value));
      return parsed.toString();
    }
  } catch {
    // Invalid URL, return as-is
  }

  return url;
}

/**
 * Preload critical images
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === "undefined") return;

  urls.forEach((url) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    document.head.appendChild(link);
  });
}

// ─── Bundle Size Optimization ─────────────────────────────────────────────────

/**
 * Dynamic import with retry logic
 */
export async function dynamicImport<T>(
  importFn: () => Promise<T>,
  retries = 3,
): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await importFn();
    } catch (error) {
      if (i === retries - 1) throw error;
      // Wait before retry with exponential backoff
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, i) * 1000),
      );
    }
  }
  throw new Error("Dynamic import failed after retries");
}

// ─── Virtual Scrolling Helper ─────────────────────────────────────────────────

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}

export interface VirtualScrollResult {
  startIndex: number;
  endIndex: number;
  offsetY: number;
  visibleCount: number;
}

/**
 * Calculate visible items for virtual scrolling
 */
export function calculateVirtualScroll(
  scrollTop: number,
  totalItems: number,
  config: VirtualScrollConfig,
): VirtualScrollResult {
  const { itemHeight, containerHeight, overscan = 3 } = config;

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    startIndex + visibleCount + overscan * 2,
  );
  const offsetY = startIndex * itemHeight;

  return { startIndex, endIndex, offsetY, visibleCount };
}

// ─── Request Deduplication ────────────────────────────────────────────────────

const pendingRequests = new Map<string, Promise<unknown>>();

/**
 * Deduplicate concurrent identical requests
 * If the same URL is requested multiple times simultaneously, only one fetch is made
 */
export async function deduplicatedFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const key = `${url}:${JSON.stringify(options)}`;

  if (pendingRequests.has(key)) {
    return pendingRequests.get(key) as Promise<Response>;
  }

  const promise = fetch(url, options).finally(() => {
    pendingRequests.delete(key);
  });

  pendingRequests.set(key, promise);
  return promise;
}

// ─── Performance Metrics ──────────────────────────────────────────────────────

/**
 * Measure component render time
 */
export function measureRenderTime(componentName: string): {
  start: () => void;
  end: () => number;
} {
  let startTime = 0;

  return {
    start: () => {
      startTime = performance.now();
    },
    end: () => {
      const duration = performance.now() - startTime;
      if (
        typeof process !== "undefined" &&
        process.env.NODE_ENV === "development"
      ) {
        console.debug(
          `[Performance] ${componentName} rendered in ${duration.toFixed(2)}ms`,
        );
      }
      return duration;
    },
  };
}

/**
 * Check if the user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Check if the connection is slow
 */
export function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const connection = (
    navigator as Navigator & {
      connection?: { effectiveType?: string; saveData?: boolean };
    }
  ).connection;
  if (!connection) return false;
  return (
    connection.saveData === true ||
    ["slow-2g", "2g"].includes(connection.effectiveType ?? "")
  );
}
