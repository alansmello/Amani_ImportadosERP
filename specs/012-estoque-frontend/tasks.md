# Tasks: Estoque Frontend

**Input**: Design documents from `/specs/012-estoque-frontend/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/estoque-frontend.md, quickstart.md

**Tests**: No automated test tasks were requested in the specification. Validation is covered by `quickstart.md`, `npm run lint`, `npm run typecheck`, and `npm run build`.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- All tasks include exact file paths

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the shared module skeleton and route helpers used by all stories.

- [ ] T001 Create Estoque component directory in frontend/src/components/estoque/
- [ ] T002 [P] Create stock type module skeleton in frontend/src/types/stock.ts
- [ ] T003 [P] Create stock service module skeleton in frontend/src/services/stock.ts
- [ ] T004 [P] Create stock query hook module skeleton in frontend/src/hooks/use-stock.ts
- [ ] T005 Add `estoqueDetalhe(produtoId: string)` route helper in frontend/src/config/routes.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define contracts, service calls, query keys, and shared formatting before user-facing stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Define `StockProduct`, `StockListFilters`, `StockMovementType`, `StockMovement`, `StockMovementFilters`, and `StockMovementHistory` in frontend/src/types/stock.ts
- [ ] T007 Implement query string builders for stock list and product movement filters in frontend/src/services/stock.ts
- [ ] T008 Implement `stockService.list(filters)` and `stockService.getMovements(produtoId, filters)` using `apiClient` in frontend/src/services/stock.ts
- [ ] T009 Implement `stockQueryKeys`, `useStockProducts(filters)`, and `useStockMovements(produtoId, filters)` in frontend/src/hooks/use-stock.ts
- [ ] T010 [P] Create number, date, movement type, movement origin, and stock status formatters in frontend/src/components/estoque/stock-formatters.ts
- [ ] T011 Validate constitution gates for F012 in specs/012-estoque-frontend/plan.md: stock by movements, purchases in transit, item-level receipts, losses without stock, backend-owned rules, analytics limits, Mobile First, operational UX, Dark Only, and simplicity

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Consultar saldos atuais (Priority: P1) MVP

**Goal**: `/estoque` shows all products returned by the official stock source, including zero balance, with official balances and no placeholder.

**Independent Test**: Open `/estoque` with products available and verify all official products appear, including zero balance, with loading/error/empty states and no local stock calculation.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Create stock summary component for total products, positive balances, zero balances, and negative balances from already returned values in frontend/src/components/estoque/stock-summary.tsx
- [ ] T013 [P] [US1] Create stock list component that renders product identity, official balance, zero balance, and negative balance highlighting in frontend/src/components/estoque/stock-list.tsx
- [ ] T014 [P] [US1] Create basic stock filters component with disabled search and "com saldo" controls reserved for US2 in frontend/src/components/estoque/stock-filters.tsx
- [ ] T015 [US1] Replace Estoque placeholder with client page loading `useStockProducts({})` in frontend/src/app/estoque/page.tsx
- [ ] T016 [US1] Integrate loading, error, retry, and empty states for the stock list in frontend/src/app/estoque/page.tsx
- [ ] T017 [US1] Wire each product row to `estoqueDetalhe(produtoId)` without adding movement editing actions in frontend/src/components/estoque/stock-list.tsx

**Checkpoint**: User Story 1 is independently functional and validates the MVP scope.

---

## Phase 4: User Story 2 - Buscar e filtrar estoque (Priority: P2)

**Goal**: Users can search products and filter the list to focus on products with available balance, then clear filters back to the default all-products view.

**Independent Test**: Enter a search term, activate the "com saldo" filter, confirm zero-balance products are hidden while active, and clear filters to restore the default list.

### Implementation for User Story 2

- [ ] T018 [P] [US2] Implement controlled search input, "com saldo" toggle, active filter count, and clear action in frontend/src/components/estoque/stock-filters.tsx
- [ ] T019 [US2] Add local filter state for `busca` and `somenteComSaldo` in frontend/src/app/estoque/page.tsx
- [ ] T020 [US2] Apply search by product name, code, or equivalent identity and apply "com saldo" filtering without changing official balances in frontend/src/app/estoque/page.tsx
- [ ] T021 [US2] Add filtered empty state that preserves the search term and offers clear filters in frontend/src/app/estoque/page.tsx
- [ ] T022 [US2] Ensure stock summary reflects the currently displayed list while preserving original official balance values in frontend/src/components/estoque/stock-summary.tsx

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Auditar movimentacoes por produto (Priority: P3)

**Goal**: Users can open a product detail page and audit official movement history with type, quantity, date, origin, period filter, type filter, empty state, limited-list signal, and no editing actions.

**Independent Test**: Open `/estoque/[produtoId]`, verify official balance and movement rows, filter by period and type, clear filters, and confirm empty or limited history states are clear.

### Implementation for User Story 3

- [ ] T023 [P] [US3] Create movement filters component with period fields, type select, apply, and clear actions in frontend/src/components/estoque/stock-movement-filters.tsx
- [ ] T024 [P] [US3] Create movement list component showing type, quantity, date, origin, optional reference, optional unit value, and limited-list notice in frontend/src/components/estoque/stock-movement-list.tsx
- [ ] T025 [P] [US3] Create movement detail header component showing product identity and official current balance in frontend/src/components/estoque/stock-movement-detail.tsx
- [ ] T026 [US3] Create product stock detail route using `useStockMovements(produtoId, filters)` and `useProducts()` in frontend/src/app/estoque/[produtoId]/page.tsx
- [ ] T027 [US3] Add period/type filter state and refetch behavior for movement history in frontend/src/app/estoque/[produtoId]/page.tsx
- [ ] T028 [US3] Add loading, error, retry, not-found, empty-history, and limited-history states in frontend/src/app/estoque/[produtoId]/page.tsx
- [ ] T029 [US3] Ensure the detail page contains no create, edit, delete, adjustment, transfer, or minimum-stock alert controls in frontend/src/app/estoque/[produtoId]/page.tsx

**Checkpoint**: User Story 3 works independently after foundation and validates stock traceability.

---

## Phase 6: User Story 4 - Acompanhar pendencias de recebimento (Priority: P4)

**Goal**: Users can view pending receipt items in Estoque, understand they are not available stock, and open the purchase detail of origin.

**Independent Test**: Open the pending receipt view in `/estoque`, verify product, supplier, purchase origin, pending quantity, non-available-stock wording, and navigation to the purchase detail.

### Implementation for User Story 4

- [ ] T030 [P] [US4] Create pending receipts panel for Estoque using `PendingPurchaseProduct`, product catalog, suppliers, and `compraDetalhe(compraId)` in frontend/src/components/estoque/pending-receipts-panel.tsx
- [ ] T031 [US4] Integrate `usePendingPurchaseProducts()`, `useProducts()`, and `useSuppliers()` data into the pending receipts panel without blocking the already loaded stock list in frontend/src/app/estoque/page.tsx
- [ ] T032 [US4] Add pending receipts loading, error, retry, and empty states that do not block already loaded stock balances in frontend/src/app/estoque/page.tsx
- [ ] T033 [US4] Ensure pending quantities are labelled as aguardando recebimento and are never summed into `saldoAtual` in frontend/src/components/estoque/pending-receipts-panel.tsx
- [ ] T034 [US4] Validate the pending receipt action opens the existing purchase detail route via `compraDetalhe(compraId)` in frontend/src/components/estoque/pending-receipts-panel.tsx

**Checkpoint**: User Story 4 works independently and keeps receipt/loss actions in Compras.

---

## Phase 7: User Story 5 - Usar estoque em telas pequenas e grandes (Priority: P5)

**Goal**: The stock list, filters, movement detail, and pending receipts are usable on smartphone, tablet, and desktop without overlap or inaccessible actions.

**Independent Test**: Run the quickstart scenarios at approximately 390px width, tablet width, and desktop width; verify readability, tap targets, wrapping, and no content overlap.

### Implementation for User Story 5

- [ ] T035 [US5] Apply responsive layout for summary, filters, stock list, and pending receipts in frontend/src/app/estoque/page.tsx
- [ ] T036 [US5] Apply responsive layout for product detail, movement filters, and movement list in frontend/src/app/estoque/[produtoId]/page.tsx
- [ ] T037 [US5] Audit text wrapping, stable control dimensions, and mobile tap targets in frontend/src/components/estoque/stock-list.tsx
- [ ] T038 [US5] Audit text wrapping, stable control dimensions, and mobile tap targets in frontend/src/components/estoque/stock-movement-list.tsx
- [ ] T039 [US5] Audit text wrapping, stable control dimensions, and mobile tap targets in frontend/src/components/estoque/pending-receipts-panel.tsx

**Checkpoint**: User Story 5 validates the module against Mobile First requirements.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, navigation status, validation, and regression checks across stories.

- [ ] T040 Update Estoque navigation status from placeholder to ready in frontend/src/config/navigation.ts
- [ ] T041 [P] Review `/estoque` copy for Dark Only operational tone and absence of feature-explainer prose in frontend/src/app/estoque/page.tsx
- [ ] T042 [P] Review `/estoque/[produtoId]` copy for Dark Only operational tone and absence of feature-explainer prose in frontend/src/app/estoque/[produtoId]/page.tsx
- [ ] T043 Verify no task introduced local stock, cost, profit, dashboard metric, pending quantity, or average cost calculation in frontend/src/app/estoque/page.tsx, frontend/src/app/estoque/[produtoId]/page.tsx, frontend/src/hooks/use-stock.ts, and frontend/src/services/stock.ts
- [ ] T044 Run `npm run lint` in frontend/
- [ ] T045 Run `npm run typecheck` in frontend/
- [ ] T046 Run `npm run build` in frontend/
- [ ] T047 Confirm a validation dataset with at least 100 products is available before running search/filter timing checks in specs/012-estoque-frontend/quickstart.md
- [ ] T048 Execute quickstart validation scenarios from specs/012-estoque-frontend/quickstart.md for stock list, filters, negative balance, movement detail, pending receipts, errors, and Mobile First layouts
- [ ] T049 Run regression check that `/compras` still displays pending products and receipt/loss actions remain only in the Compras flow in frontend/src/app/compras/page.tsx and frontend/src/app/compras/[id]/page.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependency on other stories.
- **User Story 2 (P2)**: Depends on US1 list page and list components.
- **User Story 3 (P3)**: Can start after Foundational, but benefits from US1 route helper and list navigation.
- **User Story 4 (P4)**: Can start after Foundational, integrates into the US1 page layout.
- **User Story 5 (P5)**: Depends on UI from US1-US4 being present.

### Within Each User Story

- Shared types before services.
- Services before hooks.
- Hooks before pages.
- Components can be built in parallel when they use finalized types.
- Page integration after story-specific components exist.
- Validation after each story checkpoint.

---

## Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001.
- T010 can run in parallel with T007-T009.
- US1 components T012, T013, and T014 can run in parallel.
- US3 components T023, T024, and T025 can run in parallel.
- T041 and T042 can run in parallel during polish.
- Different developers can work on US3 and US4 in parallel after Foundation if page integration conflicts are coordinated.

---

## Parallel Example: User Story 1

```text
Task: "T012 [P] [US1] Create stock summary component in frontend/src/components/estoque/stock-summary.tsx"
Task: "T013 [P] [US1] Create stock list component in frontend/src/components/estoque/stock-list.tsx"
Task: "T014 [P] [US1] Create basic stock filters component in frontend/src/components/estoque/stock-filters.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T023 [P] [US3] Create movement filters component in frontend/src/components/estoque/stock-movement-filters.tsx"
Task: "T024 [P] [US3] Create movement list component in frontend/src/components/estoque/stock-movement-list.tsx"
Task: "T025 [P] [US3] Create movement detail header component in frontend/src/components/estoque/stock-movement-detail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate `/estoque` list with all products, official balances, zero balance, negative balance highlight, loading, error, and empty states.

### Incremental Delivery

1. Add US1 for official stock list MVP.
2. Add US2 for search and filtering.
3. Add US3 for movement history audit.
4. Add US4 for pending receipt visibility and purchase navigation.
5. Add US5 for full responsive validation.
6. Run final lint, typecheck, build, quickstart, and Compras regression checks.

### Parallel Team Strategy

1. Complete Setup and Foundation together.
2. Work in parallel on independent components for US1 and US3.
3. Integrate page-level work sequentially to avoid conflicts in `frontend/src/app/estoque/page.tsx`.
4. Finish with shared responsiveness and validation tasks.

---

## Notes

- [P] tasks are parallelizable because they touch separate files or independent components.
- Story labels map directly to priorities in `spec.md`.
- Estoque remains read-only throughout the task list.
- Do not add backend, migration, dependency, manual stock adjustment, stock transfer, minimum-stock alert, movement edit, movement delete, or local stock calculation.
