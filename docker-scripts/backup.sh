#!/bin/bash

# Chawkbazar Docker Backup Script
# This script creates backups of the Chawkbazar application data

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

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="chawkbazar_backup_$DATE"

# Create backup directory
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        mkdir -p "$BACKUP_DIR"
        print_status "Created backup directory: $BACKUP_DIR"
    fi
}

# Backup database
backup_database() {
    print_status "Backing up MySQL database..."
    docker-compose exec -T mysql mysqldump -u root -p"${DB_ROOT_PASSWORD:-rootpassword}" --all-databases > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"
    print_success "Database backup completed: ${BACKUP_NAME}_database.sql"
}

# Backup Redis data
backup_redis() {
    print_status "Backing up Redis data..."
    docker-compose exec -T redis redis-cli --rdb /data/dump.rdb
    docker cp chawkbazar_redis:/data/dump.rdb "$BACKUP_DIR/${BACKUP_NAME}_redis.rdb"
    print_success "Redis backup completed: ${BACKUP_NAME}_redis.rdb"
}

# Backup application files
backup_application() {
    print_status "Backing up application files..."
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_application.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=.next \
        --exclude=storage/logs \
        --exclude=storage/framework/cache \
        --exclude=storage/framework/sessions \
        --exclude=storage/framework/views \
        chawkbazar-api/ admin/ shop/ nginx/ docker-compose.yml docker-compose.dev.yml
    print_success "Application backup completed: ${BACKUP_NAME}_application.tar.gz"
}

# Backup storage files
backup_storage() {
    print_status "Backing up storage files..."
    docker-compose exec -T backend tar -czf /tmp/storage_backup.tar.gz -C /var/www/html storage
    docker cp chawkbazar_backend:/tmp/storage_backup.tar.gz "$BACKUP_DIR/${BACKUP_NAME}_storage.tar.gz"
    docker-compose exec -T backend rm /tmp/storage_backup.tar.gz
    print_success "Storage backup completed: ${BACKUP_NAME}_storage.tar.gz"
}

# Create full backup
create_full_backup() {
    print_status "Creating full backup..."
    create_backup_dir
    backup_database
    backup_redis
    backup_application
    backup_storage
    
    # Create backup info file
    cat > "$BACKUP_DIR/${BACKUP_NAME}_info.txt" << EOF
Chawkbazar Backup Information
============================
Date: $(date)
Backup Name: $BACKUP_NAME
Services: All services backed up

Files included:
- ${BACKUP_NAME}_database.sql (MySQL database)
- ${BACKUP_NAME}_redis.rdb (Redis data)
- ${BACKUP_NAME}_application.tar.gz (Application code)
- ${BACKUP_NAME}_storage.tar.gz (Laravel storage)

To restore:
1. Stop services: ./docker-scripts/stop.sh
2. Restore database: docker-compose exec -T mysql mysql -u root -p < ${BACKUP_NAME}_database.sql
3. Restore Redis: docker cp ${BACKUP_NAME}_redis.rdb chawkbazar_redis:/data/dump.rdb
4. Restore application: tar -xzf ${BACKUP_NAME}_application.tar.gz
5. Restore storage: docker cp ${BACKUP_NAME}_storage.tar.gz chawkbazar_backend:/tmp/ && docker-compose exec backend tar -xzf /tmp/storage_backup.tar.gz -C /var/www/html
6. Start services: ./docker-scripts/start.sh
EOF
    
    print_success "Full backup completed: $BACKUP_NAME"
    print_status "Backup location: $BACKUP_DIR/"
}

# Create database-only backup
create_database_backup() {
    print_status "Creating database backup..."
    create_backup_dir
    backup_database
    print_success "Database backup completed: ${BACKUP_NAME}_database.sql"
}

# List existing backups
list_backups() {
    print_status "Existing backups:"
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        ls -la "$BACKUP_DIR"
    else
        print_warning "No backups found in $BACKUP_DIR"
    fi
}

# Clean old backups
clean_old_backups() {
    local days=${1:-7}
    print_status "Cleaning backups older than $days days..."
    find "$BACKUP_DIR" -name "chawkbazar_backup_*" -type f -mtime +$days -delete
    print_success "Old backups cleaned (older than $days days)"
}

# Show help
show_help() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -f, --full           Create full backup (database, redis, application, storage)"
    echo "  -d, --database       Create database-only backup"
    echo "  -l, --list           List existing backups"
    echo "  -c, --clean DAYS     Clean backups older than DAYS (default: 7)"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 --full            Create full backup"
    echo "  $0 --database        Create database backup only"
    echo "  $0 --list            List existing backups"
    echo "  $0 --clean 14        Clean backups older than 14 days"
}

# Main execution
main() {
    case "${1:-}" in
        -f|--full)
            create_full_backup
            ;;
        -d|--database)
            create_database_backup
            ;;
        -l|--list)
            list_backups
            ;;
        -c|--clean)
            clean_old_backups "$2"
            ;;
        -h|--help)
            show_help
            ;;
        "")
            create_full_backup
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
