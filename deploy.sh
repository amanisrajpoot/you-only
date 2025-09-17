#!/bin/bash

# Unified Chawkbazar Deployment Script
# This script provides both traditional and Docker deployment options

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="Chawkbazar"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Utility functions
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    $PROJECT_NAME Deployment                    ║"
    echo "║                                                              ║"
    echo "║  Choose your deployment method:                              ║"
    echo "║  1. Traditional Server Deployment (Recommended for Production) ║"
    echo "║  2. Docker Deployment (Recommended for Development)         ║"
    echo "║  3. Hybrid Deployment (Docker + Traditional)                ║"
    echo "║  4. Exit                                                     ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

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

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -d "chawkbazar-api" ]; then
        print_error "Please run this script from the project root directory."
        exit 1
    fi
    
    # Check if required files exist
    local missing_files=()
    
    if [ ! -f "deployment/enhanced-setenv.mjs" ]; then
        missing_files+=("deployment/enhanced-setenv.mjs")
    fi
    
    if [ ! -f "deployment/enhanced-backendbuildscript.mjs" ]; then
        missing_files+=("deployment/enhanced-backendbuildscript.mjs")
    fi
    
    if [ ! -f "deployment/enhanced-frontendbuildscript.mjs" ]; then
        missing_files+=("deployment/enhanced-frontendbuildscript.mjs")
    fi
    
    if [ ! -f "docker-compose.yml" ]; then
        missing_files+=("docker-compose.yml")
    fi
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing required files:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        print_error "Please ensure all deployment files are present."
        exit 1
    fi
    
    print_success "Prerequisites check passed."
}

# Traditional deployment
deploy_traditional() {
    print_status "Starting Traditional Server Deployment..."
    
    echo ""
    print_warning "This will deploy Chawkbazar using traditional server setup."
    print_warning "Make sure you have:"
    print_warning "1. A Ubuntu/Debian server with root access"
    print_warning "2. Domain name pointing to your server"
    print_warning "3. SSH access to the server"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Traditional deployment cancelled."
        return 1
    fi
    
    # Get server details
    echo ""
    read -p "Enter server username (e.g., ubuntu): " SERVER_USER
    read -p "Enter server IP address: " SERVER_IP
    read -p "Enter domain name (e.g., example.com): " DOMAIN_NAME
    
    if [ -z "$SERVER_USER" ] || [ -z "$SERVER_IP" ] || [ -z "$DOMAIN_NAME" ]; then
        print_error "All fields are required."
        return 1
    fi
    
    print_status "Starting traditional deployment..."
    
    # Step 1: Server Setup
    print_status "Step 1: Setting up server environment..."
    scp deployment/enhanced-setenv.mjs $SERVER_USER@$SERVER_IP:/tmp/
    ssh $SERVER_USER@$SERVER_IP "sudo zx /tmp/enhanced-setenv.mjs"
    
    # Step 2: Backend Deployment
    print_status "Step 2: Deploying backend..."
    scp -r chawkbazar-api $SERVER_USER@$SERVER_IP:/var/www/chawkbazar-laravel/
    scp deployment/enhanced-backendbuildscript.mjs $SERVER_USER@$SERVER_IP:/var/www/chawkbazar-laravel/
    ssh $SERVER_USER@$SERVER_IP "cd /var/www/chawkbazar-laravel && sudo zx enhanced-backendbuildscript.mjs"
    
    # Step 3: Frontend Deployment
    print_status "Step 3: Deploying frontend..."
    scp -r admin shop package.json babel.config.js yarn.lock $SERVER_USER@$SERVER_IP:/var/www/chawkbazar-laravel/
    scp deployment/enhanced-frontendbuildscript.mjs $SERVER_USER@$SERVER_IP:/var/www/chawkbazar-laravel/
    ssh $SERVER_USER@$SERVER_IP "cd /var/www/chawkbazar-laravel && zx enhanced-frontendbuildscript.mjs"
    
    # Step 4: Start Services
    print_status "Step 4: Starting frontend services..."
    scp deployment/frontendrunscript.mjs $SERVER_USER@$SERVER_IP:/var/www/chawkbazar-laravel/
    ssh $SERVER_USER@$SERVER_IP "cd /var/www/chawkbazar-laravel && zx frontendrunscript.mjs"
    
    print_success "Traditional deployment completed!"
    print_status "Application URLs:"
    echo "  - Shop: https://$DOMAIN_NAME"
    echo "  - Admin: https://$DOMAIN_NAME/admin"
    echo "  - API: https://$DOMAIN_NAME/backend"
}

