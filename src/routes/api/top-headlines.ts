import { createFileRoute } from "@tanstack/react-router";
import { getNewsContainer } from "@/features/news";

export const Route = createFileRoute("/api/top-headlines")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const pageSize = Number(url.searchParams.get("pageSize") ?? 80);
          const category = url.searchParams.get("category") ?? "general";

          const container = getNewsContainer();
          const getTopHeadlinesUseCase = container.getTopHeadlinesUseCase();

          const result = await getTopHeadlinesUseCase.execute({
            page,
            pageSize,
            category,
            language: "en",
          });

          return Response.json(
            {
              status: 200,
              success: true,
              message: "",
              data: result,
            },
            { status: 200 },
          );
        } catch (err) {
          console.error("[/api/top-headlines] error:", err);
          return Response.json(
            {
              status: 500,
              success: false,
              message: (err as Error).message,
              data: { articles: [], totalResults: 0 },
            },
            { status: 500 },
          );
        }
      },
    },
  },
});
