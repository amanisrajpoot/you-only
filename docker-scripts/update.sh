#!/bin/bash

# Chawkbazar Docker Update Script
# This script updates the Chawkbazar application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup before update
create_backup() {
    print_status "Creating backup before update..."
    if [ -f "./docker-scripts/backup.sh" ]; then
        ./docker-scripts/backup.sh --database
        print_success "Backup created successfully"
    else
        print_warning "Backup script not found. Skipping backup."
    fi
}

# Pull latest code
pull_latest_code() {
    print_status "Pulling latest code..."
    if [ -d ".git" ]; then
        git pull origin main
        print_success "Code updated successfully"
    else
        print_warning "Not a git repository. Please update code manually."
    fi
}

# Update dependencies
update_dependencies() {
    print_status "Updating PHP dependencies..."
    docker-compose exec backend composer install --no-dev --optimize-autoloader
    
    print_status "Updating Node.js dependencies..."
    docker-compose exec admin yarn install --production
    docker-compose exec shop yarn install --production
    
    print_success "Dependencies updated successfully"
}

# Run migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose exec backend php artisan migrate --force
    print_success "Migrations completed successfully"
}

# Clear caches
clear_caches() {
    print_status "Clearing application caches..."
    docker-compose exec backend php artisan config:cache
    docker-compose exec backend php artisan route:cache
    docker-compose exec backend php artisan view:cache
    docker-compose exec backend php artisan queue:restart
    print_success "Caches cleared successfully"
}

# Rebuild and restart services
rebuild_services() {
    print_status "Rebuilding and restarting services..."
    docker-compose down
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 30
    
    print_success "Services rebuilt and restarted successfully"
}

# Update without rebuilding
update_without_rebuild() {
    print_status "Updating without rebuilding..."
    docker-compose restart
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_success "Services restarted successfully"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
    
    echo ""
    print_status "Application URLs:"
    echo "  - Shop Frontend: http://localhost"
    echo "  - Admin Panel: http://localhost/admin"
    echo "  - API Backend: http://localhost/backend"
    echo "  - GraphQL Playground: http://localhost/backend/graphql"
    echo "  - Health Check: http://localhost/health"
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -f, --full           Full update (backup, pull, rebuild, migrate, clear cache)"
    echo "  -q, --quick          Quick update (restart services only)"
    echo "  -n, --no-backup      Update without creating backup"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --full            Full update with backup"
    echo "  $0 --quick           Quick restart only"
    echo "  $0 --no-backup       Update without backup"
}

# Main execution
main() {
    local full_update=false
    local quick_update=false
    local no_backup=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -f|--full)
                full_update=true
                shift
                ;;
            -q|--quick)
                quick_update=true
                shift
                ;;
            -n|--no-backup)
                no_backup=true
                shift
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    if [ "$quick_update" = true ]; then
        update_without_rebuild
    elif [ "$full_update" = true ]; then
        if [ "$no_backup" = false ]; then
            create_backup
        fi
        pull_latest_code
        rebuild_services
        update_dependencies
        run_migrations
        clear_caches
    else
        print_error "Please specify an update type. Use --help for options."
        exit 1
    fi
    
    show_status
}

# Run main function
main "$@"
