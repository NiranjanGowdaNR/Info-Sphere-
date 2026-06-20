import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  RateLimiter,
  RateLimitError,
  formatRateLimitReset,
  getRateLimitStatus,
} from "./rate-limiter";

describe("RateLimiter", () => {
  let limiter: RateLimiter;

  beforeEach(() => {
    localStorage.clear();
    limiter = new RateLimiter({
      maxRequests: 3,
      windowMs: 60000,
      retryAfterMs: 10000,
    });
    vi.useFakeTimers();
  });

  afterEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  describe("check", () => {
    it("should allow requests within limit", () => {
      const result1 = limiter.check("test");
      const result2 = limiter.check("test");
      const result3 = limiter.check("test");

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(true);
      expect(result3.allowed).toBe(true);
    });

    it("should block requests exceeding limit", () => {
      limiter.check("test");
      limiter.check("test");
      limiter.check("test");
      const result = limiter.check("test");

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("should track remaining requests", () => {
      const result1 = limiter.check("test");
      expect(result1.remaining).toBe(2);

      const result2 = limiter.check("test");
      expect(result2.remaining).toBe(1);

      const result3 = limiter.check("test");
      expect(result3.remaining).toBe(0);
    });

    it("should reset after window expires", () => {
      limiter.check("test");
      limiter.check("test");
      limiter.check("test");

      vi.advanceTimersByTime(61000);

      const result = limiter.check("test");
      expect(result.allowed).toBe(true);
    });

    it("should use separate buckets for different keys", () => {
      limiter.check("key1");
      limiter.check("key1");
      limiter.check("key1");

      const result = limiter.check("key2");
      expect(result.allowed).toBe(true);
    });

    it("should include retryAfterMs when blocked", () => {
      limiter.check("test");
      limiter.check("test");
      limiter.check("test");
      const result = limiter.check("test");

      expect(result.retryAfterMs).toBeDefined();
      expect(result.retryAfterMs).toBeGreaterThan(0);
    });
  });

  describe("reset", () => {
    it("should reset a specific key", () => {
      limiter.check("test");
      limiter.check("test");
      limiter.check("test");

      limiter.reset("test");

      const result = limiter.check("test");
      expect(result.allowed).toBe(true);
    });

    it("should not affect other keys", () => {
      limiter.check("key1");
      limiter.check("key1");
      limiter.check("key1");
      limiter.check("key2");
      limiter.check("key2");
      limiter.check("key2");

      limiter.reset("key1");

      const result1 = limiter.check("key1");
      const result2 = limiter.check("key2");

      expect(result1.allowed).toBe(true);
      expect(result2.allowed).toBe(false);
    });
  });

  describe("resetAll", () => {
    it("should reset all keys", () => {
      limiter.check("key1");
      limiter.check("key1");
      limiter.check("key1");
      limiter.check("key2");
      limiter.check("key2");
      limiter.check("key2");

      limiter.resetAll();

      expect(limiter.check("key1").allowed).toBe(true);
      expect(limiter.check("key2").allowed).toBe(true);
    });
  });

  describe("getStatus", () => {
    it("should return full remaining for new key", () => {
      const status = limiter.getStatus("new-key");
      expect(status.allowed).toBe(true);
      expect(status.remaining).toBe(3);
    });

    it("should return correct remaining after requests", () => {
      limiter.check("test");
      limiter.check("test");

      const status = limiter.getStatus("test");
      expect(status.remaining).toBe(1);
    });
  });
});

describe("RateLimitError", () => {
  it("should have correct name", () => {
    const error = new RateLimitError("test", Date.now() + 1000);
    expect(error.name).toBe("RateLimitError");
  });

  it("should store resetAt", () => {
    const resetAt = Date.now() + 5000;
    const error = new RateLimitError("test", resetAt);
    expect(error.resetAt).toBe(resetAt);
  });

  it("should store retryAfterMs", () => {
    const error = new RateLimitError("test", Date.now() + 1000, 5000);
    expect(error.retryAfterMs).toBe(5000);
  });
});

describe("formatRateLimitReset", () => {
  it("should return 'now' for past timestamps", () => {
    expect(formatRateLimitReset(Date.now() - 1000)).toBe("now");
  });

  it("should format seconds", () => {
    const result = formatRateLimitReset(Date.now() + 45000);
    expect(result).toMatch(/^\d+s$/);
  });

  it("should format minutes", () => {
    const result = formatRateLimitReset(Date.now() + 150000);
    expect(result).toMatch(/^\d+m$/);
  });

  it("should format hours", () => {
    const result = formatRateLimitReset(Date.now() + 7200000);
    expect(result).toMatch(/^\d+h$/);
  });
});

describe("getRateLimitStatus", () => {
  it("should return not limited for new key", () => {
    const limiter = new RateLimiter({ maxRequests: 5, windowMs: 60000 });
    const status = getRateLimitStatus(limiter, "test");

    expect(status.isLimited).toBe(false);
    expect(status.remaining).toBe(5);
  });

  it("should return limited when exceeded", () => {
    const limiter = new RateLimiter({
      maxRequests: 2,
      windowMs: 60000,
      retryAfterMs: 5000,
    });

    limiter.check("test");
    limiter.check("test");
    limiter.check("test"); // This triggers the block

    const status = getRateLimitStatus(limiter, "test");
    expect(status.isLimited).toBe(true);
    expect(status.remaining).toBe(0);
  });
});
