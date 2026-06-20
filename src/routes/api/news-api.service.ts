/**
 * News API Service
 * Centralized service for all news API operations
 * Follows Single Responsibility Principle
 */

import type { NewsApiResponse } from "@/shared/models/news";

export interface NewsApiServiceConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface FetchNewsOptions {
  category?: string;
  country?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}

/**
 * Service class for interacting with News API
 * Implements Repository Pattern for data access
 */
export class NewsApiService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: NewsApiServiceConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://newsapi.org/v2";
    this.timeout = config.timeout || 10000;
  }

  /**
   * Fetch all news articles
   */
  async fetchAllNews(options: FetchNewsOptions = {}): Promise<NewsApiResponse> {
    const params = this.buildQueryParams(options);
    return this.makeRequest(`${this.baseUrl}/everything`, params);
  }

  /**
   * Fetch top headlines
   */
  async fetchTopHeadlines(
    options: FetchNewsOptions = {},
  ): Promise<NewsApiResponse> {
    const params = this.buildQueryParams(options);
    return this.makeRequest(`${this.baseUrl}/top-headlines`, params);
  }

  /**
   * Search news by query
   */
  async searchNews(
    query: string,
    options: FetchNewsOptions = {},
  ): Promise<NewsApiResponse> {
    const params = this.buildQueryParams({ ...options, query });
    return this.makeRequest(`${this.baseUrl}/everything`, params);
  }

  /**
   * Fetch news by country
   */
  async fetchNewsByCountry(
    country: string,
    options: FetchNewsOptions = {},
  ): Promise<NewsApiResponse> {
    const params = this.buildQueryParams({ ...options, country });
    return this.makeRequest(`${this.baseUrl}/top-headlines`, params);
  }

  /**
   * Build query parameters for API request
   */
  private buildQueryParams(options: FetchNewsOptions): URLSearchParams {
    const params = new URLSearchParams();
    params.set("apiKey", this.apiKey);

    if (options.category) params.set("category", options.category);
    if (options.country) params.set("country", options.country);
    if (options.query) params.set("q", options.query);
    if (options.page) params.set("page", String(options.page));
    if (options.pageSize) params.set("pageSize", String(options.pageSize));

    return params;
  }

  /**
   * Make HTTP request to News API
   */
  private async makeRequest(
    url: string,
    params: URLSearchParams,
  ): Promise<NewsApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${url}?${params.toString()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return {
        status: response.status,
        success: true,
        message: "Success",
        data: {
          articles: data.articles || [],
          totalResults: data.totalResults || 0,
        },
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }
}
