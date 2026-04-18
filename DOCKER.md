# Docker Configuration

## Overview

This project uses Docker Compose for development environment with:
- **PostgreSQL** (database)
- **API** (NestJS backend with hot-reload)
- **Web** (React + Vite frontend with hot-reload)

All services include health checks for proper startup order and monitoring.

## Quick Start

### Hexlet Project Check

The project is configured for Hexlet's automated testing system. For local development:

```bash
# Start development services (3 separate containers: api, web, postgres)
docker compose -f docker-compose.dev.yml up --build
```

### First Time Setup

```bash
# Build and start all services
npm run docker:up:build
```

### Daily Development

```bash
# Start all services (uses cached images)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down

# Full cleanup (removes volumes and images)
npm run docker:clean
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:up` | Start all services |
| `npm run docker:up:build` | Build images and start |
| `npm run docker:down` | Stop all services |
| `npm run docker:logs` | View logs in real-time |
| `npm run docker:clean` | Full cleanup with volumes |

## Service URLs

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **PostgreSQL**: localhost:5432

## Hot Reload

Both frontend and backend support hot-reload:
- Changes to `apps/web/src/` are instantly reflected
- Changes to `apps/api/src/` trigger NestJS reload

## Database Migrations

Migrations run automatically on API container startup. To run manually:

```bash
# Execute migration command in API container
docker-compose exec api sh -c "cd packages/db && npx prisma migrate deploy"
```

## Environment Variables

### API (`apps/api/.env`)
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/call_calendar?schema=public
FRONTEND_URL=http://localhost:5173
PORT=3000
```

### Web (`apps/web/.env`)
```env
VITE_API_URL=http://localhost:3000
VITE_USE_MOCK_API=false
```

## Troubleshooting

### Services won't start
```bash
# Check service status
docker-compose ps

# View specific service logs
docker-compose logs api
docker-compose logs web
docker-compose logs postgres
```

### Database connection issues
```bash
# Check if postgres is healthy
docker-compose ps

# Reset database (WARNING: loses data)
npm run docker:clean
npm run docker:up:build
```

### Port already in use
```bash
# Find and kill process using port
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:5432 | xargs kill -9
```

### Permission issues with node_modules
```bash
# Clean and rebuild
docker-compose down
rm -rf apps/*/node_modules packages/*/node_modules
npm run docker:up:build
```

## Architecture

### Development (docker-compose.dev.yml)

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      Web        │────────▶│       API       │────────▶│    PostgreSQL   │
│   (Port 5173)   │         │   (Port 3000)   │         │   (Port 5432)   │
│  React + Vite   │         │     NestJS      │         │   Health Check  │
│  Health Check   │         │  Health Check   │         │   (pg_isready)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                           │                           │
       └───────────────────────────┴───────────────────────────┘
                           Docker Network
```

### Hexlet Testing (docker-compose.yml)

```
┌─────────────────────────────────────────────────────────────────┐
│                        Unified Container                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   Call Calendar App (Unified Dockerfile)               │   │
│  │   - NestJS API with Static Frontend                    │   │
│  │   - Built-in PostgreSQL                               │   │
│  │   - Port: 3000                                         │   │
│  │   - Health Check: /health                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │    PostgreSQL   │
                    │   (Port 5432)   │
                    │   Health Check  │
                    └─────────────────┘
```

**Files for Hexlet:**
- `docker-compose.yml` — Contains service `app` for Hexlet testing
- `Dockerfile` — Unified production build (root level)
- `Makefile` — Contains `setup` target for Hexlet

**Files for Local Development:**
- `docker-compose.dev.yml` — Development with separate services (api, web, postgres)
- Individual Dockerfiles in `apps/api/Dockerfile` and `apps/web/Dockerfile`

## Health Check Strategy

1. **PostgreSQL** must be healthy before API starts
2. **API** must be healthy before Web starts (and runs migrations)
3. **Web** starts only when API is ready

This ensures proper startup order and prevents connection errors.

---

# Production Mode

## Overview

Production mode uses optimized, secure Docker images:
- **PostgreSQL** — Same as development
- **API** — Compiled NestJS with non-root user
- **Web** — Nginx serving static build files (not Vite dev server)

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│      Web        │────────▶│       API       │────────▶│    PostgreSQL   │
│   (Port 80)     │         │   (Port 3000)   │         │   (Port 5432)   │
│  Nginx + Static │         │  Compiled Nest  │         │   Health Check  │
│   Health Check  │         │   Non-root User │         │   (pg_isready)  │
└─────────────────┘         └─────────────────┘         └─────────────────┘
       │                           │                           │
       └───────────────────────────┴───────────────────────────┘
                           Docker Network
