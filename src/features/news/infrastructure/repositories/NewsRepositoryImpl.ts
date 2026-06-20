/**
 * Infrastructure: News Repository Implementation
 * Implements the NewsRepository interface
 * Handles API calls and caching
 */

import type {
  NewsRepository,
  NewsQueryParams,
  TopHeadlinesParams,
  SearchParams,
  CountryNewsParams,
} from "../../domain/repositories/NewsRepository";
import type { Article, NewsResult } from "../../domain/entities/Article";
import { NewsApiClient } from "../api/NewsApiClient";
import { NewsCache } from "../cache/NewsCache";

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STALE_TTL_MS = 60 * 60 * 1000; // 1 hour

/**
 * Implementation of NewsRepository using NewsAPI
 * Follows Repository Pattern and Dependency Inversion
 */
export class NewsRepositoryImpl implements NewsRepository {
  private cache: NewsCache;

  constructor(private readonly apiClient: NewsApiClient) {
    this.cache = new NewsCache();
  }

  async getAllNews(params: NewsQueryParams): Promise<NewsResult> {
    const apiParams: Record<string, string | number> = {
      q: "news",
      language: params.language || "en",
      sortBy: params.sortBy || "publishedAt",
      page: params.page || 1,
      pageSize: params.pageSize || 80,
    };

    return this.fetchWithCache("/everything", apiParams);
  }

  async getTopHeadlines(params: TopHeadlinesParams): Promise<NewsResult> {
    const apiParams: Record<string, string | number> = {
      page: params.page || 1,
      pageSize: params.pageSize || 80,
      language: params.language || "en",
    };

    if (params.category) {
      apiParams.category = params.category;
    }

    if (params.country) {
      apiParams.country = params.country;
    }

    return this.fetchWithCache("/top-headlines", apiParams);
  }

  async searchNews(params: SearchParams): Promise<NewsResult> {
    const apiParams: Record<string, string | number> = {
      q: params.query,
      language: params.language || "en",
      sortBy: params.sortBy || "publishedAt",
      page: params.page || 1,
      pageSize: params.pageSize || 80,
    };

    return this.fetchWithCache("/everything", apiParams);
  }

  async getNewsByCountry(params: CountryNewsParams): Promise<NewsResult> {
    const apiParams: Record<string, string | number> = {
      country: params.countryCode,
      page: params.page || 1,
      pageSize: params.pageSize || 80,
    };

    return this.fetchWithCache("/top-headlines", apiParams);
  }

  /**
   * Fetch data with caching support
   */
  private async fetchWithCache(
    endpoint: string,
    params: Record<string, string | number>,
  ): Promise<NewsResult> {
    const cacheKey = this.cache.createKey(endpoint, params);

    // Try to get from cache
    const cached = this.cache.get(cacheKey, {
      freshTtlMs: CACHE_TTL_MS,
      staleTtlMs: STALE_TTL_MS,
    });

    // Return fresh cache
    if (cached && !cached.metadata.stale) {
      return cached.data;
    }

    try {
      // Fetch from API
      const response = await this.apiClient.get(endpoint, params);

      // Map API response to domain entities
      const result: NewsResult = {
        articles: response.articles as Article[],
        totalResults: response.totalResults,
      };

      // Cache the result
      this.cache.set(cacheKey, result);

      return result;
    } catch (error) {
      // If API fails and we have stale cache, return it
      if (cached) {
        return cached.data;
      }

      // Otherwise, rethrow the error
      throw error;
    }
  }
}
