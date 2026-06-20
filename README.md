# Info Sphere 🌐

> A modern, feature-rich news aggregator application that brings global news to your fingertips with intelligent features, beautiful UI, and seamless user experience.

[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![TanStack](https://img.shields.io/badge/TanStack-Start-orange.svg)](https://tanstack.com/start)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**Info Sphere** is a cutting-edge news aggregation platform designed to deliver personalized, real-time news from around the world. Built with modern web technologies and following industry-standard design patterns, it provides a seamless experience across all devices.

### What Info Sphere Does

- **Aggregates News**: Fetches news from multiple sources via NewsAPI
- **Personalizes Experience**: Customizable themes, language preferences, and reading lists
- **Enhances Discovery**: Advanced search, filtering, and sorting capabilities
- **Tracks Engagement**: Bookmarks, reading history, and popular articles
- **Optimizes Performance**: Server-side rendering, intelligent caching, and edge deployment
- **Ensures Quality**: Comprehensive testing, error handling, and monitoring

---

## ✨ Key Features

### 🌍 Core News Features

| Feature                | Description                                                                      |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Global Coverage**    | Access news from 50+ countries worldwide                                         |
| **Category Filtering** | Browse by Business, Technology, Sports, Entertainment, Health, Science, and more |
| **Smart Search**       | Powerful keyword search with real-time results                                   |
| **Multi-Language**     | Support for 20+ languages with automatic translation                             |
| **Real-Time Updates**  | Fresh content powered by NewsAPI with intelligent caching                        |

### 🎨 User Experience

| Feature                  | Description                                           |
| ------------------------ | ----------------------------------------------------- |
| **Dark/Light Mode**      | Automatic theme switching with customizable schedules |
| **Responsive Design**    | Optimized for desktop, tablet, and mobile devices     |
| **Advanced Themes**      | Multiple theme presets with customization options     |
| **Dashboard Customizer** | Personalize your news dashboard layout                |
| **Weather Widget**       | Integrated weather information for your location      |

### 📚 Content Management

| Feature              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| **Bookmarks**        | Save articles for later reading with persistent storage |
| **Reading History**  | Track viewed articles with timestamps                   |
| **Popular Articles** | Discover trending content based on engagement           |
| **Source Rankings**  | View credibility ratings for news sources               |
| **Trending Topics**  | Stay updated with what's trending globally              |

### 🚀 Advanced Features

| Feature              | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| **AI Summaries**     | Get quick article summaries powered by AI                    |
| **News Comparison**  | Compare coverage across multiple sources                     |
| **Video News**       | Integrated video news from YouTube and other platforms       |
| **Podcast Player**   | Listen to news podcasts directly in the app                  |
| **Translation**      | Translate headlines and content into your preferred language |
| **Advanced Sorting** | Sort by date, popularity, source, and more                   |

### 🔧 Technical Features

| Feature                    | Description                                     |
| -------------------------- | ----------------------------------------------- |
| **Server-Side Rendering**  | Fast initial page loads with SSR                |
| **Edge Deployment**        | Global CDN via Cloudflare Workers               |
| **Intelligent Caching**    | Multi-layer caching for optimal performance     |
| **Error Handling**         | Comprehensive error capture and recovery        |
| **Rate Limiting**          | Built-in API rate limiting and throttling       |
| **Performance Monitoring** | Real-time performance tracking and optimization |
| **Database Integration**   | Persistent storage with SQLite/D1               |

---

## 🏗️ Architecture

Info Sphere follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                        │
│  (React Components, Routes, UI)                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                          │
│  (Services, Hooks, Business Logic)                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     DOMAIN LAYER                             │
│  (Entities, Types, Models)                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 INFRASTRUCTURE LAYER                         │
│  (API Clients, Database, External Services)                 │
└─────────────────────────────────────────────────────────────┘
```

### Design Patterns Implemented

- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **Controller Pattern**: Request/response handling
- **Factory Pattern**: Object creation
- **Observer Pattern**: State synchronization
- **Strategy Pattern**: Interchangeable algorithms

### SOLID Principles

✅ **Single Responsibility**: Each module has one clear purpose  
✅ **Open/Closed**: Open for extension, closed for modification  
✅ **Liskov Substitution**: Interfaces are substitutable  
✅ **Interface Segregation**: Small, focused interfaces  
✅ **Dependency Inversion**: Depend on abstractions

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed documentation.

---

## 📋 Tech Stack

### Frontend

| Technology          | Version | Purpose                               |
| ------------------- | ------- | ------------------------------------- |
| **React**           | 19.2    | UI framework with concurrent features |
| **TypeScript**      | 5.8     | Type-safe development                 |
| **Tailwind CSS**    | 4.2     | Utility-first styling                 |
| **Radix UI**        | Latest  | Accessible component primitives       |
| **TanStack Router** | 1.168   | Type-safe routing                     |
| **TanStack Query**  | 5.83    | Server state management               |
| **Lucide React**    | 0.575   | Icon library                          |

### Backend & Infrastructure

| Technology             | Purpose                   |
| ---------------------- | ------------------------- |
| **TanStack Start**     | Meta-framework with SSR   |
| **Cloudflare Workers** | Edge computing platform   |
| **Vite**               | Build tool and dev server |
| **NewsAPI**            | News data provider        |
| **Vitest**             | Unit testing framework    |

### Developer Tools

| Tool                  | Purpose                     |
| --------------------- | --------------------------- |
| **ESLint**            | Code quality and linting    |
| **Prettier**          | Code formatting             |
| **TypeScript ESLint** | TypeScript-specific linting |
| **Vitest UI**         | Interactive test runner     |

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.0 or higher
- **npm** or **pnpm** (recommended)
- **NewsAPI Key** - [Get it free](https://newsapi.org/register)
- **Weather API Key** (optional) - [OpenWeatherMap](https://openweathermap.org/api)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Info_sphere
```

2. **Install dependencies**

```bash
npm install
# or
pnpm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
NEWS_API_KEY=your_newsapi_key_here
WEATHER_API_KEY=your_weather_api_key_here
```

### Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Build the application:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run tests with UI
npm test -- --ui
```

### Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format
```

---

## 🌐 Deployment

Info Sphere can be deployed to multiple platforms for free. Here are the recommended options:

### Option 1: Cloudflare Pages (Recommended)

**Why Cloudflare Pages?**

- ✅ Free tier with generous limits
- ✅ Global CDN with edge computing
- ✅ Automatic HTTPS
- ✅ Built-in analytics
- ✅ Serverless functions support

**Deployment Steps:**

1. **Build the project**

```bash
npm run build
```

2. **Install Wrangler CLI**

```bash
npm install -g wrangler
```

3. **Login to Cloudflare**

```bash
wrangler login
```

4. **Configure wrangler.jsonc**

```jsonc
{
  "name": "info-sphere",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "src/server.ts",
  "vars": {
    "NEWS_API_KEY": "your_api_key",
    "WEATHER_API_KEY": "your_weather_key",
  },
}
```

5. **Deploy**

```bash
wrangler deploy
```

Your app will be live at `https://info-sphere.pages.dev`

### Option 2: Vercel

**Why Vercel?**

- ✅ Zero-config deployment
- ✅ Automatic HTTPS
- ✅ Preview deployments for PRs
- ✅ Built-in analytics

**Deployment Steps:**

1. **Install Vercel CLI**

```bash
npm install -g vercel
```

2. **Deploy**

```bash
vercel
```

3. **Set environment variables** in Vercel dashboard:
   - `NEWS_API_KEY`
   - `WEATHER_API_KEY`

4. **Deploy to production**

```bash
vercel --prod
```

### Option 3: Netlify

**Why Netlify?**

- ✅ Continuous deployment from Git
- ✅ Form handling
- ✅ Split testing
- ✅ Free SSL

**Deployment Steps:**

1. **Create `netlify.toml`**

```toml
[build]
  command = "npm run build"
  publish = ".output/public"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. **Deploy via Netlify CLI**

```bash
npm install -g netlify-cli
netlify deploy --prod
```

3. **Or connect your Git repository** in Netlify dashboard

### Option 4: Railway

**Why Railway?**

- ✅ Simple deployment
- ✅ Database support
- ✅ Environment variables management
- ✅ Free tier available

**Deployment Steps:**

1. **Install Railway CLI**

```bash
npm install -g @railway/cli
```

2. **Login and initialize**

```bash
railway login
railway init
```

3. **Deploy**

```bash
railway up
```

### Option 5: Render

**Why Render?**

- ✅ Free static site hosting
- ✅ Automatic deploys from Git
- ✅ Custom domains
- ✅ DDoS protection

**Deployment Steps:**

1. Connect your GitHub repository
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `.output/public`
3. Add environment variables
4. Deploy

### Environment Variables

For all platforms, set these environment variables:

| Variable          | Required | Description            |
| ----------------- | -------- | ---------------------- |
| `NEWS_API_KEY`    | Yes      | Your NewsAPI key       |
| `WEATHER_API_KEY` | No       | OpenWeatherMap API key |

### Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test all routes and features
- [ ] Check API rate limits
- [ ] Configure custom domain (optional)
- [ ] Set up monitoring and analytics
- [ ] Enable HTTPS (usually automatic)
- [ ] Test on mobile devices

---

## 📁 Project Structure

```
Info_sphere/
├── src/
│   ├── client/                 # Client-side only code
│   │   ├── services/          # Business logic services
│   │   │   ├── popular-articles.ts
│   │   │   ├── read-time.ts
│   │   │   ├── share.ts
│   │   │   ├── sorting-filtering.ts
│   │   │   ├── source-ranking.ts
│   │   │   ├── theme-scheduler.ts
│   │   │   └── translation.ts
│   │   └── state/             # State management
│   │       └── local-store.ts
│   ├── components/            # React components
│   │   ├── Header.tsx
│   │   ├── NewsCard.tsx
│   │   ├── NewsList.tsx
│   │   ├── ThemeToggle.tsx
│   │   ├── ThemeScheduler.tsx
│   │   ├── LanguageSelector.tsx
│   │   ├── TrendingTopics.tsx
│   │   ├── PopularArticles.tsx
│   │   ├── SourceRankings.tsx
│   │   ├── WeatherWidget.tsx
│   │   ├── AISummary.tsx
│   │   ├── NewsComparison.tsx
│   │   ├── VideoNews.tsx
│   │   ├── PodcastPlayer.tsx
│   │   ├── DashboardCustomizer.tsx
│   │   ├── AdvancedThemes.tsx
│   │   └── ui/                # Radix UI components
│   ├── hooks/                 # Custom React hooks
│   │   └── use-mobile.tsx
│   ├── lib/                   # Shared utilities
│   │   ├── constants.ts
│   │   ├── logger.ts
│   │   ├── utils.ts
│   │   ├── error-capture.ts
│   │   ├── error-page.ts
│   │   ├── local-store.ts
│   │   ├── types.ts
│   │   ├── database.ts
│   │   ├── monitoring.ts
│   │   ├── performance.ts
│   │   └── rate-limiter.ts
│   ├── routes/                # Page routes
│   │   ├── __root.tsx
│   │   ├── index.tsx
│   │   ├── bookmarks.tsx
│   │   ├── history.tsx
│   │   ├── search.$query.tsx
│   │   ├── country.$iso.tsx
│   │   ├── top-headlines.$category.tsx
│   │   └── api/               # API routes
│   │       ├── all-news.ts
│   │       ├── top-headlines.ts
│   │       ├── country.$iso.ts
│   │       ├── search.msg.ts
│   │       ├── weather.ts
│   │       └── news-api.service.ts
│   ├── server-layer/          # Server-side only code
│   │   ├── controllers/
│   │   │   └── news-controller.server.ts
│   │   └── services/
│   │       ├── news-api.server.ts
│   │       └── news-cache.server.ts
│   ├── shared/                # Shared between client/server
│   │   └── models/
│   │       └── news.ts
│   ├── router.tsx
│   ├── server.ts
│   ├── start.ts
│   └── styles.css
├── public/                    # Static assets
├── .github/
│   └── workflows/
│       └── ci.yml            # CI/CD pipeline
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── wrangler.jsonc
├── ARCHITECTURE.md
├── FEATURES.md
├── FUTURE_FEATURES.md
├── CONTRIBUTING.md
└── README.md
```

---

## 📚 API Documentation

### Available Routes

| Route                      | Description             | Parameters                                     |
| -------------------------- | ----------------------- | ---------------------------------------------- |
| `/`                        | Home page with top news | -                                              |
| `/top-headlines/:category` | News by category        | `category`: business, technology, sports, etc. |
| `/country/:iso`            | News by country         | `iso`: Country code (us, gb, in, etc.)         |
| `/search/:query`           | Search news             | `query`: Search keywords                       |
| `/bookmarks`               | Saved articles          | -                                              |
| `/history`                 | Reading history         | -                                              |

### API Endpoints

| Endpoint             | Method | Description             |
| -------------------- | ------ | ----------------------- |
| `/api/all-news`      | GET    | Fetch all news articles |
| `/api/top-headlines` | GET    | Get top headlines       |
| `/api/country/:iso`  | GET    | Country-specific news   |
| `/api/search/:query` | GET    | Search news articles    |
| `/api/weather`       | GET    | Get weather information |

### Response Format

```typescript
{
  status: number;
  success: boolean;
  message: string;
  data: {
    articles: Article[];
    totalResults: number;
  }
}
```

---

## 🧪 Testing

### Test Coverage

- **Services**: 80%+ coverage
- **Controllers**: 80%+ coverage
- **Utilities**: 90%+ coverage
- **Components**: 60%+ coverage

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm test -- --watch

# Coverage report
npm test -- --coverage

# UI mode
npm test -- --ui
```

### Test Structure

```
src/
├── client/services/*.test.ts
├── components/*.test.tsx
├── lib/*.test.ts
└── server-layer/**/*.test.ts
```

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

### Quick Start

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow coding standards (SOLID, DRY, KISS)
4. Write tests for your changes
5. Run `npm test` and `npm run lint`
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Standards

- Follow TypeScript best practices
- Write comprehensive tests
- Document complex logic
- Use meaningful variable names
- Follow existing code style

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [NewsAPI](https://newsapi.org/) for news data
- [TanStack](https://tanstack.com/) for amazing tools
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Cloudflare](https://www.cloudflare.com/) for edge deployment

---

## 📞 Support

For issues and questions:

1. Check [existing issues](https://github.com/your-repo/issues)
2. Create a new issue with detailed description
3. Include steps to reproduce
4. Provide error messages and logs

---

## 🗺️ Roadmap

See [FUTURE_FEATURES.md](FUTURE_FEATURES.md) for planned features and enhancements.

### Coming Soon

- ✨ User authentication and profiles
- 🔔 Push notifications for breaking news
- 📱 Progressive Web App (PWA)
- 🎙️ Enhanced podcast integration
- 🤖 Advanced AI features
- 📊 Analytics dashboard

---

## 📊 Performance

- **Lighthouse Score**: 95+
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 200KB (gzipped)

---

## 🌟 Star History

If you find this project useful, please consider giving it a star ⭐

---

**Made with ❤️ using the TanStack ecosystem**

_Last Updated: June 20, 2026_
