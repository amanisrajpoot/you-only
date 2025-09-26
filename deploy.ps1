# 🚀 Chawkbazar Deployment Script
Write-Host "🚀 Chawkbazar Deployment Script" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Check if user wants to deploy backend
$deploy_backend = Read-Host "Deploy backend to Railway? (y/n)"

if ($deploy_backend -eq "y") {
    Write-Host "📦 Deploying backend to Railway..." -ForegroundColor Yellow
    
    # Check if Railway CLI is installed
    if (!(Get-Command railway -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Railway CLI..." -ForegroundColor Yellow
        npm install -g @railway/cli
    }
    
    # Deploy backend
    Set-Location backend-express
    railway login
    railway up
    Write-Host "✅ Backend deployed! Copy the URL and update frontend environment variables." -ForegroundColor Green
    Set-Location ..
}

# Check if user wants to deploy frontend
$deploy_shop = Read-Host "Deploy shop frontend to Vercel? (y/n)"

if ($deploy_shop -eq "y") {
    Write-Host "🛍️ Deploying shop frontend to Vercel..." -ForegroundColor Yellow
    
    # Check if Vercel CLI is installed
    if (!(Get-Command vercel -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
        npm install -g vercel
    }
    
    # Deploy shop
    Set-Location shop
    vercel login
    vercel --prod
    Write-Host "✅ Shop frontend deployed!" -ForegroundColor Green
    Set-Location ..
}

# Check if user wants to deploy admin
$deploy_admin = Read-Host "Deploy admin frontend to Vercel? (y/n)"

if ($deploy_admin -eq "y") {
    Write-Host "👨‍💼 Deploying admin frontend to Vercel..." -ForegroundColor Yellow
    
    # Deploy admin
    Set-Location admin/rest
    vercel --prod
    Write-Host "✅ Admin frontend deployed!" -ForegroundColor Green
    Set-Location ../..
}

Write-Host "🎉 Deployment complete!" -ForegroundColor Green
Write-Host "Don't forget to update environment variables with the correct backend URL." -ForegroundColor Yellow
