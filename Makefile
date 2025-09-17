# Chawkbazar Docker Makefile
# Provides convenient commands for managing the Docker environment

.PHONY: help setup start stop restart logs backup update clean status

# Default target
help: ## Show this help message
	@echo "Chawkbazar Docker Management"
	@echo "============================"
	@echo ""
	@echo "Available commands:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Setup commands
setup: ## Initial setup of the application
	@echo "Setting up Chawkbazar..."
	@./docker-scripts/setup.sh

# Service management
start: ## Start all services
	@echo "Starting services..."
	@./docker-scripts/start.sh

stop: ## Stop all services
	@echo "Stopping services..."
	@./docker-scripts/stop.sh

restart: ## Restart all services
	@echo "Restarting services..."
	@./docker-scripts/restart.sh

restart-build: ## Restart and rebuild services
	@echo "Restarting and rebuilding services..."
	@./docker-scripts/restart.sh --build

# Development commands
dev: ## Start development environment
	@echo "Starting development environment..."
	@docker-compose -f docker-compose.dev.yml up -d

dev-stop: ## Stop development environment
	@echo "Stopping development environment..."
	@docker-compose -f docker-compose.dev.yml down

# Logging
logs: ## Show logs for all services
	@./docker-scripts/logs.sh

logs-backend: ## Show logs for backend service
	@./docker-scripts/logs.sh backend

logs-admin: ## Show logs for admin service
	@./docker-scripts/logs.sh admin

logs-shop: ## Show logs for shop service
	@./docker-scripts/logs.sh shop

logs-nginx: ## Show logs for nginx service
	@./docker-scripts/logs.sh nginx

logs-mysql: ## Show logs for mysql service
	@./docker-scripts/logs.sh mysql

logs-redis: ## Show logs for redis service
	@./docker-scripts/logs.sh redis

# Backup and restore
backup: ## Create full backup
	@echo "Creating backup..."
	@./docker-scripts/backup.sh --full

backup-db: ## Create database backup only
	@echo "Creating database backup..."
	@./docker-scripts/backup.sh --database

backup-list: ## List existing backups
	@./docker-scripts/backup.sh --list

backup-clean: ## Clean old backups
	@./docker-scripts/backup.sh --clean 7

# Update commands
update: ## Full update with backup
	@echo "Updating application..."
	@./docker-scripts/update.sh --full

update-quick: ## Quick update without rebuild
	@echo "Quick update..."
	@./docker-scripts/update.sh --quick

update-no-backup: ## Update without backup
	@echo "Updating without backup..."
	@./docker-scripts/update.sh --no-backup

# Maintenance commands
status: ## Show service status
	@echo "Service Status:"
	@docker-compose ps

clean: ## Clean up containers and images
	@echo "Cleaning up..."
	@docker-compose down
	@docker system prune -f

clean-all: ## Clean up everything including volumes
	@echo "Cleaning up everything..."
	@docker-compose down -v
	@docker system prune -af

# Database commands
db-migrate: ## Run database migrations
	@echo "Running migrations..."
	@docker-compose exec backend php artisan migrate

db-seed: ## Seed database
	@echo "Seeding database..."
	@docker-compose exec backend php artisan db:seed

db-reset: ## Reset database
	@echo "Resetting database..."
	@docker-compose exec backend php artisan migrate:fresh --seed

# Laravel commands
artisan: ## Run artisan command (usage: make artisan CMD="migrate")
	@docker-compose exec backend php artisan $(CMD)

composer: ## Run composer command (usage: make composer CMD="install")
	@docker-compose exec backend composer $(CMD)

# Frontend commands
yarn-admin: ## Run yarn command in admin (usage: make yarn-admin CMD="install")
	@docker-compose exec admin yarn $(CMD)

yarn-shop: ## Run yarn command in shop (usage: make yarn-shop CMD="install")
	@docker-compose exec shop yarn $(CMD)

# Health checks
health: ## Check application health
	@echo "Checking application health..."
	@curl -f http://localhost/health || echo "Health check failed"

health-backend: ## Check backend health
	@echo "Checking backend health..."
	@curl -f http://localhost/backend/health || echo "Backend health check failed"

health-admin: ## Check admin health
	@echo "Checking admin health..."
	@curl -f http://localhost:3002/api/health || echo "Admin health check failed"

health-shop: ## Check shop health
	@echo "Checking shop health..."
	@curl -f http://localhost:3003/api/health || echo "Shop health check failed"

# Production deployment
deploy: ## Deploy to production
	@echo "Deploying to production..."
	@make backup
	@make update
	@make status

# Quick development setup
dev-setup: ## Quick development setup
	@echo "Setting up development environment..."
	@cp env.example .env
	@cp chawkbazar-api/env.example chawkbazar-api/.env
	@cp admin/rest/env.example admin/rest/.env
	@cp shop/env.example shop/.env
	@make dev
	@echo "Development environment ready!"
	@echo "Access:"
	@echo "  - Backend: http://localhost:8001"
	@echo "  - Admin: http://localhost:3003"
	@echo "  - Shop: http://localhost:3004"
