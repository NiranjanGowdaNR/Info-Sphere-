import { createFileRoute } from "@tanstack/react-router";
import { NewsList } from "@/components/NewsList";

export const Route = createFileRoute("/search/$query")({
  head: ({ params }) => ({
    meta: [
      { title: `Search: ${params?.query} — Info-Sphere` },
      { name: "description", content: `Search results for ${params?.query}.` },
    ],
  }),
  component: SearchPage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center">Error: {error.message}</div>
  ),
});

function SearchPage() {
  const { query } = Route.useParams();
  return (
    <NewsList
      title={`Results for "${query}"`}
      endpoint="/api/search/msg"
      extraParams={{ msg: query }}
    />
  );
}
