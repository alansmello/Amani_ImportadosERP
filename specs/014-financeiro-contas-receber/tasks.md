# Tasks: Financeiro Contas a Receber Frontend

**Input**: Design documents from `/specs/014-financeiro-contas-receber/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/receivables-frontend.md, quickstart.md

**Tests**: Nenhuma suite automatizada foi gerada — a spec não solicita TDD. Validação usa lint, typecheck, build e cenários do quickstart.

**Organization**: Tarefas agrupadas por user story para permitir implementação e teste independentes de cada história.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo (arquivos diferentes, sem dependências incompletas)
- **[Story]**: User story correspondente (US1…US7)
- Inclui caminhos exatos de arquivo nas descrições

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verificar estrutura existente e criar pastas da feature.

- [X] T001 Verificar placeholder atual em `frontend/src/app/financeiro/page.tsx` e padrões operacionais de referência em `frontend/src/components/vendas/` e `frontend/src/components/compras/`
- [X] T002 Criar estrutura de diretórios da feature: `frontend/src/components/financeiro/`, `frontend/src/app/financeiro/contas-receber/nova/`, `frontend/src/app/financeiro/contas-receber/[id]/editar/`, e `frontend/src/app/financeiro/contas-receber/cliente/[clienteId]/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extensões de backend (B1 e B2) e infraestrutura compartilhada do frontend que bloqueiam todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode começar até esta fase estar completa.

### Backend — Extensão B1: suporte a criação manual com ClienteId

- [X] T003 Ampliar `CriarContaReceberCommand` com campo `ClienteId` (Guid?, opcional) em `src/Amani.ImportadosERP.Application/Commands/CriarContaReceberCommand.cs`
- [X] T004 Adicionar construtor público manual à entidade `ContaReceber(Guid clienteId, decimal valor, DateTime dataVencimento)` com `Origem = "Manual"` em `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs`
- [X] T005 Atualizar `CriarContaReceberCommandHandler` para selecionar o construtor correto: usa construtor manual quando `ClienteId` informado, construtor existente com `VendaId` caso contrário, em `src/Amani.ImportadosERP.Application/Commands/Handlers/CriarContaReceberCommandHandler.cs`

### Backend — Extensão B2: detalhe por cliente enriquecido

- [X] T006 [P] Criar `PagamentoDetalheDto` com campos `Id` (Guid), `Valor` (decimal) e `DataPagamento` (DateTime) em `src/Amani.ImportadosERP.Application/DTOs/PagamentoDetalheDto.cs`
- [X] T007 Estender `ContaReceberDetalheDto` com campos `Status` (string) e `Pagamentos` (List\<PagamentoDetalheDto\>) em `src/Amani.ImportadosERP.Application/DTOs/ContaReceberDetalheDto.cs` (depende de T006)
- [X] T008 Atualizar `ObterEmAbertoDetalhePorClienteAsync` no repositório para calcular e preencher `Status` (`saldo <= 0 ? "Pago" : "Pendente"`) e mapear `PagamentoRecebido` para `PagamentoDetalheDto` em cada conta retornada em `src/Amani.ImportadosERP.Infra.Data/Repositories/ContaReceberRepository.cs` (depende de T007)

### Frontend — Infraestrutura compartilhada

- [X] T009 [P] Criar tipos explícitos de listagem, por-cliente, detalhe, pagamento individual, payloads e filtros em `frontend/src/types/receivable.ts`
- [X] T010 Criar service com métodos `list`, `listByClient`, `getClientDetail`, `create`, `registerPayment`, `update` e `delete` em `frontend/src/services/receivables.ts` (depende de T009)
- [X] T011 Criar query keys, queries e mutations com invalidação de `queryKeys.financeiro` após cada mutação em `frontend/src/hooks/use-receivables.ts` (depende de T009, T010)
- [X] T012 [P] Criar helpers de formatação para moeda, datas (sem offset UTC→local) e labels de status/origem em `frontend/src/components/financeiro/receivable-formatters.ts`
- [X] T013 Adicionar rotas `contasReceber`, `contasReceberNova` e funções auxiliares `contaReceberEditar(id)` e `contaReceberClienteDetalhe(clienteId)` em `frontend/src/config/routes.ts`
- [X] T014 Validar constitution gates da F014 em `specs/014-financeiro-contas-receber/plan.md`: extensões B1/B2 sem migration, backend como fonte de status/saldo, Dark Only, Mobile First, sem cálculo local, sem contas a pagar, sem dependência nova

