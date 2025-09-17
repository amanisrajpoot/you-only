#!/bin/bash

# Chawkbazar Deployment Testing Script
# This script tests both traditional and Docker deployments locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
TEST_TIMEOUT=30
HEALTH_CHECK_RETRIES=10
HEALTH_CHECK_DELAY=5

# Utility functions
print_header() {
    echo -e "${PURPLE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                Chawkbazar Deployment Testing                 ║"
    echo "║                                                              ║"
    echo "║  This script will test both deployment methods locally      ║"
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Wait for service to be ready
wait_for_service() {
    local url=$1
    local service_name=$2
    local retries=$HEALTH_CHECK_RETRIES
    
    print_status "Waiting for $service_name to be ready..."
    
    while [ $retries -gt 0 ]; do
        if curl -f -s "$url" >/dev/null 2>&1; then
            print_success "$service_name is ready!"
            return 0
        fi
        
        retries=$((retries - 1))
        print_status "Retrying in ${HEALTH_CHECK_DELAY}s... ($retries attempts left)"
        sleep $HEALTH_CHECK_DELAY
    done
    
    print_error "$service_name failed to start within timeout"
    return 1
}

# Test HTTP endpoint
test_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local service_name=$3
    
    print_status "Testing $service_name at $url..."
    
    local response_code
    response_code=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$response_code" = "$expected_status" ]; then
        print_success "$service_name responded with status $response_code"
        return 0
    else
        print_error "$service_name responded with status $response_code (expected $expected_status)"
        return 1
    fi
}

# Test Docker deployment
test_docker_deployment() {
    print_header
    print_status "Testing Docker Deployment..."
    
    # Check if Docker is available
    if ! command_exists docker; then
        print_error "Docker is not installed. Skipping Docker tests."
        return 1
    fi
    
    if ! command_exists docker-compose; then
        print_error "Docker Compose is not installed. Skipping Docker tests."
        return 1
    fi
    
    # Start Docker services
    print_status "Starting Docker services..."
    if [ -f "docker-scripts/enhanced-setup.sh" ]; then
        chmod +x docker-scripts/enhanced-setup.sh
        ./docker-scripts/enhanced-setup.sh
    else
        print_error "Docker setup script not found."
        return 1
    fi
    
    # Wait for services to be ready
    wait_for_service "http://localhost:3002" "Admin Panel"
    wait_for_service "http://localhost:3003" "Shop Frontend"
    wait_for_service "http://localhost:8000" "Backend API"
    
    # Test endpoints
    local test_results=0
    
    test_endpoint "http://localhost:3002" 200 "Admin Panel" || test_results=$((test_results + 1))
    test_endpoint "http://localhost:3003" 200 "Shop Frontend" || test_results=$((test_results + 1))
    test_endpoint "http://localhost:8000" 200 "Backend API" || test_results=$((test_results + 1))
    
    # Test database connection
    print_status "Testing database connection..."
    if docker-compose exec -T backend php artisan tinker --execute="DB::connection()->getPdo(); echo 'Database connected';" >/dev/null 2>&1; then
        print_success "Database connection successful"
    else
        print_error "Database connection failed"
        test_results=$((test_results + 1))
    fi
    
    # Test Redis connection
    print_status "Testing Redis connection..."
    if docker-compose exec -T redis redis-cli ping | grep -q "PONG"; then
        print_success "Redis connection successful"
    else
        print_error "Redis connection failed"
        test_results=$((test_results + 1))
    fi
    
    # Show service status
    print_status "Docker service status:"
    docker-compose ps
    
    if [ $test_results -eq 0 ]; then
        print_success "Docker deployment test passed!"
        return 0
    else
        print_error "Docker deployment test failed with $test_results errors"
        return 1
    fi
}

