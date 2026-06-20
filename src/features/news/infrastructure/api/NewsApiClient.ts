/**
 * Infrastructure: News API Client
 * Handles HTTP communication with external News API
 * Isolated from business logic
 */

export interface NewsApiConfig {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export interface NewsApiResponse {
  articles: unknown[];
  totalResults: number;
  message?: string;
}

/**
 * Low-level API client for News API
 * Handles HTTP requests and response parsing
 */
export class NewsApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config: NewsApiConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || "https://newsapi.org/v2";
    this.timeout = config.timeout || 10000;
  }

  /**
   * Make a GET request to the News API
   */
  async get(
    endpoint: string,
    params: Record<string, string | number>,
  ): Promise<NewsApiResponse> {
    const url = new URL(`${this.baseUrl}${endpoint}`);

    // Add query parameters
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
    url.searchParams.set("apiKey", this.apiKey);

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent": "info-sphere/1.0",
        },
      });

      clearTimeout(timeoutId);

      const data = (await response.json()) as NewsApiResponse;

      if (!response.ok) {
        throw new Error(
          data.message || `News API error: ${response.status}`,
        );
      }

      return {
        articles: data.articles || [],
        totalResults: data.totalResults || 0,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Request timeout");
        }
        throw error;
      }

      throw new Error("Unknown error occurred");
    }
  }
}