**Checkpoint**: Fundação pronta. Implementação das user stories pode começar.

---

## Phase 3: User Story 1 — Criar conta a receber (Priority: P1) 🎯 MVP

**Goal**: Permitir criar uma conta a receber manualmente informando cliente, valor e data de vencimento.

**Independent Test**: Acesse `/financeiro/contas-receber/nova`, selecione um cliente existente, informe valor e data, confirme — a conta aparece na lista como "Pendente" com Origem "Manual" conforme a fonte oficial.

### Implementation for User Story 1

- [X] T015 [P] [US1] Criar formulário de criação com seleção de cliente via `useCustomers`, campo de valor e campo de data de vencimento (com aviso informativo para datas no passado), validação local de campos obrigatórios, estado de carregamento durante mutação (botão desabilitado + indicador visual) e feedback de erro do backend sem limpar o formulário em `frontend/src/components/financeiro/receivable-form.tsx`
- [X] T016 [US1] Criar rota de nova conta que renderiza o formulário, executa `useCreateReceivable` e navega para a lista após sucesso em `frontend/src/app/financeiro/contas-receber/nova/page.tsx` (depende de T015)
- [ ] T017 [US1] Validar criação e validação de campos dos cenários C01 e C02 em `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: User Story 1 funcional como incremento MVP.

---

## Phase 4: User Story 2 — Registrar pagamento via modal (Priority: P2)

**Goal**: Registrar pagamento de uma conta existente via modal com campo de valor, sem navegar para outra página.

**Independent Test**: Na lista, abra o modal de pagamento de uma conta "Pendente", informe valor positivo, confirme — lista atualiza TotalPago, Saldo e Status sem recarregar a página.

### Implementation for User Story 2

- [X] T018 [P] [US2] Criar modal/bottom-sheet de pagamento com campo de valor, validação de valor positivo, estados de loading/erro/sucesso e fechamento somente após confirmação da fonte oficial em `frontend/src/components/financeiro/receivable-payment-modal.tsx`
- [X] T019 [US2] Integrar ação de registrar pagamento no componente de lista e no detalhe por cliente, passando `id` da conta e conectando `useRegisterPayment` com invalidação de cache em `frontend/src/components/financeiro/receivables-list.tsx` e `frontend/src/components/financeiro/receivable-client-detail.tsx` (depende de T018, T027)
- [ ] T020 [US2] Validar fluxo de pagamento dos cenários C03, C04 e C15 em `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: User Stories 1 e 2 funcionam independentemente.

---

## Phase 5: User Story 3 — Listar e consultar contas (Priority: P3)

**Goal**: Substituir o placeholder de Financeiro pela lista operacional com filtro por status e busca por nome de cliente.

**Independent Test**: Abra `/financeiro/contas-receber`, verifique lista com Status, ValorTotal, TotalPago, Saldo, Origem e DataVencimento; aplique filtro "Pendente" e busca por nome — resultados filtram localmente; link de venda funciona quando Origem = "Venda".

### Implementation for User Story 3

