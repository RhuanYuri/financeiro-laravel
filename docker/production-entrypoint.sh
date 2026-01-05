#!/bin/bash
set -e

# Turn on Bash's job control
set -m

echo "Starting deployment..."

if [ "$APP_ENV" = "production" ]; then
    echo "Caching configuration..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
fi

# Ensure storage directories effectively exist and are writable
# (This is redundant if the Dockerfile chown works, but safe for mounted volumes)
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
chown -R www-data:www-data storage bootstrap/cache

echo "Starting Apache..."
exec apache2-foreground
