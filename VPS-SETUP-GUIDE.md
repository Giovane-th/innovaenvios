# 🚀 Guia de Setup do In'Nova Envios no VPS

## 📋 Pré-requisitos
- Node.js 18+ instalado
- PostgreSQL rodando
- Nginx instalado
- PM2 instalado (`npm install -g pm2`)
- SSL/HTTPS configurado (Let's Encrypt)

---

## ✅ Passo 1: Clonar Repositório

```bash
cd /home
git clone https://github.com/seu-usuario/innova-envios.git
cd innova-envios
```

---

## ✅ Passo 2: Instalar Dependências

```bash
npm install
# ou
pnpm install
```

---

## ✅ Passo 3: Configurar Variáveis de Ambiente

Crie o arquivo `.env.production`:

```bash
cat > .env.production << 'EOF'
# ===== BANCO DE DADOS =====
DATABASE_URL="postgresql://usuario:senha@localhost:5432/innova_envios"

# ===== CORREIOS API =====
CORREIOS_USER="seu_usuario_correios"
CORREIOS_PASSWORD="sua_senha_correios"
CORREIOS_CONTRACT="seu_numero_contrato"
CORREIOS_DR="seu_codigo_dr"
CORREIOS_ADMINISTRATIVE_CODE="seu_codigo_administrativo"

# ===== EMAIL (OPCIONAL) =====
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu_email@gmail.com"
SMTP_PASSWORD="sua_senha_app"
SMTP_FROM="noreply@innovaenvios.app"

# ===== APP =====
NODE_ENV="production"
PORT="3002"
EXPO_PORT="8081"

# ===== SEGURANÇA =====
JWT_SECRET="sua_chave_secreta_muito_segura_aqui"
EOF
```

---

## ✅ Passo 4: Criar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Criar banco de dados
CREATE DATABASE innova_envios;
\q

# Executar migrations
npm run db:push
```

---

## ✅ Passo 5: Configurar Nginx

### 5.1 Copiar Configuração

```bash
sudo cp /home/innova-envios/nginx-config.conf /etc/nginx/sites-available/innovaenvios.app
```

### 5.2 Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
```

### 5.3 Testar Configuração

```bash
sudo nginx -t
```

### 5.4 Recarregar Nginx

```bash
sudo systemctl reload nginx
```

---

## ✅ Passo 6: Iniciar Aplicação com PM2

### 6.1 Iniciar Backend (API)

```bash
cd /home/innova-envios
pm2 start "npm run start" --name "innova-api" --env production
```

### 6.2 Iniciar Frontend Web (Metro)

```bash
pm2 start "npm run dev:metro" --name "innova-web" --env production
```

### 6.3 Salvar Configuração PM2

```bash
pm2 save
pm2 startup
```

---

## ✅ Passo 7: Verificar Status

```bash
# Ver todos os processos
pm2 list

# Ver logs da API
pm2 logs innova-api

# Ver logs do Web
pm2 logs innova-web

# Ver logs do Nginx
sudo tail -f /var/log/nginx/innovaenvios.app.access.log
sudo tail -f /var/log/nginx/innovaenvios.app.error.log
```

---

## ✅ Passo 8: Testar Acesso

1. **Frontend Web:** https://innovaenvios.app
2. **Health Check:** https://innovaenvios.app/health
3. **API:** https://innovaenvios.app/api/health

---

## 🔧 Troubleshooting

### Nginx retorna 502 Bad Gateway
```bash
# Verificar se os serviços estão rodando
pm2 list

# Reiniciar serviços
pm2 restart all

# Verificar logs
pm2 logs
```

### Porta 8081 já está em uso
```bash
# Encontrar processo usando porta 8081
lsof -i :8081

# Matar processo
kill -9 <PID>
```

### Certificado SSL expirado
```bash
# Renovar certificado Let's Encrypt
sudo certbot renew --force-renewal

# Recarregar Nginx
sudo systemctl reload nginx
```

### Banco de dados não conecta
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U postgres -h localhost -d innova_envios
```

---

## 📊 Monitoramento

### Ver uso de CPU/Memória
```bash
pm2 monit
```

### Configurar alertas
```bash
pm2 install pm2-auto-pull
pm2 install pm2-logrotate
```

---

## 🔐 Segurança

### Habilitar Firewall
```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Fazer Backup do Banco de Dados
```bash
pg_dump innova_envios > backup_$(date +%Y%m%d).sql
```

---

## 📝 Próximos Passos

1. ✅ Testar login em https://innovaenvios.app
2. ✅ Testar logout (deve voltar para login)
3. ✅ Testar geração de etiquetas
4. ✅ Testar impressão USB
5. ✅ Testar integração com Correios

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs: `pm2 logs`
2. Verifique Nginx: `sudo nginx -t`
3. Verifique banco de dados: `psql -d innova_envios`
4. Reinicie tudo: `pm2 restart all && sudo systemctl reload nginx`
