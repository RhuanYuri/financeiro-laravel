# Etapa 1: Obter Node.js 22
# Usamos uma versão baseada no Debian (Bookworm) para que os binários
# sejam compatíveis com a imagem do PHP (que também é baseada no Debian).
FROM node:22-bookworm AS nodejs

# Etapa 2: Imagem final do Laravel
FROM php:8.2-apache

# UID/GID da máquina host para evitar conflito de permissões
ARG UID
ARG GID

RUN groupadd -g ${GID} docker && \
    useradd -u ${UID} -g docker -m docker

# Dependências básicas + extensões PHP necessárias
# 'curl' e 'git' ainda são necessários para o composer ou outras ferramentas
# === CORREÇÃO ===
# Adicionado 'default-mysql-client' (ou 'mysql-client') para o script de espera
RUN apt-get update && apt-get install -y \
    libzip-dev zip unzip curl git default-mysql-client \
    && docker-php-ext-install pdo pdo_mysql bcmath zip

# === CORREÇÃO ===
# Copia o binário do Node.js e os módulos do NPM da etapa 'nodejs'
COPY --from=nodejs /usr/local/bin/node /usr/local/bin/node
COPY --from=nodejs /usr/local/lib/node_modules /usr/local/lib/node_modules
# Cria o link simbólico para o executável do npm
RUN ln -s /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm
# ===============

# Instala Composer
COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer

# Configura Apache
RUN a2enmod rewrite headers
COPY apache.conf /etc/apache2/sites-available/000-default.conf

# Copia o entrypoint e dá permissão de execução (como root)
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Define diretório do Laravel
WORKDIR /var/www/html

# Permissões corretas para cache e storage (ainda como root)
RUN chown -R docker:docker /var/www/html || true

# Só agora troca de usuário
USER docker

# Expõe as portas
EXPOSE 80
EXPOSE 5173

# Define o entrypoint
ENTRYPOINT ["entrypoint.sh"]

