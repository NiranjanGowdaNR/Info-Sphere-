# Info-Sphere Architecture Documentation

## Overview

Info-Sphere is a modern news aggregator application built with a clean, layered architecture following SOLID principles and design patterns. The application is structured to ensure maintainability, testability, and scalability.

## Architecture Layers

### 1. **Presentation Layer** (`src/components/`, `src/routes/`)

- **Responsibility**: User interface and user interaction
- **Components**: React components, route handlers
- **Principles**:
  - Single Responsibility: Each component has one clear purpose
  - Dependency Inversion: Components depend on abstractions (hooks, services)

### 2. **Application Layer** (`src/client/services/`, `src/hooks/`)

- **Responsibility**: Business logic and application-specific operations
- **Components**: Custom hooks, client-side services
- **Principles**:
  - Open/Closed: Services are open for extension, closed for modification
  - Interface Segregation: Small, focused service interfaces

### 3. **Domain Layer** (`src/shared/models/`)

- **Responsibility**: Core business entities and domain logic
- **Components**: Type definitions, domain models, constants
- **Principles**:
  - Single Responsibility: Each model represents one domain concept
  - Dependency Rule: No dependencies on outer layers

### 4. **Infrastructure Layer** (`src/server-layer/`)

- **Responsibility**: External integrations and data access
- **Components**: API clients, caching, controllers
- **Principles**:
  - Dependency Inversion: Depends on abstractions, not concrete implementations
  - Single Responsibility: Each service handles one external concern

### 5. **State Management Layer** (`src/client/state/`)

- **Responsibility**: Client-side state persistence and synchronization
- **Components**: Local storage utilities, state hooks
- **Principles**:
  - Single Responsibility: Focused on state management only
  - Open/Closed: Extensible for new state types

## Design Patterns

### 1. **Repository Pattern**

- **Location**: `src/server-layer/services/news-api.server.ts`
- **Purpose**: Abstracts data access from NewsAPI
- **Benefits**: Easy to mock, test, and swap implementations

### 2. **Service Layer Pattern**

- **Location**: `src/client/services/`, `src/server-layer/services/`
- **Purpose**: Encapsulates business logic
- **Benefits**: Reusable, testable, maintainable

### 3. **Controller Pattern**

- **Location**: `src/server-layer/controllers/`
- **Purpose**: Handles HTTP requests and orchestrates services
- **Benefits**: Separation of concerns, easier testing

### 4. **Factory Pattern**

- **Location**: `src/client/services/share.ts`, `src/server-layer/services/news-cache.server.ts`
- **Purpose**: Creates complex objects with consistent interfaces
- **Benefits**: Encapsulates object creation logic

### 5. **Observer Pattern**

- **Location**: `src/client/state/local-store.ts`
- **Purpose**: Synchronizes state across components and tabs
- **Benefits**: Reactive state updates, cross-tab synchronization

### 6. **Strategy Pattern**

- **Location**: `src/client/services/popular-articles.ts`, `src/client/services/source-ranking.ts`
- **Purpose**: Different algorithms for ranking and scoring
- **Benefits**: Interchangeable algorithms, easy to extend

## SOLID Principles Implementation

### Single Responsibility Principle (SRP)

- ✅ Each service has one clear responsibility
- ✅ Components focus on presentation only
- ✅ Controllers handle request/response only
- ✅ Models represent domain entities only

### Open/Closed Principle (OCP)

- ✅ Services are extensible through composition
- ✅ New features added without modifying existing code
- ✅ Strategy pattern allows algorithm variations

### Liskov Substitution Principle (LSP)

- ✅ Service interfaces can be substituted with implementations
- ✅ Mock implementations for testing
- ✅ Consistent contracts across layers

### Interface Segregation Principle (ISP)

- ✅ Small, focused interfaces (e.g., `NewsApiServiceOptions`)
- ✅ Clients depend only on methods they use
- ✅ No fat interfaces

### Dependency Inversion Principle (DIP)

- ✅ High-level modules depend on abstractions
- ✅ Dependency injection for services (e.g., `fetcher` parameter)
- ✅ Testable through mock implementations

## Data Flow

