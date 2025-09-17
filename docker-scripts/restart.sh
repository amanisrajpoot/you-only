#!/bin/bash

# Chawkbazar Docker Restart Script
# This script restarts the Chawkbazar application

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

# Restart services
restart_services() {
    print_status "Restarting Chawkbazar services..."
    docker-compose restart
    
    print_status "Waiting for services to be ready..."
    sleep 10
    
    print_success "Services restarted successfully!"
}

# Restart and rebuild
restart_and_rebuild() {
    print_status "Restarting and rebuilding Chawkbazar services..."
    docker-compose down
    docker-compose up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 30
    
    print_success "Services restarted and rebuilt successfully!"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose ps
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -b, --build    Restart and rebuild services"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              Restart services"
    echo "  $0 --build      Restart and rebuild services"
}

# Main execution
main() {
    case "${1:-}" in
        -b|--build)
            restart_and_rebuild
            ;;
        -h|--help)
            show_help
            ;;
        "")
            restart_services
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
    
    show_status
}

# Run main function
main "$@"
