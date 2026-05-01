# 🚀 Instruções de Deploy para VPS

## Credenciais VPS
- **IP**: 72.61.135.33
- **Usuário SSH**: giovanethdaniel@gmail.com
- **Senha SSH**: 082117Th
- **Porta SSH**: 22

## Arquivos de Build
- **Arquivo**: dist/index.js (53.8KB)
- **Dependências**: package.json, package-lock.json

## Passo 1: Conectar à VPS
```bash
ssh giovanethdaniel@gmail.com@72.61.135.33
```

## Passo 2: Preparar diretório na VPS
```bash
mkdir -p /opt/innova-envios
cd /opt/innova-envios
```

## Passo 3: Copiar arquivos (do seu computador)
```bash
scp -r dist/ package.json package-lock.json giovanethdaniel@gmail.com@72.61.135.33:/opt/innova-envios/
```

## Passo 4: Instalar dependências na VPS
```bash
cd /opt/innova-envios
npm install --production
```

## Passo 5: Criar arquivo .env na VPS
```bash
cat > .env << 'ENV_EOF'
NODE_ENV=production
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_NAME=innovaenvios_db
DB_USER=innovaenvios_user
DB_PASSWORD=D54sbCnRKDX98w#
DATABASE_URL=mysql://innovaenvios_user:D54sbCnRKDX98w%23@localhost:3306/innovaenvios_db
DOMAIN_NAME=innovaenvios.app
ENV_EOF
```

## Passo 6: Instalar PM2 (gerenciador de processos)
```bash
npm install -g pm2
```

## Passo 7: Iniciar aplicação com PM2
```bash
pm2 start dist/index.js --name "innova-envios" --env production
pm2 save
pm2 startup
```

## Passo 8: Configurar Nginx (proxy reverso)
```bash
# Criar arquivo de configuração Nginx
sudo nano /etc/nginx/sites-available/innovaenvios.app
```

Adicionar:
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

## Passo 9: Configurar SSL (Let's Encrypt)
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d innovaenvios.app -d www.innovaenvios.app
```

## Passo 10: Configurar DNS
Apontar o domínio `innovaenvios.app` para o IP `72.61.135.33`

## Comandos Úteis PM2
```bash
pm2 status                    # Ver status
pm2 logs innova-envios        # Ver logs
pm2 restart innova-envios     # Reiniciar
pm2 stop innova-envios        # Parar
pm2 delete innova-envios      # Remover
```

## Verificar se está rodando
```bash
curl http://localhost:3002/health
```

## Resumo do Deploy
1. ✅ Build de produção gerado (dist/index.js)
2. ✅ Credenciais de banco de dados configuradas
3. ✅ Instruções de deploy preparadas
4. ⏳ Próximo: Executar os passos acima na VPS
5. ⏳ Próximo: Configurar domínio innovaenvios.app
6. ⏳ Próximo: Configurar SSL com Let's Encrypt
