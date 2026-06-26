# Feature Specification: Configurações e Categorias (Refinamento, Frontend)

**Feature Branch**: `019-configuracoes-categorias-frontend`

**Created**: 2026-06-25

**Status**: Draft

**Input**: F019 — Configurações e Categorias (refinamento, frontend). Objetivo: Centralizar gestão de apoio: categorias de produto, categorias de despesa, taxas de formas de pagamento e preferências. Escopo exato: Página Configurações real com CRUD de categorias e gestão de taxas (endpoints prontos em F015 e F016).

## Clarifications

### Session 2026-06-25

- Q: Como as seções da página de Configurações devem ser apresentadas? → A: Abas horizontais — cada seção (categorias produto, categorias despesa, taxas, implantação) é uma aba separada.
- Q: O operador deve conseguir inativar/reativar uma categoria de despesa a partir da tela de Configurações? → A: Sim, toggle de status — o operador pode inativar e reativar categorias de despesa diretamente na lista, com confirmação antes da ação.
- Q: Como o frontend deve tratar o botão de remoção de categorias de produto que possuem produtos vinculados? → A: Reativo — botão sempre visível; o backend rejeita e o frontend exibe o erro retornado, sem validação prévia no cliente.
- Q: Como os atalhos de implantação devem ser apresentados na aba correspondente de Configurações? → A: Cards de navegação — cada atalho é um card com ícone, título, descrição curta e link para a rota de implantação correspondente (F010), sem formulários embutidos.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gerenciar Categorias de Produto (Priority: P1)

Como operador do sistema, quero cadastrar, editar e remover categorias de produto diretamente na página de Configurações, para que os produtos criados ou editados possam ser classificados corretamente sem precisar acionar suporte.

**Why this priority**: Categorias de produto são um pré-requisito para o cadastro de produtos com classificação consistente. A ausência de uma tela dedicada forçava o operador a depender de dados semeados manualmente no banco.

**Independent Test**: Pode ser testada acessando `/configuracoes`, criando uma nova categoria de produto, verificando que ela aparece na lista, editando o nome e removendo — tudo sem sair da seção de configurações.

**Acceptance Scenarios**:

1. **Given** a página de Configurações aberta na seção de categorias de produto, **When** o operador preenche o nome da nova categoria e confirma, **Then** a categoria deve aparecer imediatamente na lista sem recarregar a página inteira.
2. **Given** uma categoria de produto existente na lista, **When** o operador edita o nome e salva, **Then** o nome atualizado deve refletir na lista e no formulário de produto sem inconsistências.
3. **Given** uma categoria de produto existente e sem produtos vinculados, **When** o operador aciona a remoção e confirma, **Then** a categoria deve ser removida da lista.
4. **Given** um nome de categoria duplicado, **When** o operador tenta salvar, **Then** o sistema deve exibir a mensagem de erro retornada pelo backend sem recalcular nenhuma validação no cliente.

---

### User Story 2 - Gerenciar Categorias de Despesa (Priority: P1)

Como responsável financeiro, quero criar, editar e visualizar categorias de despesa na página de Configurações, para que o lançamento de despesas operacionais use categorias organizadas e atualizadas.

**Why this priority**: As categorias de despesa alimentam o dashboard financeiro e o lançamento de despesas (F016). Sem gestão de categorias, o operador não consegue organizar despesas por tipo sem contato direto com o banco de dados.

**Independent Test**: Pode ser testada acessando a seção de categorias de despesa em Configurações, criando uma nova categoria, verificando a lista e editando o nome.

**Acceptance Scenarios**:

1. **Given** a seção de categorias de despesa em Configurações, **When** o operador cria uma nova categoria informando nome e confirma, **Then** a categoria deve aparecer na lista e estar disponível no formulário de lançamento de despesa.
2. **Given** uma categoria de despesa existente, **When** o operador edita e salva, **Then** o nome atualizado deve refletir imediatamente na lista.
3. **Given** uma categoria de despesa inativa, **When** o operador consulta a lista de categorias em Configurações, **Then** categorias inativas devem ser exibidas de forma diferenciada (ex.: indicação visual) e não devem aparecer no formulário de nova despesa.
4. **Given** uma categoria de despesa ativa na lista, **When** o operador aciona o toggle de inativação e confirma, **Then** a categoria deve passar para status inativo, a indicação visual deve atualizar imediatamente e a categoria deve deixar de aparecer no formulário de nova despesa.
5. **Given** uma categoria de despesa inativa na lista, **When** o operador aciona o toggle de reativação e confirma, **Then** a categoria deve voltar ao status ativo e deve aparecer novamente como opção no formulário de nova despesa.
6. **Given** qualquer erro retornado pelo backend ao salvar ou ao alterar status, **When** o operador confirma a operação, **Then** a mensagem de erro deve ser exibida sem que o frontend tente interpretar ou corrigir o dado.

