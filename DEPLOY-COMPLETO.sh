#!/bin/bash
set -e

# 🚀 SCRIPT COMPLETO DE DEPLOY PARA VPS
# Cole este script inteiro no terminal da VPS e execute

echo "🚀 Iniciando deploy completo da In'Nova Envios..."
echo ""

# ============================================================================
# PASSO 1: PREPARAR DIRETÓRIO
# ============================================================================
echo "📁 PASSO 1: Preparando diretório..."
APP_DIR="/opt/innova-envios"
mkdir -p $APP_DIR
cd $APP_DIR
echo "✅ Diretório criado: $APP_DIR"
echo ""

# ============================================================================
# PASSO 2: VERIFICAR SE OS ARQUIVOS FORAM COPIADOS
# ============================================================================
echo "📦 PASSO 2: Verificando arquivos..."
if [ ! -f "dist/index.js" ]; then
    echo "❌ ERRO: dist/index.js não encontrado!"
    echo "Execute primeiro: scp -r dist/ package.json package-lock.json giovanethdaniel@gmail.com@72.61.135.33:/opt/innova-envios/"
    exit 1
fi
echo "✅ Arquivos encontrados"
echo ""

# ============================================================================
# PASSO 3: INSTALAR DEPENDÊNCIAS
# ============================================================================
echo "📦 PASSO 3: Instalando dependências..."
npm install --production
echo "✅ Dependências instaladas"
echo ""

# ============================================================================
# PASSO 4: INSTALAR PM2
# ============================================================================
echo "🔄 PASSO 4: Instalando PM2..."
npm install -g pm2
echo "✅ PM2 instalado"
echo ""

# ============================================================================
# PASSO 5: CRIAR ARQUIVO .ENV
# ============================================================================
echo "📝 PASSO 5: Criando arquivo .env..."
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
echo "✅ Arquivo .env criado"
echo ""

# ============================================================================
# PASSO 6: PARAR APLICAÇÃO ANTERIOR
# ============================================================================
echo "🛑 PASSO 6: Parando aplicação anterior (se existir)..."
pm2 delete innova-envios 2>/dev/null || true
echo "✅ Aplicação anterior parada"
echo ""

# ============================================================================
# PASSO 7: INICIAR APLICAÇÃO COM PM2
# ============================================================================
echo "🚀 PASSO 7: Iniciando aplicação com PM2..."
pm2 start dist/index.js --name "innova-envios" --env production
echo "✅ Aplicação iniciada"
echo ""

# ============================================================================
# PASSO 8: SALVAR CONFIGURAÇÃO PM2
# ============================================================================
echo "💾 PASSO 8: Salvando configuração PM2..."
pm2 save
pm2 startup
echo "✅ Configuração salva"
echo ""

# ============================================================================
# PASSO 9: VERIFICAR STATUS
# ============================================================================
echo "📊 PASSO 9: Status da aplicação:"
pm2 status
echo ""

# ============================================================================
# PASSO 10: INSTALAR E CONFIGURAR NGINX
# ============================================================================
echo "🌐 PASSO 10: Configurando Nginx..."

# Instalar Nginx se não estiver instalado
if ! command -v nginx &> /dev/null; then
    echo "📦 Instalando Nginx..."
    apt-get update -qq
    apt-get install -y nginx > /dev/null 2>&1
    echo "✅ Nginx instalado"
else
    echo "✅ Nginx já instalado"
fi

# Criar arquivo de configuração do Nginx
echo "📝 Criando configuração do Nginx..."
sudo tee /etc/nginx/sites-available/innovaenvios.app > /dev/null << 'NGINX_EOF'
server {
    listen 80;
    server_name innovaenvios.app www.innovaenvios.app;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_EOF

# Ativar site
echo "🔗 Ativando site no Nginx..."
sudo ln -sf /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
echo "✅ Testando configuração do Nginx..."
sudo nginx -t

# Reiniciar Nginx
echo "🔄 Reiniciando Nginx..."
sudo systemctl restart nginx
echo "✅ Nginx configurado e reiniciado"
echo ""

# ============================================================================
# PASSO 11: INSTALAR CERTBOT PARA SSL
# ============================================================================
echo "🔐 PASSO 11: Configurando SSL com Let's Encrypt..."

# Instalar Certbot
if ! command -v certbot &> /dev/null; then
    echo "📦 Instalando Certbot..."
    apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
    echo "✅ Certbot instalado"
else
    echo "✅ Certbot já instalado"
fi

# Configurar SSL
echo "🔐 Configurando certificado SSL..."
sudo certbot --nginx -d innovaenvios.app -d www.innovaenvios.app --non-interactive --agree-tos --email giovanethdaniel@gmail.com

echo "✅ SSL configurado com sucesso!"
echo ""

# ============================================================================
# PASSO 12: VERIFICAÇÃO FINAL
# ============================================================================
echo "✅ ✅ ✅ DEPLOY CONCLUÍDO COM SUCESSO! ✅ ✅ ✅"
echo ""
echo "📊 Status final:"
echo "================================"
pm2 status
echo "================================"
echo ""
echo "🌐 Seu app está disponível em:"
echo "   https://innovaenvios.app"
echo ""
echo "📝 Comandos úteis:"
echo "   pm2 logs innova-envios      - Ver logs em tempo real"
echo "   pm2 restart innova-envios   - Reiniciar aplicação"
echo "   pm2 stop innova-envios      - Parar aplicação"
echo "   pm2 delete innova-envios    - Remover aplicação"
echo ""
echo "🔐 Certificado SSL:"
echo "   sudo certbot renew          - Renovar certificado"
echo "   sudo certbot certificates   - Ver certificados"
echo ""
echo "🌐 Nginx:"
echo "   sudo systemctl status nginx - Status do Nginx"
echo "   sudo systemctl restart nginx - Reiniciar Nginx"
echo ""
echo "📋 Logs:"
echo "   tail -f /var/log/nginx/error.log"
echo "   tail -f /var/log/nginx/access.log"
echo ""
