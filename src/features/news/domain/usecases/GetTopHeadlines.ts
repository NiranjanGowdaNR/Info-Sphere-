/**
 * Use Case: Get Top Headlines
 * Business logic for fetching top headlines
 * Follows Single Responsibility and Dependency Inversion principles
 */

import type {
  NewsRepository,
  TopHeadlinesParams,
} from "../repositories/NewsRepository";
import type { NewsResult } from "../entities/Article";

export class GetTopHeadlines {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(params: TopHeadlinesParams): Promise<NewsResult> {
    // Business logic: validate category
    const validCategories = [
      "business",
      "entertainment",
      "general",
      "health",
      "science",
      "sports",
      "technology",
    ];

    // Handle special case for politics category
    if (params.category === "politics") {
      return this.newsRepository.getAllNews({
        ...params,
        language: params.language || "en",
        sortBy: "publishedAt",
      });
    }

    // Validate and normalize category
    const category =
      params.category && validCategories.includes(params.category)
        ? params.category
        : "general";

    return this.newsRepository.getTopHeadlines({
      ...params,
      category,
      country: params.country || "us",
      language: params.language || "en",
    });
  }
}
