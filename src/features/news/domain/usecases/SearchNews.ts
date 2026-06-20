/**
 * Use Case: Search News
 * Business logic for searching news articles
 * Follows Single Responsibility and Dependency Inversion principles
 */

import type { NewsRepository, SearchParams } from "../repositories/NewsRepository";
import type { NewsResult } from "../entities/Article";

export class SearchNews {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(params: SearchParams): Promise<NewsResult> {
    // Business logic: validate query
    if (!params.query || !params.query.trim()) {
      throw new Error("Search query cannot be empty");
    }

    return this.newsRepository.searchNews({
      ...params,
      query: params.query.trim(),
      language: params.language || "en",
      sortBy: params.sortBy || "publishedAt",
    });
  }
}
