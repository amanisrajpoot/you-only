#!/bin/bash

# Chawkbazar Quick Deployment Script
# This script deploys the Chawkbazar application using Docker

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

# Create environment files
create_env_files() {
    print_status "Creating environment files..."
    
    # Main .env file
    if [ ! -f ".env" ]; then
        cat > .env << EOF
# Application Configuration
APP_NAME=Chawkbazar
APP_ENV=production
APP_KEY=base64:your-app-key-will-be-generated
APP_DEBUG=false
APP_URL=http://localhost

# Database Configuration
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=chawkbazar
DB_USERNAME=chawkbazar_user
DB_PASSWORD=chawkbazar_secure_password_2024
DB_ROOT_PASSWORD=root_secure_password_2024

# Redis Configuration
REDIS_HOST=redis
REDIS_PASSWORD=
REDIS_PORT=6379
REDIS_DB=0
REDIS_CACHE_DB=1

# Cache Configuration
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis

# Frontend URLs
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3002

# Mail Configuration (Optional)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@chawkbazar.com
MAIL_FROM_NAME="\${APP_NAME}"

# Security
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SESSION_DOMAIN=localhost
EOF
        print_success "Main .env file created."
    fi

    # Backend Express .env file
    if [ ! -f "backend-express/.env" ]; then
        cat > backend-express/.env << EOF
# Express Backend Environment Configuration
NODE_ENV=production
PORT=8000

# Database Configuration
DB_HOST=mysql
DB_PORT=3306
DB_USER=chawkbazar_user
DB_PASSWORD=chawkbazar_secure_password_2024
DB_NAME=chawkbazar

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-here-2024
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost,http://localhost:3002,http://localhost:3003

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# API Configuration
API_PREFIX=
API_VERSION=v1

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Security
BCRYPT_ROUNDS=12
EOF
        print_success "Backend Express .env file created."
    fi

    # Admin .env file
    if [ ! -f "admin/rest/.env" ]; then
        cat > admin/rest/.env << EOF
# Admin Frontend Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-nextauth-secret-here-2024
EOF
        print_success "Admin .env file created."
    fi

    # Shop .env file
    if [ ! -f "shop/.env" ]; then
        cat > shop/.env << EOF
# Shop Frontend Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-nextauth-secret-here-2024
EOF
        print_success "Shop .env file created."
    fi
}

# Update docker-compose.yml to use Express backend instead of Laravel
update_docker_compose() {
    print_status "Updating Docker Compose configuration for Express backend..."
    
    # Create a custom docker-compose file for Express backend
    cat > docker-compose.express.yml << EOF
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: chawkbazar_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: \${DB_ROOT_PASSWORD:-root_secure_password_2024}
      MYSQL_DATABASE: \${DB_DATABASE:-chawkbazar}
      MYSQL_USER: \${DB_USERNAME:-chawkbazar_user}
      MYSQL_PASSWORD: \${DB_PASSWORD:-chawkbazar_secure_password_2024}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - chawkbazar_network
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p\${DB_ROOT_PASSWORD:-root_secure_password_2024}"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 30s

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: chawkbazar_redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - chawkbazar_network
    command: redis-server --appendonly yes
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 30s

  # Express Backend API
  backend:
    build:
      context: ./backend-express
      dockerfile: Dockerfile
    container_name: chawkbazar_backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - PORT=8000
      - DB_HOST=mysql
      - DB_PORT=3306
      - DB_USER=chawkbazar_user
      - DB_PASSWORD=chawkbazar_secure_password_2024
      - DB_NAME=chawkbazar
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=your-jwt-secret-key-here-2024
      - CORS_ORIGIN=http://localhost,http://localhost:3002,http://localhost:3003
    volumes:
      - backend_uploads:/app/uploads
      - backend_logs:/app/logs
    ports:
      - "8000:8000"
    depends_on:
      - mysql
      - redis
    networks:
      - chawkbazar_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Next.js Admin Frontend
  admin:
    build:
      context: ./admin/rest
      dockerfile: Dockerfile
    container_name: chawkbazar_admin
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
      - NEXT_PUBLIC_SHOP_URL=http://localhost
      - NEXT_PUBLIC_SITE_URL=http://localhost:3002
    ports:
      - "3002:3002"
    depends_on:
      - backend
    networks:
      - chawkbazar_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3002"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Next.js Shop Frontend
  shop:
    build:
      context: ./shop
      dockerfile: Dockerfile
    container_name: chawkbazar_shop
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
      - NEXT_PUBLIC_SITE_URL=http://localhost:3003
    ports:
      - "3003:3003"
    depends_on:
      - backend
    networks:
      - chawkbazar_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3003"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: chawkbazar_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/conf.d:/etc/nginx/conf.d
      - backend_uploads:/var/www/html/uploads
    depends_on:
      - backend
      - admin
      - shop
    networks:
      - chawkbazar_network

volumes:
  mysql_data:
    driver: local
  redis_data:
    driver: local
  backend_uploads:
    driver: local
  backend_logs:
    driver: local

networks:
  chawkbazar_network:
    driver: bridge
EOF
    print_success "Docker Compose configuration updated for Express backend."
}

# Create Express backend Dockerfile if it doesn't exist
create_express_dockerfile() {
    if [ ! -f "backend-express/Dockerfile" ]; then
        print_status "Creating Dockerfile for Express backend..."
        cat > backend-express/Dockerfile << EOF
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start the application
CMD ["node", "server.js"]
EOF
        print_success "Express backend Dockerfile created."
    fi
}

# Build and start services
start_services() {
    print_status "Building and starting Docker services..."
    docker-compose -f docker-compose.express.yml up -d --build
    
    print_status "Waiting for services to be ready..."
    sleep 30
    
    print_success "All services are running!"
}

# Show service status
show_status() {
    print_status "Service Status:"
    docker-compose -f docker-compose.express.yml ps
    
    echo ""
    print_status "Application URLs:"
    echo "  - Shop Frontend: http://localhost:3003"
    echo "  - Admin Panel: http://localhost:3002"
    echo "  - API Backend: http://localhost:8000"
    echo "  - Health Check: http://localhost:8000/health"
    echo ""
    print_status "Direct Access (without Nginx):"
    echo "  - Shop: http://localhost:3003"
    echo "  - Admin: http://localhost:3002"
    echo "  - Backend: http://localhost:8000"
}

# Main execution
main() {
    print_status "Starting Chawkbazar Express deployment..."
    
    check_docker
    create_env_files
    create_express_dockerfile
    update_docker_compose
    start_services
    show_status
    
    print_success "Deployment completed successfully!"
    print_warning "Next steps:"
    print_warning "1. Test all URLs to ensure services are working"
    print_warning "2. Configure your domain in nginx/conf.d/chawkbazar.conf"
    print_warning "3. Set up SSL certificates for production"
    print_warning "4. Configure payment gateways and other services in .env files"
}

# Run main function
main "$@"
