#!/bin/bash

# Script de Deployment do In'Nova Envios para VPS
# Uso: ./deploy-vps.sh
# Executar como root via painel web

set -e

echo "🚀 Iniciando deployment do In'Nova Envios..."

# ===== CORES =====
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ===== FUNÇÕES =====
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# ===== VERIFICAÇÕES =====
echo -e "\n${YELLOW}📋 Verificando pré-requisitos...${NC}"

if ! command -v node &> /dev/null; then
    log_error "Node.js não está instalado"
    exit 1
fi
log_success "Node.js encontrado: $(node -v)"

if ! command -v npm &> /dev/null; then
    log_error "npm não está instalado"
    exit 1
fi
log_success "npm encontrado: $(npm -v)"

if ! command -v pm2 &> /dev/null; then
    log_warning "PM2 não encontrado. Instalando..."
    npm install -g pm2
fi
log_success "PM2 encontrado"

if ! command -v psql &> /dev/null; then
    log_error "PostgreSQL não está instalado"
    exit 1
fi
log_success "PostgreSQL encontrado"

if ! command -v nginx &> /dev/null; then
    log_error "Nginx não está instalado"
    exit 1
fi
log_success "Nginx encontrado"

# ===== INSTALAÇÃO DE DEPENDÊNCIAS =====
echo -e "\n${YELLOW}📦 Instalando dependências...${NC}"
npm install
log_success "Dependências instaladas"

# ===== CONFIGURAR VARIÁVEIS DE AMBIENTE =====
echo -e "\n${YELLOW}🔐 Verificando arquivo .env.production...${NC}"
if [ ! -f .env.production ]; then
    log_warning ".env.production não encontrado"
    echo "Por favor, crie o arquivo .env.production com as variáveis necessárias"
    echo "Referência: VPS-SETUP-GUIDE.md"
    exit 1
fi
log_success ".env.production encontrado"

# ===== BUILD =====
echo -e "\n${YELLOW}🔨 Compilando aplicação...${NC}"
npm run build
log_success "Build concluído"

# ===== MIGRATIONS DO BANCO DE DADOS =====
echo -e "\n${YELLOW}🗄️  Executando migrations do banco de dados...${NC}"
npm run db:push
log_success "Migrations executadas"

# ===== CONFIGURAR NGINX =====
echo -e "\n${YELLOW}🌐 Configurando Nginx...${NC}"
if [ ! -f nginx-config.conf ]; then
    log_error "nginx-config.conf não encontrado"
    exit 1
fi

cp nginx-config.conf /etc/nginx/sites-available/innovaenvios.app
log_success "Arquivo de configuração Nginx copiado"

# Ativar site
if [ ! -L /etc/nginx/sites-enabled/innovaenvios.app ]; then
    ln -s /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
    log_success "Site Nginx ativado"
else
    log_success "Site Nginx já estava ativado"
fi

# Testar configuração
if nginx -t; then
    log_success "Configuração Nginx válida"
else
    log_error "Configuração Nginx inválida"
    exit 1
fi

# Recarregar Nginx
systemctl reload nginx
log_success "Nginx recarregado"

# ===== INICIAR APLICAÇÃO COM PM2 =====
echo -e "\n${YELLOW}🚀 Iniciando aplicação com PM2...${NC}"

# Parar processos antigos
pm2 delete innova-api 2>/dev/null || true
pm2 delete innova-web 2>/dev/null || true

# Iniciar backend
pm2 start "npm run start" --name "innova-api" --env production
log_success "Backend iniciado (innova-api)"

# Iniciar frontend web
pm2 start "npm run dev:metro" --name "innova-web" --env production
log_success "Frontend web iniciado (innova-web)"

# Salvar configuração PM2
pm2 save
pm2 startup
log_success "PM2 configurado para iniciar automaticamente"

# ===== VERIFICAÇÕES FINAIS =====
echo -e "\n${YELLOW}✔️  Verificando status...${NC}"
sleep 3
pm2 list
log_success "Aplicação em execução"

# ===== RESUMO =====
echo -e "\n${GREEN}🎉 Deployment concluído com sucesso!${NC}"
echo -e "\n${YELLOW}📊 Informações:${NC}"
echo "  Frontend: https://innovaenvios.app"
echo "  Health Check: https://innovaenvios.app/health"
echo "  API: https://innovaenvios.app/api/health"
echo ""
echo -e "${YELLOW}📝 Próximos passos:${NC}"
echo "  1. Testar login em https://innovaenvios.app"
echo "  2. Testar logout"
echo "  3. Testar geração de etiquetas"
echo "  4. Testar impressão USB"
echo ""
echo -e "${YELLOW}📋 Monitoramento:${NC}"
echo "  Ver logs: pm2 logs"
echo "  Ver status: pm2 list"
echo "  Reiniciar: pm2 restart all"
echo ""
