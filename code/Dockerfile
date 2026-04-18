# Multi-stage Dockerfile for Call Calendar Application
# Includes PostgreSQL, NestJS API, and React Web frontend
# All services run in a single container
# Cache buster: 2026-04-11 - HEALTHCHECK port 8080 fix

# Stage 1: Dependencies installation
FROM node:20-alpine AS deps

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/db/package.json ./packages/db/
COPY packages/db/tsconfig.json ./packages/db/

# Install root dependencies
RUN npm install

# Install workspace dependencies
RUN cd packages/db && npm install
RUN cd apps/api && npm install
RUN cd apps/web && npm install

# Ensure workspace node_modules directories exist (npm workspaces may hoist all deps to root)
RUN mkdir -p /app/apps/api/node_modules /app/apps/web/node_modules /app/packages/db/node_modules

# Stage 2: Build packages/db
FROM deps AS db-build

WORKDIR /app

# Install Prisma globally
RUN npm install -g prisma@5.22.0

# Copy Prisma schema and source
COPY packages/db/prisma ./packages/db/prisma/
COPY packages/db/src ./packages/db/src/

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build packages/db
RUN cd packages/db && npm run build

# Stage 3: Build API
FROM db-build AS api-build

WORKDIR /app

# Install NestJS CLI and TypeScript globally
RUN npm install -g @nestjs/cli typescript

# Copy API source code
COPY apps/api/src ./apps/api/src/
COPY apps/api/tsconfig*.json ./apps/api/
COPY apps/api/nest-cli.json ./apps/api/

# Build API
RUN cd apps/api && npm run build

# Stage 4: Build Web
FROM deps AS web-builder

WORKDIR /app

# Install platform-specific native bindings required by Vite 8
RUN apk add --no-cache python3 make g++ && \
    ARCH=$(uname -m) && \
    if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then \
        cd apps/web && npm install @rolldown/binding-linux-arm64-musl lightningcss-linux-arm64-musl; \
    elif [ "$ARCH" = "x86_64" ] || [ "$ARCH" = "amd64" ]; then \
        cd apps/web && npm install @rolldown/binding-linux-x64-musl lightningcss-linux-x64-musl; \
    fi

# Copy web source code
COPY apps/web/src ./apps/web/src/
COPY apps/web/public ./apps/web/public/
COPY apps/web/index.html ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tsconfig*.json ./apps/web/
COPY apps/web/eslint.config.js ./apps/web/

# Build web application (production)
ENV VITE_API_URL=http://localhost:8080
ENV VITE_USE_MOCK_API=false
RUN cd apps/web && npm run build

# Ensure dist layer is properly exported (create marker file to force layer creation)
RUN touch /app/apps/web/dist/.build-complete && ls -la /app/apps/web/dist/

# Stage 5: Runtime with PostgreSQL and Node.js
FROM postgres:15-alpine AS runtime

WORKDIR /app

# Install Node.js 20 in the PostgreSQL image
RUN apk add --no-cache nodejs npm wget openssl

# Create postgres data directory and set permissions
RUN mkdir -p /var/lib/postgresql/data && chown -R postgres:postgres /var/lib/postgresql/data

# Create app directory (and all subdirectories used at runtime) and set permissions
RUN mkdir -p /app/apps/api/public /app/apps/web/dist /app/packages/db \
    && chown -R postgres:postgres /app

# Switch to postgres user for subsequent operations
USER postgres

# Set environment variables
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=postgres
ENV POSTGRES_DB=call_calendar
ENV DATABASE_URL=postgresql://postgres:postgres@localhost:5432/call_calendar?schema=public
ENV FRONTEND_URL=http://localhost:8080
ENV PORT=8080
ENV NODE_ENV=production
ENV PGDATA=/var/lib/postgresql/data

# Copy node_modules from builder
# Root node_modules must come from db-build (contains generated Prisma client in .prisma/client/)
COPY --from=db-build --chown=postgres:postgres /app/node_modules ./node_modules
COPY --from=deps --chown=postgres:postgres /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps --chown=postgres:postgres /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps --chown=postgres:postgres /app/packages/db/node_modules ./packages/db/node_modules

# Copy package.json files
COPY --chown=postgres:postgres package.json ./
COPY --chown=postgres:postgres apps/api/package.json ./apps/api/
COPY --chown=postgres:postgres apps/web/package.json ./apps/web/
COPY --chown=postgres:postgres packages/db/package.json ./packages/db/
COPY --chown=postgres:postgres packages/db/tsconfig.json ./packages/db/

# Copy Prisma files
COPY --from=db-build --chown=postgres:postgres /app/packages/db/prisma ./packages/db/prisma/
COPY --from=db-build --chown=postgres:postgres /app/packages/db/dist ./packages/db/dist/
COPY --from=db-build --chown=postgres:postgres /app/packages/db/src ./packages/db/src/

# Copy built API
COPY --from=api-build --chown=postgres:postgres /app/apps/api/dist ./apps/api/dist/

# Copy built Web files (static assets to be served by API)
COPY --from=web-builder --chown=postgres:postgres /app/apps/web/dist ./apps/web/dist/

# Copy entrypoint script
COPY --chown=postgres:postgres docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Expose port (will use PORT environment variable at runtime)
EXPOSE 8080

# Health check - hardcoded port 8080 for reliability
HEALTHCHECK --interval=5s --timeout=5s --start-period=120s --retries=10 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Entrypoint
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
