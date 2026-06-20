/**
 * AI-Powered Summary Component
 * Generates article summaries using extractive NLP summarization
 * Works entirely in the browser - no API key required
 */

import { useState, useCallback, useEffect } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, X } from "lucide-react";
import type { Article } from "@/lib/types";

export interface AISummaryConfig {
  provider: "openai" | "extractive" | "none";
  apiKey?: string;
  maxLength?: number;
}

// ─── Extractive Summarization Engine ─────────────────────────────────────────

const STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "has",
  "have",
  "had",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "as",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "he",
  "she",
  "they",
  "we",
  "you",
  "i",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "their",
  "our",
  "said",
  "says",
  "also",
  "just",
  "more",
  "than",
  "about",
  "after",
  "before",
  "when",
  "where",
  "which",
  "who",
  "what",
  "how",
  "not",
  "no",
  "so",
  "if",
  "then",
  "there",
  "here",
  "up",
  "out",
  "into",
  "over",
  "new",
  "can",
  "do",
  "did",
  "does",
  "been",
  "being",
  "get",
  "got",
  "make",
]);

/**
 * Tokenize text into meaningful words
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

/**
 * Calculate TF-IDF-like word importance scores
 */
function calculateWordScores(sentences: string[]): Map<string, number> {
  const wordFreq = new Map<string, number>();
  const totalWords: string[] = [];

  for (const sentence of sentences) {
    const words = tokenize(sentence);
    totalWords.push(...words);
    words.forEach((w) => wordFreq.set(w, (wordFreq.get(w) ?? 0) + 1));
  }

  // Normalize by total word count
  const maxFreq = Math.max(...wordFreq.values(), 1);
  const scores = new Map<string, number>();
  wordFreq.forEach((freq, word) => {
    scores.set(word, freq / maxFreq);
  });

  return scores;
}

/**
 * Score a sentence based on word importance and position
 */
function scoreSentence(
  sentence: string,
  index: number,
  totalSentences: number,
  wordScores: Map<string, number>,
  titleWords: Set<string>,
): number {
  const words = tokenize(sentence);
  if (words.length === 0) return 0;

  // Word importance score
  const wordScore =
    words.reduce((sum, w) => sum + (wordScores.get(w) ?? 0), 0) / words.length;

  // Title keyword overlap (most important signal)
  const titleOverlap =
    words.filter((w) => titleWords.has(w)).length /
    Math.max(titleWords.size, 1);

  // Position score: first and last sentences are usually important
  const positionScore =
    index === 0
      ? 1.5
      : index === totalSentences - 1
        ? 0.8
        : index < totalSentences * 0.3
          ? 1.0
          : 0.5;

  // Length penalty: prefer medium-length sentences
  const lengthScore =
    sentence.length >= 40 && sentence.length <= 250
      ? 1.0
      : sentence.length < 40
        ? 0.5
        : 0.7;

  return (
    (wordScore * 0.3 + titleOverlap * 0.4 + positionScore * 0.2) * lengthScore
  );
}

/**
 * Main extractive summarization function
 * Uses TextRank-inspired algorithm
 */
export function extractiveSummarize(
  article: Article,
  maxSentences = 3,
): string {
  // Gather all text
  const rawText = [
    article.description,
    article.content?.replace(/\[\+\d+\s+chars\]/gi, ""),
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  if (!rawText || rawText.length < 50) {
    return article.description ?? article.title;
  }

  // Split into sentences
  const sentences = rawText
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 500);

  if (sentences.length === 0) {
    return article.description ?? article.title;
  }

  if (sentences.length <= maxSentences) {
    return sentences.join(" ");
  }

  // Calculate word scores
  const wordScores = calculateWordScores(sentences);
  const titleWords = new Set(tokenize(article.title));

  // Score each sentence
  const scored = sentences.map((sentence, index) => ({
    sentence,
    score: scoreSentence(
      sentence,
      index,
      sentences.length,
      wordScores,
      titleWords,
    ),
    originalIndex: index,
  }));

  // Select top sentences and restore original order
  const topSentences = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSentences)
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((s) => s.sentence);

  return topSentences.join(" ");
}

/**
 * Extract structured key points from article
 */
