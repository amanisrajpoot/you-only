# PHP Installation Script for Windows
# This script will help you install PHP on Windows

Write-Host "=== PHP Installation Helper ===" -ForegroundColor Green
Write-Host ""

# Check if PHP ZIP file exists in Downloads
$downloadsPath = [Environment]::GetFolderPath("UserProfile") + "\Downloads"
$phpZipFiles = Get-ChildItem -Path $downloadsPath -Filter "php-*.zip" | Sort-Object LastWriteTime -Descending

if ($phpZipFiles.Count -eq 0) {
    Write-Host "❌ No PHP ZIP file found in Downloads folder!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download PHP manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://windows.php.net/download/" -ForegroundColor Cyan
    Write-Host "2. Download the latest PHP 8.3 Thread Safe (x64) ZIP file" -ForegroundColor Cyan
    Write-Host "3. Save it to your Downloads folder" -ForegroundColor Cyan
    Write-Host "4. Run this script again" -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter to continue..."
    exit 1
}

$latestPhpZip = $phpZipFiles[0]
Write-Host "✅ Found PHP ZIP file: $($latestPhpZip.Name)" -ForegroundColor Green

# Extract PHP
Write-Host ""
Write-Host "📦 Extracting PHP to C:\php..." -ForegroundColor Yellow
try {
    Expand-Archive -Path $latestPhpZip.FullName -DestinationPath "C:\php" -Force
    Write-Host "✅ PHP extracted successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Error extracting PHP: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configure php.ini
Write-Host ""
Write-Host "⚙️  Configuring php.ini..." -ForegroundColor Yellow

$phpIniPath = "C:\php\php.ini"
$phpIniDevelopmentPath = "C:\php\php.ini-development"

if (Test-Path $phpIniDevelopmentPath) {
    Copy-Item $phpIniDevelopmentPath $phpIniPath -Force
    Write-Host "✅ php.ini created from development template" -ForegroundColor Green
} else {
    Write-Host "❌ php.ini-development not found!" -ForegroundColor Red
    exit 1
}

# Configure php.ini settings
Write-Host "🔧 Configuring PHP extensions..." -ForegroundColor Yellow

$phpIniContent = Get-Content $phpIniPath
$phpIniContent = $phpIniContent -replace '^;extension_dir = "ext"', 'extension_dir = "C:\php\ext"'
$phpIniContent = $phpIniContent -replace '^;extension=curl', 'extension=curl'
$phpIniContent = $phpIniContent -replace '^;extension=gd', 'extension=gd'
$phpIniContent = $phpIniContent -replace '^;extension=mbstring', 'extension=mbstring'
$phpIniContent = $phpIniContent -replace '^;extension=pdo_mysql', 'extension=pdo_mysql'
$phpIniContent = $phpIniContent -replace '^;extension=openssl', 'extension=openssl'
$phpIniContent = $phpIniContent -replace '^;extension=zip', 'extension=zip'

# Add timezone if not set
if ($phpIniContent -notmatch '^date\.timezone') {
    $phpIniContent += "`ndate.timezone = UTC"
}

Set-Content -Path $phpIniPath -Value $phpIniContent
Write-Host "✅ PHP extensions configured!" -ForegroundColor Green

# Add PHP to PATH
Write-Host ""
Write-Host "🛤️  Adding PHP to system PATH..." -ForegroundColor Yellow

$currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if ($currentPath -notlike "*C:\php*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;C:\php", "User")
    Write-Host "✅ PHP added to user PATH!" -ForegroundColor Green
} else {
    Write-Host "✅ PHP already in PATH!" -ForegroundColor Green
}

# Test PHP installation
Write-Host ""
Write-Host "🧪 Testing PHP installation..." -ForegroundColor Yellow

# Refresh environment variables
$env:PATH = [Environment]::GetEnvironmentVariable("PATH", "User") + ";" + [Environment]::GetEnvironmentVariable("PATH", "Machine")

try {
    $phpVersion = & "C:\php\php.exe" -v 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PHP installed successfully!" -ForegroundColor Green
        Write-Host "Version: $($phpVersion[0])" -ForegroundColor Cyan
    } else {
        Write-Host "❌ PHP installation test failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error testing PHP: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 PHP installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Close and reopen your terminal/PowerShell" -ForegroundColor White
Write-Host "2. Run: php -v (to verify installation)" -ForegroundColor White
Write-Host "3. Install Composer from: https://getcomposer.org/download/" -ForegroundColor White
Write-Host "4. Run: composer install (in your Laravel project)" -ForegroundColor White
Write-Host "5. Run: php artisan serve (to start Laravel backend)" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue..."
