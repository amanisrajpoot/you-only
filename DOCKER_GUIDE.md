# 🐳 Docker Deployment Guide

## Overview

This guide explains how to run the Chawkbazar application using Docker and Docker Compose.

---

## 📋 Prerequisites

- Docker (v20.10+)
- Docker Compose (v2.0+)

### Install Docker

**macOS:**
```bash
brew install docker docker-compose
```

**Linux:**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER
```

**Windows:**
Download from [docker.com](https://www.docker.com/products/docker-desktop)

---

## 🚀 Quick Start with Docker Compose

### 1. Build and Start All Services
```bash
docker-compose up --build
```

### 2. Access Applications
- **Backend**: http://localhost:8000
- **Shop**: http://localhost:3000
- **Admin**: http://localhost:3001

### 3. Stop Services
```bash
docker-compose down
```

---

## 🔧 Docker Compose Commands

### Start Services (Detached Mode)
```bash
docker-compose up -d
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f shop
docker-compose logs -f admin
```

### Restart Services
```bash
docker-compose restart
```

### Stop Services
```bash
docker-compose stop
```

### Remove Containers
```bash
docker-compose down
```

### Rebuild Specific Service
```bash
docker-compose up -d --build backend
docker-compose up -d --build shop
docker-compose up -d --build admin
```

---

## 🏗️ Individual Docker Builds

### Build Backend
```bash
docker build -f Dockerfile.backend -t chawkbazar-backend .
docker run -p 8000:8000 chawkbazar-backend
```

### Build Shop
```bash
docker build -f Dockerfile.shop -t chawkbazar-shop .
docker run -p 3000:3000 chawkbazar-shop
```

### Build Admin
```bash
docker build -f Dockerfile.admin -t chawkbazar-admin .
docker run -p 3001:3001 chawkbazar-admin
```

---

## 🌍 Environment Variables

### Using .env file
Create `.env` in the root directory:

```env
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
NEXTAUTH_SECRET=your-nextauth-secret-key

# API Endpoints
NEXT_PUBLIC_REST_API_ENDPOINT=http://localhost:8000

# Database (Optional)
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=chawkbazar_user
DB_PASSWORD=chawkbazar_password
DB_DATABASE=chawkbazar
```

### Load Environment Variables
```bash
docker-compose --env-file .env up
```

---

## 📊 Health Checks

Docker Compose includes health checks for services:

```bash
# Check service health
docker-compose ps

# View health status
docker inspect chawkbazar-backend --format='{{.State.Health.Status}}'
```

---

## 🔍 Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs backend

# Check container status
docker ps -a

# Inspect container
docker inspect chawkbazar-backend
```

### Port Already in Use
```bash
# Find process using port
lsof -i :8000
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Remove All Containers and Images
```bash
# Stop and remove containers
docker-compose down

# Remove all images
docker rmi chawkbazar-backend chawkbazar-shop chawkbazar-admin

# Clean up system
docker system prune -a
```

### Reset Everything
```bash
docker-compose down -v --rmi all
docker system prune -a --volumes
```

---

## 🚀 Production Deployment

### Using Docker Compose in Production

1. **Create production docker-compose file:**

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  backend:
    image: your-registry/chawkbazar-backend:latest
    environment:
      - NODE_ENV=production
      - PORT=8000
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M

  shop:
    image: your-registry/chawkbazar-shop:latest
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2

  admin:
    image: your-registry/chawkbazar-admin:latest
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 1
```

2. **Deploy:**
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### Push to Docker Registry

```bash
# Tag images
docker tag chawkbazar-backend your-registry/chawkbazar-backend:latest
docker tag chawkbazar-shop your-registry/chawkbazar-shop:latest
docker tag chawkbazar-admin your-registry/chawkbazar-admin:latest

# Push to registry
docker push your-registry/chawkbazar-backend:latest
docker push your-registry/chawkbazar-shop:latest
docker push your-registry/chawkbazar-admin:latest
```

---

## 🎯 Best Practices

### 1. Use Multi-Stage Builds
All Dockerfiles use multi-stage builds to reduce image size.

### 2. Health Checks
Always include health checks for production deployments.

### 3. Resource Limits
Set CPU and memory limits in production:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

### 4. Logging
Configure logging drivers:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### 5. Secrets Management
Use Docker secrets for sensitive data:

```bash
echo "supersecret" | docker secret create jwt_secret -
```

---

## 📦 Image Sizes

| Service | Size | Optimization |
|---------|------|--------------|
| Backend | ~150MB | Alpine-based Node.js |
| Shop | ~250MB | Multi-stage build |
| Admin | ~250MB | Multi-stage build |

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push backend
        uses: docker/build-push-action@v4
        with:
          context: .
          file: Dockerfile.backend
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/chawkbazar-backend:latest
      
      - name: Build and push shop
        uses: docker/build-push-action@v4
        with:
          context: .
          file: Dockerfile.shop
          push: true
          tags: ${{ secrets.DOCKER_USERNAME }}/chawkbazar-shop:latest
```

---

## 🎉 Summary

Docker makes it easy to:
- ✅ Run the entire stack with one command
- ✅ Ensure consistent environments
- ✅ Deploy to any platform
- ✅ Scale services independently
- ✅ Isolate dependencies

**Run everything with:**
```bash
docker-compose up -d
```

**That's it! 🚀**
