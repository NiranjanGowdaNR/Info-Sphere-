import type { Article } from "@/shared/models/news";

export interface ArticleShareLinks {
  copyText: string;
  email: string;
  linkedin: string;
  twitter: string;
  whatsapp: string;
}

export function createArticleShareLinks(article: Article): ArticleShareLinks {
  const text = [article.title, article.description]
    .filter(Boolean)
    .join("\n\n");
  const encodedTitle = encodeURIComponent(article.title);
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(article.url);
  const fullText = `${text}\n\n${article.url}`;

  return {
    copyText: fullText,
    email: `mailto:?subject=${encodedTitle}&body=${encodeURIComponent(fullText)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    whatsapp: `https://web.whatsapp.com/send?text=${encodeURIComponent(fullText)}`,
  };
}
