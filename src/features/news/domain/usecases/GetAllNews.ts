/**
 * Use Case: Get All News
 * Business logic for fetching all news articles
 * Follows Single Responsibility and Dependency Inversion principles
 */

import type {
  NewsRepository,
  NewsQueryParams,
} from "../repositories/NewsRepository";
import type { NewsResult } from "../entities/Article";

export class GetAllNews {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(params: NewsQueryParams = {}): Promise<NewsResult> {
    return this.newsRepository.getAllNews({
      ...params,
      language: params.language || "en",
      sortBy: params.sortBy || "publishedAt",
    });
  }
}
