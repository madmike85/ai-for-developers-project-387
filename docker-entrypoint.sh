#!/bin/sh
set -e

# Call Calendar - Docker Entrypoint Script
# Orchestrates PostgreSQL and API startup

echo "================================"
echo "Call Calendar - Starting Services"
echo "================================"

# Start PostgreSQL (data directory is pre-initialized in Docker image)
echo "Starting PostgreSQL..."
pg_ctl -D "$PGDATA" -l /var/lib/postgresql/logfile start

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in $(seq 1 30); do
    if pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
        echo "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "ERROR: PostgreSQL failed to start within 30 seconds"
        exit 1
    fi
    echo "Waiting for PostgreSQL... ($i/30)"
    sleep 1
done

# Create database if it doesn't exist
if ! psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT 1" > /dev/null 2>&1; then
    echo "Creating database $POSTGRES_DB..."
    createdb -U "$POSTGRES_USER" "$POSTGRES_DB"
fi

# Set postgres user password for md5 authentication
echo "Setting postgres user password..."
psql -U "$POSTGRES_USER" -c "ALTER USER $POSTGRES_USER WITH PASSWORD '$POSTGRES_PASSWORD';" > /dev/null 2>&1 || true

# Run Prisma migrations
echo "Running database migrations..."
cd /app/packages/db
npx prisma migrate deploy --schema=./prisma/schema.prisma || true

cd /app

# Setup static files for web frontend
echo "Setting up static files..."
mkdir -p /app/apps/api/public
cp -r /app/apps/web/dist/* /app/apps/api/public/ 2>/dev/null || true

# Use PORT from environment if set, default to 3000
export PORT=${PORT:-3000}

echo "================================"
echo "Starting API Server on port $PORT"
echo "================================"

# Start the API server
# The API will serve static files and handle API requests
exec node apps/api/dist/main
