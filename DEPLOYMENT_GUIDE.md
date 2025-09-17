# Chawkbazar Deployment Guide

This comprehensive guide covers both traditional server deployment and Docker deployment for the Chawkbazar e-commerce application.

## 🚀 Quick Start

### Option 1: Interactive Deployment
```bash
./deploy.sh
```

### Option 2: Direct Deployment
```bash
# Traditional deployment
./deploy.sh --traditional

# Docker deployment
./deploy.sh --docker

# Hybrid deployment
./deploy.sh --hybrid
```

### Option 3: Test First
```bash
./test-deployment.sh
```

## 📋 Prerequisites

### For Traditional Deployment
- Ubuntu/Debian server with root access
- Domain name pointing to your server
- SSH access to the server
- At least 2GB RAM, 20GB disk space

### For Docker Deployment
- Docker and Docker Compose installed
- At least 4GB RAM, 10GB disk space
- Windows: Docker Desktop
- Linux/Mac: Docker Engine + Docker Compose

## 🏗️ Architecture Overview

### Traditional Deployment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx (80/443)│────│  PHP-FPM (8.1)  │────│   MySQL (8.0)   │
│   Reverse Proxy │    │  Laravel API    │    │   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────│  Next.js Apps   │
                        │  Admin + Shop   │
                        │  (PM2 Managed)  │
                        └─────────────────┘
```

### Docker Deployment
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx         │────│   Backend       │────│   MySQL         │
│   Container     │    │   Container     │    │   Container     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │
         │              ┌─────────────────┐
         └──────────────│  Frontend       │
                        │  Containers     │
                        │  Admin + Shop   │
                        └─────────────────┘
```

## 🔧 Traditional Deployment

### Step 1: Server Setup
```bash
# Upload project to server
scp -r . user@server:/var/www/chawkbazar-laravel/

# SSH into server
ssh user@server

# Run server setup
cd /var/www/chawkbazar-laravel
sudo zx deployment/enhanced-setenv.mjs
```

### Step 2: Backend Deployment
```bash
# Run backend setup
sudo zx deployment/enhanced-backendbuildscript.mjs
```

### Step 3: Frontend Deployment
```bash
# Run frontend build
zx deployment/enhanced-frontendbuildscript.mjs

# Start frontend services
zx deployment/frontendrunscript.mjs
```

### Step 4: Verification
```bash
# Check services
systemctl status nginx mysql php8.1-fpm
pm2 status

# Test endpoints
curl https://yourdomain.com/health
curl https://yourdomain.com/backend/health
```

## 🐳 Docker Deployment

### Step 1: Local Setup
```bash
# Clone repository
git clone <repository-url>
cd you-only

# Run Docker setup
./docker-scripts/enhanced-setup.sh
```

### Step 2: Development Mode
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Access services
# Backend: http://localhost:8001
# Admin: http://localhost:3003
# Shop: http://localhost:3004
```

### Step 3: Production Mode
```bash
# Start production environment
docker-compose up -d

# Access services
# All services: http://localhost
```

## 📁 File Structure

```
you-only/
├── deployment/                    # Traditional deployment scripts
│   ├── enhanced-setenv.mjs       # Enhanced server setup
│   ├── enhanced-backendbuildscript.mjs  # Enhanced backend deployment
│   ├── enhanced-frontendbuildscript.mjs # Enhanced frontend deployment
│   ├── frontendrunscript.mjs     # Frontend service management
│   └── nodesetup.sh              # Node.js setup
├── docker-scripts/               # Docker management scripts
│   ├── enhanced-setup.sh         # Enhanced Docker setup
│   ├── start.sh                  # Start services
│   ├── stop.sh                   # Stop services
│   ├── restart.sh                # Restart services
│   ├── logs.sh                   # View logs
│   ├── backup.sh                 # Backup data
│   └── update.sh                 # Update application
├── nginx/                        # Nginx configuration
│   ├── nginx.conf                # Main Nginx config
│   └── conf.d/
│       └── chawkbazar.conf       # Site configuration
├── chawkbazar-api/               # Laravel backend
│   ├── Dockerfile                # Backend Docker image
│   └── env.example               # Backend environment template
├── admin/rest/                   # Next.js admin panel
│   ├── Dockerfile                # Admin Docker image
│   └── env.example               # Admin environment template
├── shop/                         # Next.js shop frontend
│   ├── Dockerfile                # Shop Docker image
│   └── env.example               # Shop environment template
├── docker-compose.yml            # Production Docker Compose
├── docker-compose.dev.yml        # Development Docker Compose
├── docker-compose.override.yml   # Local overrides
├── deploy.sh                     # Unified deployment script
├── test-deployment.sh            # Deployment testing script
└── .env.example                  # Main environment template
```

## ⚙️ Configuration

### Environment Variables

#### Main Application (.env)
```bash
APP_NAME=Chawkbazar
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=http://localhost

# Database
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=chawkbazar
DB_USERNAME=chawkbazar_user
DB_PASSWORD=your-secure-password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Frontend URLs
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### Nginx Configuration

The Nginx configuration includes:
- Reverse proxy for all services
- Static file caching
- Security headers
- Rate limiting
- SSL/HTTPS support
- Health check endpoints

### Docker Configuration

Docker setup includes:
- Multi-stage builds for optimization
- Health checks for all services
- Persistent data volumes
- Network isolation
- Resource limits

## 🧪 Testing

### Run All Tests
```bash
./test-deployment.sh
```

