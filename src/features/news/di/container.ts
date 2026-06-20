/**
 * Dependency Injection Container
 * Manages dependencies and provides instances
 * Follows Dependency Inversion Principle
 */

import { NewsApiClient } from "../infrastructure/api/NewsApiClient";
import { NewsRepositoryImpl } from "../infrastructure/repositories/NewsRepositoryImpl";
import { GetAllNews } from "../domain/usecases/GetAllNews";
import { GetTopHeadlines } from "../domain/usecases/GetTopHeadlines";
import { SearchNews } from "../domain/usecases/SearchNews";
import { GetCountryNews } from "../domain/usecases/GetCountryNews";
import type { NewsRepository } from "../domain/repositories/NewsRepository";

/**
 * Dependency Injection Container for News Feature
 * Centralizes dependency creation and management
 */
export class NewsContainer {
  private static instance: NewsContainer;
  private newsRepository: NewsRepository;

  private constructor() {
    // Initialize API Client
    const apiKey = process.env.NEWS_API_KEY || "";
    const apiClient = new NewsApiClient({
      apiKey,
      baseUrl: "https://newsapi.org/v2",
      timeout: 10000,
    });

    // Initialize Repository
    this.newsRepository = new NewsRepositoryImpl(apiClient);
  }

  /**
   * Get singleton instance
   */
  static getInstance(): NewsContainer {
    if (!NewsContainer.instance) {
      NewsContainer.instance = new NewsContainer();
    }
    return NewsContainer.instance;
  }

  /**
   * Get GetAllNews use case
   */
  getAllNewsUseCase(): GetAllNews {
    return new GetAllNews(this.newsRepository);
  }

  /**
   * Get GetTopHeadlines use case
   */
  getTopHeadlinesUseCase(): GetTopHeadlines {
    return new GetTopHeadlines(this.newsRepository);
  }

  /**
   * Get SearchNews use case
   */
  getSearchNewsUseCase(): SearchNews {
    return new SearchNews(this.newsRepository);
  }

  /**
   * Get GetCountryNews use case
   */
  getCountryNewsUseCase(): GetCountryNews {
    return new GetCountryNews(this.newsRepository);
  }

  /**
   * Get repository instance (for testing or advanced use)
   */
  getRepository(): NewsRepository {
    return this.newsRepository;
  }
}

/**
 * Helper function to get container instance
 */
export function getNewsContainer(): NewsContainer {
  return NewsContainer.getInstance();
}
