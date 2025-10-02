#!/bin/bash

echo "🚀 Starting Chawkbazar Backend Server"
echo "====================================="
echo ""
echo "📍 Backend will run on: http://localhost:8000"
echo "📊 Health check: http://localhost:8000/health"
echo "🔗 API endpoint: http://localhost:8000/"
echo ""
echo "Default credentials:"
echo "  Admin: admin@chawkbazar.com / password"
echo "  Customer: customer@example.com / password"
echo ""

cd backend-express
npm run dev
