/**
 * Domain Repository Interface: NewsRepository
 * Defines the contract for news data access
 * Implementation details are hidden in the infrastructure layer
 */

import type { Article, NewsResult } from "../entities/Article";

export interface NewsQueryParams {
  page?: number;
  pageSize?: number;
  language?: string;
  sortBy?: string;
}

export interface TopHeadlinesParams extends NewsQueryParams {
  category?: string;
  country?: string;
}

export interface SearchParams extends NewsQueryParams {
  query: string;
}

export interface CountryNewsParams extends NewsQueryParams {
  countryCode: string;
}

/**
 * Repository interface for news operations
 * Follows Repository Pattern and Dependency Inversion Principle
 */
export interface NewsRepository {
  /**
   * Fetch all news articles
   */
  getAllNews(params: NewsQueryParams): Promise<NewsResult>;

  /**
   * Fetch top headlines with optional category/country filters
   */
  getTopHeadlines(params: TopHeadlinesParams): Promise<NewsResult>;

  /**
   * Search news by query string
   */
  searchNews(params: SearchParams): Promise<NewsResult>;

  /**
   * Fetch news by country code
   */
  getNewsByCountry(params: CountryNewsParams): Promise<NewsResult>;
}
