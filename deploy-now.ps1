# Chawkbazar Express Deployment Script for Windows PowerShell
# This script deploys the Chawkbazar application using Docker

param(
    [switch]$SkipEnvFiles,
    [switch]$Force
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"

# Function to print colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Check if Docker is installed
function Test-Docker {
    Write-Status "Checking Docker installation..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed. Please install Docker Desktop first."
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    }
    
    Write-Success "Docker and Docker Compose are installed."
}

# Create environment files
function New-EnvFiles {
    if ($SkipEnvFiles) {
        Write-Status "Skipping environment file creation..."
        return
    }
    
    Write-Status "Creating environment files..."
    
    # Main .env file
    if (-not (Test-Path ".env")) {
        @"
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

# Security
SANCTUM_STATEFUL_DOMAINS=localhost,127.0.0.1
SESSION_DOMAIN=localhost
"@ | Out-File -FilePath ".env" -Encoding UTF8
        Write-Success "Main .env file created."
    }

    # Backend Express .env file
    if (-not (Test-Path "backend-express\.env")) {
        @"
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
"@ | Out-File -FilePath "backend-express\.env" -Encoding UTF8
        Write-Success "Backend Express .env file created."
    }

    # Admin .env file
    if (-not (Test-Path "admin\rest\.env")) {
        @"
# Admin Frontend Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3002
NEXTAUTH_URL=http://localhost:3002
NEXTAUTH_SECRET=your-nextauth-secret-here-2024
"@ | Out-File -FilePath "admin\rest\.env" -Encoding UTF8
        Write-Success "Admin .env file created."
    }

    # Shop .env file
    if (-not (Test-Path "shop\.env")) {
        @"
# Shop Frontend Environment Configuration
NODE_ENV=production
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3003
NEXTAUTH_URL=http://localhost:3003
NEXTAUTH_SECRET=your-nextauth-secret-here-2024
"@ | Out-File -FilePath "shop\.env" -Encoding UTF8
        Write-Success "Shop .env file created."
    }
}

# Create Express backend Dockerfile if it doesn't exist
function New-ExpressDockerfile {
    if (-not (Test-Path "backend-express\Dockerfile")) {
        Write-Status "Creating Dockerfile for Express backend..."
        @"
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
"@ | Out-File -FilePath "backend-express\Dockerfile" -Encoding UTF8
        Write-Success "Express backend Dockerfile created."
    }
}

# Create Docker Compose file for Express backend
function New-DockerComposeExpress {
    Write-Status "Creating Docker Compose configuration for Express backend..."
    
    @"
version: '3.8'

services:
  # MySQL Database
  mysql:
    image: mysql:8.0
    container_name: chawkbazar_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: `${DB_ROOT_PASSWORD:-root_secure_password_2024}
      MYSQL_DATABASE: `${DB_DATABASE:-chawkbazar}
      MYSQL_USER: `${DB_USERNAME:-chawkbazar_user}
      MYSQL_PASSWORD: `${DB_PASSWORD:-chawkbazar_secure_password_2024}
    volumes:
      - mysql_data:/var/lib/mysql
    ports:
      - "3306:3306"
    networks:
      - chawkbazar_network
    command: --default-authentication-plugin=mysql_native_password
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-p`${DB_ROOT_PASSWORD:-root_secure_password_2024}"]
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
"@ | Out-File -FilePath "docker-compose.express.yml" -Encoding UTF8
    Write-Success "Docker Compose configuration created for Express backend."
}

# Build and start services
function Start-Services {
    Write-Status "Building and starting Docker services..."
    
    if ($Force) {
        Write-Status "Force rebuilding all containers..."
        docker-compose -f docker-compose.express.yml up -d --build --force-recreate
    } else {
        docker-compose -f docker-compose.express.yml up -d --build
    }
    
    Write-Status "Waiting for services to be ready..."
    Start-Sleep -Seconds 30
    
    Write-Success "All services are running!"
}

# Show service status
function Show-Status {
    Write-Status "Service Status:"
    docker-compose -f docker-compose.express.yml ps
    
    Write-Host ""
    Write-Status "Application URLs:"
    Write-Host "  - Shop Frontend: http://localhost:3003" -ForegroundColor $Green
    Write-Host "  - Admin Panel: http://localhost:3002" -ForegroundColor $Green
    Write-Host "  - API Backend: http://localhost:8000" -ForegroundColor $Green
    Write-Host "  - Health Check: http://localhost:8000/health" -ForegroundColor $Green
    Write-Host ""
    Write-Status "Direct Access (without Nginx):"
    Write-Host "  - Shop: http://localhost:3003" -ForegroundColor $Yellow
    Write-Host "  - Admin: http://localhost:3002" -ForegroundColor $Yellow
    Write-Host "  - Backend: http://localhost:8000" -ForegroundColor $Yellow
}

# Main execution
function Main {
    Write-Status "Starting Chawkbazar Express deployment..."
    
    Test-Docker
    New-EnvFiles
    New-ExpressDockerfile
    New-DockerComposeExpress
    Start-Services
    Show-Status
    
    Write-Success "Deployment completed successfully!"
    Write-Warning "Next steps:"
    Write-Warning "1. Test all URLs to ensure services are working"
    Write-Warning "2. Configure your domain in nginx/conf.d/chawkbazar.conf"
    Write-Warning "3. Set up SSL certificates for production"
    Write-Warning "4. Configure payment gateways and other services in .env files"
}

# Run main function
Main
