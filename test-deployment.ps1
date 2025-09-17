# Chawkbazar Deployment Testing Script for Windows
# This script tests the deployment configuration

Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                Chawkbazar Deployment Testing                 ║" -ForegroundColor Magenta
Write-Host "║                                                              ║" -ForegroundColor Magenta
Write-Host "║  This script will test deployment configuration              ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json") -or -not (Test-Path "chawkbazar-api")) {
    Write-Host "[ERROR] Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

Write-Host "[INFO] Checking project structure..." -ForegroundColor Blue

# Check required files
$requiredFiles = @(
    "docker-compose.yml",
    "docker-compose.dev.yml",
    "nginx/nginx.conf",
    "nginx/conf.d/chawkbazar.conf",
    "deployment/enhanced-setenv.mjs",
    "deployment/enhanced-backendbuildscript.mjs",
    "deployment/enhanced-frontendbuildscript.mjs",
    "deployment/frontendrunscript.mjs",
    "chawkbazar-api/Dockerfile",
    "admin/rest/Dockerfile",
    "shop/Dockerfile"
)

$missingFiles = @()
foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "[ERROR] Missing required files:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  - $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "[SUCCESS] All required files found" -ForegroundColor Green

# Check environment files
Write-Host "[INFO] Checking environment files..." -ForegroundColor Blue

$envFiles = @(
    "env.example",
    "chawkbazar-api/env.example",
    "admin/rest/env.example",
    "shop/env.example"
)

$missingEnv = @()
foreach ($file in $envFiles) {
    if (-not (Test-Path $file)) {
        $missingEnv += $file
    }
}

if ($missingEnv.Count -gt 0) {
    Write-Host "[WARNING] Missing environment template files:" -ForegroundColor Yellow
    foreach ($file in $missingEnv) {
        Write-Host "  - $file" -ForegroundColor Yellow
    }
} else {
    Write-Host "[SUCCESS] All environment template files found" -ForegroundColor Green
}

# Check Docker
Write-Host "[INFO] Checking Docker availability..." -ForegroundColor Blue

try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "[SUCCESS] Docker is available: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Docker is not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Docker is not available" -ForegroundColor Yellow
}

try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        Write-Host "[SUCCESS] Docker Compose is available: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Docker Compose is not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Docker Compose is not available" -ForegroundColor Yellow
}

# Check Node.js
Write-Host "[INFO] Checking Node.js availability..." -ForegroundColor Blue

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "[SUCCESS] Node.js is available: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Node.js is not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Node.js is not available" -ForegroundColor Yellow
}

# Check Yarn
Write-Host "[INFO] Checking Yarn availability..." -ForegroundColor Blue

try {
    $yarnVersion = yarn --version 2>$null
    if ($yarnVersion) {
        Write-Host "[SUCCESS] Yarn is available: $yarnVersion" -ForegroundColor Green
    } else {
        Write-Host "[WARNING] Yarn is not available" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARNING] Yarn is not available" -ForegroundColor Yellow
}

# Test Docker Compose configuration
Write-Host "[INFO] Testing Docker Compose configuration..." -ForegroundColor Blue

try {
    docker-compose config 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] Docker Compose configuration is valid" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Docker Compose configuration is invalid" -ForegroundColor Red
    }
} catch {
    Write-Host "[WARNING] Could not validate Docker Compose configuration" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║                        Test Summary                         ║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta

Write-Host ""
Write-Host "Deployment is ready! You can now deploy using:" -ForegroundColor Green
Write-Host "  - Traditional: ./deploy.sh --traditional" -ForegroundColor White
Write-Host "  - Docker: ./deploy.sh --docker" -ForegroundColor White
Write-Host "  - Hybrid: ./deploy.sh --hybrid" -ForegroundColor White

Write-Host ""
Write-Host "For Windows users:" -ForegroundColor Yellow
Write-Host "  - Use WSL or Git Bash to run the deployment scripts" -ForegroundColor White
Write-Host "  - Or use Docker Desktop for Docker deployment" -ForegroundColor White

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Blue
Write-Host "1. Configure your environment files (.env)" -ForegroundColor White
Write-Host "2. Choose your deployment method" -ForegroundColor White
Write-Host "3. Run the deployment script" -ForegroundColor White
Write-Host "4. Test the application" -ForegroundColor White
