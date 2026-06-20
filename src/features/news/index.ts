/**
 * News Feature Module
 * Public API for the news feature
 * Exports only what's needed by other parts of the application
 */

// Domain Entities
export type { Article, ArticleSource, NewsResult } from "./domain/entities/Article";

// Domain Repository Interface
export type {
  NewsRepository,
  NewsQueryParams,
  TopHeadlinesParams,
  SearchParams,
  CountryNewsParams,
} from "./domain/repositories/NewsRepository";

// Use Cases
export { GetAllNews } from "./domain/usecases/GetAllNews";
export { GetTopHeadlines } from "./domain/usecases/GetTopHeadlines";
export { SearchNews } from "./domain/usecases/SearchNews";
export { GetCountryNews } from "./domain/usecases/GetCountryNews";

// Dependency Injection
export { NewsContainer, getNewsContainer } from "./di/container";
