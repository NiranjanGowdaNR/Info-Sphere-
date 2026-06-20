/**
 * Video News Integration Component
 * Embeds related YouTube videos for news articles
 *
 * API Support Analysis:
 * - NewsAPI does NOT provide video content
 * - We use YouTube Data API v3 for video search (requires API key)
 * - Without API key: shows a search link to YouTube
 * - With YOUTUBE_API_KEY: fetches and embeds related videos
 *
 * To enable full video integration:
 * 1. Get a YouTube Data API v3 key from Google Cloud Console
 * 2. Add YOUTUBE_API_KEY to your .env file
 * 3. The component will automatically use it
 */

import { useState, useCallback } from "react";
import { Video, ExternalLink, Play, Loader2, AlertCircle } from "lucide-react";
import type { Article } from "@/lib/types";

interface VideoResult {
  id: string;
  title: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
}

interface VideoNewsProps {
  article: Article;
  compact?: boolean;
  maxResults?: number;
}

/**
 * Build YouTube search URL for an article
 */
function buildYouTubeSearchUrl(article: Article): string {
  const query = encodeURIComponent(
    article.title.slice(0, 100).replace(/[^\w\s]/g, " "),
  );
  return `https://www.youtube.com/results?search_query=${query}`;
}

/**
 * Build YouTube embed URL
 */
function buildYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
}

/**
 * Fetch related videos from YouTube Data API
 * Returns null if no API key is configured
 */
async function fetchRelatedVideos(
  article: Article,
  maxResults = 3,
): Promise<VideoResult[] | null> {
  // Check if YouTube API key is available
  // In a real implementation, this would be a server-side API call
  // to protect the API key
  const apiKey =
    typeof window !== "undefined"
      ? (window as Window & { YOUTUBE_API_KEY?: string }).YOUTUBE_API_KEY
      : null;

  if (!apiKey) {
    return null; // No API key, fall back to search link
  }

  const query = article.title.slice(0, 100);
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("q", query);
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", String(maxResults));
  url.searchParams.set("relevanceLanguage", "en");
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = (await response.json()) as {
    items: Array<{
      id: { videoId: string };
      snippet: {
        title: string;
        thumbnails: { medium: { url: string } };
        channelTitle: string;
        publishedAt: string;
      };
    }>;
  };

  return data.items.map((item) => ({
    id: item.id.videoId,
    title: item.snippet.title,
    thumbnail: item.snippet.thumbnails.medium.url,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  }));
}

export function VideoNews({
  article,
  compact = false,
  maxResults = 3,
}: VideoNewsProps) {
  const [videos, setVideos] = useState<VideoResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [noApiKey, setNoApiKey] = useState(false);

  const loadVideos = useCallback(async () => {
    if (videos !== null || isLoading) {
      setIsExpanded(!isExpanded);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await fetchRelatedVideos(article, maxResults);

      if (results === null) {
        // No API key available
        setNoApiKey(true);
        setIsExpanded(true);
      } else {
        setVideos(results);
        setIsExpanded(true);
      }
    } catch (err) {
      setError("Failed to load videos. Please try again.");
      console.error("[VideoNews] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [article, videos, isLoading, isExpanded, maxResults]);

  const youtubeSearchUrl = buildYouTubeSearchUrl(article);

  if (compact) {
    return (
      <a
        href={youtubeSearchUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        title="Watch related videos on YouTube"
      >
        <Video className="h-3.5 w-3.5 text-red-500" />
        Watch Videos
      </a>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-border bg-muted/30">
      <button
        onClick={loadVideos}
        disabled={isLoading}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left transition hover:bg-muted/50 disabled:opacity-50"
      >
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-red-500" />
          ) : (
            <Video className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm font-medium">
            {isLoading
              ? "Loading videos..."
              : isExpanded
                ? "Related Videos"
                : "Watch Related Videos"}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">YouTube</span>
      </button>

      {error && (
        <div className="flex items-center gap-2 border-t border-border px-4 py-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {isExpanded && noApiKey && (
        <div className="border-t border-border px-4 py-4">
          <p className="mb-3 text-sm text-muted-foreground">
            Search for related videos on YouTube:
          </p>
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400 dark:hover:bg-red-950/50"
          >
            <Video className="h-4 w-4" />
            Search on YouTube
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <p className="mt-3 text-xs text-muted-foreground">
            💡 Add a{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              YOUTUBE_API_KEY
            </code>{" "}
            to enable embedded video search
          </p>
        </div>
      )}

      {isExpanded && videos && videos.length > 0 && (
        <div className="border-t border-border px-4 py-4 space-y-3">
          {activeVideo && (
            <div className="mb-4 aspect-video w-full overflow-hidden rounded-lg">
              <iframe
                src={buildYouTubeEmbedUrl(activeVideo)}
                title="Related video"
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="space-y-2">
            {videos.map((video) => (
              <button
                key={video.id}
                onClick={() =>
                  setActiveVideo(activeVideo === video.id ? null : video.id)
                }
                className={`flex w-full items-start gap-3 rounded-lg border p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm ${
                  activeVideo === video.id
                    ? "border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/20"
                    : "border-border bg-background hover:bg-muted/50"
                }`}
              >
                <div className="relative shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="h-16 w-28 rounded object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black/60">
                      <Play className="h-4 w-4 text-white" />
                    </div>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium leading-snug">
                    {video.title}
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {video.channelTitle}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          >
            More on YouTube <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {isExpanded && videos && videos.length === 0 && (
        <div className="border-t border-border px-4 py-4">
          <p className="mb-3 text-sm text-muted-foreground">
            No videos found. Search on YouTube:
          </p>
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[color:var(--heading)] hover:underline"
          >
            Search YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
