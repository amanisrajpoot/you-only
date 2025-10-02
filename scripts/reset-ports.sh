#!/bin/bash

echo "🔌 Resetting Ports"
echo "=================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Function to kill port
kill_port() {
    local port=$1
    echo -n "Checking port $port... "
    
    PID=$(lsof -ti:$port)
    
    if [ -z "$PID" ]; then
        echo -e "${GREEN}✓${NC} Port $port is free"
    else
        echo -e "${YELLOW}!${NC} Port $port in use (PID: $PID)"
        kill -9 $PID 2>/dev/null
        sleep 1
        echo -e "${GREEN}✓${NC} Killed process on port $port"
    fi
}

# Kill processes on required ports
kill_port 8000  # Backend
kill_port 3000  # Shop
kill_port 3001  # Admin

echo ""
echo "✅ All ports reset!"
echo ""
echo "You can now start the application:"
echo "  ${GREEN}./start-all.sh${NC}"
echo ""
