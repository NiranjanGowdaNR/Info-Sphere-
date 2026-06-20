/**
 * Database Integration Layer
 * Provides a unified interface for data persistence
 * Currently uses localStorage as the storage backend
 * Can be swapped for a real database (SQLite, PostgreSQL, etc.)
 *
 * Architecture: Repository Pattern with pluggable backends
 */

export interface DatabaseRecord {
  id: string;
  createdAt: number;
  updatedAt: number;
  [key: string]: unknown;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDir?: "asc" | "desc";
  where?: Record<string, unknown>;
}

export interface DatabaseAdapter {
  get<T>(collection: string, id: string): Promise<T | null>;
  getAll<T>(collection: string, options?: QueryOptions): Promise<T[]>;
  set<T>(collection: string, id: string, data: T): Promise<void>;
  delete(collection: string, id: string): Promise<void>;
  clear(collection: string): Promise<void>;
  count(collection: string): Promise<number>;
}

/**
 * LocalStorage Database Adapter
 * Implements DatabaseAdapter using browser localStorage
 * Suitable for client-side persistence without a backend
 */
class LocalStorageAdapter implements DatabaseAdapter {
  private prefix = "info-sphere:db:";

  private getKey(collection: string): string {
    return `${this.prefix}${collection}`;
  }

  private readCollection<T>(collection: string): Map<string, T> {
    try {
      if (typeof window === "undefined") return new Map();
      const raw = localStorage.getItem(this.getKey(collection));
      if (!raw) return new Map();
      const entries = JSON.parse(raw) as [string, T][];
      return new Map(entries);
    } catch {
      return new Map();
    }
  }

  private writeCollection<T>(collection: string, data: Map<string, T>): void {
    try {
      if (typeof window === "undefined") return;
      const entries = Array.from(data.entries());
      localStorage.setItem(this.getKey(collection), JSON.stringify(entries));
      window.dispatchEvent(
        new CustomEvent(`ls:db:${collection}`, { detail: "updated" }),
      );
    } catch (err) {
      console.error(
        `[Database] Failed to write collection ${collection}:`,
        err,
      );
    }
  }

  async get<T>(collection: string, id: string): Promise<T | null> {
    const data = this.readCollection<T>(collection);
    return data.get(id) ?? null;
  }

  async getAll<T>(collection: string, options?: QueryOptions): Promise<T[]> {
    const data = this.readCollection<T>(collection);
    let results = Array.from(data.values());

    // Apply where filter
    if (options?.where) {
      results = results.filter((item) => {
        const record = item as Record<string, unknown>;
        return Object.entries(options.where!).every(
          ([key, value]) => record[key] === value,
        );
      });
    }

    // Apply ordering
    if (options?.orderBy) {
      const field = options.orderBy;
      const dir = options.orderDir === "desc" ? -1 : 1;
      results.sort((a, b) => {
        const aVal = (a as Record<string, unknown>)[field];
        const bVal = (b as Record<string, unknown>)[field];
        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * dir;
        }
        return String(aVal).localeCompare(String(bVal)) * dir;
      });
    }

    // Apply pagination
    const offset = options?.offset ?? 0;
    const limit = options?.limit;
    if (limit !== undefined) {
      results = results.slice(offset, offset + limit);
    } else if (offset > 0) {
      results = results.slice(offset);
    }

    return results;
  }

  async set<T>(collection: string, id: string, data: T): Promise<void> {
    const existing = this.readCollection<T>(collection);
    existing.set(id, {
      ...data,
      id,
      updatedAt: Date.now(),
      createdAt: (existing.get(id) as DatabaseRecord)?.createdAt ?? Date.now(),
    } as T);
    this.writeCollection(collection, existing);
  }

  async delete(collection: string, id: string): Promise<void> {
    const data = this.readCollection(collection);
    data.delete(id);
    this.writeCollection(collection, data);
  }

  async clear(collection: string): Promise<void> {
    this.writeCollection(collection, new Map());
  }

  async count(collection: string): Promise<number> {
    const data = this.readCollection(collection);
    return data.size;
  }
}

/**
 * Database Service
 * High-level interface for database operations
 * Wraps the adapter with additional functionality
 */
class DatabaseService {
  private adapter: DatabaseAdapter;

