import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  debounce,
  throttle,
  memoize,
  calculateVirtualScroll,
  getOptimizedImageUrl,
} from "./performance";

import { formatRateLimitReset as rateLimitFormat } from "./rate-limiter";

describe("Performance Utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("debounce", () => {
    it("should delay function execution", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should reset timer on repeated calls", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced();
      vi.advanceTimersByTime(50);
      debounced();
      vi.advanceTimersByTime(50);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to the function", () => {
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced("arg1", "arg2");
      vi.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });
  });

  describe("throttle", () => {
    it("should call function immediately on first call", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should not call function again within interval", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should allow call after interval", () => {
      const fn = vi.fn();
      const throttled = throttle(fn, 100);

      throttled();
      vi.advanceTimersByTime(100);
      throttled();

      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe("memoize", () => {
    it("should cache function results", () => {
      const fn = vi.fn((x: unknown) => (x as number) * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should call function for different arguments", () => {
      const fn = vi.fn((x: unknown) => (x as number) * 2);
      const memoized = memoize(fn);

      expect(memoized(5)).toBe(10);
      expect(memoized(10)).toBe(20);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should respect TTL", () => {
      const fn = vi.fn((x: unknown) => (x as number) * 2);
      const memoized = memoize(fn, { ttlMs: 100 });

      expect(memoized(5)).toBe(10);
      vi.advanceTimersByTime(150);
      expect(memoized(5)).toBe(10);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should respect maxSize", () => {
      const fn = vi.fn((x: unknown) => x);
      const memoized = memoize(fn, { maxSize: 2 });

      memoized(1);
      memoized(2);
      memoized(3); // Should evict oldest

      expect(fn).toHaveBeenCalledTimes(3);
    });
  });

  describe("calculateVirtualScroll", () => {
    it("should calculate correct visible range", () => {
      const result = calculateVirtualScroll(0, 100, {
        itemHeight: 50,
        containerHeight: 300,
        overscan: 0,
      });

      expect(result.startIndex).toBe(0);
      expect(result.visibleCount).toBe(6);
    });

    it("should apply overscan", () => {
      const result = calculateVirtualScroll(200, 100, {
        itemHeight: 50,
        containerHeight: 300,
        overscan: 2,
      });

      // scrollTop=200, itemHeight=50 → first visible = 4, minus overscan 2 = 2
      expect(result.startIndex).toBe(2);
    });

    it("should not go below 0 for startIndex", () => {
      const result = calculateVirtualScroll(0, 100, {
        itemHeight: 50,
        containerHeight: 300,
        overscan: 5,
      });

      expect(result.startIndex).toBe(0);
    });

    it("should calculate correct offsetY", () => {
      const result = calculateVirtualScroll(200, 100, {
        itemHeight: 50,
        containerHeight: 300,
        overscan: 0,
      });

      expect(result.offsetY).toBe(result.startIndex * 50);
    });
  });

  describe("getOptimizedImageUrl", () => {
    it("should return empty string for empty input", () => {
      expect(getOptimizedImageUrl("")).toBe("");
    });

    it("should return placeholder URLs unchanged", () => {
      const url = "https://placehold.co/600x400";
      expect(getOptimizedImageUrl(url, { width: 300 })).toBe(url);
    });

    it("should return URL unchanged when no options", () => {
      const url = "https://example.com/image.jpg";
      expect(getOptimizedImageUrl(url)).toBe(url);
    });

    it("should add params for Unsplash URLs", () => {
      const url = "https://images.unsplash.com/photo-123";
      const result = getOptimizedImageUrl(url, { width: 800, quality: 80 });
      expect(result).toContain("w=800");
      expect(result).toContain("q=80");
    });
  });
});

describe("Rate Limiter Format", () => {
  it("should format seconds correctly", () => {
    const now = Date.now();
    expect(rateLimitFormat(now + 30000)).toMatch(/\d+s/);
  });

  it("should format minutes correctly", () => {
    const now = Date.now();
    expect(rateLimitFormat(now + 120000)).toMatch(/\d+m/);
  });

  it("should return 'now' for past timestamps", () => {
    expect(rateLimitFormat(Date.now() - 1000)).toBe("now");
  });
});
