import { createFileRoute } from "@tanstack/react-router";
import { NewsList } from "@/components/NewsList";
import { TrendingTopics } from "@/components/TrendingTopics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "All News — Info-Sphere" },
      { name: "description", content: "Latest news from around the world." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <TrendingTopics />
      <NewsList title="All News" endpoint="/api/all-news" />
    </>
  );
}
