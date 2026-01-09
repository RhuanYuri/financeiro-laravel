#!/bin/bash
set -e

echo "🚀 Iniciando processo de deployment no Railway..."

# 1. Aguardar/Rodar migrações de banco de dados
# O --force é obrigatório em produção
echo "ajustando banco de dados..."
php artisan migrate --force

# 2. Criar link simbólico para arquivos públicos
# Essencial para que fotos e uploads funcionem
echo "vinculando storage..."
php artisan storage:link --force

# 3. Otimizações de performance do Laravel
# Se for produção, limpamos e geramos o cache de configurações/rotas
if [ "$APP_ENV" = "production" ]; then
    echo "⚡ Otimizando caches para produção..."
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
else
    echo "🛠️ Limpando caches para ambiente de $APP_ENV..."
    php artisan optimize:clear
fi

# 4. Garantir permissões de escrita (Segurança extra)
# O Dockerfile já faz isso, mas aqui garantimos caso o Railway use volumes montados
echo "ajustando permissões de pastas..."
mkdir -p storage/framework/{sessions,views,cache}
mkdir -p storage/logs
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# 5. Finalização
echo "✅ Deployment concluído com sucesso!"
echo "🌐 Iniciando Apache na porta ${PORT:-80}..."

# Inicia o Apache no "foreground" para o container não fechar
exec apache2-foreground