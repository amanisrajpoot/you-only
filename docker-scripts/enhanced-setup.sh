#!/bin/bash

# Enhanced Docker Setup Script for Chawkbazar
# This script provides a fail-proof Docker deployment alongside traditional deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="chawkbazar"
DOCKER_COMPOSE_FILE="docker-compose.yml"
DOCKER_COMPOSE_DEV_FILE="docker-compose.dev.yml"

# Utility functions
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        print_status "Visit: https://docs.docker.com/get-docker/"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        print_status "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed and running."
}

# Check system resources
check_resources() {
    print_status "Checking system resources..."
    
    # Check available memory
    if command -v free &> /dev/null; then
        MEMORY_GB=$(free -g | awk 'NR==2{print $2}')
        if [ "$MEMORY_GB" -lt 4 ]; then
            print_warning "System has less than 4GB RAM. Performance may be affected."
        fi
    fi
    
    # Check available disk space
    if command -v df &> /dev/null; then
        DISK_GB=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
        if [ "$DISK_GB" -lt 10 ]; then
            print_warning "Less than 10GB disk space available. Consider freeing up space."
        fi
    fi
    
    print_success "Resource check completed."
}

# Check if .env files exist and create them if needed
setup_environment() {
    print_status "Setting up environment configuration..."
    
    # Main .env file
    if [ ! -f ".env" ]; then
        if [ -f "env.example" ]; then
            print_status "Creating .env from template..."
            cp env.example .env
            print_warning "Please edit .env file with your configuration."
        else
            print_error ".env file not found and no template available."
            exit 1
        fi
    fi
    
    # Backend .env file
    if [ ! -f "chawkbazar-api/.env" ]; then
        if [ -f "chawkbazar-api/env.example" ]; then
            print_status "Creating backend .env from template..."
            cp chawkbazar-api/env.example chawkbazar-api/.env
        else
            print_warning "Backend .env template not found. Using main .env values."
        fi
    fi
    
    # Admin .env file
    if [ ! -f "admin/rest/.env" ]; then
        if [ -f "admin/rest/env.example" ]; then
            print_status "Creating admin .env from template..."
            cp admin/rest/env.example admin/rest/.env
        else
            print_warning "Admin .env template not found."
        fi
    fi
    
    # Shop .env file
    if [ ! -f "shop/.env" ]; then
        if [ -f "shop/env.example" ]; then
            print_status "Creating shop .env from template..."
            cp shop/env.example shop/.env
        else
            print_warning "Shop .env template not found."
        fi
    fi
    
    print_success "Environment configuration setup completed."
}

# Generate application key if needed
generate_app_key() {
    print_status "Generating Laravel application key..."
    
    if [ -f "chawkbazar-api/.env" ]; then
        # Check if APP_KEY is empty or not set
        if ! grep -q "APP_KEY=base64:" chawkbazar-api/.env; then
            print_status "Generating new application key..."
            docker run --rm -v "$(pwd)/chawkbazar-api:/app" -w /app php:8.1-cli php -r "echo 'APP_KEY=' . base64_encode(random_bytes(32)) . PHP_EOL;" >> chawkbazar-api/.env.tmp
            # Replace the APP_KEY line
            if grep -q "APP_KEY=" chawkbazar-api/.env; then
                sed -i '/APP_KEY=/d' chawkbazar-api/.env
            fi
            cat chawkbazar-api/.env.tmp >> chawkbazar-api/.env
            rm chawkbazar-api/.env.tmp
            print_success "Application key generated."
        else
            print_status "Application key already exists."
        fi
    fi
}

# Build Docker images
build_images() {
    print_status "Building Docker images..."
    
    # Build backend image
    print_status "Building backend image..."
    docker-compose build backend
    
    # Build frontend images
    print_status "Building admin image..."
    docker-compose build admin
    
    print_status "Building shop image..."
    docker-compose build shop
    
    print_success "All images built successfully."
}

# Start services
start_services() {
    print_status "Starting Docker services..."
    
    # Start services in order
    docker-compose up -d mysql redis
    
    print_status "Waiting for database to be ready..."
    sleep 30
    
    # Start backend
    docker-compose up -d backend
    
    print_status "Waiting for backend to be ready..."
    sleep 20
    
    # Start frontend services
    docker-compose up -d admin shop
    
    print_status "Waiting for all services to be ready..."
    sleep 30
    
    print_success "All services started successfully."
}

# Run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Wait for backend to be healthy
    print_status "Waiting for backend to be healthy..."
    timeout 60 bash -c 'until docker-compose exec backend php artisan migrate:status &>/dev/null; do sleep 5; done'
    
    # Run migrations
    docker-compose exec backend php artisan migrate --force
    
    print_status "Installing Marvel packages..."
    docker-compose exec backend php artisan marvel:install --force
    
    print_status "Creating storage link..."
    docker-compose exec backend php artisan storage:link
    
    print_success "Database setup completed."
}

# Clear caches
clear_caches() {
    print_status "Clearing application caches..."
    
    docker-compose exec backend php artisan config:cache
    docker-compose exec backend php artisan route:cache
    docker-compose exec backend php artisan view:cache
    
    print_success "Caches cleared successfully."
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
    
    echo ""
    print_status "Database Access:"
    echo "  - Host: localhost"
    echo "  - Port: 3306"
    echo "  - Database: ${DB_DATABASE:-chawkbazar}"
    echo "  - Username: ${DB_USERNAME:-chawkbazar_user}"
    
    echo ""
    print_status "Redis Access:"
    echo "  - Host: localhost"
    echo "  - Port: 6379"
}

# Health check
health_check() {
    print_status "Running health checks..."
    
    # Check if all services are running
    if ! docker-compose ps | grep -q "Up"; then
        print_error "Some services are not running."
        docker-compose ps
        return 1
    fi
    
    # Check backend health
    if curl -f http://localhost/backend/health &>/dev/null; then
        print_success "Backend health check passed."
    else
        print_warning "Backend health check failed. This might be normal if Nginx is not configured."
    fi
    
    # Check frontend services
    if curl -f http://localhost:3002 &>/dev/null; then
        print_success "Admin panel is accessible."
    else
        print_warning "Admin panel health check failed."
    fi
    
    if curl -f http://localhost:3003 &>/dev/null; then
        print_success "Shop frontend is accessible."
    else
        print_warning "Shop frontend health check failed."
    fi
    
    print_success "Health checks completed."
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    docker-compose down
    print_success "Cleanup completed."
}

# Main execution
main() {
    print_status "Starting Enhanced Chawkbazar Docker Setup..."
    
    # Set up error handling
    trap cleanup EXIT
    
    check_docker
    check_resources
    setup_environment
    generate_app_key
    build_images
    start_services
    run_migrations
    clear_caches
    health_check
    show_status
    
    print_success "Docker setup completed successfully!"
    print_warning "Don't forget to:"
    print_warning "1. Configure your domain in nginx/conf.d/chawkbazar.conf"
    print_warning "2. Set up SSL certificates for production"
    print_warning "3. Configure payment gateways and other services in .env files"
    print_warning "4. Test all functionality before going live"
}

# Run main function
main "$@"