---

### User Story 3 - Editar Taxas de Operadora por Forma de Pagamento (Priority: P2)

Como responsável financeiro, quero visualizar e editar as taxas de operadora cadastradas para cada forma de pagamento (cartão de débito, cartão de crédito) diretamente em Configurações, para que as taxas reflitam os acordos atuais com as operadoras e o cálculo de despesa de operadora seja correto nas vendas.

**Why this priority**: As taxas são usadas automaticamente nas vendas (F015). Se estiverem desatualizadas, toda despesa de operadora calculada pelo backend fica incorreta. A edição deve ser simples e acessível sem acesso técnico ao sistema.

**Independent Test**: Pode ser testada acessando a seção de taxas em Configurações, alterando a taxa de cartão de débito, salvando e verificando que a nova venda em débito registra a despesa com o percentual atualizado.

**Acceptance Scenarios**:

1. **Given** a seção de taxas de operadora em Configurações, **When** o operador abre a lista, **Then** devem ser exibidas as taxas atuais de cada forma de pagamento aplicável (cartão de débito e cartão de crédito no mínimo).
2. **Given** uma taxa exibida, **When** o operador edita o percentual e salva, **Then** o backend confirma a atualização e o novo valor aparece na lista sem necessidade de recarregar a página.
3. **Given** um valor de taxa inválido (ex.: negativo ou acima de 100%), **When** o operador tenta salvar, **Then** o sistema exibe o erro do backend sem aceitar o valor silenciosamente.
4. **Given** a taxa atualizada, **When** uma nova venda é concluída com a forma de pagamento correspondente, **Then** a despesa de operadora calculada pelo backend deve usar o percentual atualizado.

---

### User Story 4 - Atalhos para Implantação (Priority: P3)

Como administrador que está inicializando o sistema, quero encontrar cards de navegação para as telas de implantação inicial a partir da aba de Implantação em Configurações, para que a configuração inicial do ERP seja acessível em um único lugar de referência sem precisar memorizar rotas.

**Why this priority**: Refinamento de navegação que unifica o ponto de entrada para operações de setup. Não bloqueia nenhum outro fluxo.

**Independent Test**: Pode ser testada verificando se os três cards de implantação aparecem na aba correspondente de Configurações e se ao acioná-los o operador é direcionado corretamente para cada tela de F010.

**Acceptance Scenarios**:

1. **Given** a aba de Implantação em Configurações, **When** o operador a acessa, **Then** devem ser exibidos três cards — Inventário Inicial, Saldo Inicial de Caixa e Contas a Receber Iniciais — cada um com ícone, título e descrição curta.
2. **Given** um card de implantação visível, **When** o operador aciona o card, **Then** o sistema deve navegar para a rota de implantação correspondente (F010) sem erros de rota e sem exibir formulário embutido na aba.

---

### Edge Cases

