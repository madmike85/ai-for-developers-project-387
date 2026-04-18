FROM node:20-alpine

WORKDIR /app

# Install necessary tools for health checks, Prisma, and OpenSSL
RUN apk add --no-cache wget openssl

# Install Prisma CLI globally
RUN npm install -g prisma

# Copy package.json files for dependency installation
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/db/package*.json ./packages/db/
COPY packages/db/tsconfig.json ./packages/db/

# Install root dependencies
RUN npm install

# Install @prisma/client explicitly in packages/db
RUN cd packages/db && npm install @prisma/client prisma

# Copy Prisma schema and source files
COPY packages/db/prisma ./packages/db/prisma/
COPY packages/db/src ./packages/db/src/

# Generate Prisma client
RUN cd packages/db && npx prisma generate

# Build the packages/db package
RUN cd packages/db && npm run build

# Expose port
EXPOSE 3000

# Start script with migrations
CMD ["sh", "-c", "cd packages/db && npx prisma migrate deploy && cd /app && npm run start:dev --workspace=api"]
