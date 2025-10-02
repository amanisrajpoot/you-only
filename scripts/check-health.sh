#!/bin/bash

echo "🏥 Health Check"
echo "==============="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to check service
check_service() {
    local name=$1
    local url=$2
    
    echo -n "Checking $name... "
    
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ HEALTHY${NC} (HTTP $HTTP_CODE)"
        return 0
    else
        echo -e "${RED}✗ DOWN${NC} (HTTP $HTTP_CODE)"
        return 1
    fi
}

# Check services
BACKEND_UP=0
SHOP_UP=0
ADMIN_UP=0

check_service "Backend API" "http://localhost:8000/health" && BACKEND_UP=1
check_service "Shop Frontend" "http://localhost:3000" && SHOP_UP=1
check_service "Admin Frontend" "http://localhost:3001" && ADMIN_UP=1

echo ""
echo "Summary:"
echo "--------"

if [ $BACKEND_UP -eq 1 ] && [ $SHOP_UP -eq 1 ] && [ $ADMIN_UP -eq 1 ]; then
    echo -e "${GREEN}✓ All services are running!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some services are down${NC}"
    
    if [ $BACKEND_UP -eq 0 ]; then
        echo "  - Start backend: ./start-backend.sh"
    fi
    if [ $SHOP_UP -eq 0 ]; then
        echo "  - Start shop: ./start-shop.sh"
    fi
    if [ $ADMIN_UP -eq 0 ]; then
        echo "  - Start admin: ./start-admin.sh"
    fi
    
    exit 1
fi