- [X] T021 [P] [US3] Criar componente de filtros com seleção de status ("Pendente"/"Pago"/todos) e campo de busca por nome de cliente com limpeza, aplicados localmente sobre o conjunto carregado em `frontend/src/components/financeiro/receivables-filters.tsx`
- [X] T022 [P] [US3] Criar lista de contas com colunas de cliente (resolver `NomeCliente` via cache de `useCustomers`; exibir `ClienteId` como fallback se nome indisponível), Status, ValorTotal, TotalPago, Saldo, Origem (com link para `/vendas/[vendaId]` quando VendaId presente), DataVencimento, e ações de pagamento/editar/excluir; incluir estados loading, erro (com botão de nova tentativa visível) e vazio e vazio-filtrado em `frontend/src/components/financeiro/receivables-list.tsx`
- [X] T023 [US3] Substituir `frontend/src/app/financeiro/page.tsx` por redirect ou link direto para `/financeiro/contas-receber` — depende apenas de T002; pode executar a partir da Phase 2 sem aguardar os componentes de US3
- [X] T024 [US3] Criar página principal com tab "Lista" (renderiza receivables-list + receivables-filters) e ação de nova conta em `frontend/src/app/financeiro/contas-receber/page.tsx` (depende de T021, T022)
- [ ] T025 [US3] Validar lista, filtros, busca, link de venda, estado vazio e estado de erro dos cenários C05, C06, C07, C13 e C14 em `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: User Story 3 funcional independentemente após fase foundational.

---

## Phase 6: User Story 4 — Ver recebíveis por cliente (Priority: P4)

**Goal**: Exibir contas agrupadas por cliente com total a receber e, no detalhe, contas em aberto com pagamentos individuais.

**Independent Test**: Na tab "Por Cliente", clique em um cliente — `/financeiro/contas-receber/cliente/[clienteId]` exibe contas com Status, ValorTotal, TotalPago, Saldo, DataVencimento e lista de pagamentos individuais conforme fonte oficial.

### Implementation for User Story 4

- [X] T026 [P] [US4] Criar componente de visão por cliente com lista de clientes, NomeCliente, TotalAReceber, e link para detalhe; incluir estados loading, erro e vazio em `frontend/src/components/financeiro/receivables-by-client.tsx`
- [X] T027 [P] [US4] Criar componente de detalhe por cliente com contas em aberto (Status, ValorTotal, TotalPago, Saldo, DataVencimento, Origem, link de venda) e accordion/lista de pagamentos individuais de cada conta em `frontend/src/components/financeiro/receivable-client-detail.tsx`
- [X] T028 [US4] Criar rota de detalhe por cliente com loading, erro (com botão de nova tentativa visível), vazio e ação de registrar pagamento em `frontend/src/app/financeiro/contas-receber/cliente/[clienteId]/page.tsx` (depende de T027)
- [X] T029 [US4] Adicionar tab "Por Cliente" à página principal renderizando `receivables-by-client` com navegação para detalhe em `frontend/src/app/financeiro/contas-receber/page.tsx` (depende de T026)
- [ ] T030 [US4] Validar visão por cliente e detalhe dos cenários C11 e C12 em `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: User Story 4 funcional independentemente após fase foundational.

---

## Phase 7: User Story 5 — Editar conta a receber (Priority: P5)

**Goal**: Permitir alterar valor e data de vencimento de uma conta existente sem perder histórico de pagamentos.

**Independent Test**: Acesse `/financeiro/contas-receber/[id]/editar`, altere valor ou data, confirme — lista exibe novos dados após sucesso; erro preserva os valores anteriores.

### Implementation for User Story 5

- [X] T031 [US5] Estender `receivable-form.tsx` com modo de edição: pré-preencher valor e data de vencimento a partir dos dados existentes, executar `useUpdateReceivable` em vez de `useCreateReceivable`, incluir estado de carregamento durante mutação (botão desabilitado + indicador visual) e preservar dados na tela quando a fonte oficial rejeitar em `frontend/src/components/financeiro/receivable-form.tsx`
- [X] T032 [US5] Criar rota de edição que carrega a conta, renderiza o formulário em modo edição e navega de volta após sucesso em `frontend/src/app/financeiro/contas-receber/[id]/editar/page.tsx` (depende de T031)
- [ ] T033 [US5] Validar edição e preservação de erro do cenário C08 em `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: User Story 5 funcional independentemente.

---

## Phase 8: User Story 6 — Excluir conta a receber (Priority: P6)

**Goal**: Excluir conta com confirmação explícita, removendo da lista somente após aceite da fonte oficial.

**Independent Test**: Selecione uma conta, confirme exclusão — lista remove o item apenas após retorno da fonte oficial; ao cancelar o diálogo, nenhuma chamada é feita; rejeição pelo backend exibe mensagem e preserva o registro.

### Implementation for User Story 6

- [X] T034 [P] [US6] Criar diálogo de confirmação de exclusão com estados de loading, erro e prévia do item a excluir; não fechar e não remover da lista até sucesso confirmado pela fonte oficial em `frontend/src/components/financeiro/delete-receivable-dialog.tsx`
- [X] T035 [US6] Integrar ação de exclusão na lista de contas conectando `useDeleteReceivable` com invalidação de `queryKeys.financeiro` e exibição de erro sem silenciar a razão de rejeição em `frontend/src/components/financeiro/receivables-list.tsx` (depende de T034)
- [ ] T036 [US6] Validar exclusão e cancelamento dos cenários C09 e C10 em `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: User Story 6 funcional independentemente.

