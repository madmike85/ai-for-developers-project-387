FROM node:20-alpine

WORKDIR /app

# Install wget for health checks
RUN apk add --no-cache wget

# Copy package.json files (NOT package-lock.json to avoid platform conflicts)
COPY package.json ./
COPY apps/web/package.json ./apps/web/

# Install dependencies (will generate fresh lock file for Linux ARM64)
RUN npm install

# Copy all source code (since we're not using bind mounts)
COPY apps/web/src ./apps/web/src
COPY apps/web/public ./apps/web/public
COPY apps/web/index.html ./apps/web/
COPY apps/web/vite.config.ts ./apps/web/
COPY apps/web/tsconfig*.json ./apps/web/
COPY apps/web/eslint.config.js ./apps/web/

# Expose port
EXPOSE 5173

# Start dev server with external access
CMD ["npm", "run", "dev", "--workspace=web", "--", "--host", "0.0.0.0"]
