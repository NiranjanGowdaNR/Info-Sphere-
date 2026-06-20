import { createFileRoute } from "@tanstack/react-router";
import { useBookmarks } from "@/lib/local-store";
import { NewsCard } from "@/components/NewsCard";

export const Route = createFileRoute("/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — Info-Sphere" },
      { name: "description", content: "Your saved news articles." },
    ],
  }),
  component: BookmarksPage,
});

function BookmarksPage() {
  const { items, clear } = useBookmarks();
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookmarks</h1>
        {items.length > 0 && (
          <button
            onClick={clear}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Clear all
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <p className="py-12 text-center opacity-70">
          No bookmarks yet. Tap the bookmark icon on any article to save it.
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
