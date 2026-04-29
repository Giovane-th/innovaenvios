# ✅ CHECKLIST DE DEPLOYMENT - In'Nova Envios

## 🎯 Objetivo
Configurar o app para acessar via **https://innovaenvios.app** com login funcionando corretamente.

---

## 📋 PRÉ-REQUISITOS
- [ ] VPS com IP: 72.61.135.33
- [ ] Domínio: innovaenvios.app (apontando para VPS)
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL instalado
- [ ] Nginx instalado
- [ ] SSL/HTTPS configurado (Let's Encrypt)

---

## 🚀 COMANDOS PARA EXECUTAR NO PAINEL WEB

### ✅ PASSO 1: Preparar Repositório
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
cd /home/innova-envios
npm install
```

**Esperado:** Vê "added X packages" ✅

---

### ✅ PASSO 2: Criar Arquivo .env.production
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
cat > .env.production << 'EOF'
DATABASE_URL="postgresql://usuario:senha@localhost:5432/innova_envios"
CORREIOS_USER="seu_usuario_correios"
CORREIOS_PASSWORD="sua_senha_correios"
CORREIOS_CONTRACT="seu_numero_contrato"
CORREIOS_DR="seu_codigo_dr"
CORREIOS_ADMINISTRATIVE_CODE="seu_codigo_administrativo"
NODE_ENV="production"
PORT="3002"
EXPO_PORT="8081"
JWT_SECRET="sua_chave_secreta_muito_segura_aqui"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="seu_email@gmail.com"
SMTP_PASSWORD="sua_senha_app"
SMTP_FROM="noreply@innovaenvios.app"
EOF
```

**⚠️ IMPORTANTE:** Edite os valores com suas credenciais reais!

```bash
nano .env.production
```

Pressione: `Ctrl + X` → `Y` → `Enter`

**Esperado:** Arquivo salvo sem erros ✅

---

### ✅ PASSO 3: Compilar Aplicação
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
npm run build
```

**Esperado:** Vê "Done in Xms" ✅

---

### ✅ PASSO 4: Executar Migrations do Banco
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
npm run db:push
```

**Esperado:** Tabelas criadas no banco ✅

---

### ✅ PASSO 5: Copiar Configuração Nginx
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
sudo cp /home/innova-envios/nginx-config.conf /etc/nginx/sites-available/innovaenvios.app
```

**Esperado:** Arquivo copiado sem erros ✅

---

### ✅ PASSO 6: Ativar Site no Nginx
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
sudo ln -s /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/
```

**Esperado:** Link simbólico criado ✅

---

### ✅ PASSO 7: Testar Configuração Nginx
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
sudo nginx -t
```

**Esperado:** 
```
nginx: configuration file test is successful
```
✅

---

### ✅ PASSO 8: Recarregar Nginx
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
sudo systemctl reload nginx
```

**Esperado:** Nginx recarregado sem erros ✅

---

### ✅ PASSO 9: Parar Processos Antigos
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
pm2 delete all
```

**Esperado:** Processos deletados ✅

---

### ✅ PASSO 10: Iniciar Backend (API)
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
cd /home/innova-envios
pm2 start "npm run start" --name "innova-api" --env production
```

**Esperado:** Backend iniciado, PID visível ✅

---

### ✅ PASSO 11: Iniciar Frontend Web
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
pm2 start "npm run dev:metro" --name "innova-web" --env production
```

**Esperado:** Frontend iniciado, PID visível ✅

---

### ✅ PASSO 12: Salvar Configuração PM2
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
pm2 save
pm2 startup
```

**Esperado:** Configuração salva ✅

---

### ✅ PASSO 13: Verificar Status
**Status:** [ ] Concluído

Copie e cole no terminal:

```bash
pm2 list
```

**Esperado:** Dois processos "online":
```
innova-api    online
innova-web    online
```
✅

---

## 🧪 TESTES DE ACESSO

### ✅ Teste 1: Frontend Web
**Status:** [ ] Concluído

Abra no navegador:
```
https://innovaenvios.app
```

**Esperado:** Tela de login aparece ✅

---

### ✅ Teste 2: Health Check
**Status:** [ ] Concluído

Abra no navegador:
```
https://innovaenvios.app/health
```

**Esperado:** Vê "OK" ✅

---

### ✅ Teste 3: API Health
**Status:** [ ] Concluído

Abra no navegador:
```
https://innovaenvios.app/api/health
```

**Esperado:** Resposta JSON ✅

---

### ✅ Teste 4: Login
**Status:** [ ] Concluído

1. Acesse: https://innovaenvios.app
2. Crie um usuário (ou use um existente)
3. Faça login
4. Clique em "Sair"

**Esperado:** Volta para tela de login ✅

---

## 🔍 TROUBLESHOOTING

### ❌ Problema: Nginx retorna 502 Bad Gateway

**Solução:**
```bash
pm2 list
pm2 logs
pm2 restart all
```

---

### ❌ Problema: Porta 8081 já está em uso

**Solução:**
```bash
lsof -i :8081
kill -9 <PID>
pm2 restart innova-web
```

---

### ❌ Problema: Banco de dados não conecta

**Solução:**
```bash
sudo systemctl status postgresql
psql -U postgres -d innova_envios
```

---

### ❌ Problema: Certificado SSL expirado

**Solução:**
```bash
sudo certbot renew --force-renewal
sudo systemctl reload nginx
```

---

## 📊 MONITORAMENTO

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

## ✨ PRÓXIMOS PASSOS

- [ ] Testar login/logout
- [ ] Criar usuários de teste
- [ ] Testar geração de etiquetas
- [ ] Testar impressão USB (Waytec WLP-200)
- [ ] Testar integração com Correios
- [ ] Configurar backup automático

---

## 📞 PRECISA DE AJUDA?

Se algo não funcionar:

1. **Verifique os logs:** `pm2 logs`
2. **Verifique Nginx:** `sudo nginx -t`
3. **Verifique banco:** `psql -U postgres -d innova_envios`
4. **Reinicie tudo:** `pm2 restart all && sudo systemctl reload nginx`

---

**Status Geral:** [ ] ✅ DEPLOYMENT CONCLUÍDO

**Data de Conclusão:** _______________

**Assinado por:** _______________
