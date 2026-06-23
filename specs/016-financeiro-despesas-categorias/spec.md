# Feature Specification: Financeiro: Despesas + Categorias de Despesa

**Feature Branch**: `016-financeiro-despesas-categorias`

**Created**: 2026-06-23

**Status**: Draft

**Input**: User description: "Feature 016 de docs/roadmap/RoadMap_AmaniERP.md - Financeiro: Despesas + Categorias de Despesa."

## Clarifications

### Session 2026-06-23

- Q: Como tratar categorias que nao devem mais ser usadas em novos lancamentos? -> A: Categorias podem ser inativadas; despesas antigas mantem a categoria, mas novas despesas so usam categorias ativas.
- Q: Qual data deve orientar filtros e totais financeiros das despesas? -> A: Usar uma unica data de competencia/ocorrencia da despesa para filtros e totais financeiros.
- Q: A despesa operacional deve registrar forma de pagamento nesta feature? -> A: Exigir forma de pagamento em toda despesa operacional.
- Q: Quais formas de pagamento sao validas para despesas operacionais? -> A: Dinheiro, PIX, CartaoDebito e CartaoCredito.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar categorias de despesa (Priority: P1)

Como responsavel financeiro, quero criar e manter categorias de despesa, para classificar os gastos operacionais da Amani de forma consistente antes de lancar despesas.

**Why this priority**: As despesas exigem uma categoria para gerar relatórios e dashboard financeiro confiaveis. Sem categorias disponiveis, o lancamento de despesas fica bloqueado ou inconsistente.

**Independent Test**: Pode ser testada criando uma categoria de despesa, consultando a lista de categorias e editando seus dados principais sem depender do cadastro de uma despesa.

**Acceptance Scenarios**:

1. **Given** que o usuario esta na area financeira, **When** cria uma nova categoria de despesa com nome valido, **Then** a categoria fica disponivel para novos lancamentos de despesa.
2. **Given** que ja existem categorias de despesa cadastradas, **When** o usuario acessa a gestao de categorias, **Then** consegue visualizar as categorias existentes em uma lista clara.
3. **Given** uma categoria de despesa existente, **When** o usuario atualiza seu nome ou descricao, **Then** novos lancamentos passam a exibir os dados atualizados sem perder o historico das despesas ja classificadas.
4. **Given** uma categoria de despesa que nao deve mais ser usada, **When** o usuario inativa a categoria, **Then** despesas antigas continuam exibindo essa categoria e novos lancamentos deixam de oferece-la como opcao.

---

### User Story 2 - Lancar despesa operacional (Priority: P1)

Como responsavel financeiro, quero lancar despesas operacionais informando valor, data de competencia/ocorrencia, descricao, categoria e forma de pagamento, para que o sistema reflita os custos reais do negocio.

**Why this priority**: O controle de despesas e requisito central para apurar resultado financeiro e alimentar o dashboard. O MVP financeiro fica incompleto se a Amani nao consegue registrar gastos operacionais.

**Independent Test**: Pode ser testada cadastrando uma categoria, lancando uma despesa nessa categoria e verificando se a despesa aparece na lista financeira com os dados corretos.

**Acceptance Scenarios**:

1. **Given** pelo menos uma categoria de despesa ativa, **When** o usuario lanca uma despesa com valor positivo, data de competencia/ocorrencia, descricao, categoria e forma de pagamento, **Then** a despesa e registrada e exibida na lista de despesas.
2. **Given** que o usuario tenta lancar uma despesa sem categoria, **When** confirma o formulario, **Then** o sistema rejeita o lancamento e informa que a categoria e obrigatoria.
3. **Given** que o usuario tenta lancar uma despesa sem forma de pagamento, **When** confirma o formulario, **Then** o sistema rejeita o lancamento e informa que a forma de pagamento e obrigatoria.
4. **Given** que o usuario tenta lancar uma despesa com valor zero ou negativo, **When** confirma o formulario, **Then** o sistema rejeita o lancamento e mantem a lista sem alteracao indevida.

---