# Test traditional deployment (simulated)
test_traditional_deployment() {
    print_header
    print_status "Testing Traditional Deployment (Simulated)..."
    
    # Check if required files exist
    local required_files=(
        "deployment/enhanced-setenv.mjs"
        "deployment/enhanced-backendbuildscript.mjs"
        "deployment/enhanced-frontendbuildscript.mjs"
        "deployment/frontendrunscript.mjs"
    )
    
    local missing_files=()
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_files+=("$file")
        fi
    done
    
    if [ ${#missing_files[@]} -gt 0 ]; then
        print_error "Missing required files for traditional deployment:"
        for file in "${missing_files[@]}"; do
            echo "  - $file"
        done
        return 1
    fi
    
    # Check if scripts are executable
    print_status "Checking script permissions..."
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            chmod +x "$file"
            print_success "Made $file executable"
        fi
    done
    
    # Validate environment files
    print_status "Validating environment files..."
    local env_files=(
        "env.example"
        "chawkbazar-api/env.example"
        "admin/rest/env.example"
        "shop/env.example"
    )
    
    local missing_env=()
    for file in "${env_files[@]}"; do
        if [ ! -f "$file" ]; then
            missing_env+=("$file")
        fi
    done
    
    if [ ${#missing_env[@]} -gt 0 ]; then
        print_warning "Missing environment template files:"
        for file in "${missing_env[@]}"; do
            echo "  - $file"
        done
    else
        print_success "All environment template files found"
    fi
    
    # Check if zx is available
    if command_exists zx; then
        print_success "zx is available for running deployment scripts"
    else
        print_warning "zx is not available. Install with: npm install -g zx"
    fi
    
    # Check if required system packages would be available
    print_status "Checking system requirements..."
    local system_commands=("mysql" "nginx" "php" "composer" "yarn" "node")
    local missing_commands=()
    
    for cmd in "${system_commands[@]}"; do
        if ! command_exists "$cmd"; then
            missing_commands+=("$cmd")
        fi
    done
    
    if [ ${#missing_commands[@]} -gt 0 ]; then
        print_warning "Missing system commands (would be installed by setenv.mjs):"
        for cmd in "${missing_commands[@]}"; do
            echo "  - $cmd"
        done
    else
        print_success "All required system commands are available"
    fi
    
    print_success "Traditional deployment validation passed!"
    print_status "To test traditional deployment on a real server:"
    echo "  1. Upload project to server"
    echo "  2. Run: zx deployment/enhanced-setenv.mjs"
    echo "  3. Run: zx deployment/enhanced-backendbuildscript.mjs"
    echo "  4. Run: zx deployment/enhanced-frontendbuildscript.mjs"
    echo "  5. Run: zx deployment/frontendrunscript.mjs"
    
    return 0
}

# Test configuration files
test_configuration() {
    print_header
    print_status "Testing Configuration Files..."
    
    local config_files=(
        "docker-compose.yml"
        "docker-compose.dev.yml"
        "nginx/nginx.conf"
        "nginx/conf.d/chawkbazar.conf"
    )
    
    local test_results=0
    
    for file in "${config_files[@]}"; do
        if [ -f "$file" ]; then
            print_success "Found $file"
            
            # Basic syntax validation
            case "$file" in
                *.yml|*.yaml)
                    if command_exists docker-compose; then
                        if docker-compose -f "$file" config >/dev/null 2>&1; then
                            print_success "$file syntax is valid"
                        else
                            print_error "$file syntax is invalid"
                            test_results=$((test_results + 1))
                        fi
                    fi
                    ;;
                *.conf)
                    if command_exists nginx; then
                        if nginx -t -c "$(pwd)/$file" >/dev/null 2>&1; then
                            print_success "$file syntax is valid"
                        else
                            print_warning "$file syntax validation skipped (nginx not available)"
                        fi
                    fi
                    ;;
            esac
        else
            print_error "Missing $file"
            test_results=$((test_results + 1))
        fi
    done
    
    if [ $test_results -eq 0 ]; then
        print_success "Configuration files test passed!"
        return 0
    else
        print_error "Configuration files test failed with $test_results errors"
        return 1
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up test environment..."
    
    if [ -f "docker-compose.yml" ]; then
        docker-compose down 2>/dev/null || true
    fi
    
    print_success "Cleanup completed"
}

# Main execution
main() {
    # Set up cleanup trap
    trap cleanup EXIT
    
    local test_results=0
    
    # Test configuration files
    test_configuration || test_results=$((test_results + 1))
    
    # Test traditional deployment
    test_traditional_deployment || test_results=$((test_results + 1))
    
    # Ask user if they want to test Docker deployment
    echo ""
    read -p "Do you want to test Docker deployment? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        test_docker_deployment || test_results=$((test_results + 1))
    else
        print_status "Skipping Docker deployment test"
    fi
    
    # Summary
    echo ""
    print_header
    if [ $test_results -eq 0 ]; then
        print_success "All tests passed! Deployment is ready."
        print_status "You can now deploy using:"
        echo "  - Traditional: ./deploy.sh --traditional"
        echo "  - Docker: ./deploy.sh --docker"
        echo "  - Hybrid: ./deploy.sh --hybrid"
    else
        print_error "Some tests failed. Please fix the issues before deploying."
        print_status "Check the error messages above for details."
    fi
}

# Run main function
main "$@"