---

## Phase 9: User Story 7 — Operar recebíveis em telas pequenas e grandes (Priority: P7)

**Goal**: Garantir que lista, filtros, tabs, modal de pagamento, formulários e detalhe funcionem em smartphone, tablet e desktop.

**Independent Test**: Execute os fluxos de lista, criação, pagamento, visão por cliente e detalhe em 390px, 768px e 1280px sem sobreposição de conteúdo, controles inacessíveis ou perda de informações essenciais.

### Implementation for User Story 7

- [ ] T037 [US7] Revisar e ajustar layout responsivo da lista, filtros e tabs em `frontend/src/app/financeiro/contas-receber/page.tsx`, `frontend/src/components/financeiro/receivables-list.tsx`, `frontend/src/components/financeiro/receivables-filters.tsx` e `frontend/src/components/financeiro/receivables-by-client.tsx`
- [ ] T038 [US7] Revisar e ajustar layout responsivo do formulário de criação/edição e do modal de pagamento em `frontend/src/app/financeiro/contas-receber/nova/page.tsx`, `frontend/src/app/financeiro/contas-receber/[id]/editar/page.tsx`, `frontend/src/components/financeiro/receivable-form.tsx` e `frontend/src/components/financeiro/receivable-payment-modal.tsx`
- [ ] T039 [US7] Revisar e ajustar layout responsivo do detalhe por cliente e do diálogo de exclusão em `frontend/src/app/financeiro/contas-receber/cliente/[clienteId]/page.tsx`, `frontend/src/components/financeiro/receivable-client-detail.tsx` e `frontend/src/components/financeiro/delete-receivable-dialog.tsx`
- [ ] T040 [US7] Validar Mobile First em smartphone (390px), tablet (768px) e desktop (1280px) para os cenários C01, C03, C05, C11 e C12 de `specs/014-financeiro-contas-receber/quickstart.md`

**Checkpoint**: Todas as user stories são independentemente funcionais e responsivas.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validar exclusões de escopo, consistência visual e qualidade de build.

