# 🖥️ Instruções para Configurar via Painel Web do VPS

## 📋 Resumo do Que Vamos Fazer

1. ✅ Conectar ao VPS via painel web
2. ✅ Copiar arquivo de configuração Nginx
3. ✅ Ativar site no Nginx
4. ✅ Iniciar aplicação com PM2
5. ✅ Testar acesso em https://innovaenvios.app

---

## 🔧 Passo 1: Acessar Terminal do Painel Web

1. Abra o painel de controle do VPS
2. Procure por **"Terminal"**, **"Console"**, **"SSH"** ou **"Command Line"**
3. Clique para abrir o terminal

---

## 📁 Passo 2: Clonar Repositório (Se Não Tiver)

Se ainda não clonou o repositório:

```bash
cd /home
git clone https://github.com/seu-usuario/innova-envios.git
cd innova-envios
```

Se já tem o repositório, atualize:

```bash
cd /home/innova-envios
git pull origin main
```

---

## 📦 Passo 3: Instalar Dependências

```bash
npm install
# ou
pnpm install
```

Aguarde até ver: ✅ **added X packages**

---

## 🔐 Passo 4: Criar Arquivo .env.production

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
JWT_SECRET="sua_chave_secreta_muito_segura_aqui_mude_isso"
EOF
```

**⚠️ IMPORTANTE:** Edite os valores acima com suas credenciais reais!

Para editar:
```bash
nano .env.production
```

Depois pressione:
- `Ctrl + X` para sair
- `Y` para salvar
- `Enter` para confirmar

---

## 🗄️ Passo 5: Configurar Banco de Dados

```bash
# Conectar ao PostgreSQL
psql -U postgres

# Dentro do PostgreSQL, execute:
CREATE DATABASE innova_envios;
CREATE USER innova_user WITH PASSWORD 'sua_senha_segura';
GRANT ALL PRIVILEGES ON DATABASE innova_envios TO innova_user;
\q
```

Depois execute as migrations:

```bash
npm run db:push
```

---

## 🔨 Passo 6: Compilar Aplicação

```bash
npm run build
```

Aguarde até ver: ✅ **Done in Xms**

---

## 🌐 Passo 7: Configurar Nginx

### 7.1 Copiar Arquivo de Configuração

```bash
sudo cp /home/innova-envios/nginx-config.conf /etc/nginx/sites-available/innovaenvios.app
```

### 7.2 Ativar Site

```bash
sudo ln -s /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
```

### 7.3 Testar Configuração

```bash
sudo nginx -t
```

Você deve ver: ✅ **nginx: configuration file test is successful**

### 7.4 Recarregar Nginx

```bash
sudo systemctl reload nginx
```

---

## 🚀 Passo 8: Iniciar Aplicação com PM2

### 8.1 Instalar PM2 (Se Não Tiver)

```bash
npm install -g pm2
```

### 8.2 Parar Processos Antigos

```bash
pm2 delete all
```

### 8.3 Iniciar Backend (API)

```bash
cd /home/innova-envios
pm2 start "npm run start" --name "innova-api" --env production
```

### 8.4 Iniciar Frontend Web

```bash
pm2 start "npm run dev:metro" --name "innova-web" --env production
```

### 8.5 Salvar Configuração PM2

```bash
pm2 save
pm2 startup
```

---

## ✅ Passo 9: Verificar Status

```bash
pm2 list
```

Você deve ver:

```
┌─────────────────────┬────┬─────────┬──────┬──────┬────────┐
│ App name            │ id │ version │ mode │ pid  │ status │
├─────────────────────┼────┼─────────┼──────┼──────┼────────┤
│ innova-api          │ 0  │ 1.0.0   │ fork │ 1234 │ online │
│ innova-web          │ 1  │ 1.0.0   │ fork │ 5678 │ online │
└─────────────────────┴────┴─────────┴──────┴──────┴────────┘
```

---

## 🧪 Passo 10: Testar Acesso

### 10.1 Testar Frontend Web

Abra seu navegador e acesse:
```
https://innovaenvios.app
```

Você deve ver a **tela de login**.

### 10.2 Testar Health Check

```
https://innovaenvios.app/health
```

Você deve ver: `OK`

### 10.3 Testar API

```
https://innovaenvios.app/api/health
```

Você deve ver uma resposta JSON.

---

## 🔍 Troubleshooting

### ❌ Nginx retorna 502 Bad Gateway

```bash
# Verificar se os serviços estão rodando
pm2 list

# Reiniciar serviços
pm2 restart all

# Ver logs
pm2 logs
```

### ❌ Porta 8081 já está em uso

```bash
# Encontrar processo usando porta 8081
lsof -i :8081

# Matar processo (substitua PID)
kill -9 <PID>

# Reiniciar web
pm2 restart innova-web
```

### ❌ Banco de dados não conecta

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U innova_user -h localhost -d innova_envios
```

### ❌ Certificado SSL expirado

```bash
# Renovar certificado
sudo certbot renew --force-renewal

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 📊 Monitoramento Contínuo

### Ver Logs em Tempo Real

```bash
pm2 logs
```

### Ver Uso de CPU/Memória

```bash
pm2 monit
```

### Reiniciar Tudo

```bash
pm2 restart all
sudo systemctl reload nginx
```

---

## 📝 Próximos Passos

1. ✅ Testar login em https://innovaenvios.app
2. ✅ Criar usuário de teste
3. ✅ Testar logout (deve voltar para login)
4. ✅ Testar geração de etiquetas
5. ✅ Testar impressão USB (Waytec WLP-200)
6. ✅ Testar integração com Correios

---

## 🆘 Precisa de Ajuda?

Se algo não funcionar:

1. Verifique os logs: `pm2 logs`
2. Verifique Nginx: `sudo nginx -t`
3. Verifique banco: `psql -U innova_user -d innova_envios`
4. Reinicie tudo: `pm2 restart all && sudo systemctl reload nginx`

---

## 📞 Contato

Se precisar de suporte, entre em contato com o desenvolvedor.

**Bom deployment! 🚀**
