import { createFileRoute } from "@tanstack/react-router";
import { getNewsContainer } from "@/features/news";

export const Route = createFileRoute("/api/all-news")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const pageSize = Number(url.searchParams.get("pageSize") ?? 80);

          const container = getNewsContainer();
          const getAllNewsUseCase = container.getAllNewsUseCase();

          const result = await getAllNewsUseCase.execute({
            page,
            pageSize,
            language: "en",
            sortBy: "publishedAt",
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
          console.error("[/api/all-news] error:", err);
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
