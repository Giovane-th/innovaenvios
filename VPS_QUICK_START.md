# In'Nova Envios - VPS Quick Start

## Informações da VPS

- **IP**: 72.61.135.33
- **Usuário**: root
- **Senha**: D54sbCnRKDX98w#
- **Domínio**: innovaenvios.app
- **SO**: Ubuntu 22.04 LTS

---

## PASSO 1: Conectar à VPS via SSH

Abra o Terminal/PowerShell e execute:

```bash
ssh root@72.61.135.33
```

Quando pedir a senha, cole: `D54sbCnRKDX98w#`

---

## PASSO 2: Preparar VPS para Deployment

Depois de conectado à VPS, execute esses comandos:

```bash
# Ir para diretório root
cd /root

# Criar arquivo de script
cat > deploy-vps.sh << 'EOF'
#!/bin/bash

set -e

echo "================================"
echo "In'Nova Envios - Deployment VPS"
echo "================================"
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Atualizar sistema
print_status "Atualizando sistema..."
apt-get update
apt-get upgrade -y

# Instalar dependências
print_status "Instalando dependências..."
apt-get install -y curl wget git build-essential

# Instalar Node.js
print_status "Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt-get install -y nodejs

print_status "Node.js versão: $(node -v)"

# Instalar PostgreSQL
print_status "Instalando PostgreSQL..."
apt-get install -y postgresql postgresql-contrib

systemctl start postgresql
systemctl enable postgresql

print_status "Configurando banco de dados..."

sudo -u postgres psql << PSQL
CREATE USER innova_envios WITH PASSWORD 'innova_envios_pass_2024';
CREATE DATABASE innova_envios_db OWNER innova_envios;
GRANT ALL PRIVILEGES ON DATABASE innova_envios_db TO innova_envios;
\c innova_envios_db
GRANT ALL PRIVILEGES ON SCHEMA public TO innova_envios;
PSQL

print_status "Banco de dados criado"

# Instalar Nginx
print_status "Instalando Nginx..."
apt-get install -y nginx

systemctl start nginx
systemctl enable nginx

print_status "Nginx iniciado"

# Instalar Certbot
print_status "Instalando Certbot..."
apt-get install -y certbot python3-certbot-nginx

# Criar diretório
print_status "Criando diretório de aplicação..."
mkdir -p /var/www/innova-envios
cd /var/www/innova-envios

# Configurar Nginx
print_status "Configurando Nginx..."

cat > /etc/nginx/sites-available/innova-envios << 'NGINX'
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
NGINX

ln -sf /etc/nginx/sites-available/innova-envios /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

print_status "Nginx configurado"

# Instalar PM2
print_status "Instalando PM2..."
npm install -g pm2

# Criar arquivo .env
print_status "Criando arquivo .env..."

cat > /var/www/innova-envios/.env << 'ENV'
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://innova_envios:innova_envios_pass_2024@localhost:5432/innova_envios_db
CORREIOS_CARTAO_POSTAGEM=0076337634
CORREIOS_CONTRATO=9912528344
CORREIOS_CNPJ=36543139000129
CORREIOS_SENHA=082117tH#
CORREIOS_API_URL=https://cwshom.correios.com.br
JWT_SECRET=MUDE_ISSO_PARA_UMA_CHAVE_SEGURA
APP_URL=https://innovaenvios.app
ENV

print_warning "IMPORTANTE: Edite .env e mude JWT_SECRET"

# Criar ecosystem.config.js
cat > /var/www/innova-envios/ecosystem.config.js << 'PM2'
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
PM2

mkdir -p /var/www/innova-envios/logs

echo ""
echo "================================"
echo -e "${GREEN}Deployment preparado!${NC}"
echo "================================"
echo ""
echo "Próximos passos:"
echo "1. cd /var/www/innova-envios"
echo "2. git clone https://github.com/Giovane-th/innova-envios.git ."
echo "3. npm install"
echo "4. npm run build"
echo "5. nano .env (edite JWT_SECRET)"
echo "6. pm2 start ecosystem.config.js"
echo "7. certbot --nginx -d innovaenvios.app"
echo ""
EOF

# Dar permissão
chmod +x deploy-vps.sh

# Executar script
sudo bash deploy-vps.sh
```

---

## PASSO 3: Clonar Repositório e Instalar

```bash
cd /var/www/innova-envios

# Clonar seu repositório
git clone https://github.com/Giovane-th/innova-envios.git .

# Instalar dependências
npm install

# Build
npm run build
```

---

## PASSO 4: Configurar Variáveis de Ambiente

```bash
# Editar .env
nano /var/www/innova-envios/.env
```

Mude `JWT_SECRET` para uma chave segura. Gere uma com:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`.

---

## PASSO 5: Iniciar Aplicação

```bash
cd /var/www/innova-envios

# Iniciar com PM2
pm2 start ecosystem.config.js

# Salvar
pm2 save
pm2 startup

# Verificar status
pm2 status
pm2 logs
```

---

## PASSO 6: Configurar SSL (HTTPS)

```bash
sudo certbot --nginx -d innovaenvios.app -d www.innovaenvios.app
```

Siga as instruções na tela.

---

## PASSO 7: Testar

```bash
# Verificar se está rodando
curl https://innovaenvios.app/health

# Ver logs
pm2 logs innova-envios-api
```

---

## Comandos Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs

# Reiniciar
pm2 restart innova-envios-api

# Parar
pm2 stop innova-envios-api

# Atualizar código (após push no GitHub)
cd /var/www/innova-envios
git pull origin main
npm install
npm run build
pm2 restart innova-envios-api
```

---

**Pronto! Seu app estará rodando em https://innovaenvios.app** 🚀
