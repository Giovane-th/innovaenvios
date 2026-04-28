# In'Nova Envios - Design de Interface

## Visão Geral

O aplicativo In'Nova Envios é uma solução móvel para geração ágil de etiquetas de envio dos Correios. Funciona em modo portrait (9:16) e é otimizado para uso com uma mão, seguindo os padrões iOS Human Interface Guidelines.

## Paleta de Cores

| Elemento | Cor | Uso |
|----------|-----|-----|
| **Primária** | `#0066CC` (Azul Correios) | Botões de ação, destaques |
| **Secundária** | `#FFD700` (Amarelo Correios) | Acentos, ícones |
| **Sucesso** | `#22C55E` (Verde) | Confirmações, etiquetas geradas |
| **Aviso** | `#F59E0B` (Laranja) | Alertas, validações |
| **Erro** | `#EF4444` (Vermelho) | Erros, cancelamentos |
| **Fundo** | `#FFFFFF` (Branco) / `#151718` (Escuro) | Background principal |
| **Superfície** | `#F5F5F5` (Cinza claro) / `#1E2022` (Cinza escuro) | Cards, superfícies |
| **Texto Principal** | `#11181C` (Preto) / `#ECEDEE` (Branco) | Títulos, corpo |
| **Texto Secundário** | `#687076` (Cinza) / `#9BA1A6` (Cinza claro) | Labels, hints |

## Lista de Telas

1. **Tela de Autenticação** - Login com credenciais do Correios
2. **Home / Dashboard** - Resumo de envios recentes e ações rápidas
3. **Gerar Etiqueta** - Formulário para criar nova etiqueta
4. **Detalhes da Etiqueta** - Visualizar e imprimir etiqueta gerada
5. **Histórico de Envios** - Lista de etiquetas geradas
6. **Configurações de Contrato** - Gerenciar dados do contrato Correios
7. **Perfil / Configurações** - Preferências do usuário e logout

## Telas Detalhadas

### 1. Tela de Autenticação

**Conteúdo:**
- Logo In'Nova Envios no topo (100x100pt)
- Campo de entrada: Número do Cartão de Postagem
- Campo de entrada: Número do Contrato
- Campo de entrada: Senha de Componente
- Botão "Entrar" (primário, full-width)
- Link "Esqueceu a senha?" (secundário)
- Indicador de carregamento durante autenticação

**Funcionalidade:**
- Validação de campos obrigatórios
- Chamada à API de token dos Correios
- Armazenamento seguro de credenciais (SecureStore)
- Redirecionamento para Home após sucesso
- Mensagem de erro em caso de falha

---

### 2. Home / Dashboard

**Conteúdo:**
- Cabeçalho com nome da empresa e ícone de menu
- Card de resumo: "Envios Hoje" (número)
- Card de resumo: "Pendentes" (número)
- Botão flutuante "Nova Etiqueta" (primário, fixo no canto inferior direito)
- Seção "Últimos Envios" com lista de 3-5 etiquetas recentes
- Cada item mostra: código de rastreamento, destinatário, status, data

**Funcionalidade:**
- Carregamento de dados do histórico local (AsyncStorage)
- Atualização ao puxar para baixo (pull-to-refresh)
- Tap em item abre detalhes
- Tap no botão flutuante vai para "Gerar Etiqueta"

---

### 3. Gerar Etiqueta

**Conteúdo:**
- Cabeçalho: "Nova Etiqueta"
- Seção "Remetente" (pré-preenchida com dados do contrato):
  - Nome empresa
  - CEP
  - Endereço
  - Número
  - Complemento
  - Cidade / Estado
  - Telefone
- Seção "Destinatário":
  - Nome (obrigatório)
  - CEP (obrigatório, com busca)
  - Endereço (auto-preenchido após CEP)
  - Número (obrigatório)
  - Complemento
  - Cidade / Estado (auto-preenchido)
  - Telefone
- Seção "Objeto":
  - Tipo de serviço (dropdown: PAC, SEDEX, etc.)
  - Peso (kg)
  - Dimensões (altura, largura, profundidade)
  - Valor declarado (opcional)
  - Descrição do conteúdo
- Botão "Gerar Etiqueta" (primário, full-width)
- Botão "Cancelar" (secundário)

**Funcionalidade:**
- Validação em tempo real
- Busca de CEP via API Correios
- Cálculo automático de frete (opcional)
- Chamada à API de pré-postagem
- Redirecionamento para "Detalhes da Etiqueta" após sucesso

---

### 4. Detalhes da Etiqueta

