import { createFileRoute, notFound } from "@tanstack/react-router";
import { NewsList } from "@/components/NewsList";
import { CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/top-headlines/$category")({
  beforeLoad: ({ params }) => {
    if (!(CATEGORIES as readonly string[]).includes(params.category))
      throw notFound();
  },
  head: ({ params }) => ({
    meta: [
      { title: `${params?.category ?? "Top"} Headlines — Info-Sphere` },
      {
        name: "description",
        content: `Top headlines for ${params?.category}.`,
      },
    ],
  }),
  component: TopHeadlinesPage,
  notFoundComponent: () => (
    <div className="p-12 text-center">Unknown category.</div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-12 text-center">Error: {error.message}</div>
  ),
});

function TopHeadlinesPage() {
  const { category } = Route.useParams();
  const title = `${category[0].toUpperCase()}${category.slice(1)} Headlines`;
  return (
    <NewsList
      title={title}
      endpoint="/api/top-headlines"
      extraParams={{ category }}
    />
  );
}
