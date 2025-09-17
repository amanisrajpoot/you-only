# Fix PHP Extensions Script
Write-Host "Fixing PHP Extensions..." -ForegroundColor Green

$phpIniPath = "C:\php\php.ini"
$content = Get-Content $phpIniPath

# Enable required extensions
$content = $content -replace '^;extension=openssl', 'extension=openssl'
$content = $content -replace '^;extension=curl', 'extension=curl'
$content = $content -replace '^;extension=intl', 'extension=intl'
$content = $content -replace '^;extension=fileinfo', 'extension=fileinfo'
$content = $content -replace '^;extension=exif', 'extension=exif'
$content = $content -replace '^;extension=mbstring', 'extension=mbstring'
$content = $content -replace '^;extension=pdo_mysql', 'extension=pdo_mysql'

Set-Content $phpIniPath -Value $content

Write-Host "PHP extensions enabled!" -ForegroundColor Green
Write-Host "Testing PHP extensions..." -ForegroundColor Yellow

php -m | findstr "openssl curl intl fileinfo exif mbstring pdo_mysql"