# Docker deployment
deploy_docker() {
    print_status "Starting Docker Deployment..."
    
    echo ""
    print_warning "This will deploy Chawkbazar using Docker containers."
    print_warning "Make sure you have:"
    print_warning "1. Docker and Docker Compose installed"
    print_warning "2. At least 4GB RAM available"
    print_warning "3. At least 10GB disk space available"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Docker deployment cancelled."
        return 1
    fi
    
    # Check if Docker is available
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        return 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        return 1
    fi
    
    # Run Docker setup
    if [ -f "docker-scripts/enhanced-setup.sh" ]; then
        chmod +x docker-scripts/enhanced-setup.sh
        ./docker-scripts/enhanced-setup.sh
    else
        print_error "Docker setup script not found."
        return 1
    fi
    
    print_success "Docker deployment completed!"
    print_status "Application URLs:"
    echo "  - Shop: http://localhost"
    echo "  - Admin: http://localhost/admin"
    echo "  - API: http://localhost/backend"
}

# Hybrid deployment
deploy_hybrid() {
    print_status "Starting Hybrid Deployment..."
    
    echo ""
    print_warning "This will deploy Chawkbazar using Docker for development and traditional for production."
    print_warning "This approach provides:"
    print_warning "1. Docker for local development and testing"
    print_warning "2. Traditional deployment for production server"
    echo ""
    
    read -p "Do you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Hybrid deployment cancelled."
        return 1
    fi
    
    # Set up Docker for development
    print_status "Setting up Docker development environment..."
    if [ -f "docker-scripts/enhanced-setup.sh" ]; then
        chmod +x docker-scripts/enhanced-setup.sh
        ./docker-scripts/enhanced-setup.sh
    fi
    
    print_success "Hybrid deployment completed!"
    print_status "Development URLs (Docker):"
    echo "  - Shop: http://localhost"
    echo "  - Admin: http://localhost/admin"
    echo "  - API: http://localhost/backend"
    echo ""
    print_status "For production deployment, use the traditional method:"
    echo "  ./deploy.sh --traditional"
}

# Show help
show_help() {
    echo "Chawkbazar Deployment Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --traditional    Deploy using traditional server setup"
    echo "  --docker         Deploy using Docker containers"
    echo "  --hybrid         Deploy using hybrid approach"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                    # Interactive mode"
    echo "  $0 --traditional      # Traditional deployment"
    echo "  $0 --docker           # Docker deployment"
    echo "  $0 --hybrid           # Hybrid deployment"
}

# Main execution
main() {
    # Check prerequisites
    check_prerequisites
    
    # Handle command line arguments
    case "${1:-}" in
        --traditional)
            deploy_traditional
            ;;
        --docker)
            deploy_docker
            ;;
        --hybrid)
            deploy_hybrid
            ;;
        --help)
            show_help
            exit 0
            ;;
        "")
            # Interactive mode
            while true; do
                print_header
                read -p "Enter your choice (1-4): " choice
                case $choice in
                    1)
                        deploy_traditional
                        break
                        ;;
                    2)
                        deploy_docker
                        break
                        ;;
                    3)
                        deploy_hybrid
                        break
                        ;;
                    4)
                        print_status "Exiting..."
                        exit 0
                        ;;
                    *)
                        print_error "Invalid choice. Please enter 1-4."
                        ;;
                esac
            done
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
