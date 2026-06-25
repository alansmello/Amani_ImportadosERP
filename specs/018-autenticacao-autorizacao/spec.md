# Feature Specification: Autenticacao e Autorizacao

**Feature Branch**: `018-autenticacao-autorizacao`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "F018 - Autenticacao e Autorizacao (backend + frontend). Objetivo: Proteger o ERP para uso real (login unico/poucos usuarios da Amani). Escopo exato: autenticacao no backend e guarda de rotas/sessao no frontend. O que entra: usuario, login, emissao/validacao de acesso, protecao dos recursos, tela de login e protecao de rotas, logout. O que fica fora: perfis/permissoes granulares, recuperacao de senha por e-mail, SSO, multi-tenant. Criterios de aceite: areas protegidas exigem acesso valido; login/logout funcionam; segredos fora do codigo; usuarios nao autenticados sao redirecionados; build ok."

## Clarifications

### Session 2026-06-25

- Q: Quanto tempo a sessao deve durar antes de exigir novo login? -> A: Sessao expira em 8 horas ou apos 60 minutos de inatividade.
- Q: Como os usuarios autorizados devem ser criados no MVP? -> A: Usuarios criados por procedimento administrativo controlado, sem tela de gestao no MVP.
- Q: Quais rotas podem permanecer publicas no MVP? -> A: Publico apenas login e endpoint tecnico de saude.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Entrar no ERP com credenciais validas (Priority: P1)

Uma pessoa autorizada da Amani precisa acessar o ERP informando suas credenciais em uma tela de login. Depois da autenticacao, ela deve chegar ao ambiente operacional e conseguir usar os modulos existentes sem repetir login a cada navegacao.

**Why this priority**: Sem entrada autenticada, o ERP nao pode ser usado com seguranca em producao.

**Independent Test**: Pode ser testado criando um usuario autorizado, acessando a tela de login, informando credenciais validas e verificando que a pessoa chega ao ERP e consegue navegar por uma area protegida.

**Acceptance Scenarios**:

1. **Given** uma pessoa autorizada com credenciais validas, **When** ela faz login, **Then** o sistema concede acesso ao ERP e exibe a area operacional protegida.
2. **Given** uma pessoa autenticada, **When** ela navega entre modulos protegidos, **Then** o sistema mantem a sessao ativa sem solicitar novo login a cada rota.

---

### User Story 2 - Bloquear acesso nao autenticado (Priority: P1)

Uma pessoa sem sessao valida nao deve conseguir acessar dados ou telas operacionais do ERP. Ao tentar abrir uma area protegida, ela deve ser enviada para login sem visualizar informacoes de negocio.

**Why this priority**: A protecao de dados comerciais, financeiros e operacionais e o motivo principal da feature.

**Independent Test**: Pode ser testado abrindo uma rota protegida e tentando consultar dados sem sessao valida; o acesso deve ser negado e a pessoa deve ser direcionada para login.

**Acceptance Scenarios**:

1. **Given** uma pessoa sem sessao valida, **When** ela tenta acessar uma tela operacional, **Then** o sistema redireciona para login antes de exibir dados.
2. **Given** uma chamada a recurso protegido sem acesso valido, **When** a requisicao chega ao sistema, **Then** o sistema nega a operacao sem retornar dados de negocio.

---

### User Story 3 - Encerrar sessao com seguranca (Priority: P2)

Uma pessoa autenticada precisa poder sair do ERP. Depois do logout, o acesso anterior nao deve continuar valido no navegador, e novas tentativas de uso devem exigir login novamente.

**Why this priority**: Logout reduz risco em dispositivos compartilhados ou em operacao fora do escritorio.

**Independent Test**: Pode ser testado fazendo login, acionando logout e tentando voltar para uma tela protegida.

**Acceptance Scenarios**:

1. **Given** uma pessoa autenticada, **When** ela aciona logout, **Then** a sessao local e encerrada e a tela de login e exibida.
2. **Given** uma pessoa que acabou de sair, **When** ela tenta retornar a uma area protegida, **Then** o sistema exige novo login.

---

### User Story 4 - Rejeitar credenciais invalidas com mensagem clara (Priority: P3)

Uma pessoa que informa credenciais incorretas deve receber uma mensagem clara e segura, sem detalhes que ajudem a descobrir usuarios, senhas ou regras internas.

**Why this priority**: Feedback adequado reduz confusao operacional sem expor informacoes sensiveis.

**Independent Test**: Pode ser testado tentando login com credenciais invalidas e validando que o acesso e negado com mensagem generica.

**Acceptance Scenarios**:

1. **Given** credenciais invalidas, **When** a pessoa tenta entrar, **Then** o sistema nega acesso e informa que as credenciais nao foram aceitas.
2. **Given** campos obrigatorios ausentes, **When** a pessoa tenta entrar, **Then** o sistema informa os campos necessarios sem executar autenticacao.

### Edge Cases

