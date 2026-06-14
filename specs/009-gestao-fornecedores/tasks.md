# Tasks: Gestao de Fornecedores no Frontend

**Input**: Design documents from `/specs/009-gestao-fornecedores/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/fornecedores-frontend.md, quickstart.md

**Tests**: Nao foram solicitados testes automatizados/TDD. A validacao sera por lint, typecheck, build e cenarios manuais do quickstart.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar estrutura de arquivos do modulo sem alterar comportamento ainda.

- [X] T001 Create supplier route directories in frontend/src/app/fornecedores, frontend/src/app/fornecedores/novo, frontend/src/app/fornecedores/[id], and frontend/src/app/fornecedores/[id]/editar
- [X] T002 Create supplier component directory in frontend/src/components/fornecedores
- [X] T003 [P] Review Produtos reference files frontend/src/app/produtos/page.tsx and frontend/src/components/produtos/product-table.tsx before implementing supplier list patterns

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Contratos, service e hooks compartilhados por todas as user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Update supplier type contract with SupplierPayload in frontend/src/types/supplier.ts
- [X] T005 Extend suppliersService with getById, create, and update methods in frontend/src/services/suppliers.ts
- [X] T006 Extend supplier query keys and add useSupplier, useCreateSupplier, and useUpdateSupplier in frontend/src/hooks/use-suppliers.ts
- [X] T007 [P] Create shared SupplierActions component without delete/inactivate/remove actions in frontend/src/components/fornecedores/supplier-actions.tsx
- [X] T008 Validate constitution gates for this frontend-only feature in specs/009-gestao-fornecedores/tasks.md, confirming no backend rules, stock, purchase, sales, analytics, schema, migration, or metric behavior is introduced

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Consultar fornecedores (Priority: P1) MVP

**Goal**: Usuario acessa a area de fornecedores, visualiza fornecedores reais, busca por nome e trata loading/vazio/erro.

**Independent Test**: Acessar `/fornecedores` com fornecedores existentes, validar lista responsiva, busca por nome, estado vazio e estado de erro com retry.

### Implementation for User Story 1

- [X] T009 [P] [US1] Create responsive SupplierTable for mobile cards and desktop table in frontend/src/components/fornecedores/supplier-table.tsx
- [X] T010 [US1] Implement suppliers list page with PageHeader, search by nome, LoadingState, EmptyState, ErrorState, retry, and SupplierTable in frontend/src/app/fornecedores/page.tsx
- [X] T011 [US1] Ensure supplier list page uses only real API data from useSuppliers and no mocked values in frontend/src/app/fornecedores/page.tsx
- [X] T012 [US1] Ensure search normalization uses pt-BR locale and filters only supplier.nome in frontend/src/app/fornecedores/page.tsx
- [X] T013 [US1] Wire SupplierActions detail/edit links from list rows and cards in frontend/src/components/fornecedores/supplier-actions.tsx

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Cadastrar fornecedor (Priority: P2)

**Goal**: Usuario cadastra fornecedor informando nome valido, recebe feedback e ve o fornecedor salvo.

**Independent Test**: Acessar `/fornecedores/novo`, validar erro para nome vazio, cadastrar nome valido e confirmar que o fornecedor aparece na lista ou detalhe.

### Implementation for User Story 2

- [X] T014 [P] [US2] Create SupplierFormFields with nome input, validation message slots, and disabled state in frontend/src/components/fornecedores/supplier-form-fields.tsx
- [X] T015 [US2] Create SupplierForm with trim, required nome validation, submit loading, success feedback, API error handling, and payload { nome } in frontend/src/components/fornecedores/supplier-form.tsx
- [X] T016 [US2] Implement new supplier page using SupplierForm and useCreateSupplier in frontend/src/app/fornecedores/novo/page.tsx
- [X] T017 [US2] Redirect or navigate after successful creation so the user can see the saved supplier in frontend/src/app/fornecedores/novo/page.tsx
- [X] T018 [US2] Preserve typed nome when local validation or API rejection fails in frontend/src/components/fornecedores/supplier-form.tsx

**Checkpoint**: User Story 2 works independently after foundation and can be validated without editing existing suppliers.

---

## Phase 5: User Story 3 - Consultar detalhes de fornecedor (Priority: P3)

**Goal**: Usuario abre um fornecedor especifico e revisa nome e identificador somente leitura.

**Independent Test**: Abrir fornecedor existente por link da lista ou URL, validar nome e ID, navegar para edicao, e validar estado de nao encontrado para ID inexistente.

### Implementation for User Story 3

- [X] T019 [P] [US3] Create SupplierDetails component showing nome and read-only id only in frontend/src/components/fornecedores/supplier-details.tsx
- [X] T020 [US3] Implement supplier detail page with useSupplier, LoadingState, ErrorState, not-found state, back navigation, and edit action in frontend/src/app/fornecedores/[id]/page.tsx
- [X] T021 [US3] Ensure detail page displays no purchase history, totals, rankings, metrics, contact fields, delete, remove, or inactivate actions in frontend/src/app/fornecedores/[id]/page.tsx
- [X] T022 [US3] Validate missing supplier ID behavior with a not-found state and list navigation in frontend/src/app/fornecedores/[id]/page.tsx

**Checkpoint**: User Story 3 is independently functional for existing and missing suppliers.

---

## Phase 6: User Story 4 - Editar fornecedor existente (Priority: P4)

**Goal**: Usuario edita nome de fornecedor existente, preservando preenchimento e atualizando lista/detalhe.

**Independent Test**: Abrir `/fornecedores/[id]/editar`, confirmar nome atual preenchido, validar erro para nome vazio, salvar novo nome e conferir lista/detalhe atualizados.

### Implementation for User Story 4

- [X] T023 [US4] Implement supplier edit page loading current supplier and passing initial nome to SupplierForm in frontend/src/app/fornecedores/[id]/editar/page.tsx
- [X] T024 [US4] Connect supplier edit page to useUpdateSupplier and send only payload { nome } in frontend/src/app/fornecedores/[id]/editar/page.tsx
- [X] T025 [US4] Handle loading, API error, success feedback, not-found states, and post-success navigation or visible refresh to updated supplier detail in frontend/src/app/fornecedores/[id]/editar/page.tsx
- [X] T026 [US4] Ensure cache invalidation refreshes supplier list and edited supplier detail through useUpdateSupplier in frontend/src/hooks/use-suppliers.ts

**Checkpoint**: User Story 4 completes the edit flow without changing unsupported fields.

---

## Phase 7: User Story 5 - Navegar para fornecedores pelo menu (Priority: P5)

**Goal**: Usuario encontra Fornecedores na navegacao principal e consegue retornar entre lista, detalhe, cadastro e edicao.

**Independent Test**: Abrir navegacao em smartphone, tablet e desktop, acionar Fornecedores e validar retorno entre telas sem perda de contexto.

### Implementation for User Story 5

- [X] T027 [P] [US5] Add fornecedores route key pointing to /fornecedores in frontend/src/config/routes.ts
- [X] T028 [US5] Add Fornecedores navigation item near operational cadastro entries using an existing lucide icon in frontend/src/config/navigation.ts
- [ ] T029 [US5] Ensure list, new, detail, and edit pages expose clear back/list navigation in frontend/src/app/fornecedores/page.tsx, frontend/src/app/fornecedores/novo/page.tsx, frontend/src/app/fornecedores/[id]/page.tsx, and frontend/src/app/fornecedores/[id]/editar/page.tsx

**Checkpoint**: User Story 5 makes the module discoverable and navigable across viewport sizes.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Validacao final, regressao e acabamento transversal.

- [ ] T030 [P] Validate Dark Only visual consistency and absence of unsupported supplier fields/actions across frontend/src/app/fornecedores and frontend/src/components/fornecedores
- [ ] T031 Validate Mobile First behavior at 390px smartphone, tablet, and desktop widths using scenarios in specs/009-gestao-fornecedores/quickstart.md
- [ ] T032 Validate timed success criteria from spec.md for locating supplier details within 30 seconds, creating within 2 minutes, and editing within 2 minutes using specs/009-gestao-fornecedores/quickstart.md
- [ ] T033 Run npm run lint in frontend and fix any issues in frontend/src/app/fornecedores, frontend/src/components/fornecedores, frontend/src/hooks/use-suppliers.ts, frontend/src/services/suppliers.ts, frontend/src/types/supplier.ts, frontend/src/config/routes.ts, and frontend/src/config/navigation.ts
- [ ] T034 Run npm run typecheck in frontend and fix any TypeScript issues in frontend/src/app/fornecedores, frontend/src/components/fornecedores, frontend/src/hooks/use-suppliers.ts, frontend/src/services/suppliers.ts, and frontend/src/types/supplier.ts
- [ ] T035 Run npm run build in frontend and fix any build issues in frontend/src/app/fornecedores and related supplier files
- [ ] T036 Validate regression that Produtos still loads supplier names through useSuppliers in frontend/src/app/produtos/page.tsx
- [ ] T037 Confirm no backend files, migrations, stock movement logic, purchase flow, sales flow, financial dashboard, analytics aggregation, or metrics behavior were changed for this frontend-only feature in src and frontend/src

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 Consultar fornecedores (P1)**: Starts after Foundation; MVP scope.
- **US2 Cadastrar fornecedor (P2)**: Starts after Foundation; benefits from US1 for list confirmation, but can be validated by API/list refresh after implementation.
- **US3 Consultar detalhes (P3)**: Starts after Foundation; uses SupplierActions links from US1 when available, but route can be opened directly.
- **US4 Editar fornecedor (P4)**: Starts after Foundation and is most useful after US3, because it loads and returns to detail.
- **US5 Navegar pelo menu (P5)**: Starts after routes exist; final navigation depends on pages from US1-US4.

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

- T003 can run while T001-T002 create folders.
- T007 can run after component directory exists and before page implementations.
- T009 and T014 can run in parallel after Foundation because they create different components.
- T019 can run in parallel with US2 form work after Foundation.
- T027 can run in parallel with earlier story work because it changes only routes configuration.
- T030 can run before command validation once all UI files exist.

## Parallel Example: User Story 1

```text
Task: "T009 [P] [US1] Create responsive SupplierTable for mobile cards and desktop table in frontend/src/components/fornecedores/supplier-table.tsx"
Task: "T007 [P] Create shared SupplierActions component without delete/inactivate/remove actions in frontend/src/components/fornecedores/supplier-actions.tsx"
```

## Parallel Example: Cross-Story Components

```text
Task: "T014 [P] [US2] Create SupplierFormFields with nome input, validation message slots, and disabled state in frontend/src/components/fornecedores/supplier-form-fields.tsx"
Task: "T027 [P] [US5] Add fornecedores route key pointing to /fornecedores in frontend/src/config/routes.ts"
```

## Parallel Example: User Story 5

```text
Task: "T027 [P] [US5] Add fornecedores route key pointing to /fornecedores in frontend/src/config/routes.ts"
Task: "T030 [P] Validate Dark Only visual consistency and absence of unsupported supplier fields/actions across frontend/src/app/fornecedores and frontend/src/components/fornecedores"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate `/fornecedores` list, search, loading, empty and error states.
4. Stop and demo the read-only supplier area before adding mutations.

### Incremental Delivery

1. US1 delivers supplier discovery and list.
2. US2 adds supplier creation.
3. US3 adds detail review.
4. US4 completes edit flow.
5. US5 makes the module fully discoverable in navigation.
6. Polish validates responsive behavior, prohibited actions/data, and build health.

### Notes

- [P] tasks touch different files or can be prepared without depending on incomplete story behavior.
- Every user story task includes exact file paths.
- Do not add tests unless a later request explicitly asks for automated tests/TDD.
- Do not add dependencies, backend changes, migrations, unsupported supplier fields, metrics, purchase history, delete, remove, or inactivate actions.
