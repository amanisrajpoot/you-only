#!/bin/bash

echo "🚀 Starting Chawkbazar Full Stack Application"
echo "============================================="
echo ""
echo "This will start all three services:"
echo "  Backend:  http://localhost:8000"
echo "  Shop:     http://localhost:3000"
echo "  Admin:    http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Function to cleanup background processes
cleanup() {
    echo ""
    echo "🛑 Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT SIGTERM

# Start backend
echo "🔧 Starting Backend..."
cd backend-express && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start shop frontend
echo "🛍️ Starting Shop Frontend..."
    cd shop && yarn dev &
SHOP_PID=$!

# Wait a bit
sleep 2

# Start admin frontend
echo "👨‍💼 Starting Admin Dashboard..."
    cd admin/rest && yarn dev &
ADMIN_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "Access your applications at:"
echo "  🌐 Shop:    http://localhost:3000"
echo "  🔧 Admin:   http://localhost:3001"
echo "  ⚙️    Backend:  http://localhost:8000"
echo ""
echo "Default credentials:"
echo "  Admin: admin@chawkbazar.com / password"
echo "  Customer: customer@example.com / password"
echo ""

# Wait for all background jobs
wait