- Sessao expirada durante o uso por limite de 8 horas ou por 60 minutos de inatividade: a pessoa deve ser enviada para login e nao deve continuar vendo dados atualizados de areas protegidas.
- Tentativa de acessar diretamente uma URL interna: a pessoa sem sessao valida deve ser redirecionada antes de visualizar o conteudo.
- Tentativa de acessar qualquer recurso diferente de login e saude tecnica sem sessao valida: o sistema deve negar acesso sem retornar dados de negocio.
- Credenciais de usuario inativo ou inexistente: o sistema deve negar acesso com mensagem generica.
- Falha temporaria de comunicacao no login: a tela deve informar que nao foi possivel autenticar naquele momento e permitir nova tentativa.
- Logout acionado em uma tela com dados carregados: o sistema deve limpar o estado de acesso local e impedir novas operacoes sem novo login.
- Acesso valido usado em recurso inexistente ou sem rota correspondente: o sistema deve responder conforme o erro da rota, sem tratar como login invalido.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que pessoas autorizadas entrem no ERP informando identificador de usuario e senha.
- **FR-002**: O sistema MUST negar login quando as credenciais forem invalidas, ausentes ou pertencerem a usuario inativo.
- **FR-003**: O sistema MUST criar uma sessao de acesso verificavel apos login bem-sucedido.
- **FR-004**: O sistema MUST validar a sessao de acesso em todos os recursos e telas operacionais protegidos.
- **FR-005**: O sistema MUST impedir que pessoas sem sessao valida visualizem, criem, alterem ou excluam dados de negocio.
- **FR-006**: O sistema MUST redirecionar pessoas nao autenticadas para a tela de login ao tentar acessar areas protegidas.
- **FR-007**: O sistema MUST preservar a navegacao operacional depois do login, levando a pessoa autenticada para uma area util do ERP.
- **FR-008**: Pessoas autenticadas MUST poder encerrar a sessao explicitamente por logout.
- **FR-009**: Apos logout, o sistema MUST impedir reutilizacao da sessao local anterior no navegador.
- **FR-010**: O sistema MUST manter segredos e chaves operacionais de runtime fora do codigo-fonte versionado.
- **FR-011**: O sistema MUST armazenar senhas de forma protegida, sem guardar texto puro.
- **FR-012**: O sistema MUST usar mensagens de erro de autenticacao que nao revelem se o usuario existe, se esta inativo ou qual parte da credencial falhou.
- **FR-013**: O sistema MUST registrar dados minimos de auditoria para tentativas de login bem-sucedidas e negadas, preservando privacidade e sem registrar senhas.
- **FR-014**: O sistema MUST funcionar em smartphone, tablet e desktop, mantendo a identidade visual oficial do ERP.
- **FR-015**: O sistema MUST manter fora do MVP perfis granulares, recuperacao de senha por e-mail, autenticacao corporativa externa e separacao multiempresa.
- **FR-016**: O sistema MUST expirar sessoes apos 8 horas de duracao total ou apos 60 minutos de inatividade, exigindo novo login.
- **FR-017**: O sistema MUST permitir criacao de usuarios por procedimento administrativo controlado, sem tela de gestao de usuarios no MVP.
- **FR-018**: O sistema MUST manter credenciais iniciais e dados sensiveis de provisionamento administrativo fora do codigo-fonte versionado.
- **FR-019**: O sistema MUST manter publicos apenas a entrada de login e o recurso tecnico de saude; todos os demais recursos devem exigir sessao valida.

### Key Entities

- **Usuario**: Pessoa autorizada a acessar o ERP. Inclui identificador de login, nome de exibicao, senha protegida, situacao de ativo/inativo, origem de provisionamento administrativo e datas relevantes para auditoria.
- **Sessao de Acesso**: Comprovante temporario de que uma pessoa foi autenticada. Relaciona o usuario autenticado ao periodo de uso permitido.
- **Evento de Autenticacao**: Registro de tentativa de entrada ou saida, contendo resultado, data/hora e dados tecnicos minimos para auditoria, sem armazenar senha.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das telas e recursos operacionais definidos como protegidos negam acesso quando nao ha sessao valida.
- **SC-002**: Uma pessoa autorizada consegue entrar no ERP em ate 30 segundos usando credenciais validas em conexao normal.
- **SC-003**: Apos logout, 100% das tentativas de retornar a areas protegidas exigem novo login.
- **SC-004**: 100% das mensagens de erro de credenciais invalidas usam texto generico que nao confirma existencia de usuario.
- **SC-005**: A experiencia de login, navegacao protegida e logout e validada em smartphone, tablet e desktop sem bloqueios de layout.
- **SC-006**: Nenhum segredo operacional necessario para autenticacao aparece em arquivos versionados do projeto.
- **SC-007**: 100% das sessoes testadas deixam de permitir acesso apos 8 horas de duracao total ou apos 60 minutos sem atividade.
- **SC-008**: Pelo menos um usuario autorizado consegue ser provisionado por procedimento administrativo documentado sem exigir tela de gestao no MVP.
- **SC-009**: 100% dos recursos verificados fora de login e saude tecnica exigem sessao valida antes de retornar dados.

## Assumptions

- O MVP sera usado por poucos usuarios internos da Amani, sem necessidade inicial de perfis ou permissoes diferentes por modulo.
- O primeiro usuario autorizado sera criado por procedimento administrativo controlado definido no plano tecnico, sem credenciais sensiveis em arquivos versionados.
- Todas as areas operacionais do ERP devem ser tratadas como protegidas; somente login e saude tecnica ficam publicos no MVP.
- O sistema encerra o acesso quando a sessao expirar por tempo total ou inatividade e exige novo login, sem recuperacao automatica de senha neste MVP.
- A feature preserva Mobile First e deve funcionar em smartphone, tablet e desktop.
- A identidade visual permanece Dark Theme e alinhada ao Design System existente.
