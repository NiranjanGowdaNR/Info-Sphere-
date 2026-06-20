import type { Article } from "@/shared/models/news";
import type { ArticleEngagement } from "@/client/state/local-store";

export function getPopularArticles(
  articles: Article[],
  engagement: ArticleEngagement[],
) {
  const statsByUrl = new Map(engagement.map((item) => [item.url, item]));

  return articles
    .map((article) => {
      const stats = statsByUrl.get(article.url);
      return {
        article,
        views: stats?.views ?? 0,
        shares: stats?.shares ?? 0,
        score: (stats?.views ?? 0) * 2 + (stats?.shares ?? 0) * 3,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}
