#!/bin/bash
set -e

# Render injects PORT=8080; fall back to 80 for local Docker runs
PORT="${PORT:-80}"

echo "==> Configuring Apache to listen on port ${PORT}"

# Update Apache's ports.conf to listen on $PORT
sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf

# Update the VirtualHost port in the default site config
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PORT}>/" \
    /etc/apache2/sites-available/000-default.conf

echo "==> Running migrations"
php artisan migrate --force

echo "==> Seeding database"
php artisan db:seed --force

echo "==> Starting Apache on port ${PORT}"
exec apache2-foreground
