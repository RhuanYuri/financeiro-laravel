# Build assets using a Node.js stage
FROM node:22-bookworm AS build
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the frontend assets
RUN npm run build

# --- Final Stage ---
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

# Configure PHP behavior for production
RUN echo "upload_max_filesize=10M" > /usr/local/etc/php/conf.d/uploads.ini \
    && echo "post_max_size=10M" >> /usr/local/etc/php/conf.d/uploads.ini \
    && echo "memory_limit=256M" >> /usr/local/etc/php/conf.d/memory.ini

# Set working directory
WORKDIR /var/www/html

# Copy Apache configuration
# We are creating a custom configuration file inline or copying an existing one.
# Reusing the existing simple conf logic:
COPY docker/laravel/apache.conf /etc/apache2/sites-available/000-default.conf

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy only composer files first to leverage Docker cache
COPY composer.json composer.lock ./

# Install Composer dependencies (optimized for production)
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Copy the rest of the application code
COPY . .

# Copy built frontend assets from the build stage
COPY --from=build /app/public/build ./public/build

# Ensure permissions are correct
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 80
EXPOSE 80

# Copy and set entrypoint script
COPY docker/production-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER root

ENTRYPOINT ["entrypoint.sh"]
