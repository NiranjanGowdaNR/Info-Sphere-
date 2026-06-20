/**
 * Use Case: Get Country News
 * Business logic for fetching news by country
 * Follows Single Responsibility and Dependency Inversion principles
 */

import type {
  NewsRepository,
  CountryNewsParams,
} from "../repositories/NewsRepository";
import type { NewsResult } from "../entities/Article";

export class GetCountryNews {
  constructor(private readonly newsRepository: NewsRepository) {}

  async execute(params: CountryNewsParams): Promise<NewsResult> {
    // Business logic: validate country code
    if (!params.countryCode || params.countryCode.length !== 2) {
      throw new Error("Invalid country code. Must be a 2-letter ISO code.");
    }

    return this.newsRepository.getNewsByCountry({
      ...params,
      countryCode: params.countryCode.toLowerCase(),
    });
  }
}
