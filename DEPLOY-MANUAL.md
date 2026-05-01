# 🚀 Guia de Deploy Manual para VPS

## Passo 1: Conectar à VPS via SSH

```bash
ssh giovanethdaniel@gmail.com@72.61.135.33
```

Senha: `082117Th`

## Passo 2: Criar diretório da aplicação

```bash
mkdir -p /opt/innova-envios
cd /opt/innova-envios
```

## Passo 3: Copiar arquivos (do seu computador local)

Abra outro terminal no seu computador e execute:

```bash
# Copiar arquivos de build
scp -r dist/ package.json package-lock.json giovanethdaniel@gmail.com@72.61.135.33:/opt/innova-envios/

# Ou se preferir usar sshpass:
sshpass -p "082117Th" scp -r dist/ package.json package-lock.json giovanethdaniel@gmail.com@72.61.135.33:/opt/innova-envios/
```

## Passo 4: Instalar dependências (na VPS)

```bash
cd /opt/innova-envios
npm install --production
```

## Passo 5: Instalar PM2 (gerenciador de processos)

```bash
npm install -g pm2
```

## Passo 6: Criar arquivo .env

```bash
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
```

## Passo 7: Iniciar aplicação com PM2

```bash
pm2 start dist/index.js --name "innova-envios" --env production
```

## Passo 8: Salvar configuração PM2

```bash
pm2 save
pm2 startup
```

## Passo 9: Verificar status

```bash
pm2 status
pm2 logs innova-envios
```

## Passo 10: Configurar Nginx (proxy reverso)

```bash
sudo nano /etc/nginx/sites-available/innovaenvios.app
```

Cole o seguinte conteúdo:

```nginx
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
    }
}
```

Ativar:

```bash
sudo ln -s /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Passo 11: Configurar SSL com Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d innovaenvios.app -d www.innovaenvios.app
```

## Passo 12: Configurar DNS

Apontar o domínio `innovaenvios.app` para o IP `72.61.135.33` no seu provedor de DNS.

## Comandos Úteis

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs innova-envios

# Reiniciar
pm2 restart innova-envios

# Parar
pm2 stop innova-envios

# Remover
pm2 delete innova-envios

# Ver processos do sistema
ps aux | grep node

# Testar conexão
curl http://localhost:3002/health
```

## Verificação Final

1. Conectar à VPS: `ssh giovanethdaniel@gmail.com@72.61.135.33`
2. Verificar status: `pm2 status`
3. Ver logs: `pm2 logs innova-envios`
4. Testar: `curl http://localhost:3002/health`
5. Acessar no navegador: `https://innovaenvios.app`

## Troubleshooting

Se a aplicação não iniciar:

```bash
# Ver logs detalhados
pm2 logs innova-envios --lines 100

# Reiniciar
pm2 restart innova-envios

# Verificar se a porta 3002 está em uso
netstat -tlnp | grep 3002

# Verificar conexão com banco de dados
mysql -h localhost -u innovaenvios_user -p innovaenvios_db -e "SELECT 1"
```

## Resumo do Deploy

| Etapa | Status |
|-------|--------|
| Build de produção | ✅ Pronto |
| Arquivos de deploy | ✅ Pronto |
| Credenciais VPS | ✅ Configuradas |
| Script de instalação | ✅ Pronto |
| Deploy na VPS | ⏳ Aguardando execução |
| Configuração Nginx | ⏳ Aguardando execução |
| SSL Let's Encrypt | ⏳ Aguardando execução |
| Domínio DNS | ⏳ Aguardando configuração |
