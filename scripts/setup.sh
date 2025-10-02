#!/bin/bash

echo "🔧 Chawkbazar Setup Script"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check Node.js
echo -n "Checking Node.js installation... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found Node.js $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
echo -n "Checking npm installation... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found npm $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check/Install Yarn
echo -n "Checking Yarn installation... "
if command -v yarn &> /dev/null; then
    YARN_VERSION=$(yarn --version)
    echo -e "${GREEN}✓${NC} Found Yarn $YARN_VERSION"
else
    echo -e "${YELLOW}!${NC} Yarn not found. Installing..."
    npm install -g yarn
    echo -e "${GREEN}✓${NC} Yarn installed"
fi

echo ""
echo "📦 Installing Dependencies"
echo "--------------------------"

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend-express
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${RED}✗${NC} Backend dependency installation failed"
    exit 1
fi
cd ..

# Install frontend dependencies
echo "Installing frontend dependencies..."
yarn install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${RED}✗${NC} Frontend dependency installation failed"
    exit 1
fi

echo ""
echo "⚙️  Setting up Environment Files"
echo "--------------------------------"

# Check if .env files exist
if [ ! -f "backend-express/.env" ]; then
    echo -e "${YELLOW}!${NC} Backend .env file already exists (created earlier)"
else
    echo -e "${GREEN}✓${NC} Backend .env file exists"
fi

if [ ! -f "shop/.env.local" ]; then
    echo -e "${YELLOW}!${NC} Shop .env.local file already exists (created earlier)"
else
    echo -e "${GREEN}✓${NC} Shop .env.local file exists"
fi

if [ ! -f "admin/rest/.env.local" ]; then
    echo -e "${YELLOW}!${NC} Admin .env.local file already exists (created earlier)"
else
    echo -e "${GREEN}✓${NC} Admin .env.local file exists"
fi

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "You can now start the application:"
echo ""
echo "  Option 1 - Start all services:"
echo "    ${GREEN}./start-all.sh${NC}"
echo ""
echo "  Option 2 - Start services individually:"
echo "    ${GREEN}./start-backend.sh${NC}  # Terminal 1"
echo "    ${GREEN}./start-shop.sh${NC}     # Terminal 2"
echo "    ${GREEN}./start-admin.sh${NC}    # Terminal 3"
echo ""
echo "Access URLs:"
echo "  Backend:  ${GREEN}http://localhost:8000${NC}"
echo "  Shop:     ${GREEN}http://localhost:3000${NC}"
echo "  Admin:    ${GREEN}http://localhost:3001${NC}"
echo ""
echo "Default credentials:"
echo "  Email:    ${GREEN}admin@chawkbazar.com${NC}"
echo "  Password: ${GREEN}password${NC}"
echo ""
