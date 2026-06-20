# Contributing to Info-Sphere

Thank you for your interest in contributing to Info-Sphere! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Git
- NewsAPI key from [newsapi.org](https://newsapi.org)

### Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Info_sphere.git`
3. Install dependencies: `npm install`
4. Create `.env` file with your NewsAPI key
5. Run development server: `npm run dev`

## Development Workflow

### Branch Naming

- `feature/` - New features (e.g., `feature/add-dark-mode`)
- `fix/` - Bug fixes (e.g., `fix/search-pagination`)
- `refactor/` - Code refactoring (e.g., `refactor/api-service`)
- `docs/` - Documentation updates (e.g., `docs/update-readme`)
- `test/` - Test additions/updates (e.g., `test/add-component-tests`)

### Development Process

1. Create a new branch from `main`
2. Make your changes following our coding standards
3. Write/update tests for your changes
4. Run tests: `npm test`
5. Run linter: `npm run lint`
6. Format code: `npm run format`
7. Commit your changes
8. Push to your fork
9. Create a Pull Request

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` type - use `unknown` or proper types
- Use interfaces for object shapes
- Use type aliases for unions and primitives

### React

- Use functional components with hooks
- Follow React best practices
- Use proper prop types
- Implement error boundaries where appropriate
- Memoize expensive computations

### File Organization

```
src/
├── client/          # Client-side only code
│   ├── services/   # Business logic services
│   └── state/      # State management
├── components/     # React components
│   └── ui/        # Reusable UI components
├── hooks/         # Custom React hooks
├── lib/           # Shared utilities
├── routes/        # Page routes
│   └── api/      # API endpoints
├── server-layer/  # Server-side only code
│   ├── controllers/
│   └── services/
└── shared/        # Shared between client/server
    └── models/    # Domain models
```

### Design Principles

#### SOLID Principles

1. **Single Responsibility**: Each module/class has one reason to change
2. **Open/Closed**: Open for extension, closed for modification
3. **Liskov Substitution**: Subtypes must be substitutable for base types
4. **Interface Segregation**: Many specific interfaces over one general
5. **Dependency Inversion**: Depend on abstractions, not concretions

#### DRY (Don't Repeat Yourself)

- Extract common logic into utilities
- Use constants for repeated values
- Create reusable components

#### KISS (Keep It Simple, Stupid)

- Write simple, readable code
- Avoid over-engineering
- Prefer clarity over cleverness

### Naming Conventions

- **Files**: kebab-case (e.g., `news-card.tsx`)
- **Components**: PascalCase (e.g., `NewsCard`)
- **Functions**: camelCase (e.g., `fetchNews`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- **Interfaces**: PascalCase with descriptive names (e.g., `NewsApiResponse`)
- **Types**: PascalCase (e.g., `Article`)

### Code Style

- Use 2 spaces for indentation
- Use semicolons
- Use double quotes for strings
- Max line length: 80 characters (flexible)
- Use trailing commas in multi-line objects/arrays

## Testing Guidelines

### Test Structure

- **Unit Tests**: Test individual functions/utilities
- **Integration Tests**: Test component interactions
- **Component Tests**: Test React components with mocked dependencies

### Test Coverage Goals

- Services: 80%+
- Controllers: 80%+
- Utilities: 90%+
- Components: 60%+

### Writing Tests

```typescript
describe("ComponentName", () => {
  beforeEach(() => {
    // Setup
  });

  it("should do something specific", () => {
    // Arrange
    const input = "test";

    // Act
    const result = doSomething(input);

    // Assert
    expect(result).toBe("expected");
  });
});
```

### Test File Naming

- Place tests next to the file being tested
- Use `.test.ts` or `.test.tsx` extension
- Example: `news-card.tsx` → `news-card.test.tsx`

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(news-card): add share functionality

Added social media sharing buttons to news cards with support for
Twitter, LinkedIn, Email, and WhatsApp.

Closes #123
```

```
fix(api): handle rate limit errors

Improved error handling for NewsAPI rate limits with proper user
feedback and retry logic.
```

## Pull Request Process

### Before Submitting

1. ✅ All tests pass
2. ✅ Code is linted and formatted
3. ✅ New tests added for new features
4. ✅ Documentation updated
5. ✅ No console errors or warnings
6. ✅ Commits follow commit guidelines

### PR Description Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

Describe testing performed

## Screenshots (if applicable)

Add screenshots for UI changes

## Checklist

- [ ] Tests pass
- [ ] Code is linted
- [ ] Documentation updated
- [ ] No breaking changes (or documented)
```

### Review Process

1. Automated checks must pass
2. At least one approval required
3. Address review comments
4. Squash commits if requested
5. Maintainer will merge

## Architecture Guidelines

### Component Design

- Keep components small and focused
- Use composition over inheritance
- Implement proper prop validation
- Handle loading and error states
- Make components reusable

### State Management

- Use React Query for server state
- Use local state for UI state
- Use localStorage for persistence
- Avoid prop drilling - use context when needed

### API Integration

- Use service layer for API calls
- Implement proper error handling
- Add request/response logging
- Use caching where appropriate
- Handle rate limiting

### Performance

- Lazy load routes and components
- Memoize expensive computations
- Optimize images
- Minimize bundle size
- Use code splitting

## Questions?

If you have questions, please:

1. Check existing documentation
2. Search existing issues
3. Create a new issue with the `question` label

Thank you for contributing to Info-Sphere! 🎉