### User Story 3 - Consultar despesas com filtros (Priority: P2)

Como responsavel financeiro, quero listar despesas por periodo e categoria, para conferir gastos, localizar lancamentos e acompanhar o impacto de cada tipo de custo.

**Why this priority**: Depois que as despesas sao registradas, a consulta filtrada e necessaria para operacao diaria, fechamento mensal e conferencia de dados financeiros.

**Independent Test**: Pode ser testada registrando despesas em categorias e datas diferentes, filtrando por periodo e categoria, e validando que apenas os lancamentos correspondentes aparecem.

**Acceptance Scenarios**:

1. **Given** despesas registradas em varias datas de competencia/ocorrencia, **When** o usuario filtra por periodo, **Then** a lista mostra somente despesas cuja data de competencia/ocorrencia esta dentro do intervalo escolhido.
2. **Given** despesas registradas em categorias diferentes, **When** o usuario filtra por categoria, **Then** a lista mostra somente despesas daquela categoria.
3. **Given** nenhum resultado para os filtros selecionados, **When** a consulta e feita, **Then** a tela mostra um estado vazio claro, sem tratar a ausencia de registros como erro.

---

### User Story 4 - Refletir despesas no financeiro gerencial (Priority: P3)

Como gestor da Amani, quero que despesas lancadas e categorizadas estejam disponiveis para visoes financeiras, para que os indicadores de custos e resultado usem dados operacionais reais.

**Why this priority**: O valor gerencial das despesas depende de elas alimentarem as consultas financeiras existentes. Essa historia consolida o beneficio de gestao, mas depende do cadastro e consulta basicos.

**Independent Test**: Pode ser testada lancando despesas em um periodo e verificando que as visoes financeiras que consideram despesas passam a refletir esses valores sem lancamento paralelo.

**Acceptance Scenarios**:

1. **Given** uma despesa operacional com data de competencia/ocorrencia em um periodo, **When** o gestor consulta a visao financeira desse periodo, **Then** a despesa e considerada nos totais de despesas.
2. **Given** despesas em categorias diferentes, **When** a visao financeira agrupa ou filtra informacoes por categoria, **Then** os valores respeitam a classificacao registrada no lancamento.

### Edge Cases

- Se o usuario tentar criar categoria com nome vazio, o sistema deve rejeitar e indicar o campo obrigatorio.
- Se o usuario tentar criar categoria com nome duplicado equivalente, o sistema deve impedir duplicidade operacional e orientar o usuario a reutilizar ou editar a categoria existente.
- Se a categoria escolhida para uma despesa nao existir, estiver inativa ou nao estiver disponivel para uso, o sistema deve rejeitar o lancamento e pedir uma categoria ativa.
- Se o usuario tentar criar despesa sem forma de pagamento, o sistema deve rejeitar o lancamento e pedir uma forma valida.
- Se o usuario tentar criar despesa com forma de pagamento fora de Dinheiro, PIX, CartaoDebito ou CartaoCredito, o sistema deve rejeitar o lancamento.
- Se o periodo filtrado tiver data inicial posterior a data final, o sistema deve rejeitar o filtro com mensagem clara.
- Se houver muitas despesas no periodo, a consulta deve continuar limitada e filtravel sem exigir que o usuario carregue todo o historico manualmente.
- Se uma despesa foi registrada por engano, a correcao por edicao ou exclusao de despesa permanece fora do escopo desta feature e deve ser tratada em refinamento futuro.
- Despesas de operadora de cartao continuam separadas das despesas operacionais desta feature, ainda que ambas contribuam para visoes financeiras.
- Em smartphone, tablet e desktop, os fluxos de categorias, lancamento e consulta devem permanecer utilizaveis sem perda de informacao essencial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow users to create expense categories with name, optional description and active status.
- **FR-002**: System MUST allow users to list expense categories, distinguishing categories available for new operational expense classification from inactive categories retained for history.
- **FR-003**: System MUST allow users to view the details of a single expense category.
- **FR-004**: System MUST allow users to update the name and description of an expense category.
- **FR-005**: System MUST prevent creation or update of expense categories with empty names.
- **FR-006**: System MUST prevent operationally duplicate expense category names.
- **FR-007**: System MUST allow users to inactivate an expense category while preserving all historical expenses assigned to it.
- **FR-008**: Users MUST be able to create an operational expense with category, competence/occurrence date, amount, description and payment method.
- **FR-009**: System MUST require a valid active expense category for every new operational expense.
- **FR-010**: System MUST reject operational expenses with zero or negative amount.
- **FR-011**: System MUST require one of these payment methods for every new operational expense: Dinheiro, PIX, CartaoDebito or CartaoCredito.
- **FR-012**: System MUST preserve the historical expense record after creation; editing or deleting operational expenses is outside this feature scope.
- **FR-013**: Users MUST be able to list operational expenses with filters for competence/occurrence date range and category.
- **FR-014**: Expense listings MUST show competence/occurrence date, category, payment method, description and amount for each record.
- **FR-015**: System MUST provide clear empty, loading and error states for category and expense lists.
- **FR-016**: System MUST make registered operational expenses available to financial views that include expense totals.
- **FR-017**: System MUST keep operational expenses separate from card operator expenses while allowing both to contribute to financial totals where applicable.
- **FR-018**: System MUST preserve existing sales, receivables, stock movement and card operator expense behaviors.
- **FR-019**: System MUST provide user-friendly validation messages for inactive category, missing category, missing payment method, invalid amount, invalid period and duplicate category name.
- **FR-020**: The official user interface MUST support smartphone, tablet and desktop layouts for category management, expense creation and expense consultation.
- **FR-021**: System MUST keep unsupported capabilities outside the feature scope: editing expenses, deleting expenses, cost allocation, cost centers, recurring expenses and pending expense debt represented as Fiado.

