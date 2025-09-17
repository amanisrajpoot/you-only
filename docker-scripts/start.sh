#!/bin/bash

# Chawkbazar Docker Start Script
# This script starts the Chawkbazar application

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

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found. Please run setup.sh first."
        exit 1
    fi
}

# Start services
start_services() {
    print_status "Starting Chawkbazar services..."
    docker-compose up -d
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_success "Services started successfully!"
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
    check_env_file
    start_services
    show_status
}

# Run main function
main "$@"
