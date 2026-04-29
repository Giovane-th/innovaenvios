#!/bin/bash

# ============================================================
# RESUMO EXECUTIVO - COMANDOS ESSENCIAIS PARA VPS
# ============================================================
# Copie e cole cada bloco no terminal do painel web
# ============================================================

echo "🚀 In'Nova Envios - Deployment Rápido"
echo ""

# ============================================================
# 1. PREPARAR REPOSITÓRIO
# ============================================================
echo "📋 PASSO 1: Preparar Repositório"
echo "Copie e cole:"
echo ""
echo "cd /home/innova-envios"
echo "npm install"
echo ""
echo "Pressione ENTER quando terminar..."
read

# ============================================================
# 2. CRIAR ARQUIVO .env.production
# ============================================================
echo ""
echo "📋 PASSO 2: Criar Arquivo .env.production"
echo "Copie e cole:"
echo ""
cat << 'EOF'
cat > .env.production << 'ENVEOF'
DATABASE_URL="postgresql://usuario:senha@localhost:5432/innova_envios"
CORREIOS_USER="seu_usuario"
CORREIOS_PASSWORD="sua_senha"
CORREIOS_CONTRACT="seu_contrato"
CORREIOS_DR="seu_dr"
CORREIOS_ADMINISTRATIVE_CODE="seu_codigo"
NODE_ENV="production"
PORT="3002"
EXPO_PORT="8081"
JWT_SECRET="sua_chave_secreta_muito_segura"
ENVEOF
EOF
echo ""
echo "⚠️  EDITE OS VALORES COM SUAS CREDENCIAIS!"
echo "nano .env.production"
echo ""
echo "Pressione ENTER quando terminar..."
read

# ============================================================
# 3. COMPILAR E MIGRAR BANCO
# ============================================================
echo ""
echo "📋 PASSO 3: Compilar e Migrar Banco"
echo "Copie e cole:"
echo ""
echo "npm run build"
echo "npm run db:push"
echo ""
echo "Pressione ENTER quando terminar..."
read

# ============================================================
# 4. CONFIGURAR NGINX
# ============================================================
echo ""
echo "📋 PASSO 4: Configurar Nginx"
echo "Copie e cole:"
echo ""
cat << 'EOF'
sudo cp /home/innova-envios/nginx-config.conf /etc/nginx/sites-available/innovaenvios.app
sudo ln -s /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
EOF
echo ""
echo "Pressione ENTER quando terminar..."
read

# ============================================================
# 5. INICIAR COM PM2
# ============================================================
echo ""
echo "📋 PASSO 5: Iniciar com PM2"
echo "Copie e cole:"
echo ""
cat << 'EOF'
cd /home/innova-envios
pm2 delete all 2>/dev/null || true
pm2 start "npm run start" --name "innova-api" --env production
pm2 start "npm run dev:metro" --name "innova-web" --env production
pm2 save
pm2 startup
EOF
echo ""
echo "Pressione ENTER quando terminar..."
read

# ============================================================
# 6. VERIFICAR STATUS
# ============================================================
echo ""
echo "📋 PASSO 6: Verificar Status"
echo "Copie e cole:"
echo ""
echo "pm2 list"
echo "pm2 logs"
echo ""
echo "Pressione ENTER quando terminar..."
read

# ============================================================
# 7. TESTAR ACESSO
# ============================================================
echo ""
echo "✅ PRONTO!"
echo ""
echo "Teste os links abaixo no navegador:"
echo "  1. Frontend: https://innovaenvios.app"
echo "  2. Health: https://innovaenvios.app/health"
echo "  3. API: https://innovaenvios.app/api/health"
echo ""
echo "Se algo der errado, use:"
echo "  pm2 logs          (ver logs)"
echo "  pm2 restart all   (reiniciar)"
echo "  sudo nginx -t     (testar nginx)"
echo ""
