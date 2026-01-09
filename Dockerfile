# ===============================
# Estágio 1: Dependências do PHP (Composer)
# ===============================
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
# Instalamos as dependências aqui para poder usá-las no build do Node
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# ===============================
# Estágio 2: Build frontend assets (Node + PHP CLI)
# ===============================
FROM node:22-bookworm AS build
WORKDIR /app

# O Wayfinder precisa do PHP CLI e extensões para rodar o artisan
RUN apt-get update && apt-get install -y \
    php-cli \
    php-mbstring \
    php-xml \
    php-curl \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Copia vendor do PHP (garantindo que sobrescreva qualquer coisa local)
COPY --from=vendor /app/vendor ./vendor

# Cria .env para o build (necessário para alguns comandos artisan)
RUN cp .env.example .env


# Agora o build vai funcionar porque o vendor/autoload.php existe!
RUN npm run build

# ===============================
# Estágio 3: Final Stage (PHP + Apache)
# ===============================
FROM php:8.2-apache

# Instala extensões necessárias no servidor final
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev zip unzip libicu-dev libonig-dev curl \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo_mysql zip bcmath intl opcache \
    && rm -rf /var/lib/apt/lists/*

# Configuração do Apache para o Railway
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && a2enmod rewrite \
    && sed -s -i 's/80/${PORT}/' /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf

WORKDIR /var/www/html

# Copiamos tudo dos estágios anteriores
COPY --from=vendor /app/vendor ./vendor
COPY --from=build /app/public/build ./public/build
COPY . .

# Permissões
RUN chown -R www-data:www-data storage bootstrap/cache

EXPOSE 80

# Entrypoint
COPY docker/production-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]