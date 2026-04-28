# ⚡ In'Nova Envios - Quick Reference Card

## 🔐 Acesso Rápido

```bash
# Conectar na VPS
ssh root@72.61.135.33
# Senha: D54sbCnRKDX98w#
```

---

## 📊 Status da Aplicação

```bash
# Ver status
pm2 status

# Ver logs
pm2 logs innova-envios

# Ver logs de erro
pm2 logs innova-envios --err

# Monitorar recursos
pm2 monit
```

---

## 🔄 Gerenciar Aplicação

```bash
# Parar
pm2 stop innova-envios

# Iniciar
pm2 start innova-envios

# Reiniciar
pm2 restart innova-envios

# Recarregar (sem downtime)
pm2 reload innova-envios
```

---

## 🗄️ Banco de Dados

```bash
# Conectar
sudo -u postgres psql innova_envios_db

# Listar tabelas
\dt

# Sair
\q

# Fazer backup
sudo -u postgres pg_dump innova_envios_db > backup.sql

# Restaurar
sudo -u postgres psql innova_envios_db < backup.sql
```

---

## 🌐 Nginx

```bash
# Status
sudo systemctl status nginx

# Reiniciar
sudo systemctl restart nginx

# Recarregar (sem downtime)
sudo systemctl reload nginx

# Ver logs de erro
sudo tail -50 /var/log/nginx/error.log

# Ver logs de acesso
sudo tail -50 /var/log/nginx/access.log
```

---

## 🔒 SSL/HTTPS

```bash
# Ver certificados
sudo certbot certificates

# Renovar
sudo certbot renew

# Forçar renovação
sudo certbot renew --force-renewal

# Ver data de expiração
openssl s_client -connect innovaenvios.app:443 -showcerts | grep -A 5 "Validity"
```

---

## 📝 Editar Configurações

```bash
# Editar .env
nano /var/www/innova-envios/.env

# Editar Nginx
nano /etc/nginx/sites-available/innovaenvios.app

# Editar Nginx (ativar)
sudo ln -sf /etc/nginx/sites-available/innovaenvios.app /etc/nginx/sites-enabled/

# Testar Nginx
sudo nginx -t

# Recarregar Nginx
sudo systemctl reload nginx
```

---

## 🚀 Deploy de Atualizações

```bash
cd /var/www/innova-envios

# Fazer pull
git pull origin main

# Instalar dependências
pnpm install

# Compilar
pnpm run build

# Reiniciar
pm2 restart innova-envios

# Ver logs
pm2 logs innova-envios --lines 20
```

---

## 🧪 Testes Rápidos

```bash
# Testar HTTPS
curl -I https://innovaenvios.app

# Testar API raiz
curl https://innovaenvios.app

# Testar tRPC
curl https://innovaenvios.app/api/trpc/system.health

# Testar porta 3001
netstat -tlnp | grep 3001
```

---

## 📈 Monitoramento

```bash
# Espaço em disco
df -h

# Uso de memória
free -h

# Processos
ps aux | grep node

# Conexões de rede
netstat -tlnp | grep LISTEN
```

---

## 🆘 Troubleshooting Rápido

| Problema | Solução |
|----------|---------|
| App offline | `pm2 restart innova-envios` |
| Erro 502 | `sudo systemctl restart nginx` |
| DB offline | `sudo systemctl restart postgresql` |
| SSL expirado | `sudo certbot renew` |
| Porta ocupada | `netstat -tlnp \| grep :3001` |

---

## 📞 Informações Importantes

| Item | Valor |
|------|-------|
| **IP VPS** | 72.61.135.33 |
| **Domínio** | innovaenvios.app |
| **Porta API** | 3001 (interno), 443 (HTTPS) |
| **DB User** | innova_envios |
| **DB Pass** | innova_envios_pass_2024 |
| **DB Name** | innova_envios_db |
| **SSL Válido até** | 2026-07-27 |

---

## 📋 Checklist Diário

- [ ] Verificar `pm2 status`
- [ ] Verificar `df -h` (espaço em disco)
- [ ] Verificar `free -h` (memória)
- [ ] Verificar `sudo certbot certificates` (SSL)
- [ ] Verificar logs: `pm2 logs innova-envios --err`

---

**Última Atualização:** 28 de Abril de 2026
