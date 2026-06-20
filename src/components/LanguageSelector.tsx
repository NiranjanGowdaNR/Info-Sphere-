import { useState, useEffect } from "react";
import { Languages } from "lucide-react";
import {
  SUPPORTED_LANGUAGES,
  getPreferredLanguage,
  setPreferredLanguage,
} from "@/client/services/translation";

export function LanguageSelector() {
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    setLanguage(getPreferredLanguage());

    const handleUpdate = () => setLanguage(getPreferredLanguage());
    window.addEventListener("ls:info-sphere:preferred-language", handleUpdate);

    return () => {
      window.removeEventListener(
        "ls:info-sphere:preferred-language",
        handleUpdate,
      );
    };
  }, []);

  const handleChange = (newLang: string) => {
    setLanguage(newLang);
    setPreferredLanguage(newLang);
  };

  return (
    <div className="relative inline-flex items-center gap-2">
      <Languages className="h-4 w-4 text-muted-foreground" />
      <select
        value={language}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-md border border-border bg-card px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
        aria-label="Select language"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
}
