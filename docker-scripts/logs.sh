#!/bin/bash

# Chawkbazar Docker Logs Script
# This script shows logs for the Chawkbazar application

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

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show logs for all services
show_all_logs() {
    print_status "Showing logs for all services..."
    docker-compose logs -f
}

# Show logs for specific service
show_service_logs() {
    local service=$1
    print_status "Showing logs for $service service..."
    docker-compose logs -f "$service"
}

# Show logs with timestamps
show_logs_with_timestamps() {
    print_status "Showing logs with timestamps..."
    docker-compose logs -f -t
}

# Show last N lines of logs
show_last_logs() {
    local lines=${1:-100}
    print_status "Showing last $lines lines of logs..."
    docker-compose logs --tail="$lines" -f
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS] [SERVICE]"
    echo ""
    echo "Options:"
    echo "  -t, --timestamps    Show logs with timestamps"
    echo "  -n, --tail N        Show last N lines (default: 100)"
    echo "  -h, --help          Show this help message"
    echo ""
    echo "Services:"
    echo "  backend             Laravel API backend"
    echo "  admin               Next.js admin frontend"
    echo "  shop                Next.js shop frontend"
    echo "  nginx               Nginx reverse proxy"
    echo "  mysql               MySQL database"
    echo "  redis               Redis cache"
    echo "  queue               Laravel queue worker"
    echo "  scheduler           Laravel scheduler"
    echo ""
    echo "Examples:"
    echo "  $0                  Show logs for all services"
    echo "  $0 backend          Show logs for backend service"
    echo "  $0 --tail 50        Show last 50 lines of all logs"
    echo "  $0 --timestamps     Show logs with timestamps"
}

# Main execution
main() {
    local service=""
    local timestamps=false
    local tail_lines=100
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            -t|--timestamps)
                timestamps=true
                shift
                ;;
            -n|--tail)
                tail_lines="$2"
                shift 2
                ;;
            -h|--help)
                show_help
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                show_help
                exit 1
                ;;
            *)
                service="$1"
                shift
                ;;
        esac
    done
    
    if [ -n "$service" ]; then
        show_service_logs "$service"
    elif [ "$timestamps" = true ]; then
        show_logs_with_timestamps
    else
        show_last_logs "$tail_lines"
    fi
}

# Run main function
main "$@"
