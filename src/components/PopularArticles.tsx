import { ExternalLink, Eye, Share2, Trophy } from "lucide-react";
import type { Article } from "@/lib/types";
import type { ArticleEngagement } from "@/lib/local-store";
import { pushHistory, recordArticleView } from "@/lib/local-store";
import { getPopularArticles } from "@/client/services/popular-articles";
import { useWidgetEnabled } from "./DashboardCustomizer";

export function PopularArticles({
  articles,
  engagement,
}: {
  articles: Article[];
  engagement: ArticleEngagement[];
}) {
  const enabled = useWidgetEnabled("popular");
  const popular = getPopularArticles(articles, engagement);

  if (!enabled || popular.length === 0) return null;

  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Trophy className="h-4 w-4 text-[color:var(--heading)]" />
        <h2 className="text-base font-semibold">Popular Articles</h2>
      </div>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
        {popular.map(({ article, views, shares }, index) => (
          <a
            key={article.url}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              pushHistory(article);
              recordArticleView(article);
            }}
            className="flex min-h-28 flex-col justify-between rounded-md border border-border bg-background p-3 transition hover:-translate-y-0.5 hover:bg-muted/50 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-medium">
                {article.title}
              </h3>
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                #{index + 1}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                {views}
              </span>
              <span className="inline-flex items-center gap-1">
                <Share2 className="h-3.5 w-3.5" />
                {shares}
              </span>
              <span className="ml-auto inline-flex items-center gap-1 text-[color:var(--heading)]">
                Open
                <ExternalLink className="h-3.5 w-3.5" />
              </span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
