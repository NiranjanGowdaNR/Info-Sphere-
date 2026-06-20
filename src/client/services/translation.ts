/**
 * Translation Service
 * Provides article translation functionality using browser's built-in translation or external APIs
 */

export interface TranslationConfig {
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslatedContent {
  title: string;
  description: string | null;
  content: string | null;
  originalLanguage: string;
  targetLanguage: string;
}

// Supported languages for translation
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
  { code: "sv", name: "Swedish" },
] as const;

/**
 * Translate text using a translation API
 * This is a placeholder implementation - in production, you would integrate with:
 * - Google Translate API
 * - Microsoft Translator
 * - DeepL API
 * - LibreTranslate (open source)
 */
export async function translateText(
  text: string,
  targetLang: string,
  sourceLang: string = "auto",
): Promise<string> {
  // For now, return a simulated translation
  // In production, replace with actual API call
  try {
    // Example API integration (commented out):
    // const response = await fetch('https://translation-api.example.com/translate', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ text, targetLang, sourceLang })
    // });
    // const data = await response.json();
    // return data.translatedText;

    // Simulated translation for demo purposes
    return `[${targetLang.toUpperCase()}] ${text}`;
  } catch (error) {
    console.error("[translation] Failed to translate text:", error);
    return text; // Return original text on error
  }
}

/**
 * Translate article content
 */
export async function translateArticle(
  title: string,
  description: string | null,
  content: string | null,
  targetLanguage: string,
  sourceLanguage: string = "auto",
): Promise<TranslatedContent> {
  try {
    const [translatedTitle, translatedDescription, translatedContent] =
      await Promise.all([
        translateText(title, targetLanguage, sourceLanguage),
        description
          ? translateText(description, targetLanguage, sourceLanguage)
          : Promise.resolve(null),
        content
          ? translateText(content, targetLanguage, sourceLanguage)
          : Promise.resolve(null),
      ]);

    return {
      title: translatedTitle,
      description: translatedDescription,
      content: translatedContent,
      originalLanguage: sourceLanguage,
      targetLanguage,
    };
  } catch (error) {
    console.error("[translation] Failed to translate article:", error);
    // Return original content on error
    return {
      title,
      description,
      content,
      originalLanguage: sourceLanguage,
      targetLanguage: sourceLanguage,
    };
  }
}

/**
 * Get user's preferred language from localStorage
 */
export function getPreferredLanguage(): string {
  try {
    if (typeof window === "undefined") return "en";
    return localStorage.getItem("info-sphere:preferred-language") || "en";
  } catch {
    return "en";
  }
}

/**
 * Set user's preferred language
 */
export function setPreferredLanguage(language: string): void {
  try {
    if (typeof window === "undefined") return;
    localStorage.setItem("info-sphere:preferred-language", language);
    window.dispatchEvent(
      new CustomEvent("ls:info-sphere:preferred-language", {
        detail: language,
      }),
    );
  } catch (error) {
    console.error("[translation] Failed to set preferred language:", error);
  }
}

/**
 * Detect browser language
 */
export function detectBrowserLanguage(): string {
  try {
    if (typeof window === "undefined") return "en";
    const browserLang = navigator.language.split("-")[0];
    const supported = SUPPORTED_LANGUAGES.find((l) => l.code === browserLang);
    return supported ? browserLang : "en";
  } catch {
    return "en";
  }
}
