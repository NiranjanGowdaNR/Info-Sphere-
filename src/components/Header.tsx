import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X, Search, Bookmark, History, Clock3 } from "lucide-react";
import { CATEGORIES, COUNTRIES } from "@/lib/types";
import { formatReadingTime, useReadingTime } from "@/lib/local-store";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeScheduler } from "./ThemeScheduler";
import { WeatherIcon } from "./WeatherIcon";
import { DashboardCustomizer } from "./DashboardCustomizer";
import { AdvancedThemes } from "./AdvancedThemes";

export function Header() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const readingTime = useReadingTime();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setOpen(false);
    navigate({ to: "/search/$query", params: { query } });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="whitespace-nowrap text-2xl font-bold tracking-tight text-[color:var(--heading)]"
          >
            Info<span className="opacity-70">-Sphere</span>
          </Link>
          <WeatherIcon />
        </div>

        <nav className="hidden flex-1 items-center justify-end gap-3 md:flex">
          <form onSubmit={onSearch} className="relative w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search news…"
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </form>

          <select
            onChange={(e) =>
              e.target.value &&
              navigate({
                to: "/top-headlines/$category",
                params: { category: e.target.value },
              })
            }
            value=""
            className="rounded-md border border-border bg-card px-2 py-2 text-sm"
          >
            <option value="">Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>

          <select
            onChange={(e) =>
              e.target.value &&
              navigate({ to: "/country/$iso", params: { iso: e.target.value } })
            }
            value=""
            className="rounded-md border border-border bg-card px-2 py-2 text-sm"
          >
            <option value="">Country</option>
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          <div className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            <span>Read {formatReadingTime(readingTime)}</span>
          </div>

          <ThemeToggle />
          <ThemeScheduler />
          <AdvancedThemes />
          <DashboardCustomizer />
          <Link
            to="/bookmarks"
            aria-label="Bookmarks"
            className="rounded-md border border-border p-2 hover:bg-muted"
          >
            <Bookmark className="h-4 w-4" />
          </Link>
          <Link
            to="/history"
            aria-label="History"
            className="rounded-md border border-border p-2 hover:bg-muted"
          >
            <History className="h-4 w-4" />
          </Link>
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <div className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-card px-2 text-xs text-muted-foreground">
            <Clock3 className="h-3.5 w-3.5" />
            <span>{formatReadingTime(readingTime)}</span>
          </div>
          <ThemeToggle />
          <ThemeScheduler />
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            className="rounded-md border border-border p-2"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <form onSubmit={onSearch} className="relative mb-3">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search news…"
              className="w-full rounded-full border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </form>
          <select
            onChange={(e) => {
              if (e.target.value) {
                setOpen(false);
                navigate({
                  to: "/top-headlines/$category",
                  params: { category: e.target.value },
                });
              }
            }}
            value=""
            className="mb-2 w-full rounded-md border border-border bg-card px-2 py-2 text-sm"
          >
            <option value="">Category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c[0].toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
          <select
            onChange={(e) => {
              if (e.target.value) {
                setOpen(false);
                navigate({
                  to: "/country/$iso",
                  params: { iso: e.target.value },
                });
              }
            }}
            value=""
            className="mb-2 w-full rounded-md border border-border bg-card px-2 py-2 text-sm"
          >
            <option value="">Country</option>
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} {c.name}
              </option>
            ))}
          </select>

          {/* Mobile-only navigation links */}
          <div className="mt-3 flex flex-col gap-2">
            <Link
              to="/bookmarks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
            >
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </Link>
            <Link
              to="/history"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
            >
              <History className="h-4 w-4" />
              History
            </Link>
          </div>

          {/* Mobile-only utility components */}
          <div className="mt-3 flex flex-wrap gap-2">
            <AdvancedThemes />
            <DashboardCustomizer />
            <LanguageSelector />
          </div>
        </div>
      )}
    </header>
  );
}
