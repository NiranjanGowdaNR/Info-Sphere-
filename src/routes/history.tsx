import { createFileRoute } from "@tanstack/react-router";
import { useHistory } from "@/lib/local-store";
import { NewsCard } from "@/components/NewsCard";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Reading History — Info-Sphere" },
      { name: "description", content: "Recently viewed news articles." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { items, clear } = useHistory();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reading History</h1>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Clear history
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-12 text-center opacity-70">
          No reading history yet. Articles you open will appear here.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a, i) => (
            <NewsCard key={`${a.url}-${i}`} article={a} />
          ))}
        </div>
      )}
    </section>
  );
}
