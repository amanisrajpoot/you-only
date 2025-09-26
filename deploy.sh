#!/bin/bash

echo "🚀 Chawkbazar Deployment Script"
echo "================================"

# Check if user wants to deploy backend
read -p "Deploy backend to Railway? (y/n): " deploy_backend

if [ "$deploy_backend" = "y" ]; then
    echo "📦 Deploying backend to Railway..."
    
    # Check if Railway CLI is installed
    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi
    
    # Deploy backend
    cd backend-express
    railway login
    railway up
    echo "✅ Backend deployed! Copy the URL and update frontend environment variables."
    cd ..
fi

# Check if user wants to deploy frontend
read -p "Deploy shop frontend to Vercel? (y/n): " deploy_shop

if [ "$deploy_shop" = "y" ]; then
    echo "🛍️ Deploying shop frontend to Vercel..."
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo "Installing Vercel CLI..."
        npm install -g vercel
    fi
    
    # Deploy shop
    cd shop
    vercel login
    vercel --prod
    echo "✅ Shop frontend deployed!"
    cd ..
fi

# Check if user wants to deploy admin
read -p "Deploy admin frontend to Vercel? (y/n): " deploy_admin

if [ "$deploy_admin" = "y" ]; then
    echo "👨‍💼 Deploying admin frontend to Vercel..."
    
    # Deploy admin
    cd admin/rest
    vercel --prod
    echo "✅ Admin frontend deployed!"
    cd ../..
fi

echo "🎉 Deployment complete!"
echo "Don't forget to update environment variables with the correct backend URL."