```

## Production Features

- ✅ **Multi-stage builds** — Smaller final images
- ✅ **Compiled code only** — No TypeScript source in production
- ✅ **Non-root user** — API runs as `nodejs` user (not root)
- ✅ **Nginx** — High-performance static file serving
- ✅ **Gzip compression** — Optimized asset delivery
- ✅ **Static file caching** — 1 year cache for assets
- ✅ **API proxy** — `/api/*` routes proxied to backend

## Quick Start (Production)

### Setup

```bash
# 1. Create production environment file
cp .env.production.example .env

# 2. Edit .env and set secure password
# POSTGRES_PASSWORD=your_secure_password_here

# 3. Build and start production services
npm run docker:prod:build
```

### Daily Operations

```bash
# Start production services
npm run docker:prod:up

# View logs
npm run docker:prod:logs

# Stop services
npm run docker:prod:down

# Full cleanup (WARNING: removes database)
npm run docker:prod:clean
```

## Production Scripts

| Script | Description |
|--------|-------------|
| `npm run docker:prod:up` | Start production services |
| `npm run docker:prod:build` | Build images and start |
| `npm run docker:prod:down` | Stop production services |
| `npm run docker:prod:logs` | View production logs |
| `npm run docker:prod:clean` | Full cleanup with volumes |

## Production URLs

| Service | URL | Description |
|---------|-----|-------------|
| **Web** | http://localhost:80 | Production frontend (Nginx) |
| **API** | http://localhost:3000 | Direct API access |
| **API Docs** | http://localhost:3000/api/docs | Swagger documentation |
| **Health** | http://localhost:3000/health | API health check |

## Production Files

### Dockerfiles
- `apps/web/Dockerfile.prod` — Multi-stage Nginx build
- `apps/api/Dockerfile.prod` — Multi-stage Node.js build

### Configuration
- `apps/web/nginx.conf` — Nginx with API proxy and caching
- `docker-compose.prod.yml` — Production orchestration
- `.env.production.example` — Environment template

## Security Features

### API Container
- Runs as `nodejs` user (UID 1001, non-root)
- Only `node` binary available (no dev tools)
- Compiled JavaScript only (no TypeScript source)

### Web Container
- Nginx runs as non-root
- Static files only (no Node.js)
- Minimal attack surface

### Network
- Internal Docker network (services isolated)
- Only ports 80 and 3000 exposed
- PostgreSQL not exposed to host

## Nginx Configuration

The production Nginx setup:
- **Port 80** — HTTP (no SSL as requested)
- **Static files** — Served directly with 1-year cache
- **API proxy** — `/api/*` → `http://api:3000/api/`
- **SPA routing** — All routes serve `index.html`
- **Gzip** — Compression for JS/CSS/HTML
- **Health check** — `/nginx-health` endpoint

## Switching Between Modes

### From Development to Production
```bash
# Stop development
npm run docker:down

# Start production
npm run docker:prod:build
```

### From Production to Development
```bash
# Stop production
npm run docker:prod:down

# Start development
npm run docker:up:build
```

## Troubleshooting (Production)

### Web container shows 502 error
```bash
# Check if API is healthy
docker-compose -f docker-compose.prod.yml ps

# View API logs
docker-compose -f docker-compose.prod.yml logs api
```

### Database connection issues
```bash
# Check environment variables
cat .env

# Verify database is healthy
docker-compose -f docker-compose.prod.yml ps
```

### Static files not updating
```bash
# Rebuild web container
npm run docker:prod:down
docker-compose -f docker-compose.prod.yml build --no-cache web
npm run docker:prod:up
```

### CORS errors
If you see CORS errors in browser console when calling API:

**Cause**: The `FRONTEND_URL` environment variable doesn't match your actual frontend URL.

**Solution**: Update `FRONTEND_URL` in `docker-compose.prod.yml`:
```yaml
api:
  environment:
    - FRONTEND_URL=http://localhost  # Change to your actual frontend URL
```

Then restart the API container:
```bash
docker-compose -f docker-compose.prod.yml up -d api
```

---

# Unified Production Dockerfile (Single Container)

## Overview

For simple deployments (e.g., Render, Railway, single VPS), use the unified `Dockerfile` in the project root. This single container includes:

- **Frontend**: Built React app served as static files
- **API**: Compiled NestJS backend
- **Prisma**: Database migrations run on startup
- **Serve Static**: Frontend served by NestJS via `@nestjs/serve-static`

## Architecture

```
┌───────────────────────────────────────────────────────────────┐
│                    Unified Container                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │  NestJS API + Static Frontend (via @nestjs/serve-static)│  │
│  │  Port: ${PORT:-3000} (configurable)                     │  │
│  │                                                         │  │
│  │  • /api/*      → API endpoints                          │  │
│  │  • /health     → Health check                           │  │
│  │  • /api/docs   → Swagger documentation                  │  │
│  │  • /*          → React SPA (serves index.html)         │  │
│  └─────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

## Build

```bash
# Build the image
docker build -t call-calendar .

# Build with custom tag
docker build -t call-calendar:v1.0.0 .
```

## Run

### Basic (with default port 3000)
```bash
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://postgres:password@db:5432/call_calendar" \
  --name call-calendar \
  call-calendar
```

### With custom port
```bash
docker run -d \
  -p 8080:8080 \
  -e PORT=8080 \
  -e DATABASE_URL="postgresql://postgres:password@db:5432/call_calendar" \
  --name call-calendar \
  call-calendar
```

### Full example with all environment variables
```bash
docker run -d \
  -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL="postgresql://postgres:password@db:5432/call_calendar" \
  -e FRONTEND_URL="http://localhost:3000" \
  -e NODE_ENV="production" \
  --name call-calendar \
  call-calendar
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 3000 | Server port (configurable) |
| `DATABASE_URL` | **Yes** | - | PostgreSQL connection string |
| `FRONTEND_URL` | No | http://localhost:5173 | CORS origin for frontend |
| `NODE_ENV` | No | production | Environment mode |

## Health Check

The container includes a health check that pings `/health` every 30 seconds:

```bash
# Check health status
docker ps

# View health check logs
docker inspect --format='{{.State.Health.Status}}' call-calendar
```

## URLs

When running on port 3000:

| URL | Description |
|-----|-------------|
| http://localhost:3000 | React frontend (SPA) |
| http://localhost:3000/api | API base path |
| http://localhost:3000/api/docs | Swagger documentation |
| http://localhost:3000/health | Health check endpoint |

## Cloud Deployment

### Render

Use the included `render.yaml` or deploy the Dockerfile directly:

```yaml
# render.yaml
services:
  - type: web
    name: call-calendar
    runtime: docker
    dockerfilePath: ./Dockerfile
    envVars:
      - key: PORT
        value: 3000
      - key: DATABASE_URL
        fromDatabase:
          name: postgres
          property: connectionString
```

### Railway

1. Connect your GitHub repo to Railway
2. Railway auto-detects the Dockerfile
3. Set `DATABASE_URL` environment variable

### Docker Compose (Single Container)

```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "${PORT:-3000}:${PORT:-3000}"
    environment:
      - PORT=${PORT:-3000}
      - DATABASE_URL=${DATABASE_URL}
      - FRONTEND_URL=${FRONTEND_URL:-http://localhost:3000}
    depends_on:
      postgres:
        condition: service_healthy
    restart: always

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: call_calendar
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-postgres}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-postgres} -d call_calendar"]
      interval: 5s
      timeout: 5s
      retries: 5
    restart: always

volumes:
  postgres_data:
```

## Troubleshooting

### Container exits immediately

```bash
# Check logs
docker logs call-calendar

# Most likely: DATABASE_URL is not set or invalid
```

### Database connection errors

Ensure `DATABASE_URL` includes the correct host (use service name in Docker network):

```
# For Docker Compose:
postgresql://postgres:password@postgres:5432/call_calendar

# For external database:
postgresql://postgres:password@your-db-host.com:5432/call_calendar
```

### Frontend shows 404 on page refresh

This is expected behavior for SPAs. The unified Dockerfile uses `@nestjs/serve-static` with SPA routing support. If you see 404s:

```bash
# Check that index.html exists in container
docker exec call-calendar ls -la /app/apps/api/public/
```

### Image size

The unified image is ~700MB (includes Node.js runtime, built frontend, and API). To reduce size:

```bash
# Multi-stage build already optimizes this
# For further reduction, use docker-slim or distroless base images
```

## Comparison: Unified vs Separate Containers

| Feature | Unified Dockerfile | Docker Compose (Separate) |
|---------|-------------------|-------------------------|
| **Complexity** | Simple, one container | Multiple services |
| **Best for** | Single server/cloud platforms | Local development, Kubernetes |
| **Portability** | Single image to deploy | Compose file + multiple images |
| **Scaling** | Scale entire app together | Scale services independently |
| **Hot reload** | ❌ Production build only | ✅ Dev: API/Web hot reload |
| **Port config** | Single `PORT` env var | Separate ports for each service |
| **Ideal use** | Render, Railway, VPS | Development, complex deployments |
