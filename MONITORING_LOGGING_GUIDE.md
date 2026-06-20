# 📊 Monitoring & Logging Guide - Info Sphere

This comprehensive guide explains how to implement, configure, and use monitoring and logging in Info Sphere for production applications.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Built-in Monitoring System](#built-in-monitoring-system)
3. [Logger Utility](#logger-utility)
4. [Error Tracking](#error-tracking)
5. [Performance Monitoring](#performance-monitoring)
6. [User Analytics](#user-analytics)
7. [External Services Integration](#external-services-integration)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

---

## Overview

Info Sphere includes a comprehensive monitoring and logging system that tracks:

- ✅ **Errors & Exceptions** - Automatic error capture and reporting
- ✅ **Performance Metrics** - Page load times, API response times, Web Vitals
- ✅ **User Events** - Page views, searches, bookmarks, shares
- ✅ **Application Logs** - Debug, info, warn, and error logs
- ✅ **Web Vitals** - FCP, LCP, and other performance indicators

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  (Components, Services, API Routes)                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  MONITORING SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Logger     │  │  Monitoring  │  │ Error Capture│      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    STORAGE & EXPORT                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ LocalStorage │  │   Console    │  │   External   │      │
│  │              │  │              │  │   Services   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Built-in Monitoring System

### Location

- **File**: `src/lib/monitoring.ts`
- **Type**: Singleton service
- **Storage**: LocalStorage (client-side)

### Features

#### 1. Error Tracking

Automatically captures:

- JavaScript errors
- Unhandled promise rejections
- Custom error events
- Error context and stack traces

#### 2. Performance Metrics

Tracks:

- Function execution time
- API response times
- Web Vitals (FCP, LCP)
- Custom performance markers

#### 3. User Events

Monitors:

- Page views
- Search queries
- Article reads
- Bookmarks (add/remove)
- Social shares

### Basic Usage

```typescript
import { monitoring } from "@/lib/monitoring";

// Track an error
monitoring.captureError({
  message: "Failed to load news",
  type: "error",
  timestamp: Date.now(),
  context: { category: "technology" },
});

// Track a performance metric
monitoring.recordMetric({
  name: "api_response_time",
  value: 250,
  unit: "ms",
});

// Track a user event
monitoring.trackEvent({
  action: "article_read",
  category: "engagement",
  label: "BBC News",
});

// Get monitoring report
const report = monitoring.getReport();
console.log("Total Errors:", report.summary.totalErrors);
console.log("Error Rate:", report.summary.errorRate);
```

### Convenience Functions

```typescript
import {
  captureError,
  trackPageView,
  trackSearch,
  trackArticleRead,
  trackBookmark,
  trackShare,
} from "@/lib/monitoring";

// Track errors
try {
  // Your code
} catch (error) {
  captureError(error, { context: "additional info" });
}

// Track page views
trackPageView("/top-headlines/technology");

// Track searches
trackSearch("artificial intelligence");

// Track article interactions
trackArticleRead("https://example.com/article", "TechCrunch");
trackBookmark("add");
trackShare("twitter");
```

### Performance Measurement

```typescript
import { monitoring } from "@/lib/monitoring";

// Measure synchronous function
monitoring.measurePerformance("data_processing", () => {
  // Your synchronous code
  processData();
});

// Measure async function
const result = await monitoring.measureAsyncPerformance(
  "api_call",
  async () => {
    return await fetch("/api/news");
  },
);
```

### Web Vitals Tracking

```typescript
import { monitoring } from "@/lib/monitoring";

// Initialize Web Vitals tracking
monitoring.trackWebVitals();

// Metrics tracked:
// - FCP (First Contentful Paint)
// - LCP (Largest Contentful Paint)
```

---

## Logger Utility

### Location

- **File**: `src/lib/logger.ts`
- **Type**: Singleton service
- **Output**: Console (development), Silent (production)

### Log Levels

```typescript
export enum LogLevel {
  DEBUG = 0, // Detailed debugging information
  INFO = 1, // General informational messages
  WARN = 2, // Warning messages
  ERROR = 3, // Error messages
  NONE = 4, // Disable all logging
}
```

### Usage

```typescript
import { logger, LogLevel } from "@/lib/logger";

// Set log level (optional)
logger.setLevel(LogLevel.DEBUG);

// Debug logs (development only)
logger.debug("Fetching news articles", { category: "tech" });

// Info logs
logger.info("User logged in", { userId: "123" });

// Warning logs
logger.warn("API rate limit approaching", { remaining: 10 });

// Error logs
logger.error("Failed to fetch news", error, { endpoint: "/api/news" });

// Grouped logs
logger.group("API Request");
logger.info("Endpoint: /api/top-headlines");
logger.info("Method: GET");
logger.groupEnd();

// Table logs (development only)
logger.table([
  { name: "Article 1", views: 100 },
  { name: "Article 2", views: 250 },
]);
```

### Environment-Based Logging

```typescript
// Development: All logs visible
// Production: Only WARN and ERROR logs

// Automatically configured based on NODE_ENV
const isDevelopment = process.env.NODE_ENV === "development";
```

---

## Error Tracking

### Automatic Error Capture

The monitoring system automatically captures:

1. **Global JavaScript Errors**

```typescript
// Automatically captured
throw new Error("Something went wrong");
```

2. **Unhandled Promise Rejections**

```typescript
// Automatically captured
Promise.reject("Failed to load data");
```

3. **Custom Errors**

```typescript
import { captureError } from "@/lib/monitoring";

try {
  await fetchNews();
} catch (error) {
  captureError(error, {
    component: "NewsList",
    action: "fetchNews",
  });
}
```

### Error Context

Add context to errors for better debugging:

```typescript
monitoring.captureError({
  message: "API request failed",
  type: "error",
  timestamp: Date.now(),
  context: {
    endpoint: "/api/top-headlines",
    method: "GET",
    statusCode: 500,
    userId: "user123",
    category: "technology",
  },
});
```

### Error Reporting

```typescript
// Get all errors
const errors = monitoring.getErrors();

// Filter by type
const criticalErrors = errors.filter((e) => e.type === "error");

// Get error report
const report = monitoring.getReport();
console.log("Total Errors:", report.summary.totalErrors);
console.log("Error Rate:", report.summary.errorRate);
```

---

## Performance Monitoring

### Built-in Performance Tracking

```typescript
import { monitoring } from "@/lib/monitoring";

// Track API response time
const startTime = performance.now();
const response = await fetch("/api/news");
const duration = performance.now() - startTime;

monitoring.recordMetric({
  name: "api_response_time",
  value: duration,
  unit: "ms",
});
```

### Performance Utilities

```typescript
// Measure function performance
monitoring.measurePerformance("render_news_list", () => {
  renderNewsList(articles);
});

// Measure async operations
const data = await monitoring.measureAsyncPerformance(
  "fetch_top_headlines",
  async () => {
    return await fetchTopHeadlines();
  },
);
```

### Web Vitals

```typescript
// Initialize Web Vitals tracking
monitoring.trackWebVitals();

// Metrics automatically tracked:
// - First Contentful Paint (FCP)
// - Largest Contentful Paint (LCP)

// Get metrics
const metrics = monitoring.getMetrics();
const fcpMetric = metrics.find((m) => m.name === "FCP");
const lcpMetric = metrics.find((m) => m.name === "LCP");

console.log("FCP:", fcpMetric?.value, "ms");
console.log("LCP:", lcpMetric?.value, "ms");
```

### Custom Performance Markers

```typescript
// Mark start
performance.mark("news-fetch-start");

// Your code
await fetchNews();

// Mark end
performance.mark("news-fetch-end");

// Measure
performance.measure("news-fetch", "news-fetch-start", "news-fetch-end");

// Get measurement
const measure = performance.getEntriesByName("news-fetch")[0];
monitoring.recordMetric({
  name: "news_fetch_duration",
  value: measure.duration,
  unit: "ms",
});
```

---

## User Analytics

### Page View Tracking

```typescript
import { trackPageView } from "@/lib/monitoring";

// Track page views
trackPageView("/");
trackPageView("/top-headlines/technology");
trackPageView("/search/artificial-intelligence");
```

### User Interaction Tracking

```typescript
import {
  trackSearch,
  trackArticleRead,
  trackBookmark,
  trackShare,
} from "@/lib/monitoring";

// Track search
trackSearch("climate change");

// Track article read
trackArticleRead("https://example.com/article", "BBC News");

// Track bookmarks
trackBookmark("add");
trackBookmark("remove");

// Track shares
trackShare("twitter");
trackShare("facebook");
trackShare("linkedin");
```

### Custom Events

```typescript
import { monitoring } from "@/lib/monitoring";

// Track custom events
monitoring.trackEvent({
  action: "theme_changed",
  category: "settings",
  label: "dark_mode",
  value: 1,
});

monitoring.trackEvent({
  action: "language_changed",
  category: "settings",
  label: "es",
  value: 1,
});

monitoring.trackEvent({
  action: "filter_applied",
  category: "engagement",
  label: "source:bbc",
  value: 1,
});
```

### Analytics Report

```typescript
// Get all events
const events = monitoring.getEvents();

// Get report
const report = monitoring.getReport();

console.log("Total Events:", report.summary.totalEvents);
console.log("Recent Events:", report.events.slice(-10));

// Analyze user behavior
const pageViews = events.filter((e) => e.action === "page_view");
const searches = events.filter((e) => e.action === "search");
const bookmarks = events.filter((e) => e.action.startsWith("bookmark_"));

console.log("Page Views:", pageViews.length);
console.log("Searches:", searches.length);
console.log("Bookmarks:", bookmarks.length);
```

---

## External Services Integration

### 1. Sentry (Error Tracking)

#### Installation

```bash
npm install @sentry/react
```

#### Configuration

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [new Sentry.BrowserTracing(), new Sentry.Replay()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export default Sentry;
```

#### Integration with Monitoring

```typescript
// src/lib/monitoring.ts
import Sentry from './sentry';

captureError(error: ErrorEvent): void {
  // ... existing code ...

  // Send to Sentry
  if (typeof window !== 'undefined' && error.type === 'error') {
    Sentry.captureException(new Error(error.message), {
      contexts: {
        custom: error.context
      },
      tags: {
        type: error.type
      }
    });
  }
}
```

### 2. Google Analytics

#### Installation

```bash
npm install react-ga4
```

#### Configuration

```typescript
// src/lib/analytics.ts
import ReactGA from "react-ga4";

export function initializeAnalytics() {
  ReactGA.initialize("G-XXXXXXXXXX");
}

export function trackPageView(page: string) {
  ReactGA.send({ hitType: "pageview", page });
}

export function trackEvent(
  category: string,
  action: string,
  label?: string,
  value?: number,
) {
  ReactGA.event({
    category,
    action,
    label,
    value,
  });
}
```

#### Integration with Monitoring

```typescript
// src/lib/monitoring.ts
import { trackEvent as gaTrackEvent } from './analytics';

trackEvent(event: Omit<UserEvent, 'timestamp'>): void {
  // ... existing code ...

  // Send to Google Analytics
  if (typeof window !== 'undefined') {
    gaTrackEvent(
      event.category,
      event.action,
      event.label,
      event.value
    );
  }
}
```

### 3. LogRocket (Session Replay)

#### Installation

```bash
npm install logrocket
```

#### Configuration

```typescript
// src/lib/logrocket.ts
import LogRocket from "logrocket";

export function initializeLogRocket() {
  LogRocket.init("your-app-id/your-project");

  // Identify users (optional)
  LogRocket.identify("user-id", {
    name: "User Name",
    email: "user@example.com",
  });
}

export default LogRocket;
```

#### Integration with Monitoring

```typescript
// src/lib/monitoring.ts
import LogRocket from './logrocket';

captureError(error: ErrorEvent): void {
  // ... existing code ...

  // Send to LogRocket
  if (typeof window !== 'undefined' && error.type === 'error') {
    LogRocket.captureException(new Error(error.message));
  }
}
```

### 4. Datadog (Full-Stack Monitoring)

#### Installation

```bash
npm install @datadog/browser-rum
```

#### Configuration

```typescript
// src/lib/datadog.ts
import { datadogRum } from "@datadog/browser-rum";

export function initializeDatadog() {
  datadogRum.init({
    applicationId: "YOUR_APPLICATION_ID",
    clientToken: "YOUR_CLIENT_TOKEN",
    site: "datadoghq.com",
    service: "info-sphere",
    env: process.env.NODE_ENV,
    version: "1.0.0",
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    defaultPrivacyLevel: "mask-user-input",
  });

  datadogRum.startSessionReplayRecording();
}
```

---

## Best Practices

### 1. Error Handling

```typescript
// ✅ Good: Capture errors with context
try {
  await fetchNews(category);
} catch (error) {
  captureError(error, {
    component: "NewsList",
    action: "fetchNews",
    category,
  });
  // Show user-friendly error message
  showErrorToast("Failed to load news");
}

// ❌ Bad: Silent failures
try {
  await fetchNews();
} catch (error) {
  // Nothing
}
```

### 2. Performance Monitoring

```typescript
// ✅ Good: Measure critical operations
const articles = await monitoring.measureAsyncPerformance(
  "fetch_top_headlines",
  async () => await fetchTopHeadlines(),
);

// ❌ Bad: No performance tracking
const articles = await fetchTopHeadlines();
```

### 3. User Privacy

```typescript
// ✅ Good: Anonymize sensitive data
monitoring.trackEvent({
  action: "search",
  category: "engagement",
  label: query.length > 0 ? "has_query" : "empty",
});

// ❌ Bad: Track PII
monitoring.trackEvent({
  action: "search",
  category: "engagement",
  label: userEmail, // Don't track emails!
});
```

### 4. Log Levels

```typescript
// ✅ Good: Use appropriate log levels
logger.debug("Fetching news", { category }); // Development only
logger.info("User logged in"); // General info
logger.warn("API rate limit approaching"); // Warnings
logger.error("Failed to fetch news", error); // Errors

// ❌ Bad: Everything as error
logger.error("Fetching news"); // Not an error!
```

### 5. Sampling

```typescript
// ✅ Good: Sample high-frequency events
const shouldTrack = Math.random() < 0.1; // 10% sampling
if (shouldTrack) {
  monitoring.trackEvent({
    action: "scroll",
    category: "engagement",
  });
}

// ❌ Bad: Track every scroll event
window.addEventListener("scroll", () => {
  monitoring.trackEvent({
    action: "scroll",
    category: "engagement",
  });
});
```

### 6. Cleanup

```typescript
// ✅ Good: Clear old logs periodically
useEffect(() => {
  const interval = setInterval(() => {
    const report = monitoring.getReport();
    if (report.errors.length > 1000) {
      monitoring.clearLogs();
    }
  }, 3600000); // Every hour

  return () => clearInterval(interval);
}, []);
```

---

## Troubleshooting

### Issue: Logs not appearing

**Problem**: Logs are not visible in console

**Solution**:

```typescript
import { logger, LogLevel } from "@/lib/logger";

// Set log level to DEBUG
logger.setLevel(LogLevel.DEBUG);

// Check environment
console.log("NODE_ENV:", process.env.NODE_ENV);
```

### Issue: Monitoring disabled

**Problem**: Events not being tracked

**Solution**:

```typescript
// Check if monitoring is enabled
const report = monitoring.getReport();
console.log("Monitoring enabled:", report.events.length > 0);

// Monitoring is disabled in test environment
// Set NODE_ENV to 'development' or 'production'
```

### Issue: LocalStorage quota exceeded

**Problem**: "QuotaExceededError" in console

**Solution**:

```typescript
// Clear old logs
monitoring.clearLogs();

// Reduce MAX_LOG_ENTRIES in monitoring.ts
const MAX_LOG_ENTRIES = 50; // Default: 100
```

### Issue: Performance metrics missing

**Problem**: Web Vitals not tracked

**Solution**:

```typescript
// Initialize Web Vitals tracking
import { monitoring } from "@/lib/monitoring";

useEffect(() => {
  monitoring.trackWebVitals();
}, []);

// Check browser support
if ("PerformanceObserver" in window) {
  console.log("PerformanceObserver supported");
} else {
  console.log("PerformanceObserver not supported");
}
```

### Issue: Errors not captured

**Problem**: Errors not appearing in monitoring

**Solution**:

```typescript
// Manually capture errors
import { captureError } from "@/lib/monitoring";

try {
  // Your code
} catch (error) {
  captureError(error);
}

// Check error handlers
window.addEventListener("error", (event) => {
  console.log("Error captured:", event.message);
});
```

---

## Production Checklist

Before deploying to production:

- [ ] **Configure external monitoring service** (Sentry, Datadog, etc.)
- [ ] **Set up error alerting** (email, Slack, PagerDuty)
- [ ] **Enable performance monitoring** (Web Vitals, API metrics)
- [ ] **Configure log retention** (how long to keep logs)
- [ ] **Set up analytics** (Google Analytics, Mixpanel)
- [ ] **Test error tracking** (trigger test errors)
- [ ] **Verify privacy compliance** (GDPR, CCPA)
- [ ] **Set up monitoring dashboard** (Grafana, Datadog)
- [ ] **Configure alerts** (error rate, performance degradation)
- [ ] **Document monitoring procedures** (runbooks, escalation)

---

## Monitoring Dashboard Example

```typescript
// src/components/MonitoringDashboard.tsx
import { monitoring } from '@/lib/monitoring';
import { useEffect, useState } from 'react';

export function MonitoringDashboard() {
  const [report, setReport] = useState(monitoring.getReport());

  useEffect(() => {
    const interval = setInterval(() => {
      setReport(monitoring.getReport());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monitoring Dashboard</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Errors</h3>
          <p className="text-3xl">{report.summary.totalErrors}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Total Events</h3>
          <p className="text-3xl">{report.summary.totalEvents}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold">Error Rate</h3>
          <p className="text-3xl">
            {(report.summary.errorRate * 100).toFixed(2)}%
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-2">Recent Errors</h3>
        <ul className="space-y-2">
          {report.errors.slice(-5).reverse().map((error, i) => (
            <li key={i} className="border-b pb-2">
              <p className="font-medium">{error.message}</p>
              <p className="text-sm text-gray-600">
                {new Date(error.timestamp).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
        <ul className="space-y-2">
          {report.metrics.slice(-10).reverse().map((metric, i) => (
            <li key={i} className="flex justify-between">
              <span>{metric.name}</span>
              <span>{metric.value.toFixed(2)} {metric.unit}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

## Conclusion

Info Sphere provides a comprehensive monitoring and logging system out of the box. For production deployments, integrate with external services like Sentry, Google Analytics, or Datadog for advanced features and alerting.

**Key Takeaways:**

1. ✅ Use built-in monitoring for development and testing
2. ✅ Integrate external services for production
3. ✅ Track errors, performance, and user events
4. ✅ Follow privacy best practices
5. ✅ Set up alerts and dashboards
6. ✅ Regularly review monitoring data

---

**Last Updated**: June 20, 2026  
**Version**: 1.0.0