### Key Entities *(include if feature involves data)*

- **Categoria de Despesa**: Classification used to organize operational expenses. Key information includes name, optional description and active status. Inactive categories are retained for historical expenses but are not available for new expense entries.
- **Forma de Pagamento da Despesa**: Payment method selected for an operational expense, required for every new expense entry. Supported values are Dinheiro, PIX, CartaoDebito and CartaoCredito.
- **Despesa Operacional**: A business expense manually registered by the financial user. Key information includes competence/occurrence date, amount, description, assigned expense category and payment method. Payment date tracking is outside this feature scope.
- **Visao Financeira**: Financial reporting or dashboard view that consumes registered expenses to present totals and support management decisions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A financial user can create a new expense category and use it in an expense entry in under 2 minutes.
- **SC-002**: 100% of attempted expense entries without category, without payment method or with non-positive amount are rejected without creating a record.
- **SC-003**: A financial user can find expenses for a selected month and category in under 30 seconds.
- **SC-004**: 100% of operational expenses created during acceptance testing appear in the expense list with matching competence/occurrence date, category, payment method, description and amount.
- **SC-005**: Financial views that include expense totals reflect newly created operational expenses for the selected period during acceptance testing.
- **SC-006**: At least 90% of primary task attempts for category creation and expense creation succeed on first try during guided acceptance testing.
- **SC-007**: The primary flows for category management, expense creation and filtered consultation are usable without horizontal scrolling or overlapping content on smartphone, tablet and desktop.

## Assumptions

- The feature follows the roadmap scope for F016 and fills the existing gap for expense category management before exposing operational expense creation.
- Existing expense records, if any, remain valid and should be visible through the new financial expense experience.
- Category deletion is not included to avoid breaking historical classification.
- Expense editing and deletion are deferred to a later refinement because the roadmap marks them as G4 and outside the core F016 scope unless explicitly expanded.
- Card operator expenses created by the payment-method feature remain a separate financial record type from operational expenses.
- Financial totals should use authoritative backend-provided values; the user interface may format and filter data but is not the source of financial calculations.
- The feature preserves Mobile First and supports smartphone, tablet and desktop.
- Financial history should be preserved; corrections should use explicit future business operations rather than silent deletion of historical records.
