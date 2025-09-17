# Chawkbazar Docker Deployment Guide

This guide provides comprehensive instructions for deploying the Chawkbazar e-commerce application using Docker.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Quick Start](#quick-start)
4. [Configuration](#configuration)
5. [Services](#services)
6. [Deployment Options](#deployment-options)
7. [Management Scripts](#management-scripts)
8. [Troubleshooting](#troubleshooting)
9. [Production Considerations](#production-considerations)

## Project Overview

Chawkbazar is a multi-service e-commerce application consisting of:

- **Backend API**: Laravel 10 with GraphQL and REST endpoints
- **Admin Panel**: Next.js 13 admin dashboard
- **Shop Frontend**: Next.js 14 e-commerce storefront
- **Database**: MySQL 8.0
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx

## Prerequisites

### Required Software

- Docker (version 20.10+)
- Docker Compose (version 2.0+)
- Git (for code updates)

### System Requirements

- **Minimum**: 2 CPU cores, 4GB RAM, 20GB disk space
- **Recommended**: 4 CPU cores, 8GB RAM, 50GB disk space
- **Production**: 8+ CPU cores, 16GB+ RAM, 100GB+ disk space

## Quick Start

### 1. Clone and Setup

```bash
# Clone the repository
git clone <repository-url>
cd you-only

# Copy environment configuration
cp env.example .env
cp chawkbazar-api/env.example chawkbazar-api/.env
cp admin/rest/env.example admin/rest/.env
cp shop/env.example shop/.env
```

### 2. Configure Environment

Edit the `.env` files with your configuration:

```bash
# Main .env file
APP_NAME=Chawkbazar
APP_ENV=production
APP_KEY=base64:your-app-key-here
APP_DEBUG=false
APP_URL=http://localhost

# Database
DB_DATABASE=chawkbazar
DB_USERNAME=chawkbazar_user
DB_PASSWORD=your-secure-password
DB_ROOT_PASSWORD=your-root-password

# Frontend URLs
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost/backend
NEXT_PUBLIC_SHOP_URL=http://localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3002
```

### 3. Deploy with Docker

```bash
# Make scripts executable (Linux/Mac)
chmod +x docker-scripts/*.sh

# Run setup script
./docker-scripts/setup.sh

# Or manually start services
docker-compose up -d --build
```

### 4. Access the Application

- **Shop Frontend**: http://localhost
- **Admin Panel**: http://localhost/admin
- **API Backend**: http://localhost/backend
- **GraphQL Playground**: http://localhost/backend/graphql
- **Health Check**: http://localhost/health

## Configuration

### Environment Variables

#### Main Application (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_NAME` | Application name | Chawkbazar |
| `APP_ENV` | Environment | production |
| `APP_KEY` | Laravel encryption key | (generated) |
| `APP_DEBUG` | Debug mode | false |
| `APP_URL` | Application URL | http://localhost |

#### Database Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_DATABASE` | Database name | chawkbazar |
| `DB_USERNAME` | Database user | chawkbazar_user |
| `DB_PASSWORD` | Database password | (required) |
| `DB_ROOT_PASSWORD` | Root password | (required) |

#### Frontend Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_REST_API_ENDPOINT` | API endpoint | http://localhost/backend |
| `NEXT_PUBLIC_SHOP_URL` | Shop URL | http://localhost |
| `NEXT_PUBLIC_SITE_URL` | Admin URL | http://localhost:3002 |

### Nginx Configuration

The Nginx configuration is located in `nginx/conf.d/chawkbazar.conf`. Key features:

- Reverse proxy for all services
- Static file caching
- Security headers
- Rate limiting
- Health check endpoint

### SSL Configuration

To enable HTTPS:

1. Obtain SSL certificates
2. Place certificates in `nginx/ssl/`
3. Uncomment HTTPS server block in `nginx/conf.d/chawkbazar.conf`
4. Update certificate paths

## Services

### Backend API (Laravel)

- **Container**: `chawkbazar_backend`
- **Port**: 8000
- **Health Check**: `/health`
- **Features**: GraphQL, REST API, Queue processing

### Admin Panel (Next.js)

- **Container**: `chawkbazar_admin`
- **Port**: 3002
- **Path**: `/admin`
- **Features**: Admin dashboard, product management

### Shop Frontend (Next.js)

- **Container**: `chawkbazar_shop`
- **Port**: 3003
- **Path**: `/`
- **Features**: E-commerce storefront, PWA support

### Database (MySQL)

- **Container**: `chawkbazar_mysql`
- **Port**: 3306
- **Features**: Persistent data storage

### Cache (Redis)

- **Container**: `chawkbazar_redis`
- **Port**: 6379
- **Features**: Session storage, caching, queue

### Queue Worker

- **Container**: `chawkbazar_queue`
- **Features**: Background job processing

### Scheduler

- **Container**: `chawkbazar_scheduler`
- **Features**: Cron job execution

## Deployment Options

### Development Environment

```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up -d

# Access services
# Backend: http://localhost:8001
# Admin: http://localhost:3003
# Shop: http://localhost:3004
```

### Production Environment

```bash
# Use production compose file
docker-compose up -d

# Access services
# All services: http://localhost
```

### Custom Configuration

Create a custom compose file:

```yaml
# docker-compose.custom.yml
version: '3.8'
services:
  backend:
    environment:
      - APP_ENV=production
      - DB_HOST=external-mysql-host
    # ... other customizations
```

## Management Scripts

### Setup Script

```bash
./docker-scripts/setup.sh
```

- Checks Docker installation
- Creates environment files
- Generates application keys
- Builds and starts services
- Runs database migrations

### Start/Stop Scripts

```bash
# Start services
./docker-scripts/start.sh

# Stop services
./docker-scripts/stop.sh

# Stop and remove data
./docker-scripts/stop.sh --clean
```

### Restart Script

```bash
# Restart services
./docker-scripts/restart.sh

# Restart and rebuild
./docker-scripts/restart.sh --build
```

### Logs Script

```bash
# View all logs
./docker-scripts/logs.sh

# View specific service logs
./docker-scripts/logs.sh backend

# View logs with timestamps
./docker-scripts/logs.sh --timestamps

# View last 50 lines
./docker-scripts/logs.sh --tail 50
```

### Backup Script

```bash
# Create full backup
./docker-scripts/backup.sh --full

# Create database backup only
./docker-scripts/backup.sh --database

# List existing backups
./docker-scripts/backup.sh --list

# Clean old backups
./docker-scripts/backup.sh --clean 7
```

### Update Script

```bash
# Full update with backup
./docker-scripts/update.sh --full

# Quick restart only
./docker-scripts/update.sh --quick

# Update without backup
./docker-scripts/update.sh --no-backup
```

## Troubleshooting

### Common Issues

#### Services Not Starting

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs [service-name]

# Check resource usage
docker stats
```

#### Database Connection Issues

```bash
# Check database logs
docker-compose logs mysql

# Test database connection
docker-compose exec backend php artisan tinker
# Then run: DB::connection()->getPdo();
```

#### Permission Issues

```bash
# Fix storage permissions
docker-compose exec backend chown -R www-data:www-data storage
docker-compose exec backend chmod -R 755 storage
```

#### Memory Issues

```bash
# Increase Docker memory limit
# Edit Docker Desktop settings or docker-compose.yml
```

### Health Checks

```bash
# Check all services
curl http://localhost/health

# Check individual services
curl http://localhost/backend/health
curl http://localhost:3002/api/health
curl http://localhost:3003/api/health
```

### Log Locations

- **Application logs**: `chawkbazar-api/storage/logs/`
- **Nginx logs**: `docker logs chawkbazar_nginx`
- **MySQL logs**: `docker logs chawkbazar_mysql`
- **Redis logs**: `docker logs chawkbazar_redis`

## Production Considerations

### Security

1. **Change default passwords**
2. **Use strong database passwords**
3. **Enable HTTPS with valid certificates**
4. **Configure firewall rules**
5. **Regular security updates**

### Performance

1. **Use production-optimized images**
2. **Configure Redis for caching**
3. **Enable Nginx compression**
4. **Use CDN for static assets**
5. **Monitor resource usage**

### Monitoring

1. **Set up health checks**
2. **Monitor logs**
3. **Track performance metrics**
4. **Set up alerts**

### Backup Strategy

1. **Regular database backups**
2. **Application file backups**
3. **Configuration backups**
4. **Test restore procedures**

### Scaling

1. **Horizontal scaling with load balancer**
2. **Database replication**
3. **Redis clustering**
4. **CDN integration**

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review Docker and service logs
3. Check GitHub issues
4. Contact support team

## License

This project is licensed under the MIT License.