```
User Interaction
    ↓
React Component (Presentation Layer)
    ↓
Custom Hook / Service (Application Layer)
    ↓
Controller (Infrastructure Layer)
    ↓
API Service (Infrastructure Layer)
    ↓
External API (NewsAPI)
    ↓
Cache Layer (Infrastructure Layer)
    ↓
Response flows back up the chain
```

## Caching Strategy

### Server-Side Cache

- **Implementation**: In-memory Map with TTL
- **Location**: `src/server-layer/services/news-cache.server.ts`
- **Strategy**:
  - Fresh cache: 5 minutes
  - Stale cache: 60 minutes (fallback)
  - Automatic cleanup on expiry

### Client-Side Cache

- **Implementation**: React Query + LocalStorage
- **Location**: `src/client/state/local-store.ts`
- **Strategy**:
  - React Query: 2 minutes stale time
  - LocalStorage: Persistent bookmarks, history, engagement

## Error Handling

### Layered Error Handling

1. **API Layer**: Catches network errors, returns structured responses
2. **Controller Layer**: Validates input, handles business errors
3. **Component Layer**: Displays user-friendly error messages
4. **Global Handler**: Captures unhandled errors (`error-capture.ts`)

### Error Response Structure

```typescript
{
  status: number,
  success: boolean,
  message: string,
  data: { articles: [], totalResults: 0 }
}
```

## Testing Strategy

### Unit Tests

- **Services**: Test business logic in isolation
- **Utilities**: Test pure functions
- **Models**: Test data transformations

### Integration Tests

- **Controllers**: Test request/response handling
- **API Services**: Test with mocked fetch

### Test Coverage Goals

- Services: 80%+
- Controllers: 80%+
- Utilities: 90%+
- Components: 60%+

## File Organization

```
src/
├── client/                 # Client-side only code
│   ├── services/          # Business logic services
│   └── state/             # State management
├── components/            # React components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Shared utilities
├── routes/               # Page routes
│   └── api/             # API endpoints
├── server-layer/         # Server-side only code
│   ├── controllers/     # Request handlers
│   └── services/        # External integrations
└── shared/              # Shared between client/server
    └── models/          # Domain models
```

## Key Architectural Decisions

### 1. **Separation of Client and Server Code**

- **Rationale**: Clear boundaries, better tree-shaking, security
- **Implementation**: Separate directories with `.server.ts` suffix

### 2. **Dependency Injection**

- **Rationale**: Testability, flexibility, loose coupling
- **Implementation**: Optional parameters for dependencies (e.g., `fetcher`, `apiKey`)

### 3. **Immutable State**

- **Rationale**: Predictable state changes, easier debugging
- **Implementation**: Functional updates, no direct mutations

### 4. **Type Safety**

- **Rationale**: Catch errors at compile time, better IDE support
- **Implementation**: TypeScript with strict mode, comprehensive types

### 5. **Progressive Enhancement**

- **Rationale**: Works without JavaScript, better SEO
- **Implementation**: SSR with TanStack Start, semantic HTML

## Performance Optimizations

1. **Code Splitting**: Automatic route-based splitting
2. **Lazy Loading**: Images loaded on demand
3. **Caching**: Multi-layer caching strategy
4. **Memoization**: React.useMemo for expensive computations
5. **Debouncing**: Search input debouncing
6. **Pagination**: Limit data fetching to current page

## Security Considerations

1. **API Key Protection**: Server-side only, never exposed to client
2. **Input Validation**: All user inputs validated
3. **XSS Prevention**: React's built-in escaping
4. **CORS**: Proper CORS configuration
5. **Rate Limiting**: Handled by cache layer

## Scalability Considerations

1. **Stateless Design**: No server-side session state
2. **Edge Deployment**: Cloudflare Workers for global distribution
3. **Horizontal Scaling**: Stateless architecture supports scaling
4. **Cache Strategy**: Reduces API calls, improves response time
5. **Lazy Loading**: Reduces initial bundle size

## Future Enhancements

1. **Database Integration**: For user preferences, saved searches
2. **Real-time Updates**: WebSocket for live news updates
3. **Personalization**: ML-based article recommendations
4. **Offline Support**: Service Worker for offline reading
5. **Analytics**: User behavior tracking and insights
