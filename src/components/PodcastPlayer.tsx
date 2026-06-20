/**
 * Podcast Integration Component
 * Text-to-Speech article reader using Web Speech API
 * Uses natural-sounding voices (female/male) when available
 *
 * API Support Analysis:
 * - NewsAPI does NOT provide podcast/audio content
 * - We implement Text-to-Speech using Web Speech API (browser built-in)
 * - Selects the best available natural voice automatically
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Mic,
  User,
} from "lucide-react";

/* eslint-disable react-refresh/only-export-components */
import type { Article } from "@/lib/types";

interface PodcastPlayerProps {
  article: Article;
  compact?: boolean;
}

interface TTSState {
  isPlaying: boolean;
  isPaused: boolean;
  isMuted: boolean;
  rate: number;
  volume: number;
  progress: number;
  isSupported: boolean;
  voiceName: string;
  voiceGender: "female" | "male" | "unknown";
}

// ─── Voice Selection ──────────────────────────────────────────────────────────

/**
 * Priority list of preferred natural-sounding FEMALE voices
 * Ordered from most to least preferred
 * These are the best natural-sounding female voices available on different platforms
 */
const PREFERRED_FEMALE_VOICES = [
  "Samantha", // macOS/iOS - very natural female voice (DEFAULT)
  "Karen", // macOS Australian female
  "Moira", // macOS Irish female
  "Tessa", // macOS South African female
  "Veena", // macOS Indian female
  "Fiona", // macOS Scottish female
  "Victoria", // macOS female
  "Allison", // macOS female
  "Ava", // macOS female
  "Susan", // macOS female
  "Zira", // Windows female
  "Hazel", // Windows female
  "Google UK English Female", // Chrome female
  "Google US English", // Chrome (usually female)
  "Microsoft Zira", // Windows female
  "Microsoft Hazel", // Windows female
  "en-US-Standard-C", // Google Cloud female
  "en-GB-Standard-A", // Google Cloud female
];

const PREFERRED_MALE_VOICES = [
  "Daniel", // macOS UK - very natural male voice
  "Alex", // macOS US - very natural male voice
  "Tom", // macOS male
  "Fred", // macOS male
  "Oliver", // macOS male
  "Google UK English Male", // Chrome male
  "Microsoft David", // Windows male
  "Microsoft Mark", // Windows male
];

export function getBestVoice(
  voices: SpeechSynthesisVoice[],
  preferFemale = true,
): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;

  const englishVoices = voices.filter(
    (v) => v.lang.startsWith("en") && !v.name.includes("Compact"),
  );

  if (englishVoices.length === 0) return voices[0];

  // Try preferred voices in order
  const preferredList = preferFemale
    ? [...PREFERRED_FEMALE_VOICES, ...PREFERRED_MALE_VOICES]
    : [...PREFERRED_MALE_VOICES, ...PREFERRED_FEMALE_VOICES];

  for (const preferred of preferredList) {
    const found = englishVoices.find((v) =>
      v.name.toLowerCase().includes(preferred.toLowerCase()),
    );
    if (found) return found;
  }

  // Fall back to any non-compact English voice
  return englishVoices[0];
}

function detectVoiceGender(
  voice: SpeechSynthesisVoice,
): "female" | "male" | "unknown" {
  const name = voice.name.toLowerCase();
  const femaleNames = [
    "samantha",
    "karen",
    "moira",
    "tessa",
    "veena",
    "fiona",
    "victoria",
    "allison",
    "ava",
    "susan",
    "zira",
    "hazel",
    "female",
    "woman",
    "girl",
  ];
  const maleNames = [
    "daniel",
    "alex",
    "tom",
    "fred",
    "oliver",
    "david",
    "mark",
    "male",
    "man",
    "guy",
  ];

  if (femaleNames.some((n) => name.includes(n))) return "female";
  if (maleNames.some((n) => name.includes(n))) return "male";
  return "unknown";
}

// ─── Article Text Preparation ─────────────────────────────────────────────────