- [ ] T041 [P] Verificar ausência de contas a pagar, conciliação bancária, juros/multa automáticos, cálculo local de saldo/status e dados simulados em `frontend/src/app/financeiro/` e `frontend/src/components/financeiro/`
- [ ] T042 [P] Atualizar item de navegação de Financeiro se a config usar metadados de prontidão em `frontend/src/config/navigation.ts`
- [ ] T043 [P] Revisar labels, mensagens de erro, estados vazios e consistência visual Dark Only em `frontend/src/app/financeiro/` e `frontend/src/components/financeiro/`
- [ ] T044 Executar validação completa dos cenários do quickstart em `specs/014-financeiro-contas-receber/quickstart.md`
- [ ] T045 Executar `npm run lint` em `frontend/`
- [ ] T046 Executar `npm run typecheck` em `frontend/`
- [ ] T047 Executar `npm run build` em `frontend/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Sem dependências — pode iniciar imediatamente.
- **Foundational (Phase 2)**: Depende do Setup — bloqueia todas as user stories.
- **US1 (Phase 3)**: Depende da Foundational; MVP isolado.
- **US2 (Phase 4)**: Depende da Foundational; integra naturalmente ao componente de lista do US3, mas o modal pode ser construído antes.
- **US3 (Phase 5)**: Depende da Foundational; pode ser implementado independentemente.
- **US4 (Phase 6)**: Depende da Foundational e da extensão B2 do backend (T008).
- **US5 (Phase 7)**: Depende da Foundational; reutiliza `receivable-form.tsx` do US1.
- **US6 (Phase 8)**: Depende da Foundational; usa `receivables-list.tsx` do US3.
- **US7 (Phase 9)**: Depende dos componentes visíveis de US1, US2, US3, US4, US5 e US6.
- **Polish**: Depende de todas as user stories desejadas estarem completas.

### User Story Dependencies

- **US1 (P1)**: MVP; sem dependência em outras user stories após foundational.
- **US2 (P2)**: Modal independente; integração plena com a lista após US3.
- **US3 (P3)**: Independente após foundational; fornece a lista usada por US2, US6.
- **US4 (P4)**: Requer extensão B2 completa (T008); independente de US1–US3.
- **US5 (P5)**: Reutiliza `receivable-form.tsx` do US1; pode ser concluído depois.
- **US6 (P6)**: Usa `receivables-list.tsx` do US3 para o ponto de entrada da exclusão.
- **US7 (P7)**: Cross-cutting; executa após todas as superfícies visuais existirem.

### Parallel Opportunities

- T003–T005 (B1) e T006–T008 (B2) podem executar em paralelo entre si.
- T009, T012 podem executar em paralelo durante o foundational.
- T015 e T018 (modal de pagamento) podem executar em paralelo.
- T021, T022 (filtros e lista) podem executar em paralelo.
- T026, T027 (por-cliente e detalhe) podem executar em paralelo.
- T034 (diálogo de exclusão) pode executar em paralelo com qualquer US anterior.
- T041, T042 e T043 podem executar em paralelo durante o polish.

---

## Parallel Example: Phase 2 Backend

```text
Task: "T003 Ampliar CriarContaReceberCommand em Commands/CriarContaReceberCommand.cs"
Task: "T006 [P] Criar PagamentoDetalheDto em DTOs/PagamentoDetalheDto.cs"
Task: "T009 [P] Criar types/receivable.ts"
Task: "T012 [P] Criar receivable-formatters.ts"
```

## Parallel Example: User Story 3

```text
Task: "T021 [P] [US3] Criar receivables-filters.tsx"
Task: "T022 [P] [US3] Criar receivables-list.tsx"
```

## Parallel Example: User Story 4

```text
Task: "T026 [P] [US4] Criar receivables-by-client.tsx"
Task: "T027 [P] [US4] Criar receivable-client-detail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational (backend B1 + infraestrutura frontend).
3. Complete Phase 3: User Story 1 (criação).
4. **PARAR e VALIDAR**: `/financeiro/contas-receber/nova` com criação de conta manual funcional.
5. Demo se pronto.

### Incremental Delivery

1. Setup + Foundational → extensões B1/B2 + service/hook/types/routes prontos.
2. US1 → criação manual MVP.
3. US2 → pagamento via modal.
4. US3 → lista operacional com filtros e link de venda.
5. US4 → visão por cliente e detalhe com pagamentos (requer B2).
6. US5 → edição de valor e vencimento.
7. US6 → exclusão com confirmação.
8. US7 → revisão responsiva.
9. Polish → exclusões de escopo, quickstart, lint, typecheck, build.

### Parallel Team Strategy

Com múltiplos desenvolvedores:

1. Time completa Setup + Foundational junto (B1, B2 e infraestrutura).
2. Dev A: US1 (criação) + US5 (edição — reutiliza form).
3. Dev B: US2 (modal pagamento) + US3 (lista e filtros).
4. Dev C: US4 (por cliente e detalhe) + US6 (exclusão).
5. Time converge em US7 (responsividade) e polish final.

---

## Notes

- [P] tasks são arquivos diferentes ou validações independentes sem dependência de tasks incompletas.
- [US] labels mapeiam diretamente para user stories em `specs/014-financeiro-contas-receber/spec.md`.
- Status, saldo, pagamentos e validações financeiras permanecem exclusivamente no backend; o frontend exibe apenas.
- Contas a pagar, conciliação bancária, juros/multa automáticos e cálculo local de qualquer métrica financeira não devem aparecer em nenhum arquivo desta feature.
- Datas devem ser formatadas sem conversão UTC→local (usar parte `YYYY-MM-DD` diretamente, padrão estabelecido em BF003 de `sale-formatters.ts`).
- Commitar após cada tarefa ou grupo lógico.
- Parar em qualquer checkpoint para validar a user story independentemente.
