# 🛠️ In'Nova Envios - Guia de Operações VPS

## Acesso Rápido

```bash
# Conectar na VPS
ssh root@72.61.135.33

# Senha: D54sbCnRKDX98w#
```

---

## 📊 Comandos Essenciais

### Status da Aplicação

```bash
# Ver status do PM2
pm2 status

# Ver logs em tempo real
pm2 logs innova-envios

# Ver logs com filtro de erro
pm2 logs innova-envios --err

# Monitorar recursos (CPU, memória)
pm2 monit
```

### Gerenciar Aplicação

```bash
# Parar aplicação
pm2 stop innova-envios

# Iniciar aplicação
pm2 start innova-envios

# Reiniciar aplicação
pm2 restart innova-envios

# Recarregar sem downtime
pm2 reload innova-envios

# Remover do PM2
pm2 delete innova-envios
```

### Banco de Dados

```bash
# Conectar no PostgreSQL
sudo -u postgres psql

# Listar bancos de dados
\l

# Conectar no banco innova_envios_db
\c innova_envios_db

# Listar tabelas
\dt

# Sair
\q
```

### Nginx

```bash
# Verificar status
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Recarregar configuração (sem downtime)
sudo systemctl reload nginx

# Ver logs de erro
sudo tail -50 /var/log/nginx/error.log

# Ver logs de acesso
sudo tail -50 /var/log/nginx/access.log
```

### SSL/HTTPS

```bash
# Verificar certificado
sudo certbot certificates

# Renovar certificado manualmente
sudo certbot renew

# Ver data de expiração
openssl s_client -connect innovaenvios.app:443 -showcerts | grep -A 5 "Validity"
```

---

## 🔍 Troubleshooting Rápido

### Aplicação não responde

```bash
# 1. Verificar status
pm2 status

# 2. Ver logs
pm2 logs innova-envios --lines 50

# 3. Reiniciar
pm2 restart innova-envios

# 4. Se ainda não funcionar, verificar porta
netstat -tlnp | grep 3001
```

### Erro 502 Bad Gateway

```bash
# 1. Verificar se aplicação está rodando
pm2 status

# 2. Verificar se Nginx está rodando
sudo systemctl status nginx

# 3. Reiniciar Nginx
sudo systemctl restart nginx

# 4. Ver logs do Nginx
sudo tail -100 /var/log/nginx/error.log
```

### Banco de dados offline

```bash
# 1. Verificar status
sudo systemctl status postgresql

# 2. Reiniciar
sudo systemctl restart postgresql

# 3. Verificar logs
sudo tail -50 /var/log/postgresql/postgresql.log
```

### Certificado SSL expirado

```bash
# 1. Verificar data de expiração
sudo certbot certificates

# 2. Renovar
sudo certbot renew --force-renewal

# 3. Reiniciar Nginx
sudo systemctl restart nginx
```

---

## 📈 Monitoramento Diário

### Checklist Matinal

```bash
# 1. Verificar status da aplicação
pm2 status

# 2. Verificar logs de erro da noite
pm2 logs innova-envios --err

# 3. Verificar espaço em disco
df -h

# 4. Verificar uso de memória
free -h

# 5. Verificar certificado SSL
sudo certbot certificates
```

### Logs Importantes

```bash
# Logs da aplicação
/root/.pm2/logs/innova-envios-out.log
/root/.pm2/logs/innova-envios-error.log

# Logs do Nginx
/var/log/nginx/access.log
/var/log/nginx/error.log

# Logs do PostgreSQL
/var/log/postgresql/postgresql.log
```

---

## 🔐 Backup e Restauração

### Backup Manual do Banco de Dados

```bash
# Fazer backup
sudo -u postgres pg_dump innova_envios_db > /var/backups/innova_envios_db_$(date +%Y%m%d_%H%M%S).sql

# Listar backups
ls -lh /var/backups/innova_envios_db_*.sql
```

### Restaurar Banco de Dados

```bash
# Restaurar de um backup
sudo -u postgres psql innova_envios_db < /var/backups/innova_envios_db_20260428_120000.sql
```

### Backup da Aplicação

```bash
# Fazer backup dos arquivos
tar -czf /var/backups/innova-envios_$(date +%Y%m%d_%H%M%S).tar.gz /var/www/innova-envios

# Listar backups
ls -lh /var/backups/innova-envios_*.tar.gz
```

---

## 🚀 Deploy de Atualizações

### Atualizar Código

```bash
# 1. Conectar na VPS
ssh root@72.61.135.33

# 2. Ir para diretório do projeto
cd /var/www/innova-envios

# 3. Fazer pull do repositório
git pull origin main

# 4. Instalar dependências (se houver)
pnpm install

# 5. Compilar
pnpm run build

# 6. Reiniciar aplicação
pm2 restart innova-envios

# 7. Verificar status
pm2 status
pm2 logs innova-envios --lines 20
```

### Atualizar Variáveis de Ambiente

```bash
# 1. Editar .env
nano /var/www/innova-envios/.env

# 2. Fazer alterações necessárias

# 3. Salvar (Ctrl+X, Y, Enter)

# 4. Reiniciar aplicação
pm2 restart innova-envios
```

---

## 📞 Contatos Importantes

| Serviço | Contato | Status |
|---------|---------|--------|
| **Hostinger Support** | https://www.hostinger.com.br/suporte | 24/7 |
| **Let's Encrypt** | https://letsencrypt.org | 24/7 |
| **GitHub** | https://github.com/Giovane-th/innova-envios | Repo |

---

## 🎯 Checklist Semanal

- [ ] Verificar logs de erro
- [ ] Verificar espaço em disco
- [ ] Verificar certificado SSL (data de expiração)
- [ ] Fazer backup do banco de dados
- [ ] Verificar performance (CPU, memória)
- [ ] Testar login na aplicação
- [ ] Testar criação de etiqueta
- [ ] Revisar logs de acesso do Nginx

---

## 📝 Notas

- **Porta API:** 3001 (interno), 443 (HTTPS público)
- **Banco de Dados:** PostgreSQL em localhost:5432
- **Usuário DB:** innova_envios
- **Senha DB:** innova_envios_pass_2024
- **Domínio:** innovaenvios.app
- **SSL:** Let's Encrypt (auto-renovação)

---

**Última Atualização:** 28 de Abril de 2026
**Versão:** 1.0.0
