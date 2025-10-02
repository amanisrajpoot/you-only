#!/bin/bash

echo "👨‍💼 Starting Chawkbazar Admin Dashboard"
echo "======================================"
echo ""
echo "📍 Admin will run on: http://localhost:3001"
echo "🔗 Backend API: http://localhost:8000"
echo ""
echo "Make sure backend is running first!"
echo ""
echo "Default admin credentials:"
echo "  Email: admin@chawkbazar.com"
echo "  Password: password"
echo ""

cd admin/rest
yarn dev
