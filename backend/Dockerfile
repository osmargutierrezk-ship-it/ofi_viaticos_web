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

# Enable Apache rewrite module (required for Laravel's .htaccess routing)
RUN a2enmod rewrite

# Configure the default vhost:
#   - DocumentRoot → Laravel's public/ directory
#   - AllowOverride All  → .htaccess is honoured (needed for mod_rewrite)
RUN sed -i 's!/var/www/html!/var/www/html/public!g' \
        /etc/apache2/sites-available/000-default.conf && \
    # Append a Directory block that explicitly allows .htaccess overrides
    printf '\n<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>\n' \
        >> /etc/apache2/sites-available/000-default.conf

# Suppress the "ServerName" warning
RUN echo "ServerName localhost" >> /etc/apache2/apache2.conf

# Copy the entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Render sets PORT=8080; Apache is configured at runtime by the entrypoint
EXPOSE 8080

CMD ["/usr/local/bin/docker-entrypoint.sh"]
