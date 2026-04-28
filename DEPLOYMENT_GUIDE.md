# Guia de Deployment - In'Nova Envios

## Informações da VPS

- **IP**: 72.61.135.33
- **Domínio**: innovaenvios.app
- **SO**: Ubuntu 22.04 LTS
- **Banco de dados**: PostgreSQL
- **GitHub**: https://github.com/Giovane-th

---

## Passo 1: Preparar o Repositório GitHub

### 1.1 Criar repositório no GitHub

1. Acesse https://github.com/new
2. Nome: `innova-envios`
3. Descrição: "App mobile para geração de etiquetas de envio dos Correios"
4. Privado ou Público (sua escolha)
5. Clique em "Create repository"

### 1.2 Fazer push do projeto

```bash
# No seu computador local
cd /home/ubuntu/innova-envios

# Inicializar git (se não estiver)
git init
git add .
git commit -m "Initial commit: In'Nova Envios"

# Adicionar remote
git remote add origin https://github.com/Giovane-th/innova-envios.git
git branch -M main
git push -u origin main
```

---

## Passo 2: Configurar DNS

### 2.1 Apontar domínio para VPS

1. Acesse https://hpanel.hostinger.com
2. Vá para "Domínios" → "innovaenvios.app"
3. Clique em "Gerenciar DNS"
4. Procure pelo registro "A"
5. Edite o valor para: **72.61.135.33**
6. Salve as alterações

**Nota**: Pode levar até 24 horas para propagar, mas geralmente é mais rápido.

---

## Passo 3: Executar Script de Deployment

### 3.1 Conectar à VPS via SSH

```bash
# No seu computador
ssh root@72.61.135.33

# Senha: D54sbCnRKDX98w#
```

### 3.2 Baixar e executar script

```bash
# Na VPS
cd /root

# Baixar script (você vai fazer upload via SCP ou copiar o conteúdo)
# Ou crie o arquivo manualmente:
nano deploy-vps.sh

# Cole o conteúdo do arquivo deploy-vps.sh

# Dar permissão de execução
chmod +x deploy-vps.sh

# Executar script
sudo bash deploy-vps.sh
```

---

## Passo 4: Clonar Repositório e Instalar

```bash
# Na VPS (como root)
cd /var/www/innova-envios

# Clonar repositório
git clone https://github.com/Giovane-th/innova-envios.git .

# Instalar dependências
npm install

# Build da aplicação
npm run build
```

---

## Passo 5: Configurar Variáveis de Ambiente

```bash
# Na VPS
nano /var/www/innova-envios/.env
```

Edite os valores:

```env
NODE_ENV=production
PORT=3000

DATABASE_URL=postgresql://innova_envios:innova_envios_pass_2024@localhost:5432/innova_envios_db

CORREIOS_CARTAO_POSTAGEM=0076337634
CORREIOS_CONTRATO=9912528344
CORREIOS_CNPJ=36543139000129
CORREIOS_SENHA=082117tH#
CORREIOS_API_URL=https://cwshom.correios.com.br

JWT_SECRET=MUDE_ISSO_PARA_UMA_CHAVE_SEGURA_ALEATORIA

APP_URL=https://innovaenvios.app
```

**IMPORTANTE**: Gere uma chave JWT segura:

```bash
# Na VPS
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copie o resultado e cole em `JWT_SECRET`.

---

## Passo 6: Iniciar Aplicação com PM2

```bash
# Na VPS
cd /var/www/innova-envios

# Iniciar
pm2 start ecosystem.config.js

# Salvar configuração
pm2 save

# Configurar para iniciar automaticamente
pm2 startup
pm2 save

# Verificar status
pm2 status
pm2 logs
```

---

## Passo 7: Configurar SSL (HTTPS)

```bash
# Na VPS
sudo certbot --nginx -d innovaenvios.app -d www.innovaenvios.app

# Siga as instruções na tela
# Email: seu@email.com
# Aceite os termos
```

---

## Passo 8: Verificar Deployment

```bash
# Na VPS
# Verificar se API está respondendo
curl https://innovaenvios.app/health

# Ver logs
pm2 logs innova-envios-api

# Ver status
pm2 status
```

---

## Passo 9: Atualizar App Móvel

No arquivo `app.config.ts` ou em um arquivo de configuração, atualize:

```typescript
const env = {
  // ... outras configs
  apiUrl: "https://innovaenvios.app", // Mude de localhost para seu domínio
};
```

E em qualquer lugar que chame a API:

```typescript
// Antes
const API_URL = "http://localhost:3000";

// Depois
const API_URL = "https://innovaenvios.app";
```

---

## Troubleshooting

### Erro: "Connection refused"

```bash
# Na VPS, verificar se aplicação está rodando
pm2 status

# Se não estiver, iniciar
pm2 start ecosystem.config.js

# Ver logs de erro
pm2 logs
```

### Erro: "Database connection failed"

```bash
# Na VPS, verificar PostgreSQL
sudo systemctl status postgresql

# Conectar ao banco
sudo -u postgres psql -d innova_envios_db

# Testar conexão
\dt
```

### Erro: "SSL certificate error"

```bash
# Na VPS, renovar certificado
sudo certbot renew --dry-run

# Se tudo OK
sudo certbot renew
```

### Erro: "Nginx 502 Bad Gateway"

```bash
# Na VPS, verificar Nginx
sudo systemctl status nginx

# Testar configuração
sudo nginx -t

# Recarregar
sudo systemctl reload nginx

# Verificar se aplicação está rodando
pm2 status
```

---

## Comandos Úteis

```bash
# Ver logs em tempo real
pm2 logs innova-envios-api --lines 100

# Reiniciar aplicação
pm2 restart innova-envios-api

# Parar aplicação
pm2 stop innova-envios-api

# Remover aplicação
pm2 delete innova-envios-api

# Atualizar código (após push no GitHub)
cd /var/www/innova-envios
git pull origin main
npm install
npm run build
pm2 restart innova-envios-api
```

---

## Monitoramento

```bash
# Monitorar recursos (CPU, memória)
pm2 monit

# Gerar relatório
pm2 report

# Salvar logs
pm2 logs > app-logs.txt
```

---

## Backup do Banco de Dados

```bash
# Fazer backup
sudo -u postgres pg_dump innova_envios_db > innova_envios_backup.sql

# Restaurar backup
sudo -u postgres psql innova_envios_db < innova_envios_backup.sql
```

---

## Próximos Passos

1. ✅ Clonar repositório
2. ✅ Instalar dependências
3. ✅ Configurar .env
4. ✅ Build e iniciar com PM2
5. ✅ Configurar SSL
6. ✅ Testar API
7. ✅ Atualizar endpoints do app
8. ✅ Deploy do app nas lojas

---

## Suporte

Se tiver dúvidas, verifique:
- Logs: `pm2 logs`
- Status: `pm2 status`
- Nginx: `sudo systemctl status nginx`
- PostgreSQL: `sudo systemctl status postgresql`

---

**Data**: 28/04/2026
**Versão**: 1.0