### Test Specific Components
```bash
# Test configuration files
./test-deployment.sh --config

# Test traditional deployment
./test-deployment.sh --traditional

# Test Docker deployment
./test-deployment.sh --docker
```

### Manual Testing
```bash
# Test endpoints
curl http://localhost/health
curl http://localhost/backend/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health

# Test database
docker-compose exec backend php artisan tinker
# Then run: DB::connection()->getPdo();

# Test Redis
docker-compose exec redis redis-cli ping
```

## 🔧 Management

### Traditional Deployment Management
```bash
# Start services
sudo systemctl start nginx mysql php8.1-fpm
pm2 start all

# Stop services
sudo systemctl stop nginx mysql php8.1-fpm
pm2 stop all

# View logs
sudo journalctl -u nginx -f
pm2 logs

# Update application
git pull
composer install
php artisan migrate
yarn build
pm2 restart all
```

### Docker Deployment Management
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Update application
docker-compose pull
docker-compose up -d --build

# Backup data
./docker-scripts/backup.sh --full

# Restore data
./docker-scripts/backup.sh --restore backup-file
```

## 🚨 Troubleshooting

### Common Issues

#### Services Not Starting
```bash
# Check service status
docker-compose ps
systemctl status nginx mysql php8.1-fpm

# View logs
docker-compose logs [service-name]
sudo journalctl -u [service-name] -f
```

#### Database Connection Issues
```bash
# Check database status
docker-compose exec mysql mysql -u root -p
systemctl status mysql

# Test connection
docker-compose exec backend php artisan tinker
# Then run: DB::connection()->getPdo();
```

#### Permission Issues
```bash
# Fix permissions (Traditional)
sudo chown -R www-data:www-data /var/www/chawkbazar-laravel
sudo chmod -R 755 /var/www/chawkbazar-laravel/storage

# Fix permissions (Docker)
docker-compose exec backend chown -R www-data:www-data storage
```

#### Memory Issues
```bash
# Check memory usage
docker stats
free -h

# Increase Docker memory limit
# Edit Docker Desktop settings or docker-compose.yml
```

### Health Checks

#### Application Health
```bash
# Check all services
curl http://localhost/health

# Check individual services
curl http://localhost/backend/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health
```

#### Database Health
```bash
# Test database connection
docker-compose exec backend php artisan migrate:status

# Check database size
docker-compose exec mysql mysql -u root -p -e "SELECT table_schema AS 'Database', ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables GROUP BY table_schema;"
```

#### Redis Health
```bash
# Test Redis connection
docker-compose exec redis redis-cli ping

# Check Redis info
docker-compose exec redis redis-cli info
```

## 📊 Monitoring

### Service Monitoring
```bash
# Docker services
docker-compose ps
docker stats

# Traditional services
systemctl status nginx mysql php8.1-fpm
pm2 status
```

### Log Monitoring
```bash
# Docker logs
docker-compose logs -f

# Traditional logs
sudo journalctl -u nginx -f
pm2 logs
tail -f /var/log/nginx/error.log
```

### Performance Monitoring
```bash
# Resource usage
htop
docker stats

# Database performance
docker-compose exec mysql mysql -u root -p -e "SHOW PROCESSLIST;"
```

## 🔒 Security

### SSL/HTTPS Setup
```bash
# Traditional deployment
sudo certbot --nginx -d yourdomain.com

# Docker deployment
# Add SSL certificates to nginx/ssl/ directory
# Update nginx configuration
```

### Firewall Configuration
```bash
# Traditional deployment
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Docker deployment
# Configure host firewall
```

### Security Headers
The Nginx configuration includes:
- X-Frame-Options
- X-XSS-Protection
- X-Content-Type-Options
- Referrer-Policy
- Content-Security-Policy

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale services
docker-compose up -d --scale backend=3
docker-compose up -d --scale admin=2
docker-compose up -d --scale shop=2
```

### Load Balancer Configuration
```yaml
# docker-compose.yml
services:
  nginx:
    # ... existing config ...
    depends_on:
      - backend
      - admin
      - shop
  
  backend:
    # ... existing config ...
    deploy:
      replicas: 3
```

## 🆘 Support

### Getting Help
1. Check the troubleshooting section
2. Review service logs
3. Check GitHub issues
4. Contact support team

### Reporting Issues
When reporting issues, please include:
- Deployment method (Traditional/Docker)
- Operating system
- Service logs
- Error messages
- Steps to reproduce

## 📝 License

This project is licensed under the MIT License.

---

## 🎯 Quick Reference

### Essential Commands
```bash
# Deploy
./deploy.sh

# Test
./test-deployment.sh

# Docker
docker-compose up -d
docker-compose down
docker-compose logs -f

# Traditional
sudo systemctl start nginx mysql php8.1-fpm
pm2 start all
pm2 logs

# Backup
./docker-scripts/backup.sh --full

# Update
./docker-scripts/update.sh --full
```

### Service URLs
- **Shop Frontend**: http://localhost
- **Admin Panel**: http://localhost/admin
- **API Backend**: http://localhost/backend
- **GraphQL Playground**: http://localhost/backend/graphql
- **Health Check**: http://localhost/health

### Important Files
- **Environment**: `.env`, `chawkbazar-api/.env`, `admin/rest/.env`, `shop/.env`
- **Docker**: `docker-compose.yml`, `docker-compose.dev.yml`
- **Nginx**: `nginx/conf.d/chawkbazar.conf`
- **Scripts**: `deploy.sh`, `test-deployment.sh`
