# AI Coding Agent Guidelines
# Project: ReactJS + NestJS + PostgreSQL Application

## Project Overview
Call Calendar - Web application for scheduling and managing calls.
This is a full-stack application with:
- **Frontend**: ReactJS (Vite) + TypeScript + Mantine
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL (with TypeORM or Prisma)
- **State Management**: Zustand (frontend)

## Development Commands

### Setup

# Frontend setup (in new terminal)
```bash
cd web
npm install          # Install dependencies
npm run dev          # Start dev server
npm run dev -- --port=3001  # Custom port
```

# Backend setup
```bash
cd api
npm install          # Install dependencies
npm run dev          # Start dev server
npm run dev -- --port=3333  # Custom port
```

### Build
```bash
npm run build        # Production build
npm run preview      # Preview locally
```

### Lint & Format
```bash
npm run lint         # ESLint check
npm run lint:fix     # Fix ESLint issues
npm run format:check # Check Prettier formatting
npm run format:write # Auto-format
npm run typecheck    # TypeScript check
npm run typecheck:watch  # Watch mode
```

### Testing
```bash
npm test                    # Run all tests
npm test -- src/components/Button.test.tsx    # Single test file
npm test -- -t "test name"  # Single test by name
npm run test:watch          # Watch mode
npm run test:coverage       # With coverage report
npm run test:integration    # Integration tests
npm run test:e2e            # E2E tests
```

## Code Style Guidelines

### JavaScript/TypeScript
- Use semicolons; prefer `const`/`let` over `var`
- Arrow functions for callbacks; template literals; destructuring
- Default parameters over undefined checks
- Explicit return types for exported functions

### Naming Conventions
- Files: `kebab-case.tsx` (components: `PascalCase.tsx`)
- Components/Pages: `PascalCase`
- Variables/functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Classes/Interfaces: `PascalCase`

### Import Organization
Order with blank lines between groups:
1. External libraries (React, etc.)
2. Internal absolute imports (`@/components`)
3. Internal relative imports (`../components`)
4. Types/interfaces

Use `@/` path alias for imports from `src/`.

### Formatting
- 2 spaces indentation; single quotes
- Trailing commas; max 100 chars/line
- Blank line between function definitions

### Error Handling
- Use typed errors; avoid `any`
- Wrap async operations in try-catch
- Log errors before re-throwing
- Return error objects rather than throwing when appropriate
- Use early returns to reduce nesting

### TypeScript Guidelines
- Enable `strict` mode; no `any` types
- Define interfaces for function parameters and return types
- Use `unknown` over `any` when type is uncertain
- Prefer union types over enums; use const assertions

## Directory Structure
- `apps/web`: ReactJS frontend.
- `apps/api`: NestJS backend.
- `packages/db`: Prisma schema or TypeORM entities.


## Git Workflow

### Branch Naming
- `feature/short-description`
- `bugfix/issue-description`
- `hotfix/urgent-issue`
- `release/v1.2.3`

### Commit Messages
Use conventional commits: `<type>(<scope>): <description>`
Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## Coding Conventions

### TypeScript
- Use **strict mode** in all projects
- Prefer **interfaces** over types for objects
- Use **type aliases** for unions/literals
- Avoid `any`; use `unknown` when type is dynamic

### React Frontend
- Use **function components** with hooks (no class components)
- Prefer **named exports** over default exports
- Implement **loading** and **error states** for async operations
- Use **React Query** for server-state management

### NestJS Backend
- Follow **modular architecture** (feature modules)
- Use **class-validator** for DTO validation
- Implement **exception filters** for consistent error responses
- Use **guards** for authentication/authorization
- Services should be **thin**; business logic in services, not controllers
- Use **dependency injection** everywhere

## Code Quality Standards

### Testing Requirements
- Unit tests for all new features
- Regression tests for bug fixes
- Target >80% code coverage
- Test edge cases and error paths
- Mock external dependencies

### Performance
- Avoid bundle increases >50KB without justification
- Lazy load: `const LazyComp = lazy(() => import('./Comp'))`
- Use `React.memo` for expensive renders
- Optimize images; code split routes

### Security
- Sanitize user inputs (XSS prevention)
- Store secrets in environment variables
- Validate API responses with Zod/io-ts
- Use least privilege for permissions

## AI Agent Guidelines

### Code Generation
- Follow existing patterns in the codebase
- Add JSDoc comments for public APIs
- Include comprehensive error handling
- Write tests with new functionality

### File Modifications
- Make minimal, focused changes
- No unrelated refactoring
- Update docs when changing APIs
- Maintain backward compatibility

### Before Submitting
- Run `npm run lint` and `npm run typecheck`
- Run `npm test` and ensure all pass
- Self-review for side effects

## Troubleshooting

```bash
# Dependency issues
rm -rf node_modules package-lock.json && npm install

# Debug tests
npm test -- --verbose --no-coverage
npm test -- src/components/Button.test.tsx --verbose
```
