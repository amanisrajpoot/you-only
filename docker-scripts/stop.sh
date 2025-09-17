#!/bin/bash

# Chawkbazar Docker Stop Script
# This script stops the Chawkbazar application

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Stop services
stop_services() {
    print_status "Stopping Chawkbazar services..."
    docker-compose down
    
    print_success "Services stopped successfully!"
}

# Stop and remove volumes (data will be lost)
stop_and_clean() {
    print_warning "This will stop services and remove all data (volumes)."
    print_warning "Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Stopping services and removing volumes..."
        docker-compose down -v
        print_success "Services stopped and data removed!"
    else
        print_status "Operation cancelled."
    fi
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -c, --clean    Stop services and remove volumes (data will be lost)"
    echo "  -h, --help     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              Stop services (keep data)"
    echo "  $0 --clean      Stop services and remove all data"
}

# Main execution
main() {
    case "${1:-}" in
        -c|--clean)
            stop_and_clean
            ;;
        -h|--help)
            show_help
            ;;
        "")
            stop_services
            ;;
        *)
            print_error "Unknown option: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
