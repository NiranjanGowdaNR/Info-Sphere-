import { describe, expect, it, beforeEach, vi } from "vitest";
import { consumeLastCapturedError } from "./error-capture";

describe("error-capture", () => {
  beforeEach(() => {
    // Clear any previously captured errors
    consumeLastCapturedError();
  });

  it("returns undefined when no error has been captured", () => {
    const error = consumeLastCapturedError();
    expect(error).toBeUndefined();
  });

  it("captures and returns errors from error events", () => {
    const testError = new Error("Test error");
    const event = new ErrorEvent("error", { error: testError });

    globalThis.dispatchEvent(event);

    const captured = consumeLastCapturedError();
    expect(captured).toBe(testError);
  });

  it("captures and returns errors from unhandled promise rejections", async () => {
    const testError = new Error("Promise rejection");
    const promise = Promise.reject(testError);
    const event = new PromiseRejectionEvent("unhandledrejection", {
      promise,
      reason: testError,
    });

    globalThis.dispatchEvent(event);

    const captured = consumeLastCapturedError();
    expect(captured).toBe(testError);

    // Prevent unhandled rejection warning
    await promise.catch(() => {});
  });

  it("clears the error after consuming it", () => {
    const testError = new Error("Test error");
    const event = new ErrorEvent("error", { error: testError });

    globalThis.dispatchEvent(event);

    const first = consumeLastCapturedError();
    expect(first).toBe(testError);

    const second = consumeLastCapturedError();
    expect(second).toBeUndefined();
  });

  it("returns undefined for errors older than TTL", async () => {
    const testError = new Error("Old error");
    const event = new ErrorEvent("error", { error: testError });

    globalThis.dispatchEvent(event);

    // Mock time passing beyond TTL (5 seconds)
    vi.useFakeTimers();
    vi.advanceTimersByTime(6000);

    const captured = consumeLastCapturedError();
    expect(captured).toBeUndefined();

    vi.useRealTimers();
  });

  it("only keeps the most recent error", () => {
    const firstError = new Error("First error");
    const secondError = new Error("Second error");

    globalThis.dispatchEvent(new ErrorEvent("error", { error: firstError }));
    globalThis.dispatchEvent(new ErrorEvent("error", { error: secondError }));

    const captured = consumeLastCapturedError();
    expect(captured).toBe(secondError);
  });
});
