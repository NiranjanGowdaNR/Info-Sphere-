/**
 * Monitoring & Logging Service
 * Centralized error tracking, performance monitoring, and analytics
 * Follows Single Responsibility Principle
 */

export interface ErrorEvent {
  message: string;
  stack?: string;
  url?: string;
  timestamp: number;
  type: "error" | "warning" | "info";
  context?: Record<string, unknown>;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count";
  timestamp: number;
}

export interface UserEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  timestamp: number;
}

const MONITORING_KEY = "info-sphere:monitoring-log";
const MAX_LOG_ENTRIES = 100;

class MonitoringService {
  private errors: ErrorEvent[] = [];
  private metrics: PerformanceMetric[] = [];
  private events: UserEvent[] = [];
  private isEnabled: boolean;

  constructor() {
    this.isEnabled =
      typeof process !== "undefined" && process.env.NODE_ENV !== "test";
    this.loadFromStorage();
    this.setupGlobalErrorHandlers();
  }

  private loadFromStorage(): void {
    try {
      if (typeof window === "undefined") return;
      const stored = localStorage.getItem(MONITORING_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.errors = data.errors || [];
        this.events = data.events || [];
      }
    } catch {
      // Silently fail
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window === "undefined") return;
      const data = {
        errors: this.errors.slice(-MAX_LOG_ENTRIES),
        events: this.events.slice(-MAX_LOG_ENTRIES),
      };
      localStorage.setItem(MONITORING_KEY, JSON.stringify(data));
    } catch {
      // Silently fail
    }
  }

  private setupGlobalErrorHandlers(): void {
    if (typeof window === "undefined") return;

    window.addEventListener("error", (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        timestamp: Date.now(),
        type: "error",
        context: {
          lineno: event.lineno,
          colno: event.colno,
        },
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.captureError({
        message:
          event.reason instanceof Error
            ? event.reason.message
            : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : undefined,
        timestamp: Date.now(),
        type: "error",
        context: { type: "unhandledrejection" },
      });
    });
  }

  captureError(error: ErrorEvent): void {
    if (!this.isEnabled) return;

    this.errors.push(error);
    if (this.errors.length > MAX_LOG_ENTRIES) {
      this.errors = this.errors.slice(-MAX_LOG_ENTRIES);
    }

    // Log to console in development
    if (
      typeof process !== "undefined" &&
      process.env.NODE_ENV === "development"
    ) {
      console.error(`[Monitoring] ${error.type.toUpperCase()}:`, error.message);
    }

    this.saveToStorage();

    // In production, you would send to an external service like Sentry:
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(new Error(error.message));
    // }
  }

  captureMessage(message: string, level: "info" | "warning" = "info"): void {
    this.captureError({
      message,
      timestamp: Date.now(),
      type: level,
    });
  }

  recordMetric(metric: Omit<PerformanceMetric, "timestamp">): void {
    if (!this.isEnabled) return;

    this.metrics.push({ ...metric, timestamp: Date.now() });
    if (this.metrics.length > MAX_LOG_ENTRIES) {
      this.metrics = this.metrics.slice(-MAX_LOG_ENTRIES);
    }
  }

  trackEvent(event: Omit<UserEvent, "timestamp">): void {
    if (!this.isEnabled) return;

    this.events.push({ ...event, timestamp: Date.now() });
    if (this.events.length > MAX_LOG_ENTRIES) {
      this.events = this.events.slice(-MAX_LOG_ENTRIES);
    }

    this.saveToStorage();

    // In production, you would send to analytics:
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', event.action, {
    //     event_category: event.category,
    //     event_label: event.label,
    //     value: event.value,
    //   });
    // }
  }

  measurePerformance(name: string, fn: () => void): void {
    const start = performance.now();
    fn();
    const duration = performance.now() - start;
    this.recordMetric({ name, value: duration, unit: "ms" });
  }

  async measureAsyncPerformance<T>(
    name: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric({ name, value: duration, unit: "ms" });
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric({ name: `${name}_error`, value: duration, unit: "ms" });
      throw error;
    }
  }

  getErrors(): ErrorEvent[] {
    return [...this.errors];
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  getEvents(): UserEvent[] {
    return [...this.events];
  }

  getReport(): {
    errors: ErrorEvent[];
    metrics: PerformanceMetric[];
    events: UserEvent[];
    summary: {
      totalErrors: number;
      totalEvents: number;
      errorRate: number;
    };
  } {
    const totalErrors = this.errors.filter((e) => e.type === "error").length;
    const totalEvents = this.events.length;

    return {
      errors: this.getErrors(),
      metrics: this.getMetrics(),
      events: this.getEvents(),
      summary: {
        totalErrors,
        totalEvents,
        errorRate: totalEvents > 0 ? totalErrors / totalEvents : 0,
      },
    };
  }

  clearLogs(): void {
    this.errors = [];
    this.metrics = [];
    this.events = [];
    this.saveToStorage();
  }

  // Web Vitals tracking
  trackWebVitals(): void {
    if (typeof window === "undefined") return;

    // Track First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          this.recordMetric({
            name: "FCP",
            value: entry.startTime,
            unit: "ms",
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["paint"] });
    } catch {
      // Not supported in all browsers
    }

    // Track Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        this.recordMetric({
          name: "LCP",
          value: lastEntry.startTime,
          unit: "ms",
        });
      }
    });

    try {
      lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });
    } catch {
      // Not supported in all browsers
    }
  }
}

// Export singleton instance
export const monitoring = new MonitoringService();

// Convenience functions
export function captureError(
  error: Error | string,
  context?: Record<string, unknown>,
): void {
  monitoring.captureError({
    message: error instanceof Error ? error.message : error,
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: Date.now(),
    type: "error",
    context,
  });
}

export function trackPageView(page: string): void {
  monitoring.trackEvent({
    action: "page_view",
    category: "navigation",
    label: page,
  });
}

export function trackSearch(query: string): void {
  monitoring.trackEvent({
    action: "search",
    category: "engagement",
    label: query,
  });
}

export function trackArticleRead(articleUrl: string, source: string): void {
  monitoring.trackEvent({
    action: "article_read",
    category: "engagement",
    label: source,
  });
}

export function trackBookmark(action: "add" | "remove"): void {
  monitoring.trackEvent({
    action: `bookmark_${action}`,
    category: "engagement",
  });
}

export function trackShare(platform: string): void {
  monitoring.trackEvent({
    action: "share",
    category: "engagement",
    label: platform,
  });
}
