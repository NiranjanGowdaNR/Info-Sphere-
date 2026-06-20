import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  translateText,
  translateArticle,
  getPreferredLanguage,
  setPreferredLanguage,
  detectBrowserLanguage,
  SUPPORTED_LANGUAGES,
} from "./translation";

describe("Translation Service", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("translateText", () => {
    it("should return translated text with language prefix", async () => {
      const result = await translateText("Hello World", "es");
      expect(result).toBe("[ES] Hello World");
    });

    it("should handle empty text", async () => {
      const result = await translateText("", "fr");
      expect(result).toBe("[FR] ");
    });

    it("should handle different target languages", async () => {
      const resultEs = await translateText("Test", "es");
      const resultFr = await translateText("Test", "fr");
      const resultDe = await translateText("Test", "de");

      expect(resultEs).toBe("[ES] Test");
      expect(resultFr).toBe("[FR] Test");
      expect(resultDe).toBe("[DE] Test");
    });
  });

  describe("translateArticle", () => {
    it("should translate all article fields", async () => {
      const result = await translateArticle(
        "Test Title",
        "Test Description",
        "Test Content",
        "es",
      );

      expect(result.title).toBe("[ES] Test Title");
      expect(result.description).toBe("[ES] Test Description");
      expect(result.content).toBe("[ES] Test Content");
      expect(result.targetLanguage).toBe("es");
    });

    it("should handle null description and content", async () => {
      const result = await translateArticle("Test Title", null, null, "fr");

      expect(result.title).toBe("[FR] Test Title");
      expect(result.description).toBeNull();
      expect(result.content).toBeNull();
      expect(result.targetLanguage).toBe("fr");
    });
  });

  describe("getPreferredLanguage", () => {
    it("should return default language when not set", () => {
      const lang = getPreferredLanguage();
      expect(lang).toBe("en");
    });

    it("should return stored language preference", () => {
      localStorage.setItem("info-sphere:preferred-language", "es");
      const lang = getPreferredLanguage();
      expect(lang).toBe("es");
    });
  });

  describe("setPreferredLanguage", () => {
    it("should store language preference", () => {
      setPreferredLanguage("fr");
      const stored = localStorage.getItem("info-sphere:preferred-language");
      expect(stored).toBe("fr");
    });

    it("should dispatch custom event", () => {
      let eventFired = false;
      window.addEventListener("ls:info-sphere:preferred-language", () => {
        eventFired = true;
      });

      setPreferredLanguage("de");
      expect(eventFired).toBe(true);
    });
  });

  describe("SUPPORTED_LANGUAGES", () => {
    it("should have at least 20 languages", () => {
      expect(SUPPORTED_LANGUAGES.length).toBeGreaterThanOrEqual(20);
    });

    it("should include English", () => {
      const english = SUPPORTED_LANGUAGES.find((l) => l.code === "en");
      expect(english).toBeDefined();
      expect(english?.name).toBe("English");
    });

    it("should have unique language codes", () => {
      const codes = SUPPORTED_LANGUAGES.map((l) => l.code);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });
  });
});
