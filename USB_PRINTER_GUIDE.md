# 🖨️ Guia de Impressão USB - Waytec WLP-200

## Visão Geral

O app In'Nova Envios agora suporta **impressão direta em impressoras USB** quando acessado via navegador web no computador.

---

## ✅ Requisitos

### Hardware
- **Impressora:** Waytec WLP-200 (ou compatível com ESC/POS)
- **Conexão:** USB direto no computador
- **Etiquetas:** 4x6 polegadas (padrão Correios)

### Software
- **Navegador:** Chrome, Edge ou Opera (com suporte WebUSB)
- **Sistema:** Windows, macOS ou Linux
- **Acesso:** `https://innovaenvios.app` (via web)

---

## 🚀 Como Usar

### 1. Acessar o App via Web

1. Abra o navegador (Chrome, Edge ou Opera)
2. Acesse: `https://innovaenvios.app`
3. Faça login com suas credenciais

### 2. Conectar Impressora USB

1. **Certifique-se que a impressora está conectada** via USB
2. Na tela de **Criar Etiqueta**, clique no botão **"Impressora USB"**
3. Clique em **"Conectar Impressora"**
4. Selecione a **Waytec WLP-200** na lista
5. Clique em **"Conectar"**

### 3. Imprimir Etiqueta

1. Preencha os dados da etiqueta normalmente
2. Clique em **"Imprimir"**
3. A etiqueta será impressa automaticamente

---

## 🔧 Configuração Técnica

### Especificações da Waytec WLP-200

| Propriedade | Valor |
|-------------|-------|
| Largura | 4 polegadas (101.6mm) |
| Altura | 6 polegadas (152.4mm) |
| Resolução | 203 DPI |
| Protocolo | ESC/POS |
| Conexão | USB |
| Vendor ID | 0x0456 |
| Product ID | 0x0203 / 0x0204 |

### Comandos ESC/POS Utilizados

```
ESC @ - Reset da impressora
ESC ! 0 - Modo de impressão padrão
GS W - Definir largura de impressão
GS h - Definir altura de impressão
GS k - Imprimir código de barras (Code128)
GS V - Cortar papel
```

---

## 🐛 Troubleshooting

### Problema: "WebUSB não é suportado"

**Solução:**
- Use Chrome, Edge ou Opera
- Firefox e Safari não suportam WebUSB
- Atualize seu navegador para a versão mais recente

### Problema: "Impressora não encontrada"

**Solução:**
1. Verifique se a impressora está conectada via USB
2. Reinicie a impressora
3. Recarregue a página (`F5`)
4. Tente conectar novamente

### Problema: "Erro ao enviar comando"

**Solução:**
1. Desconecte e reconecte a impressora
2. Verifique se a impressora está ligada
3. Limpe o papel travado (se houver)
4. Tente novamente

### Problema: "Permissão negada"

**Solução:**
- O navegador pode estar bloqueando o acesso USB
- Verifique as permissões do site em `Configurações > Privacidade > Permissões`
- Adicione `https://innovaenvios.app` à lista de sites permitidos

---

## 📋 Especificações de Impressão

### Formato de Etiqueta

```
┌─────────────────────────────┐
│  CÓDIGO DE BARRAS (Code128) │
│  ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀  │
│                             │
│  Texto da Etiqueta          │
│  (até 3 linhas)             │
│                             │
└─────────────────────────────┘
```

### Tamanho de Impressão

- **Largura:** 832 pixels (203 DPI)
- **Altura:** 1218 pixels (203 DPI)
- **Margem:** 10mm em todos os lados

---

## 🔐 Segurança

### Privacidade

- A conexão USB é **local** (não envia dados para servidor)
- Nenhum dado é armazenado na impressora
- A comunicação é **criptografada** via HTTPS

### Permissões

- O navegador pede permissão antes de acessar a impressora
- Você pode revogar permissões a qualquer momento
- Cada site precisa de permissão separada

---

## 📞 Suporte

Se tiver problemas:

1. **Verifique o console do navegador** (F12 → Console)
2. **Procure por mensagens de erro**
3. **Tente em outro navegador** (Chrome, Edge)
4. **Reinicie o computador**
5. **Contate o suporte técnico**

---

## 🎯 Próximos Passos

- [ ] Testar impressão com etiqueta real
- [ ] Configurar tamanho de fonte
- [ ] Adicionar suporte a múltiplas impressoras
- [ ] Implementar fila de impressão
- [ ] Adicionar histórico de impressões

---

## 📚 Referências

- [WebUSB API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebUSB_API)
- [ESC/POS Reference](https://www.epson-biz.com/modules/pos/index.html)
- [Waytec WLP-200 Manual](https://www.waytec.com.br/produtos/wlp-200/)
