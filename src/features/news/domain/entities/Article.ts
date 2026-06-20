/**
 * Domain Entity: Article
 * Core business entity representing a news article
 * Independent of external APIs and frameworks
 */

export interface ArticleSource {
  id: string | null;
  name: string;
}

export interface Article {
  source: ArticleSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResult {
  articles: Article[];
  totalResults: number;
}
