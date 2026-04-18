# Makefile for Call Calendar Application
# Used by Hexlet project-action for testing

.PHONY: setup build start test lint clean

# Setup command - installs dependencies and prepares the application
# This is called by 'docker compose run app make setup'
setup:
	@echo "Setting up Call Calendar application..."
	# Install root dependencies
	npm install
	# Generate Prisma client
	cd packages/db && npx prisma generate
	# Build packages/db
	cd packages/db && npm run build
	# Build API
	cd apps/api && npm run build
	# Build Web
	cd apps/web && npm run build
	@echo "Setup complete!"

# Build all applications
build:
	@echo "Building all applications..."
	cd packages/db && npm run build
	cd apps/api && npm run build
	cd apps/web && npm run build
	@echo "Build complete!"

# Start the application (for local development)
start:
	@echo "Starting application..."
	npm run start

# Run tests
test:
	@echo "Running tests..."
	cd apps/api && npm test
	cd apps/web && npm test

# Run linting
lint:
	@echo "Running linter..."
	cd apps/api && npm run lint
	cd apps/web && npm run lint

# Clean build artifacts and dependencies
clean:
	@echo "Cleaning..."
	rm -rf node_modules
	rm -rf apps/api/node_modules
	rm -rf apps/web/node_modules
	rm -rf packages/db/node_modules
	rm -rf apps/api/dist
	rm -rf apps/web/dist
	rm -rf packages/db/dist
	@echo "Clean complete!"

# Docker commands
docker-up:
	docker compose up --build

docker-down:
	docker compose down

docker-dev-up:
	docker compose -f docker-compose.dev.yml up --build

docker-dev-down:
	docker compose -f docker-compose.dev.yml down
