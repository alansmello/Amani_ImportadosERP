# Tasks: Implantacao Inicial no Frontend

**Input**: Design documents from `/specs/010-implantacao-inicial/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/implantacao-frontend.md, quickstart.md

**Tests**: Nao foram solicitados testes automatizados/TDD. A validacao sera por lint, typecheck, build e cenarios manuais do quickstart.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura de arquivos, rotas e contratos base sem implementar as etapas ainda.

- [X] T001 Create implantation route directory in frontend/src/app/configuracoes/implantacao
- [X] T002 Create implantation component directory in frontend/src/components/implantacao
- [X] T003 [P] Review existing configuration placeholder in frontend/src/app/configuracoes/page.tsx and reference operational patterns in frontend/src/app/produtos/page.tsx
- [X] T004 [P] Review existing products and customers hooks/services in frontend/src/hooks/use-products.ts, frontend/src/hooks/use-customers.ts, frontend/src/services/products.ts, and frontend/src/services/customers.ts
- [X] T005 [P] Review backend contract source in src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs and DTO source files under src/Amani.ImportadosERP.Application/DTOs before implementing frontend payloads

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Tipos, service, hooks e utilitarios compartilhados por todas as etapas da implantacao.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 Create implantation type contracts for payloads, results, step status, local item drafts, and validation errors in frontend/src/types/implantation.ts
- [X] T007 Create implantationService with registerInitialInventory, registerInitialCashBalance, and registerInitialReceivable methods in frontend/src/services/implantation.ts
- [X] T008 Extend queryKeys with implantacao prefix in frontend/src/lib/query-client.ts
- [X] T009 Create use-implantation hooks with mutations for initial inventory, initial cash balance, and initial receivable registration in frontend/src/hooks/use-implantation.ts
- [X] T010 Implement local validation helpers for inventory items, cash balance, receivable drafts, duplicate products, and required references in frontend/src/components/implantacao/implantation-validation.ts
- [X] T011 [P] Add configuracoesImplantacao route key pointing to /configuracoes/implantacao in frontend/src/config/routes.ts
- [X] T012 Improve API error message extraction for backend `{ error }` responses in frontend/src/services/api-client.ts and frontend/src/services/errors.ts

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Registrar inventario inicial (Priority: P1) MVP

**Goal**: Usuario registra estoque inicial por produto, com lote local, validacao, revisao, envio e bloqueio apos sucesso.

**Independent Test**: Abrir `/configuracoes/implantacao`, selecionar produtos existentes, informar quantidade/valor, revisar, confirmar e validar sucesso; tentar item invalido e produto duplicado e validar erro sem envio.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create ImplantationProgress component showing pending, editing, submitting, completed, and error states in frontend/src/components/implantacao/implantation-progress.tsx
- [X] T014 [P] [US1] Create ImplantationReviewDialog component for pre-submit confirmation using existing dialog UI in frontend/src/components/implantacao/implantation-review-dialog.tsx
- [X] T015 [P] [US1] Create ImplantationResultSummary component for success and error summaries in frontend/src/components/implantacao/implantation-result-summary.tsx
- [X] T016 [US1] Create InitialInventoryStep component with product selector, quantity, optional unit value, add/remove draft item, duplicate-product validation, and disabled completed state in frontend/src/components/implantacao/initial-inventory-step.tsx
- [X] T017 [US1] Connect InitialInventoryStep to useProducts and registerInitialInventory mutation, sending origem ImplantacaoInicial and preserving draft data on validation/API errors in frontend/src/components/implantacao/initial-inventory-step.tsx
- [X] T018 [US1] Implement inventory review summary with product names, quantities, unit values, total item count, and confirmation action in frontend/src/components/implantacao/initial-inventory-step.tsx
- [X] T019 [US1] Mark inventory step as completed only after successful API response and block subsequent inventory submission in the current screen/session in frontend/src/components/implantacao/initial-inventory-step.tsx
- [X] T020 [US1] Create implantation page shell loading products and rendering the inventory step with loading/error states in frontend/src/app/configuracoes/implantacao/page.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Registrar saldo inicial de caixa (Priority: P2)

**Goal**: Usuario registra saldo inicial de caixa com valor, data, origem padronizada, descricao opcional, revisao e bloqueio apos sucesso.

**Independent Test**: Abrir a etapa de caixa, informar valor/data, revisar, confirmar, validar sucesso e bloqueio; tentar valor ausente/invalido e validar correcao sem perder dados.

### Implementation for User Story 2

- [X] T021 [US2] Create InitialCashStep component with value, date, optional description, validation messages, review trigger, and completed-state lock in frontend/src/components/implantacao/initial-cash-step.tsx
- [X] T022 [US2] Connect InitialCashStep to registerInitialCashBalance mutation using origem SaldoInicial and preserving typed data on validation/API errors in frontend/src/components/implantacao/initial-cash-step.tsx
- [X] T023 [US2] Render cash result summary with event id, value, date, and origem after success in frontend/src/components/implantacao/initial-cash-step.tsx
- [X] T024 [US2] Add initial cash step to implantation page with independent state from inventory in frontend/src/app/configuracoes/implantacao/page.tsx

**Checkpoint**: User Story 2 works independently after foundation and can be validated without completing other steps.

---

## Phase 5: User Story 3 - Registrar contas a receber iniciais (Priority: P3)

**Goal**: Usuario monta lote local de recebiveis por cliente, valida todos os itens antes do envio e so conclui visualmente a etapa se todos os envios tiverem sucesso.

**Independent Test**: Adicionar ate 10 contas para clientes ativos, revisar e confirmar; validar que item invalido impede envio e que falha de qualquer envio nao marca a etapa como concluida.

### Implementation for User Story 3

- [X] T025 [US3] Create InitialReceivablesStep component with client selector, value, due date, optional description, add/remove draft receivable, and completed-state lock in frontend/src/components/implantacao/initial-receivables-step.tsx
- [X] T026 [US3] Connect InitialReceivablesStep to useCustomers("active") and show loading, empty, and error states for customer support data in frontend/src/components/implantacao/initial-receivables-step.tsx
- [X] T027 [US3] Implement local validation for all receivable drafts before any API call, including required client, value greater than zero, required due date, and max 10 item UX guard in frontend/src/components/implantacao/initial-receivables-step.tsx
- [X] T028 [US3] Implement receivables review summary with client names, descriptions, values, due dates, and total count in frontend/src/components/implantacao/initial-receivables-step.tsx
- [X] T029 [US3] Implement sequential initial receivable submissions using registerInitialReceivable mutation, preserving the editable draft batch and keeping the step pending/error if any request fails in frontend/src/components/implantacao/initial-receivables-step.tsx
- [X] T030 [US3] Mark receivables step as visually completed only after every receivable in the local batch succeeds and never show individual item success when the batch fails in frontend/src/components/implantacao/initial-receivables-step.tsx
- [X] T031 [US3] Add receivables step to implantation page with independent state from inventory and cash in frontend/src/app/configuracoes/implantacao/page.tsx

**Checkpoint**: User Story 3 is independently functional and preserves all-or-nothing visual completion semantics.

---

## Phase 6: User Story 4 - Revisar e confirmar implantacao (Priority: P4)

**Goal**: Usuario revisa dados antes de confirmar cada etapa, volta para corrigir preenchimento e acompanha progresso parcial da implantacao.

**Independent Test**: Preencher cada etapa, abrir revisao, voltar para corrigir sem perder dados, confirmar uma ou duas etapas e validar progresso parcial com etapas concluidas bloqueadas e pendentes disponiveis.

### Implementation for User Story 4

- [X] T032 [US4] Create ImplantationFlow component to coordinate active step, local step states, progress, review dialog opening, and result summaries in frontend/src/components/implantacao/implantation-flow.tsx
- [X] T033 [US4] Move shared step completion, error, pending, and completedAt state management from page-level code into ImplantationFlow in frontend/src/components/implantacao/implantation-flow.tsx
- [X] T034 [US4] Ensure each review dialog can return to editing without clearing draft state in frontend/src/components/implantacao/implantation-review-dialog.tsx
- [X] T035 [US4] Render progress summary for completed, pending, submitting, and error steps in frontend/src/components/implantacao/implantation-progress.tsx
- [X] T036 [US4] Refactor implantation page to render ImplantationFlow with product and customer support data in frontend/src/app/configuracoes/implantacao/page.tsx
- [X] T037 [US4] Ensure completed steps remain visible as concluded and unavailable for new submission in the current screen/session while pending/error steps remain editable in frontend/src/components/implantacao/implantation-flow.tsx

**Checkpoint**: User Story 4 provides the full guided workflow experience across independently completed steps.

---

## Phase 7: User Story 5 - Acessar implantacao por configuracoes (Priority: P5)

**Goal**: Usuario encontra a Implantacao Inicial em Configuracoes e acessa o fluxo em smartphone, tablet e desktop sem confundir com operacoes recorrentes.

**Independent Test**: Abrir `/configuracoes`, acionar Implantacao Inicial, validar navegacao para `/configuracoes/implantacao`, retorno claro e layout responsivo.

### Implementation for User Story 5

- [X] T038 [US5] Replace Configuracoes placeholder with a configuration landing page that exposes Implantacao Inicial access without changing preferences or permissions in frontend/src/app/configuracoes/page.tsx
- [X] T039 [US5] Add clear back navigation from implantation page to Configuracoes in frontend/src/app/configuracoes/implantacao/page.tsx
- [X] T040 [US5] Ensure navigation text differentiates initial data setup from recurring purchases, sales, finance, and stock operations in frontend/src/app/configuracoes/page.tsx and frontend/src/app/configuracoes/implantacao/page.tsx
- [X] T041 [P] [US5] Add or adjust Configuracoes navigation status to reflect the real implantation entry while preserving existing menu structure in frontend/src/config/navigation.ts

**Checkpoint**: User Story 5 makes the feature discoverable and navigable across viewport sizes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validacao final, regressao constitucional e acabamento transversal.

- [ ] T042 [P] Validate API error extraction displays backend `{ error }` messages during implantation failures using specs/010-implantacao-inicial/quickstart.md
- [ ] T043 [P] Validate Dark Only visual consistency and absence of unsupported import/reopening/mass-edit actions across frontend/src/app/configuracoes and frontend/src/components/implantacao
- [ ] T044 Validate Mobile First behavior at 390px smartphone, tablet, and desktop widths using scenarios in specs/010-implantacao-inicial/quickstart.md
- [ ] T045 Validate timed success criteria for access within 20 seconds, 10 inventory items within 5 minutes, cash within 1 minute, and 10 receivables within 5 minutes using specs/010-implantacao-inicial/quickstart.md
- [ ] T046 Validate that frontend/src/components/implantacao and frontend/src/hooks/use-implantation.ts perform no cost average, stock balance, financial balance, profit, ranking, metric, dashboard, or transactional rollback calculations
- [ ] T047 Run npm run lint in frontend and fix any issues in frontend/src/app/configuracoes, frontend/src/components/implantacao, frontend/src/hooks/use-implantation.ts, frontend/src/services/implantation.ts, frontend/src/types/implantation.ts, frontend/src/config/routes.ts, and frontend/src/config/navigation.ts
- [ ] T048 Run npm run typecheck in frontend and fix any TypeScript issues in frontend/src/app/configuracoes, frontend/src/components/implantacao, frontend/src/hooks/use-implantation.ts, frontend/src/services/implantation.ts, and frontend/src/types/implantation.ts
- [ ] T049 Run npm run build in frontend and fix any build issues in frontend/src/app/configuracoes and related implantation files
- [ ] T050 Validate regression that Produtos and Clientes pages still load through existing hooks after shared query key and route changes in frontend/src/app/produtos/page.tsx and frontend/src/app/clientes/page.tsx
- [ ] T051 Validate constitution gates and confirm no backend files, migrations, stock movement logic, purchase flow, sales flow, financial dashboard, analytics aggregation, import flow, reopening flow, or mass-edit behavior were changed for this frontend-only feature in src and frontend/src

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 Registrar inventario inicial (P1)**: Starts after Foundation; MVP scope.
- **US2 Registrar saldo inicial de caixa (P2)**: Starts after Foundation; independent from US1 after shared flow primitives exist.
- **US3 Registrar contas a receber iniciais (P3)**: Starts after Foundation; independent from US1/US2, but shares progress/review primitives.
- **US4 Revisar e confirmar implantacao (P4)**: Most useful after US1-US3 step components exist; consolidates shared guided workflow.
- **US5 Acessar implantacao por configuracoes (P5)**: Starts after route exists; final copy/navigation depends on the page and flow being present.

### Implementation Order

1. Phase 1 Setup.
2. Phase 2 Foundation.
3. Phase 3 US1 as MVP.
4. Phase 4 US2.
5. Phase 5 US3.
6. Phase 6 US4.
7. Phase 7 US5.
8. Phase 8 Polish and validation.

---

## Parallel Opportunities

- T003, T004, and T005 can run in parallel because they only inspect different files.
- T011 can run in parallel with T006-T010 because it only changes routes configuration.
- T013, T014, and T015 can run in parallel after component directory exists because they create different shared components.
- T021 can run while T016-T020 are completed after foundation, because it writes a separate step component.
- T025 can run while T021-T024 are completed after foundation, because it writes a separate step component.
- T041 can run in parallel with T038-T040 because it changes navigation configuration only.
- T042 and T043 can run in parallel during polish because they touch different concerns.

## Parallel Example: Foundation

```text
Task: "T006 Create implantation type contracts for payloads, results, step status, local item drafts, and validation errors in frontend/src/types/implantation.ts"
Task: "T011 [P] Add configuracoesImplantacao route key pointing to /configuracoes/implantacao in frontend/src/config/routes.ts"
```

## Parallel Example: User Story 1

```text
Task: "T013 [P] [US1] Create ImplantationProgress component showing pending, editing, submitting, completed, and error states in frontend/src/components/implantacao/implantation-progress.tsx"
Task: "T014 [P] [US1] Create ImplantationReviewDialog component for pre-submit confirmation using existing dialog UI in frontend/src/components/implantacao/implantation-review-dialog.tsx"
Task: "T015 [P] [US1] Create ImplantationResultSummary component for success and error summaries in frontend/src/components/implantacao/implantation-result-summary.tsx"
```

## Parallel Example: User Stories 2 and 3

```text
Task: "T021 [US2] Create InitialCashStep component with value, date, optional description, validation messages, review trigger, and completed-state lock in frontend/src/components/implantacao/initial-cash-step.tsx"
Task: "T025 [US3] Create InitialReceivablesStep component with client selector, value, due date, optional description, add/remove draft receivable, and completed-state lock in frontend/src/components/implantacao/initial-receivables-step.tsx"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate `/configuracoes/implantacao` inventory flow with products, local validation, review, API success, API error, and completed-state lock.
4. Stop and demo the inventory-initial setup before adding cash and receivables.

### Incremental Delivery

1. US1 delivers inventory initial entry and validates stock-by-movements guardrails.
2. US2 adds initial cash balance.
3. US3 adds initial receivables with all-or-nothing visual completion semantics.
4. US4 consolidates review/progress behavior across all steps.
5. US5 makes the workflow discoverable from Configuracoes.
6. Polish validates responsive behavior, prohibited features, and build health.

### Notes

- [P] tasks touch different files or can be prepared without depending on incomplete story behavior.
- Every user story task includes exact file paths.
- Do not add tests unless a later request explicitly asks for automated tests/TDD.
- Do not add dependencies, backend changes, migrations, dashboard calculations, stock balance calculations, average cost calculations, transactional rollback, import flow, reopening, or mass edit.
- Treat backend rejection messages as official and keep frontend state temporary until API success.
