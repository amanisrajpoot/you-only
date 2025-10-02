#!/bin/bash

echo "🧹 Cleaning Chawkbazar Project"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

read -p "This will delete all node_modules, build files, and caches. Continue? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 1
fi

echo ""
echo "🗑️  Removing build artifacts..."

# Stop any running servers
echo "Stopping running servers..."
pkill -f "node.*server.js" 2>/dev/null
pkill -f "next-server" 2>/dev/null
echo -e "${GREEN}✓${NC} Servers stopped"

# Backend cleanup
echo "Cleaning backend..."
rm -rf backend-express/node_modules
rm -rf backend-express/logs
echo -e "${GREEN}✓${NC} Backend cleaned"

# Shop cleanup
echo "Cleaning shop..."
rm -rf shop/node_modules
rm -rf shop/.next
rm -rf shop/.cache
echo -e "${GREEN}✓${NC} Shop cleaned"

# Admin cleanup
echo "Cleaning admin..."
rm -rf admin/rest/node_modules
rm -rf admin/rest/.next
rm -rf admin/rest/.cache
echo -e "${GREEN}✓${NC} Admin cleaned"

# Root cleanup
echo "Cleaning root..."
rm -rf node_modules
rm -rf .cache
echo -e "${GREEN}✓${NC} Root cleaned"

echo ""
echo "✨ Cleanup complete!"
echo ""
echo "To reinstall dependencies, run:"
echo "  ${GREEN}./scripts/setup.sh${NC}"
echo ""
