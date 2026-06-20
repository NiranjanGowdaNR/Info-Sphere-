import { createFileRoute } from "@tanstack/react-router";
import { getNewsContainer } from "@/features/news";

export const Route = createFileRoute("/api/search/msg")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const pageSize = Number(url.searchParams.get("pageSize") ?? 80);
          const msg = url.searchParams.get("msg") ?? "";

          if (!msg.trim()) {
            return Response.json(
              {
                status: 400,
                success: false,
                message: "msg query parameter is required",
                data: { articles: [], totalResults: 0 },
              },
              { status: 400 },
            );
          }

          const container = getNewsContainer();
          const searchNewsUseCase = container.getSearchNewsUseCase();

          const result = await searchNewsUseCase.execute({
            query: msg,
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
          console.error("[/api/search/msg] error:", err);
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