export function prepareArticleText(article: Article): string {
  const parts: string[] = [];

  parts.push(article.title + ".");

  if (article.source?.name) {
    parts.push(`Reported by ${article.source.name}.`);
  }

  if (article.description) {
    parts.push(article.description);
  }

  if (article.content) {
    const cleanContent = article.content.replace(/\[\+\d+\s+chars\]/gi, "");
    if (cleanContent.trim()) {
      parts.push(cleanContent);
    }
  }

  return parts.join(" ");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PodcastPlayer({
  article,
  compact = false,
}: PodcastPlayerProps) {
  const [state, setState] = useState<TTSState>({
    isPlaying: false,
    isPaused: false,
    isMuted: false,
    rate: 1.0,
    volume: 1.0,
    progress: 0,
    isSupported: false,
    voiceName: "",
    voiceGender: "unknown",
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textRef = useRef<string>("");
  const charIndexRef = useRef<number>(0);
  const selectedVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Initialize and select best voice
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    setState((prev) => ({ ...prev, isSupported: true }));

    const initVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const best = getBestVoice(voices, true); // prefer female voice
        if (best) {
          selectedVoiceRef.current = best;
          setState((prev) => ({
            ...prev,
            voiceName: best.name,
            voiceGender: detectVoiceGender(best),
          }));
        }
      }
    };

    // Voices may load asynchronously
    initVoice();
    window.speechSynthesis.onvoiceschanged = initVoice;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const createUtterance = useCallback(
    (text: string, startChar = 0) => {
      const utterance = new SpeechSynthesisUtterance(text.slice(startChar));
      utterance.rate = state.rate;
      utterance.volume = state.isMuted ? 0 : state.volume;
      utterance.pitch = 1.0;
      utterance.lang = "en-US";

      // Apply selected voice
      if (selectedVoiceRef.current) {
        utterance.voice = selectedVoiceRef.current;
      }

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          charIndexRef.current = startChar + event.charIndex;
          const progress = (charIndexRef.current / text.length) * 100;
          setState((prev) => ({ ...prev, progress: Math.min(progress, 100) }));
        }
      };

      utterance.onend = () => {
        setState((prev) => ({
          ...prev,
          isPlaying: false,
          isPaused: false,
          progress: 100,
        }));
        charIndexRef.current = 0;
      };

      utterance.onerror = (event) => {
        if (event.error !== "interrupted" && event.error !== "canceled") {
          console.error("[PodcastPlayer] TTS error:", event.error);
          setState((prev) => ({
            ...prev,
            isPlaying: false,
            isPaused: false,
          }));
        }
      };

      return utterance;
    },
    [state.rate, state.volume, state.isMuted],
  );

  const play = useCallback(() => {
    if (!window.speechSynthesis) return;

    if (state.isPaused) {
      window.speechSynthesis.resume();
      setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
      return;
    }

    window.speechSynthesis.cancel();
    textRef.current = prepareArticleText(article);
    charIndexRef.current = 0;

    const utterance = createUtterance(textRef.current, 0);
    utteranceRef.current = utterance;

    window.speechSynthesis.speak(utterance);
    setState((prev) => ({
      ...prev,
      isPlaying: true,
      isPaused: false,
      progress: 0,
    }));
  }, [article, state.isPaused, createUtterance]);

  const pause = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.pause();
    setState((prev) => ({ ...prev, isPlaying: false, isPaused: true }));
  }, []);

  const stop = useCallback(() => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    charIndexRef.current = 0;
    setState((prev) => ({
      ...prev,
      isPlaying: false,
      isPaused: false,
      progress: 0,
    }));
  }, []);

  const skipBack = useCallback(() => {
    if (!window.speechSynthesis || !textRef.current) return;
    window.speechSynthesis.cancel();
    const newChar = Math.max(0, charIndexRef.current - 300);
    charIndexRef.current = newChar;

    const utterance = createUtterance(textRef.current, newChar);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
  }, [createUtterance]);

  const skipForward = useCallback(() => {
    if (!window.speechSynthesis || !textRef.current) return;
    window.speechSynthesis.cancel();
    const newChar = Math.min(
      textRef.current.length,
      charIndexRef.current + 300,
    );
    charIndexRef.current = newChar;

    if (newChar >= textRef.current.length) {
      stop();
      return;
    }

    const utterance = createUtterance(textRef.current, newChar);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setState((prev) => ({ ...prev, isPlaying: true, isPaused: false }));
  }, [createUtterance, stop]);

  const toggleMute = useCallback(() => {
    const newMuted = !state.isMuted;
    setState((prev) => ({ ...prev, isMuted: newMuted }));
    if (utteranceRef.current) {
      utteranceRef.current.volume = newMuted ? 0 : state.volume;
    }
  }, [state.isMuted, state.volume]);

  const changeRate = useCallback(
    (newRate: number) => {
      setState((prev) => ({ ...prev, rate: newRate }));
      if (state.isPlaying && textRef.current) {
        window.speechSynthesis.cancel();
        const utterance = createUtterance(
          textRef.current,
          charIndexRef.current,
        );
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    },
    [state.isPlaying, createUtterance],
  );

  const switchVoiceGender = useCallback(() => {
    const voices = window.speechSynthesis.getVoices();
    const preferFemale = state.voiceGender !== "female";
    const best = getBestVoice(voices, preferFemale);
    if (best) {
      selectedVoiceRef.current = best;
      setState((prev) => ({
        ...prev,
        voiceName: best.name,
        voiceGender: detectVoiceGender(best),
      }));

      // Restart if currently playing
      if (state.isPlaying && textRef.current) {
        window.speechSynthesis.cancel();
        const utterance = createUtterance(
          textRef.current,
          charIndexRef.current,
        );
        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [state.voiceGender, state.isPlaying, createUtterance]);

  if (!state.isSupported) {
    return null;
  }

  if (compact) {
    return (
      <button
        onClick={state.isPlaying ? pause : play}
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        title={state.isPlaying ? "Pause reading" : "Listen to article"}
        aria-label={state.isPlaying ? "Pause reading" : "Listen to article"}
      >
        {state.isPlaying ? (
          <Pause className="h-3.5 w-3.5 text-[color:var(--heading)]" />
        ) : (
          <Mic className="h-3.5 w-3.5 text-[color:var(--heading)]" />
        )}
        {state.isPlaying ? "Pause" : "Listen"}
      </button>
    );
  }

  return (
    <div className="mt-3 overflow-hidden rounded-lg border border-border bg-muted/30 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Mic className="h-4 w-4 text-[color:var(--heading)]" />
          <span className="text-sm font-medium">Listen to Article</span>
        </div>
        <div className="flex items-center gap-2">
          {state.voiceName && (
            <span className="text-[10px] text-muted-foreground">
              {state.voiceGender === "female"
                ? "♀"
                : state.voiceGender === "male"
                  ? "♂"
                  : ""}{" "}
              {state.voiceName.split(" ")[0]}
            </span>
          )}
          <button
            onClick={switchVoiceGender}
            className="inline-flex items-center gap-1 rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"
            title="Switch voice"
          >
            <User className="h-3 w-3" />
            Switch voice
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className="h-full rounded-full bg-[color:var(--heading)] transition-all duration-300"
          style={{ width: `${state.progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(state.progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={skipBack}
            disabled={!state.isPlaying && !state.isPaused}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            title="Skip back 300 characters"
            aria-label="Skip back"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          {state.isPlaying ? (
            <button
              onClick={pause}
              className="rounded-md bg-[color:var(--heading)] p-2 text-white transition hover:opacity-90"
              title="Pause"
              aria-label="Pause"
            >
              <Pause className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={play}
              className="rounded-md bg-[color:var(--heading)] p-2 text-white transition hover:opacity-90"
              title={state.isPaused ? "Resume" : "Play"}
              aria-label={state.isPaused ? "Resume" : "Play"}
            >
              <Play className="h-4 w-4" />
            </button>
          )}

          <button
            onClick={stop}
            disabled={!state.isPlaying && !state.isPaused}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            title="Stop"
            aria-label="Stop"
          >
            <Square className="h-4 w-4" />
          </button>

          <button
            onClick={skipForward}
            disabled={!state.isPlaying && !state.isPaused}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40"
            title="Skip forward 300 characters"
            aria-label="Skip forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed control */}
          <select
            value={state.rate}
            onChange={(e) => changeRate(Number(e.target.value))}
            className="rounded border border-border bg-card px-1.5 py-1 text-xs"
            title="Playback speed"
            aria-label="Playback speed"
          >
            <option value={0.75}>0.75×</option>
            <option value={1.0}>1×</option>
            <option value={1.25}>1.25×</option>
            <option value={1.5}>1.5×</option>
            <option value={2.0}>2×</option>
          </select>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
            title={state.isMuted ? "Unmute" : "Mute"}
            aria-label={state.isMuted ? "Unmute" : "Mute"}
          >
            {state.isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
