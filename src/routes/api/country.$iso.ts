import { createFileRoute } from "@tanstack/react-router";
import { getNewsContainer } from "@/features/news";

export const Route = createFileRoute("/api/country/$iso")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          const url = new URL(request.url);
          const page = Number(url.searchParams.get("page") ?? 1);
          const pageSize = Number(url.searchParams.get("pageSize") ?? 80);

          const container = getNewsContainer();
          const getCountryNewsUseCase = container.getCountryNewsUseCase();

          const result = await getCountryNewsUseCase.execute({
            countryCode: params.iso,
            page,
            pageSize,
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
          console.error("[/api/country/$iso] error:", err);
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
