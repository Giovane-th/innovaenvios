#!/bin/bash

# Script de Deployment - In'Nova Envios
# Para: Ubuntu 22.04 LTS com PostgreSQL
# VPS: 72.61.135.33
# Domínio: innovaenvios.app

set -e

echo "================================"
echo "In'Nova Envios - Deployment VPS"
echo "================================"
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cor
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   print_error "Este script deve ser executado como root (use: sudo bash deploy-vps.sh)"
   exit 1
fi

# 1. Atualizar sistema
print_status "Atualizando sistema..."
apt-get update
apt-get upgrade -y

# 2. Instalar dependências básicas
print_status "Instalando dependências..."
apt-get install -y curl wget git build-essential

# 3. Instalar Node.js (versão LTS)
print_status "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

print_status "Node.js versão: $(node -v)"
print_status "npm versão: $(npm -v)"

# 4. Instalar PostgreSQL
print_status "Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

# Iniciar PostgreSQL
systemctl start postgresql
systemctl enable postgresql

print_status "PostgreSQL iniciado"

# 5. Criar usuário e banco de dados PostgreSQL
print_status "Configurando banco de dados..."

sudo -u postgres psql << EOF
CREATE USER innova_envios WITH PASSWORD 'innova_envios_pass_2024';
CREATE DATABASE innova_envios_db OWNER innova_envios;
GRANT ALL PRIVILEGES ON DATABASE innova_envios_db TO innova_envios;
\c innova_envios_db
GRANT ALL PRIVILEGES ON SCHEMA public TO innova_envios;
EOF

print_status "Banco de dados criado com sucesso"

# 6. Instalar Nginx (reverse proxy)
print_status "Instalando Nginx..."
apt-get install -y nginx

# Habilitar Nginx
systemctl start nginx
systemctl enable nginx

print_status "Nginx iniciado"

# 7. Instalar Certbot para SSL
print_status "Instalando Certbot (SSL/HTTPS)..."
apt-get install -y certbot python3-certbot-nginx

# 8. Criar diretório de aplicação
print_status "Criando diretório de aplicação..."
mkdir -p /var/www/innova-envios
cd /var/www/innova-envios

# 9. Clonar repositório (você vai fazer isso depois)
print_warning "Próximo passo: Clone seu repositório do GitHub"
print_warning "Comando: cd /var/www/innova-envios && git clone https://github.com/Giovane-th/innova-envios.git ."

# 10. Criar arquivo de configuração Nginx
print_status "Configurando Nginx..."

cat > /etc/nginx/sites-available/innova-envios << 'EOF'
server {
    listen 80;
    server_name innovaenvios.app www.innovaenvios.app;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Habilitar site
ln -sf /etc/nginx/sites-available/innova-envios /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração Nginx
nginx -t

# Recarregar Nginx
systemctl reload nginx

print_status "Nginx configurado"

# 11. Criar arquivo .env
print_status "Criando arquivo de configuração..."

cat > /var/www/innova-envios/.env << 'EOF'
# Ambiente
NODE_ENV=production
PORT=3000

# Banco de dados
DATABASE_URL=postgresql://innova_envios:innova_envios_pass_2024@localhost:5432/innova_envios_db

# Correios API
CORREIOS_CARTAO_POSTAGEM=0076337634
CORREIOS_CONTRATO=9912528344
CORREIOS_CNPJ=36543139000129
CORREIOS_SENHA=082117tH#
CORREIOS_API_URL=https://cwshom.correios.com.br

# JWT Secret
JWT_SECRET=sua_chave_secreta_aqui_mude_isso

# App URL
APP_URL=https://innovaenvios.app
EOF

print_warning "IMPORTANTE: Edite o arquivo .env e mude JWT_SECRET para uma chave segura"

# 12. Instalar PM2 (gerenciador de processos)
print_status "Instalando PM2..."
npm install -g pm2

# 13. Criar script de inicialização
print_status "Criando script de inicialização..."

cat > /var/www/innova-envios/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'innova-envios-api',
    script: './dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

mkdir -p /var/www/innova-envios/logs

print_status "Script de inicialização criado"

# 14. Resumo
echo ""
echo "================================"
echo -e "${GREEN}Deployment preparado com sucesso!${NC}"
echo "================================"
echo ""
echo "Próximos passos:"
echo "1. Clone seu repositório:"
echo "   cd /var/www/innova-envios"
echo "   git clone https://github.com/Giovane-th/innova-envios.git ."
echo ""
echo "2. Instale dependências:"
echo "   npm install"
echo ""
echo "3. Configure o arquivo .env:"
echo "   nano .env"
echo ""
echo "4. Build da aplicação:"
echo "   npm run build"
echo ""
echo "5. Inicie com PM2:"
echo "   pm2 start ecosystem.config.js"
echo "   pm2 save"
echo "   pm2 startup"
echo ""
echo "6. Configure SSL (HTTPS):"
echo "   certbot --nginx -d innovaenvios.app -d www.innovaenvios.app"
echo ""
echo "7. Verifique o status:"
echo "   pm2 status"
echo "   pm2 logs"
echo ""
echo "Banco de dados:"
echo "  Host: localhost"
echo "  Usuário: innova_envios"
echo "  Senha: innova_envios_pass_2024"
echo "  Banco: innova_envios_db"
echo ""
echo "API URL: https://innovaenvios.app"
echo ""