**Conteúdo:**
- Cabeçalho: "Etiqueta #XXXXX"
- Preview da etiqueta (código de barras, dados remetente/destinatário)
- Botão "Imprimir" (primário)
- Botão "Compartilhar" (secundário)
- Botão "Copiar Código" (secundário)
- Seção "Informações":
  - Código de rastreamento
  - Serviço
  - Peso
  - Valor declarado
  - Data de geração
- Botão "Voltar ao Home" (rodapé)

**Funcionalidade:**
- Exibição do rótulo em alta resolução
- Impressão via sistema (Print API)
- Compartilhamento via WhatsApp/Email
- Cópia de código para clipboard
- Armazenamento de etiqueta no histórico

---

### 5. Histórico de Envios

**Conteúdo:**
- Cabeçalho: "Histórico de Envios"
- Filtros (abas): "Todos", "Hoje", "Semana", "Mês"
- Lista de etiquetas com:
  - Código de rastreamento
  - Destinatário (nome)
  - Status (gerada, postada, em trânsito, entregue)
  - Data
- Ícone de ação: "Detalhes" (tap abre detalhes)
- Barra de pesquisa no topo (opcional)

**Funcionalidade:**
- Carregamento do histórico local
- Filtro por período
- Busca por código ou destinatário
- Tap em item abre "Detalhes da Etiqueta"

---

### 6. Configurações de Contrato

**Conteúdo:**
- Cabeçalho: "Contrato Correios"
- Card com dados do contrato:
  - Número do cartão de postagem
  - Número do contrato
  - CNPJ da empresa
  - Status (ativo/inativo)
- Seção "Dados da Empresa":
  - Nome
  - CEP
  - Endereço
  - Número
  - Complemento
  - Cidade / Estado
  - Telefone
  - Email
- Botão "Editar" (secundário)
  - Permite atualizar dados da empresa
  - Salva em AsyncStorage
- Botão "Renovar Token" (secundário)
  - Gera novo token com Correios

**Funcionalidade:**
- Exibição de dados do contrato armazenados
- Edição e salvamento de dados da empresa
- Renovação de token antes de expiração

---

### 7. Perfil / Configurações

**Conteúdo:**
- Cabeçalho: "Configurações"
- Seção "Preferências":
  - Toggle: "Modo Escuro"
  - Dropdown: "Idioma" (Português, Inglês)
  - Toggle: "Notificações"
- Seção "Sobre":
  - Versão do app
  - Link "Política de Privacidade"
  - Link "Termos de Uso"
- Botão "Logout" (vermelho, full-width)

**Funcionalidade:**
- Alternar modo escuro/claro
- Salvar preferências em AsyncStorage
- Logout e limpeza de dados sensíveis

---

## Fluxos de Usuário Principais

### Fluxo 1: Primeiro Acesso
1. Usuário abre o app
2. Vê tela de autenticação
3. Insere dados do cartão, contrato e senha
4. Clica "Entrar"
5. App valida e gera token
6. Redirecionado para Home

### Fluxo 2: Gerar Etiqueta
1. Usuário está no Home
2. Clica no botão flutuante "Nova Etiqueta"
3. Preenche dados do destinatário
4. Seleciona tipo de serviço
5. Clica "Gerar Etiqueta"
6. App chama API de pré-postagem
7. Exibe etiqueta gerada com código de barras
8. Usuário pode imprimir ou compartilhar

### Fluxo 3: Consultar Histórico
1. Usuário está no Home
2. Clica em "Últimos Envios" ou acessa aba "Histórico"
3. Vê lista de etiquetas geradas
4. Clica em uma etiqueta
5. Vê detalhes e pode imprimir/compartilhar

---

## Considerações de UX/UI

- **Orientação**: Portrait (9:16) otimizado para uma mão
- **Tipografia**: SF Pro Display (iOS) / Roboto (Android)
- **Espaçamento**: 16pt base, 8pt incrementos
- **Ícones**: SF Symbols (iOS) / Material Icons (Android)
- **Feedback**: Haptic feedback em ações principais
- **Acessibilidade**: Contraste mínimo WCAG AA, labels descritivas
- **Performance**: Carregamento de dados em background, cache local
- **Segurança**: Credenciais em SecureStore, tokens com expiração

---

## Tecnologias Utilizadas

- **Framework**: React Native (Expo SDK 54)
- **Styling**: NativeWind (Tailwind CSS)
- **Armazenamento Local**: AsyncStorage + SecureStore
- **Integração**: Correios API (REST)
- **Impressão**: React Native Print
- **Compartilhamento**: React Native Share
