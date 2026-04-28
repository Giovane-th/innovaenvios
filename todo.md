# In'Nova Envios - TODO

## Funcionalidades Principais

### Autenticação e Configuração
- [x] Tela de login com campos: Cartão de Postagem, Número do Contrato, Senha
- [ ] Integração com API de Token dos Correios (SIGEP Web)
- [ ] Armazenamento seguro de credenciais (SecureStore)
- [ ] Validação de campos obrigatórios
- [ ] Tratamento de erros de autenticação
- [ ] Tela de configurações de contrato
- [ ] Edição de dados da empresa (remetente)
- [ ] Renovação de token antes de expiração

### Home / Dashboard
- [x] Tela inicial com resumo de envios
- [x] Exibição de "Envios Hoje" e "Pendentes"
- [x] Lista de últimos envios recentes
- [x] Pull-to-refresh para atualizar dados
- [x] Botão flutuante para nova etiqueta
- [x] Navegação para detalhes da etiqueta

### Geração de Etiqueta
- [x] Tela de formulário para nova etiqueta
- [x] Pré-preenchimento de dados do remetente (contrato)
- [x] Campos de destinatário (nome, CEP, endereço, etc.)
- [ ] Integração com API de CEP dos Correios
- [ ] Auto-preenchimento de endereço após busca de CEP
- [x] Seleção de tipo de serviço (PAC, SEDEX, etc.)
- [x] Campos de objeto (peso, dimensões, valor declarado)
- [ ] Validação em tempo real
- [ ] Chamada à API de pré-postagem dos Correios
- [ ] Geração de código de rastreamento

### Exibição e Impressão de Etiqueta
- [x] Tela de detalhes da etiqueta gerada
- [x] Exibição do rótulo com código de barras
- [ ] Botão de impressão (Print API)
- [x] Botão de compartilhamento (WhatsApp, Email, etc.)
- [x] Cópia de código de rastreamento para clipboard
- [ ] Armazenamento de etiqueta no histórico

### Histórico de Envios
- [ ] Tela de histórico com lista de etiquetas
- [ ] Filtros por período (Hoje, Semana, Mês)
- [ ] Busca por código ou destinatário
- [ ] Exibição de status de envio
- [ ] Tap em item abre detalhes
- [ ] Sincronização com histórico local

### Configurações e Perfil
- [ ] Tela de configurações
- [ ] Toggle para modo escuro/claro
- [ ] Seleção de idioma
- [ ] Toggle para notificações
- [ ] Links para política de privacidade e termos
- [ ] Botão de logout com limpeza de dados

### Interface e UX
- [x] Implementar design system com cores Correios
- [x] Criar componentes reutilizáveis (botões, cards, inputs)
- [x] Implementar feedback visual (loading, success, error)
- [ ] Adicionar haptic feedback em ações principais
- [x] Otimizar para portrait 9:16 e uso com uma mão
- [x] Implementar SafeArea para notch e home indicator
- [ ] Testes de acessibilidade (contraste, labels)

### Integração com Correios API
- [x] Documentação da API SIGEP Web
- [x] Implementar autenticação com token
- [x] Endpoint de geração de pré-postagem
- [x] Endpoint de busca de CEP
- [ ] Endpoint de consulta de agências
- [ ] Endpoint de cálculo de prazo e preço
- [ ] Tratamento de erros da API
- [ ] Retry logic para falhas de rede

### Configuração de Impressoras
- [x] Tela de configuração de impressoras
- [x] Adicionar impressora (IP e porta)
- [x] Definir impressora padrão
- [ ] Testar conexão com impressora
- [x] Remover impressora
- [x] Armazenamento local de configuração

### Armazenamento e Persistência
- [ ] AsyncStorage para histórico de envios
- [ ] AsyncStorage para preferências do usuário
- [x] SecureStore para credenciais
- [ ] Limpeza de dados ao fazer logout
- [ ] Migração de dados se necessário

### Testes e Qualidade
- [ ] Testes unitários para validação de formulários
- [ ] Testes de integração com API
- [ ] Testes de UI para fluxos principais
- [ ] Testes de performance
- [ ] Testes em dispositivos iOS e Android

### Deployment
- [ ] Configuração de ambiente de produção
- [ ] Build para iOS (TestFlight)
- [ ] Build para Android (Google Play)
- [ ] Documentação de uso para funcionários
- [ ] Suporte e manutenção

## Bugs Conhecidos

- [x] Logo não aparecendo na tela de login (ImageBackground)
- [x] Implementar botão de cadastro de usuário na tela de login
- [x] Testar funcionamento offline/online do app

## Notas

- A integração com Correios requer contrato ativo e credenciais válidas
- O token dos Correios expira em 24 horas (conforme documentação)
- Etiquetas são armazenadas localmente e sincronizadas com histórico
- O app deve funcionar offline com dados em cache


## Importação de Alunos/Clientes
- [x] Tela de importação de CSV com alunos
- [x] Validação e parsing de arquivo CSV
- [x] Banco de dados de alunos (AsyncStorage)
- [x] Busca rápida de alunos por nome/email
- [ ] Tela de gerenciamento de alunos (listar, editar, deletar)
- [ ] Auto-preenchimento na tela de criar etiqueta
- [x] Sincronização de dados offline
