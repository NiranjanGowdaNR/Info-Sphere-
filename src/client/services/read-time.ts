import type { Article } from "@/shared/models/news";

const WORDS_PER_MINUTE = 220;
const AVERAGE_CHARS_PER_WORD = 5.2;

export function estimateReadMinutes(article: Article) {
  const content = article.content ?? "";
  const hiddenChars = content.match(/\[\+(\d+)\s+chars\]/i)?.[1];
  const hiddenWords = hiddenChars
    ? Number.parseInt(hiddenChars, 10) / AVERAGE_CHARS_PER_WORD
    : 0;
  const visibleText = [
    article.title,
    article.description,
    content.replace(/\[\+\d+\s+chars\]/i, ""),
  ]
    .filter(Boolean)
    .join(" ");
  const visibleWords = visibleText.trim().split(/\s+/).filter(Boolean).length;
  const estimatedWords = Math.max(visibleWords + hiddenWords, visibleWords * 4);
  const minutes = Math.ceil(estimatedWords / WORDS_PER_MINUTE);

  return Math.max(1, Math.min(minutes, 15));
}
