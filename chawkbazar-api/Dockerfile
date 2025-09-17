# Multi-stage build for Laravel API
FROM laravelsail/php81-composer as base

# Install system dependencies
RUN apt-get update -y && apt-get install -y \
    libpng-dev \
    zlib1g-dev \
    libicu-dev \
    g++ \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libwebp-dev \
    libxpm-dev \
    libvpx-dev \
    libgd-dev \
    libmagickwand-dev \
    libzip-dev \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Configure PHP extensions
RUN docker-php-ext-configure gd \
    --with-freetype \
    --with-jpeg \
    --with-webp \
    --with-xpm

RUN docker-php-ext-configure intl

# Install PHP extensions
RUN docker-php-ext-install \
    exif \
    gd \
    intl \
    zip \
    pdo_mysql \
    mbstring \
    xml \
    bcmath \
    soap

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Imagick
RUN pecl install imagick && docker-php-ext-enable imagick

# Set working directory
WORKDIR /var/www/html

# Copy composer files
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Copy application code
COPY . .

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Create storage symlink
RUN php artisan storage:link || true

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start PHP-FPM
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
