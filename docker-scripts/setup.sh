#!/bin/bash

# Chawkbazar Docker Setup Script
# This script sets up the Chawkbazar application using Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if Docker is installed
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    print_success "Docker and Docker Compose are installed."
}

# Check if .env file exists
check_env_file() {
    print_status "Checking environment configuration..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found. Creating from template..."
        cp env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        print_warning "Press Enter when you're done editing the .env file..."
        read
    fi
    print_success "Environment configuration found."
}

# Generate application key
generate_app_key() {
    print_status "Generating Laravel application key..."
    if [ -f "chawkbazar-api/.env" ]; then
        cd chawkbazar-api
        if ! grep -q "APP_KEY=" .env || grep -q "APP_KEY=$" .env; then
            docker run --rm -v $(pwd):/app -w /app php:8.1-cli php -r "echo 'APP_KEY=' . base64_encode(random_bytes(32)) . PHP_EOL;" >> .env
            print_success "Application key generated."
        else
            print_warning "Application key already exists."
        fi
        cd ..
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting Docker services..."
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 30
    
    print_status "Running database migrations..."
    docker-compose exec backend php artisan migrate --force
    
    print_status "Installing Marvel packages..."
    docker-compose exec backend php artisan marvel:install
    
    print_status "Creating storage link..."
    docker-compose exec backend php artisan storage:link
    
    print_status "Clearing caches..."
    docker-compose exec backend php artisan config:cache
    docker-compose exec backend php artisan route:cache
    docker-compose exec backend php artisan view:cache
    
    print_success "All services are running!"
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

# Main execution
main() {
    print_status "Starting Chawkbazar Docker setup..."
    
    check_docker
    check_env_file
    generate_app_key
    start_services
    show_status
    
    print_success "Setup completed successfully!"
    print_warning "Don't forget to:"
    print_warning "1. Configure your domain in nginx/conf.d/chawkbazar.conf"
    print_warning "2. Set up SSL certificates for production"
    print_warning "3. Configure payment gateways and other services in .env files"
}

# Run main function
main "$@"
