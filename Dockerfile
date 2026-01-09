# ===============================
# Build frontend assets (Node + PHP CLI)
# ===============================
FROM node:22-bookworm AS build

WORKDIR /app

# Install PHP CLI for Wayfinder
RUN apt-get update && apt-get install -y \
    php-cli \
    php-mbstring \
    php-xml \
    php-curl \
    php-zip \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the frontend assets (Vite + Wayfinder)
RUN npm run build


# ===============================
# Final Stage (PHP + Apache)
# ===============================
FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    zip \
    unzip \
    libicu-dev \
    libonig-dev \
    curl \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install \
    pdo_mysql \
    zip \
    bcmath \
    intl \
    opcache

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# PHP production settings
RUN echo "upload_max_filesize=10M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size=10M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit=256M" >> /usr/local/etc/php/conf.d/memory.ini

# Set working directory
WORKDIR /var/www/html

# Apache config
COPY docker/laravel/apache.conf /etc/apache2/sites-available/000-default.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy composer files first (cache)
COPY composer.json composer.lock ./

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy application code
COPY . .

# Copy built frontend assets
COPY --from=build /app/public/build ./public/build

# Permissions
RUN chown -R www-data:www-data \
    storage \
    bootstrap/cache

# Expose port
EXPOSE 80

# Entrypoint
COPY docker/production-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER root
ENTRYPOINT ["entrypoint.sh"]
