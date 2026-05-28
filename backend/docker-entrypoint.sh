#!/bin/bash
set -e

# ── 1. Configure Apache port ──────────────────────────────────────────────────
PORT="${PORT:-80}"
echo "==> Configuring Apache to listen on port ${PORT}"
sed -i "s/^Listen .*/Listen ${PORT}/" /etc/apache2/ports.conf
sed -i "s/<VirtualHost \*:[0-9]*>/<VirtualHost *:${PORT}>/" \
    /etc/apache2/sites-available/000-default.conf

# ── 2. Write .env from environment variables ──────────────────────────────────
echo "==> Writing .env"
cat > /var/www/html/.env << ENVEOF
APP_NAME="${APP_NAME:-OFI}"
APP_ENV="${APP_ENV:-production}"
APP_KEY="${APP_KEY:-}"
APP_DEBUG="${APP_DEBUG:-false}"
APP_URL="${APP_URL:-http://localhost}"

LOG_CHANNEL=stderr
LOG_LEVEL=error

DB_CONNECTION="${DB_CONNECTION:-pgsql}"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_DATABASE="${DB_DATABASE:-ofi}"
DB_USERNAME="${DB_USERNAME:-ofi}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_SSLMODE="${DB_SSLMODE:-require}"

CACHE_DRIVER="${CACHE_DRIVER:-file}"
QUEUE_CONNECTION="${QUEUE_CONNECTION:-database}"
SESSION_DRIVER="${SESSION_DRIVER:-cookie}"
SESSION_LIFETIME=120

FILESYSTEM_DISK="${FILESYSTEM_DISK:-local}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}"

VAPID_PUBLIC_KEY="${VAPID_PUBLIC_KEY:-}"
VAPID_PRIVATE_KEY="${VAPID_PRIVATE_KEY:-}"
VAPID_SUBJECT="${VAPID_SUBJECT:-mailto:admin@example.com}"
ENVEOF

# ── 3. Generate APP_KEY if not set ────────────────────────────────────────────
if [ -z "${APP_KEY}" ]; then
    echo "==> Generating APP_KEY"
    php artisan key:generate --force
fi

# ── 4. Clear and cache config ─────────────────────────────────────────────────
echo "==> Caching config"
php artisan config:clear
php artisan config:cache

# ── 5. Run migrations ─────────────────────────────────────────────────────────
echo "==> Running migrations"
php artisan migrate --force

# ── 6. Seed database ──────────────────────────────────────────────────────────
echo "==> Seeding database"
php artisan db:seed --force

# ── 7. Start Apache ───────────────────────────────────────────────────────────
echo "==> Starting Apache on port ${PORT}"
exec apache2-foreground