export function extractKeyPoints(article: Article): string[] {
  const points: string[] = [];

  // Source and date
  if (article.source?.name) {
    points.push(`📰 Source: ${article.source.name}`);
  }

  if (article.publishedAt) {
    const date = new Date(article.publishedAt).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    points.push(`📅 Published: ${date}`);
  }

  // Extract key entities (capitalized words that appear multiple times)
  const allText = `${article.title} ${article.description ?? ""} ${article.content ?? ""}`;
  const entityPattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\b/g;
  const entityFreq = new Map<string, number>();
  let match;
  while ((match = entityPattern.exec(allText)) !== null) {
    const entity = match[1];
    if (entity.length > 3 && !STOP_WORDS.has(entity.toLowerCase())) {
      entityFreq.set(entity, (entityFreq.get(entity) ?? 0) + 1);
    }
  }

  const topEntities = Array.from(entityFreq.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([entity]) => entity);

  if (topEntities.length > 0) {
    points.push(`🔑 Key entities: ${topEntities.join(", ")}`);
  }

  // Reading time estimate
  const wordCount = allText.split(/\s+/).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));
  points.push(`⏱️ Est. read time: ${readTime} min`);

  return points;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AISummaryProps {
  article: Article;
  compact?: boolean;
}

interface SummaryState {
  summary: string | null;
  keyPoints: string[];
  isLoading: boolean;
  isExpanded: boolean;
  error: string | null;
}

export function AISummary({ article, compact = false }: AISummaryProps) {
  const [state, setState] = useState<SummaryState>({
    summary: null,
    keyPoints: [],
    isLoading: false,
    isExpanded: false,
    error: null,
  });

  // Reset when article changes
  useEffect(() => {
    setState({
      summary: null,
      keyPoints: [],
      isLoading: false,
      isExpanded: false,
      error: null,
    });
  }, [article.url]);

  const generateSummary = useCallback(async () => {
    // If already generated, just toggle expand
    if (state.summary) {
      setState((prev) => ({ ...prev, isExpanded: !prev.isExpanded }));
      return;
    }

    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // Run summarization in a microtask to avoid blocking UI
      await new Promise<void>((resolve) => {
        setTimeout(() => {
          try {
            const summary = extractiveSummarize(article, 3);
            const keyPoints = extractKeyPoints(article);
            setState((prev) => ({
              ...prev,
              summary,
              keyPoints,
              isExpanded: true,
              isLoading: false,
            }));
          } catch (err) {
            setState((prev) => ({
              ...prev,
              error: "Failed to generate summary.",
              isLoading: false,
            }));
            console.error("[AISummary]", err);
          }
          resolve();
        }, 50);
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        error: "Failed to generate summary. Please try again.",
        isLoading: false,
      }));
      console.error("[AISummary] Error:", err);
    }
  }, [article, state.summary]);

  const closeSummary = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setState((prev) => ({ ...prev, isExpanded: false }));
  }, []);

  if (compact) {
    return (
      <button
        onClick={generateSummary}
        disabled={state.isLoading}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-50"
        title="Generate AI Summary"
        aria-label="Generate AI Summary"
      >
        {state.isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5 text-[color:var(--heading)]" />
        )}
        {state.isLoading ? "Summarizing..." : "AI Summary"}
      </button>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/30">
      {/* Header button */}
      <button
        onClick={generateSummary}
        disabled={state.isLoading}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-muted/50 disabled:opacity-50"
        aria-expanded={state.isExpanded}
      >
        <div className="flex items-center gap-2">
          {state.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-[color:var(--heading)]" />
          ) : (
            <Sparkles className="h-4 w-4 text-[color:var(--heading)]" />
          )}
          <span className="text-sm font-medium">
            {state.isLoading
              ? "Generating summary…"
              : state.summary
                ? "AI Summary"
                : "Generate AI Summary"}
          </span>
        </div>
        {state.summary && !state.isLoading && (
          <div className="flex items-center gap-1">
            {state.isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        )}
      </button>

      {/* Error state */}
      {state.error && (
        <div className="border-t border-border px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      {/* Summary content */}
      {state.summary && state.isExpanded && (
        <div className="border-t border-border px-4 py-4 space-y-4">
          {/* Close button */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              TL;DR
            </span>
            <button
              onClick={closeSummary}
              className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close summary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Summary text */}
          <p className="text-sm leading-relaxed text-foreground">
            {state.summary}
          </p>

          {/* Key points */}
          {state.keyPoints.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Key Points
              </p>
              <ul className="space-y-1.5">
                {state.keyPoints.map((point, i) => (
                  <li key={i} className="text-xs text-muted-foreground">
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-muted-foreground/60 italic">
            ✨ Generated using extractive NLP summarization · No API key
            required
          </p>
        </div>
      )}
    </div>
  );
}