  constructor(adapter: DatabaseAdapter) {
    this.adapter = adapter;
  }

  // ─── User Preferences ──────────────────────────────────────────────────────

  async savePreference(key: string, value: unknown): Promise<void> {
    await this.adapter.set("preferences", key, {
      key,
      value,
      updatedAt: Date.now(),
    });
  }

  async getPreference<T>(key: string, defaultValue: T): Promise<T> {
    const record = await this.adapter.get<{ value: T }>("preferences", key);
    return record?.value ?? defaultValue;
  }

  // ─── Search History ─────────────────────────────────────────────────────────

  async saveSearchQuery(query: string): Promise<void> {
    const id = `search_${Date.now()}`;
    await this.adapter.set("search_history", id, {
      id,
      query,
      timestamp: Date.now(),
    });

    // Keep only last 50 searches
    const all = await this.adapter.getAll<{ id: string; timestamp: number }>(
      "search_history",
      { orderBy: "timestamp", orderDir: "desc" },
    );
    if (all.length > 50) {
      const toDelete = all.slice(50);
      for (const item of toDelete) {
        await this.adapter.delete("search_history", item.id);
      }
    }
  }

  async getSearchHistory(
    limit = 10,
  ): Promise<Array<{ id: string; query: string; timestamp: number }>> {
    return this.adapter.getAll("search_history", {
      orderBy: "timestamp",
      orderDir: "desc",
      limit,
    });
  }

  async clearSearchHistory(): Promise<void> {
    await this.adapter.clear("search_history");
  }

  // ─── Reading Stats ──────────────────────────────────────────────────────────

  async saveReadingStats(stats: {
    date: string;
    articlesRead: number;
    totalTimeSeconds: number;
    topCategories: string[];
  }): Promise<void> {
    await this.adapter.set("reading_stats", stats.date, stats);
  }

  async getReadingStats(days = 7): Promise<
    Array<{
      date: string;
      articlesRead: number;
      totalTimeSeconds: number;
      topCategories: string[];
    }>
  > {
    const all = await this.adapter.getAll<{
      date: string;
      articlesRead: number;
      totalTimeSeconds: number;
      topCategories: string[];
      updatedAt: number;
    }>("reading_stats", {
      orderBy: "updatedAt",
      orderDir: "desc",
      limit: days,
    });
    return all;
  }

  // ─── Saved Filters ──────────────────────────────────────────────────────────

  async saveFilter(
    name: string,
    filter: Record<string, unknown>,
  ): Promise<void> {
    const id = `filter_${name.toLowerCase().replace(/\s+/g, "_")}`;
    await this.adapter.set("saved_filters", id, {
      id,
      name,
      filter,
      createdAt: Date.now(),
    });
  }

  async getSavedFilters(): Promise<
    Array<{ id: string; name: string; filter: Record<string, unknown> }>
  > {
    return this.adapter.getAll("saved_filters", {
      orderBy: "createdAt",
      orderDir: "desc",
    });
  }

  async deleteFilter(id: string): Promise<void> {
    await this.adapter.delete("saved_filters", id);
  }

  // ─── Generic CRUD ───────────────────────────────────────────────────────────

  async create<T extends Record<string, unknown>>(
    collection: string,
    data: T,
  ): Promise<string> {
    const id = `${collection}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await this.adapter.set(collection, id, { ...data, id });
    return id;
  }

  async read<T>(collection: string, id: string): Promise<T | null> {
    return this.adapter.get<T>(collection, id);
  }

  async update<T extends Record<string, unknown>>(
    collection: string,
    id: string,
    data: Partial<T>,
  ): Promise<void> {
    const existing = await this.adapter.get<T>(collection, id);
    if (!existing) throw new Error(`Record ${id} not found in ${collection}`);
    await this.adapter.set(collection, id, { ...existing, ...data });
  }

  async remove(collection: string, id: string): Promise<void> {
    await this.adapter.delete(collection, id);
  }

  async list<T>(collection: string, options?: QueryOptions): Promise<T[]> {
    return this.adapter.getAll<T>(collection, options);
  }

  async count(collection: string): Promise<number> {
    return this.adapter.count(collection);
  }
}

// Export singleton database instance
const adapter = new LocalStorageAdapter();
export const db = new DatabaseService(adapter);

// Export classes for external use
export { LocalStorageAdapter };
