#!/bin/bash
set -e

cd /var/www/html

echo "🚀 Iniciando container Laravel..."

# Instala dependências se o vendor estiver vazio
if [ ! -d "vendor" ]; then
    echo "📦 Instalando dependências do Composer..."
    composer install --no-interaction --no-progress --prefer-dist
fi

# Copia .env se não existir
if [ ! -f ".env" ]; then
    echo "📄 .env não encontrado. Criando..."
    cp .env.example .env
fi

# Gera APP_KEY se estiver vazio
if ! grep -q '^APP_KEY=' .env || grep -q '^APP_KEY=$' .env; then
    echo "🔑 Gerando APP_KEY..."
    php artisan key:generate --force
fi

# === CORREÇÃO ===
# Adiciona um laço para esperar o MySQL ficar pronto
echo "⏳ Esperando pelo MySQL..."
DB_HOST=${DB_HOST:-mysql}
DB_PORT=${DB_PORT:-3306}
DB_DATABASE=${DB_DATABASE:-docker}
DB_USERNAME=${DB_USERNAME:-docker}
DB_PASSWORD=${DB_PASSWORD:-docker}

# Tenta conectar ao banco de dados em loop até conseguir
# Usamos o 'mysql' client que foi instalado no Dockerfile
# A flag '|| true' no final garante que o 'set -e' não pare o script se o 'grep' falhar
until mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USERNAME" -p"$DB_PASSWORD" -D"$DB_DATABASE" -e 'SELECT 1' 2>/dev/null; do
  >&2 echo "MySQL não está pronto - tentando novamente em 1s..."
  sleep 1
done
echo "✅ MySQL está pronto!"
# =================

# Executa migrations automaticamente
echo "🗄️ Rodando migrations..."
php artisan migrate --force || true

# Instala dependências Node se o node_modules estiver vazio
if [ ! -d "node_modules" ]; then
    echo "⚙️ Instalando dependências Node..."
    npm install
fi

# Inicia build do front (não bloqueia)
npm run dev &

echo "✅ Tudo pronto, iniciando Apache..."
exec apache2-foreground

