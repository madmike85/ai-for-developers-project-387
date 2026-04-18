# Test Execution Guide for Call Calendar

This guide provides comprehensive instructions for running tests in the Call Calendar application.

## 1. Prerequisites

### Node.js Version Requirements
- **Node.js**: v18.x or higher (v20.x recommended)
- **npm**: v9.x or higher

Verify your Node.js version:
```bash
node --version
npm --version
```

### Docker for PostgreSQL
Ensure Docker is running for the test database:
```bash
docker --version
docker-compose --version
```

The test environment uses a PostgreSQL container. Make sure Docker Desktop (or Docker Engine) is running before executing tests.

### Running Services
Before running tests, ensure services are accessible:
- **API**: http://localhost:3000
- **Web**: http://localhost:5173

Start services in separate terminals:
```bash
# Terminal 1 - API
cd api
npm run dev

# Terminal 2 - Web
cd web
npm run dev
```

## 2. Setup Test Environment

### Reset Database Before Tests
Clean the test database to ensure consistent test results:

```bash
cd api
# Reset database schema
npx prisma migrate reset --force

# Or using Docker directly
docker-compose down -v
docker-compose up -d postgres
```

### Run Database Seed
Populate the database with test data:

```bash
cd api
npx prisma db seed
```

### Ensure Services Are Running
Verify all services are healthy:

```bash
# Check API health
curl http://localhost:3000/health

# Check Web availability
curl http://localhost:5173
```

## 3. Running Tests

### API Tests
Run backend tests from the `api` directory:

```bash
cd api

# Run all API tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run a specific test file
npm test -- src/users/users.service.spec.ts

# Run tests matching a pattern
npm test -- -t "should create user"
```

### E2E Tests
Run end-to-end tests from the `web` directory:

```bash
cd web

# Run all E2E tests
npm run test:e2e

# Run E2E tests in headed mode (see browser)
npm run test:e2e -- --headed

# Run a specific E2E test file
npm run test:e2e -- tests/auth.spec.ts

# Run E2E tests on specific browser
npm run test:e2e -- --project=chromium
```

### Web Unit and Integration Tests
```bash
cd web

# Run all web tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration
```

### All Tests (Complete Test Suite)
Run the complete test suite across all packages:

```bash
# From root directory (if using workspaces)
npm test

# Or run sequentially
(cd api && npm test) && (cd web && npm test) && (cd web && npm run test:e2e)
```

## 4. Test Configuration

### Environment Variables Needed
Create a `.env.test` file in both `api` and `web` directories:

**api/.env.test:**
```env
NODE_ENV=test
DATABASE_URL=postgresql://test_user:test_password@localhost:5433/call_calendar_test
JWT_SECRET=test-secret-key-for-testing-only
PORT=3000
```

**web/.env.test:**
```env
VITE_API_URL=http://localhost:3000
VITE_APP_ENV=test
```

### Test Database Configuration
Configure the test database in `docker-compose.yml`:

```yaml
postgres_test:
  image: postgres:15-alpine
  environment:
    POSTGRES_USER: test_user
    POSTGRES_PASSWORD: test_password
    POSTGRES_DB: call_calendar_test
  ports:
    - "5433:5432"
  tmpfs:
    - /var/lib/postgresql/data
```

Start the test database:
```bash
docker-compose up -d postgres_test
```

### Playwright Configuration
Playwright configuration is located in `web/playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

## 5. CI/CD Integration

### How to Run Tests in CI
GitHub Actions workflow example:

```yaml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: call_calendar_test
        ports:
          - 5433:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies (API)
        working-directory: ./api
        run: npm ci
      
      - name: Install dependencies (Web)
        working-directory: ./web
        run: npm ci
      
      - name: Setup database
        working-directory: ./api
        run: npx prisma migrate deploy
      
      - name: Run API tests
        working-directory: ./api
        run: npm run test:coverage
      
      - name: Run Web tests
        working-directory: ./web
        run: npm run test:coverage
      
      - name: Install Playwright browsers
        working-directory: ./web
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        working-directory: ./web
        run: npm run test:e2e
```

### Test Reporting
Generate and view test reports:

```bash
# HTML report for Playwright E2E tests
cd web
npx playwright show-report

# Coverage reports
# Located in api/coverage/ and web/coverage/
open api/coverage/lcov-report/index.html
open web/coverage/lcov-report/index.html
```

### Coverage Requirements
Minimum coverage thresholds:
- **API**: 80% statements, 70% branches
- **Web**: 75% statements, 65% branches

Check coverage:
```bash
cd api && npm run test:coverage
cd web && npm run test:coverage
```

## 6. Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot connect to database"
**Solution:**
```bash
# Verify PostgreSQL is running
docker ps | grep postgres

# If not running, start it
docker-compose up -d postgres

# Check logs
docker-compose logs postgres
```

#### Issue: "Port already in use"
**Solution:**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different ports
npm run dev -- --port=3001  # API
npm run dev -- --port=5174  # Web
```

#### Issue: "E2E tests timeout"
**Solution:**
```bash
# Increase timeout in playwright.config.ts
export const config = {
  timeout: 60000,  // 60 seconds
  expect: {
    timeout: 10000,
  },
};

# Or run with longer timeout
npm run test:e2e -- --timeout=60000
```

#### Issue: "Module not found" in tests
**Solution:**
```bash
# Clear cache and reinstall
cd api && rm -rf node_modules && npm install
cd web && rm -rf node_modules && npm install

# Verify imports match file names (case-sensitive)
```

### Database Cleanup
If tests leave stale data:

```bash
# Full reset
cd api
npx prisma migrate reset --force --skip-generate

# Manual cleanup
docker-compose down -v
docker volume prune -f
```

### Port Conflicts
Common port conflicts and alternatives:

| Service | Default | Alternative | Override Command |
|---------|---------|-------------|------------------|
| API | 3000 | 3001 | `npm run dev -- --port=3001` |
| Web | 5173 | 5174 | `npm run dev -- --port=5174` |
| Postgres | 5432 | 5433 | Update `docker-compose.yml` |
| Test DB | 5433 | 5434 | Update `.env.test` |

### Debug Mode
Enable verbose logging:

```bash
# API tests with verbose output
cd api
npm test -- --verbose

# E2E tests with debug
cd web
npm run test:e2e -- --debug

# Playwright trace viewer
npx playwright show-trace test-results/trace.zip
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Start all services | `docker-compose up -d` |
| Reset test DB | `npx prisma migrate reset --force` |
| Run API tests | `cd api && npm test` |
| Run Web tests | `cd web && npm test` |
| Run E2E tests | `cd web && npm run test:e2e` |
| Run all tests | `npm test` (from root) |
| View coverage | `open coverage/lcov-report/index.html` |
| Debug E2E | `npm run test:e2e -- --headed --debug` |

---

For additional help, check the project documentation or contact the development team.
