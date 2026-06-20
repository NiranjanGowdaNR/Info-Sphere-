import { createFileRoute } from "@tanstack/react-router";
import { NewsList } from "@/components/NewsList";
import { COUNTRIES } from "@/lib/types";

export const Route = createFileRoute("/country/$iso")({
  head: ({ params }) => ({
    meta: [
      { title: `${params?.iso?.toUpperCase()} News — Info-Sphere` },
      {
        name: "description",
        content: `Top headlines from ${params?.iso?.toUpperCase()}.`,
      },
    ],
  }),
  component: CountryPage,
  errorComponent: ({ error }) => (
    <div className="p-12 text-center">Error: {error.message}</div>
  ),
});

function CountryPage() {
  const { iso } = Route.useParams();
  const country = COUNTRIES.find((c) => c.iso === iso.toLowerCase());
  const title = country
    ? `${country.flag} News from ${country.name}`
    : `News from ${iso.toUpperCase()}`;
  return (
    <NewsList title={title} endpoint={`/api/country/${iso.toLowerCase()}`} />
  );
}
