import { useMemo, useState, useEffect } from "react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Copy,
  Clock3,
  ExternalLink,
  Linkedin,
  Mail,
  MessageCircle,
  Share2,
  Twitter,
  Languages,
} from "lucide-react";
import type { Article } from "@/lib/types";
import { estimateReadMinutes } from "@/client/services/read-time";
import { createArticleShareLinks } from "@/client/services/share";
import {
  pushHistory,
  recordArticleShare,
  recordArticleView,
  useBookmarks,
} from "@/lib/local-store";
import {
  translateArticle,
  getPreferredLanguage,
} from "@/client/services/translation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AISummary } from "./AISummary";
import { PodcastPlayer } from "./PodcastPlayer";
import { VideoNews } from "./VideoNews";
import { NewsComparison } from "./NewsComparison";

const FALLBACK = "https://placehold.co/600x400/0a1e3f/93c5fd?text=Info-Sphere";

export function NewsCard({ article }: { article: Article }) {
  const { isBookmarked, toggle } = useBookmarks();
  const [copied, setCopied] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState(article.title);
  const [translatedDesc, setTranslatedDesc] = useState(article.description);
  const [isTranslating, setIsTranslating] = useState(false);
  const saved = isBookmarked(article.url);
  const desc = (translatedDesc ?? "").slice(0, 200);
  const readMinutes = estimateReadMinutes(article);
  const date = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";
  const share = useMemo(() => createArticleShareLinks(article), [article]);

  // Handle translation when language changes
  useEffect(() => {
    const preferredLang = getPreferredLanguage();
    if (preferredLang !== "en") {
      setIsTranslating(true);
      translateArticle(
        article.title,
        article.description,
        article.content,
        preferredLang,
      )
        .then((translated) => {
          setTranslatedTitle(translated.title);
          setTranslatedDesc(translated.description);
        })
        .finally(() => setIsTranslating(false));
    } else {
      setTranslatedTitle(article.title);
      setTranslatedDesc(article.description);
    }

    const handleLanguageChange = () => {
      const newLang = getPreferredLanguage();
      if (newLang !== "en") {
        setIsTranslating(true);
        translateArticle(
          article.title,
          article.description,
          article.content,
          newLang,
        )
          .then((translated) => {
            setTranslatedTitle(translated.title);
            setTranslatedDesc(translated.description);
          })
          .finally(() => setIsTranslating(false));
      } else {
        setTranslatedTitle(article.title);
        setTranslatedDesc(article.description);
      }
    };

    window.addEventListener(
      "ls:info-sphere:preferred-language",
      handleLanguageChange,
    );
    return () => {
      window.removeEventListener(
        "ls:info-sphere:preferred-language",
        handleLanguageChange,
      );
    };
  }, [article]);

  const openShareUrl = (url: string) => {
    recordArticleShare(article);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const copyArticle = async () => {
    recordArticleShare(article);
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(share.copyText);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = share.copyText;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.append(textArea);
      textArea.select();
      document.execCommand("copy");
      textArea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg w-full">
      <div className="aspect-[16/9] overflow-hidden bg-muted w-full">
        <img
          src={article.urlToImage || FALLBACK}
          alt={article.title}
          loading="lazy"
          onError={(e) =>
            ((e.currentTarget as HTMLImageElement).src = FALLBACK)
          }
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
            {isTranslating ? (
              <span className="inline-flex items-center gap-2">
                <Languages className="h-4 w-4 animate-pulse" />
                {translatedTitle}
              </span>
            ) : (
              translatedTitle
            )}
          </h3>
          <button
            onClick={() => toggle(article)}
            aria-label={saved ? "Remove bookmark" : "Add bookmark"}
            className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 hover:bg-muted"
          >
            {saved ? (
              <BookmarkCheck className="h-4 w-4 text-[color:var(--heading)]" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>
        {desc && (
          <p className="line-clamp-3 text-sm opacity-80">
            {desc}
            {(article.description?.length ?? 0) > 200 ? "…" : ""}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-2 text-xs opacity-70">
          {article.author && <span>By {article.author}</span>}
          {article.source?.name && <span>· {article.source.name}</span>}
          {date && <span>· {date}</span>}
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" />
            {readMinutes} min read
          </span>
        </div>
        {/* Podcast Player - Listen to article */}
        <PodcastPlayer article={article} />

        {/* AI Summary - expandable panel */}
        <AISummary article={article} />

        {/* News Comparison - expandable panel */}
        <NewsComparison article={article} />

        {/* Quick action buttons for video */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <VideoNews article={article} compact />
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              pushHistory(article);
              recordArticleView(article);
            }}
            className="inline-flex w-fit items-center gap-1 text-sm font-medium text-[color:var(--heading)] hover:underline"
          >
            Read Full Article <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Share article"
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => openShareUrl(share.twitter)}>
                <Twitter className="h-4 w-4" />
                Twitter
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openShareUrl(share.linkedin)}>
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openShareUrl(share.email)}>
                <Mail className="h-4 w-4" />
                Email
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => openShareUrl(share.whatsapp)}>
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={copyArticle}>
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copied ? "Copied" : "Copy Content"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </article>
  );
}
