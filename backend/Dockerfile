FROM php:8.2-apache

RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libpq-dev \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY . .

RUN mkdir -p \
    bootstrap/cache \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    resources/views

RUN chmod -R 777 storage bootstrap/cache

RUN composer install --no-dev --optimize-autoloader

RUN php artisan config:clear || true
RUN php artisan route:clear || true
RUN php artisan cache:clear || true
RUN php artisan view:clear || true

RUN a2enmod rewrite

# Point Apache DocumentRoot to Laravel's public/ directory
RUN sed -i 's!/var/www/html!/var/www/html/public!g' \
    /etc/apache2/sites-available/000-default.conf

# Suppress the "ServerName" warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Copy the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Render sets PORT=8080; Apache must listen on that port at runtime
# We use an entrypoint script to configure this dynamically
EXPOSE 8080

CMD ["/usr/local/bin/docker-entrypoint.sh"]
