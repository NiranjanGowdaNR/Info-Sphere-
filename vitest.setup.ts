import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as unknown as typeof ResizeObserver;

// Mock SpeechSynthesisUtterance for PodcastPlayer tests
if (typeof window.SpeechSynthesisUtterance === "undefined") {
  class MockSpeechSynthesisUtterance {
    text: string;
    rate = 1;
    volume = 1;
    pitch = 1;
    lang = "en-US";
    voice: SpeechSynthesisVoice | null = null;
    onboundary: ((event: SpeechSynthesisEvent) => void) | null = null;
    onend: ((event: SpeechSynthesisEvent) => void) | null = null;
    onerror: ((event: SpeechSynthesisErrorEvent) => void) | null = null;
    onstart: ((event: SpeechSynthesisEvent) => void) | null = null;
    onpause: ((event: SpeechSynthesisEvent) => void) | null = null;
    onresume: ((event: SpeechSynthesisEvent) => void) | null = null;
    onmark: ((event: SpeechSynthesisEvent) => void) | null = null;

    constructor(text = "") {
      this.text = text;
    }

    addEventListener() {}
    removeEventListener() {}
    dispatchEvent() {
      return true;
    }
  }

  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    value: MockSpeechSynthesisUtterance,
    writable: true,
    configurable: true,
  });
}

// Mock speechSynthesis
if (typeof window.speechSynthesis === "undefined") {
  Object.defineProperty(window, "speechSynthesis", {
    value: {
      speak: () => {},
      pause: () => {},
      resume: () => {},
      cancel: () => {},
      getVoices: () => [],
      onvoiceschanged: null,
      speaking: false,
      pending: false,
      paused: false,
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    },
    writable: true,
    configurable: true,
  });
}