- O que acontece quando o backend retorna lista vazia de categorias? A seção deve exibir estado vazio com instrução para criar a primeira categoria.
- O que acontece quando a requisição de salvar falha por timeout ou erro de rede? O formulário deve exibir mensagem de erro e manter os dados preenchidos para nova tentativa.
- O que acontece ao tentar remover uma categoria de produto com registros vinculados? O botão de remoção é sempre visível; o backend rejeita a operação e retorna o erro; o frontend exibe a mensagem sem travar a interface e sem validação prévia no cliente.
- O que acontece em tela de smartphone com muitas categorias? A lista deve ser scrollável e os botões de ação devem ter área de toque adequada para uso móvel.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST exibir a página `/configuracoes` com abas horizontais, uma por seção (categorias de produto, categorias de despesa, taxas de operadora, atalhos de implantação), substituindo o placeholder atual. A aba ativa MUST ser visualmente destacada e a navegação entre abas MUST ocorrer sem recarregar a página.
- **FR-002**: O sistema MUST permitir criar, listar, editar e remover categorias de produto via `/api/categorias`. O botão de remoção MUST estar sempre visível; quando o backend rejeitar a remoção (ex.: categoria com produtos vinculados), a mensagem de erro MUST ser exibida sem validação prévia no cliente.
- **FR-003**: O sistema MUST permitir criar, listar, editar e alternar o status (ativo/inativo) de categorias de despesa via endpoint de categorias de despesa (F016). Categorias ativas e inativas MUST ser diferenciadas visualmente na lista. A ação de toggle MUST exigir confirmação do operador antes de ser enviada ao backend.
- **FR-004**: O sistema MUST exibir categorias inativas de despesa apenas na tela de Configurações; categorias inativas MUST NOT aparecer no formulário de lançamento de nova despesa.
- **FR-005**: O sistema MUST permitir visualizar e editar as taxas de operadora por forma de pagamento via endpoint de taxas (F015), sem recalcular percentuais no cliente.
- **FR-006**: Toda mensagem de erro retornada pelo backend MUST ser exibida ao usuário; o frontend MUST NOT silenciar, interpretar ou corrigir erros de negócio.
- **FR-007**: A aba de Implantação em Configurações MUST exibir três cards de navegação — Inventário Inicial, Saldo Inicial de Caixa e Contas a Receber Iniciais — cada um com ícone, título, descrição curta e link para a rota de implantação correspondente (F010). Os formulários de implantação MUST NOT ser embutidos nesta página.
- **FR-008**: A página de Configurações MUST funcionar em smartphone, tablet e desktop, respeitando os padrões do Design System existente (Dark Theme, componentes UI locais, Mobile First).
- **FR-009**: O frontend MUST NOT conter cálculo de taxas, validação de negócio de categoria ou qualquer lógica financeira; toda regra MUST residir no backend.

### Key Entities *(include if feature involves data)*

- **Categoria de Produto**: Nome, identificador. Usada para classificar produtos no cadastro. Gerenciada via `/api/categorias`.
- **Categoria de Despesa**: Nome, status (ativa/inativa). Usada para classificar despesas operacionais. Gerenciada via endpoint de categorias de despesa (F016).
- **Taxa de Operadora**: Forma de pagamento, percentual de taxa. Define o percentual deduzido automaticamente em vendas com cartão. Gerenciada via endpoint de formas de pagamento/taxas (F015).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O operador consegue criar, editar ou remover uma categoria de produto em menos de 1 minuto a partir da abertura da seção correspondente.
- **SC-002**: O operador consegue atualizar uma taxa de operadora e verificar a confirmação da mudança em menos de 1 minuto.
- **SC-003**: Todos os erros retornados pelo backend são exibidos ao usuário na mesma tela, sem perda do dado preenchido no formulário.
- **SC-004**: A página de Configurações é utilizável em smartphone sem scroll horizontal, com todos os botões de ação visíveis e acessíveis por toque.
- **SC-005**: Nenhum cálculo de taxa, custo ou regra financeira é executado no frontend; 100% das validações de negócio são delegadas ao backend.
- **SC-006**: A página substitui completamente o placeholder atual de Configurações; nenhum `EmptyState` genérico permanece visível para seções implementadas.

## Assumptions

- Os endpoints `/api/categorias` (CRUD de categorias de produto), o endpoint de categorias de despesa (F016) e o endpoint de taxas de operadora (F015) estão implementados, funcionais e acessíveis antes do início desta feature.
- A autenticação (F018) não é pré-requisito para esta feature; os endpoints são acessíveis sem token enquanto F018 não estiver integrado ao frontend.
- O Dark Theme é fixo e não há alternância de tema; nenhum controle de preferência de tema será implementado.
- O Design System do projeto (componentes UI locais, `app-shell`, `desktop-sidebar`, `mobile-bottom-nav`, TanStack Query, `apiClient`) é a base para todos os componentes novos; nenhuma dependência externa nova de UI é necessária.
- A remoção de categoria de produto pode ser bloqueada pelo backend quando há produtos vinculados; o frontend apenas exibe o erro retornado.
- Categorias de despesa não são excluídas fisicamente; o backend pode marcar como inativas; a feature respeita essa decisão sem implementar exclusão se o backend não oferecer.
- A feature preserva Mobile First e suporta smartphone, tablet e desktop conforme Princípio VIII da Constituição.
- Nenhuma regra de negócio é implementada no frontend (Princípio VI da Constituição).
