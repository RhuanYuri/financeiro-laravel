# ===============================
# Estágio 1: Build de Assets (Node.js)
# ===============================
FROM node:22-slim AS build
WORKDIR /app

# Instala apenas o necessário para o PHP CLI (Wayfinder)
RUN apt-get update && apt-get install -y --no-install-recommends \
    php-cli \
    unzip \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --quiet

COPY . .
RUN npm run build

# ===============================
# Estágio 2: Imagem Final (PHP + Apache)
# ===============================
FROM php:8.2-apache

# Otimização de camadas: agrupar instalação e limpeza
RUN apt-get update && apt-get install -y --no-install-recommends \
    libzip-dev \
    zip \
    unzip \
    libicu-dev \
    libonig-dev \
    curl \
    git \
    libpng-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j$(nproc) \
    pdo_mysql \
    zip \
    bcmath \
    intl \
    opcache \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && rm -rf /var/lib/apt/lists/*

# Configurações do Apache e PHP
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf \
    && sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf \
    && a2enmod rewrite

# Instala Composer de forma eficiente
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Cache de dependências do PHP (Copiamos apenas os arquivos do composer primeiro)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copiar o restante da aplicação
COPY . .

# Copiar assets do estágio de build
COPY --from=build /app/public/build ./public/build

# Ajuste de permissões para o Railway (www-data)
RUN chown -R www-data:www-data storage bootstrap/cache

# Railway usa a variável de ambiente PORT. Ajustamos o Apache para ouvir nela.
RUN sed -s -i 's/80/${PORT}/' /etc/apache2/ports.conf /etc/apache2/sites-available/*.conf

EXPOSE 80

# Script de entrada
COPY docker/production-entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["entrypoint.sh"]