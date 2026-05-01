#!/bin/bash
set -e

# 🚀 SCRIPT DE DEPLOY PARA VPS
# Execute este script na VPS após copiar os arquivos

APP_DIR="/opt/innova-envios"
cd $APP_DIR

echo "🔧 Iniciando instalação na VPS..."
echo ""

# 1. Instalar dependências
echo "📦 Instalando dependências..."
npm install --production

# 2. Instalar PM2
echo "🔄 Instalando PM2..."
npm install -g pm2

# 3. Criar arquivo .env
echo "📝 Criando arquivo .env..."
cat > .env << 'EOF'
NODE_ENV=production
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_NAME=innovaenvios_db
DB_USER=innovaenvios_user
DB_PASSWORD=D54sbCnRKDX98w#
DATABASE_URL=mysql://innovaenvios_user:D54sbCnRKDX98w%23@localhost:3306/innovaenvios_db
DOMAIN_NAME=innovaenvios.app
EOF

# 4. Parar aplicação anterior
echo "🛑 Parando aplicação anterior (se existir)..."
pm2 delete innova-envios 2>/dev/null || true

# 5. Iniciar aplicação
echo "🚀 Iniciando aplicação com PM2..."
pm2 start dist/index.js --name "innova-envios" --env production

# 6. Salvar configuração
echo "💾 Salvando configuração PM2..."
pm2 save
pm2 startup

echo ""
echo "✅ Instalação concluída com sucesso!"
echo ""
echo "📊 Status:"
pm2 status

echo ""
echo "📝 Próximos passos:"
echo "1. Configurar Nginx como proxy reverso"
echo "2. Configurar domínio innovaenvios.app"
echo "3. Configurar SSL com Let's Encrypt"
echo ""
echo "📋 Comandos úteis:"
echo "   pm2 logs innova-envios      - Ver logs"
echo "   pm2 restart innova-envios   - Reiniciar"
echo "   pm2 stop innova-envios      - Parar"
echo "   pm2 delete innova-envios    - Remover"
