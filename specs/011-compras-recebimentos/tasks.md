# Tasks: Compras e Recebimentos

**Input**: Design documents from `/specs/011-compras-recebimentos/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/compras-frontend.md`, `quickstart.md`

**Tests**: Automated tests were not explicitly requested for this feature. Validation tasks use the quickstart scenarios plus `npm run lint`, `npm run typecheck`, and `npm run build`.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and has no direct dependency on another task in the same phase
- **[Story]**: User story covered by the task
- Every task includes exact repository paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm existing context and prepare the frontend structure for compras.

- [X] T001 Review current placeholder and local frontend patterns in `frontend/src/app/compras/page.tsx`, `frontend/src/services/suppliers.ts`, `frontend/src/services/products.ts`, `frontend/src/hooks/use-suppliers.ts`, and `frontend/src/hooks/use-products.ts`
- [X] T002 [P] Review existing route and navigation conventions in `frontend/src/config/routes.ts` and `frontend/src/config/navigation.ts`
- [X] T003 [P] Review React Query conventions and existing query keys in `frontend/src/lib/query-client.ts`
- [X] T004 [P] Create the compras component directory planned for the feature under `frontend/src/components/compras/`
- [X] T005 Confirm the backend contract remains unchanged against `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs` before implementing frontend calls

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, service, hooks, routes, and validation shared by all stories.

**CRITICAL**: No user story work should start until this phase is complete.

- [X] T006 [P] Define purchase DTO, filter, draft, receipt, loss, and loss motive types in `frontend/src/types/purchase.ts`
- [X] T007 Implement all purchase API calls in `frontend/src/services/purchases.ts` for list, in-transit, pending products, detail, create, receipt, loss, receipt history, and loss history
- [X] T008 Implement purchase query keys, read queries, mutations, and cache invalidation in `frontend/src/hooks/use-purchases.ts`
- [X] T009 [P] Add shared purchase form/action validation helpers in `frontend/src/components/compras/purchase-validation.ts`
- [X] T010 Add `comprasNova` and `compraDetalhe` route helpers in `frontend/src/config/routes.ts`
- [X] T011 Update compras navigation readiness metadata in `frontend/src/config/navigation.ts`
- [X] T012 Validate constitution guardrails for frontend-only scope in `specs/011-compras-recebimentos/plan.md`

**Checkpoint**: Foundation ready. User story implementation can proceed.

---

## Phase 3: User Story 1 - Registrar compra em transito (Priority: P1) MVP

**Goal**: Operator can create a purchase with supplier, date, distinct products, quantities, costs, item adjustments, and purchase-level adjustments without generating stock.

**Independent Test**: Create a valid purchase from `/compras/nova` and verify it becomes trackable as in transit without showing stock entry or available balance.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create the purchase item editor UI with product selection, quantity, cost, item discount, item increase, duplicate product feedback, and remove item action in `frontend/src/components/compras/purchase-item-editor.tsx`
- [X] T014 [US1] Create the purchase form shell with supplier, date, total discount, total increase, item list, add item action, submit area, loading state, and error state in `frontend/src/components/compras/purchase-form.tsx`
- [X] T015 [US1] Integrate `useSuppliers` and `useProducts` into `frontend/src/components/compras/purchase-form.tsx` with loading, empty, error, and retry states for supporting data
- [X] T016 [US1] Wire local validation from `frontend/src/components/compras/purchase-validation.ts` into `frontend/src/components/compras/purchase-form.tsx` for required supplier/date/items, unique product, positive quantity, non-negative cost, and non-negative adjustments
- [X] T017 [US1] Wire `useCreatePurchase` submission in `frontend/src/components/compras/purchase-form.tsx`, preserving filled data on local or official rejection
- [X] T018 [US1] Add success handling in `frontend/src/components/compras/purchase-form.tsx` that navigates to the created purchase detail via `frontend/src/config/routes.ts`
- [X] T019 [US1] Create the `/compras/nova` route page with the purchase form and operational copy that creation is transit only, not stock entry, in `frontend/src/app/compras/nova/page.tsx`
- [X] T020 [US1] Validate the US1 quickstart scenarios for create success and create validation from `specs/011-compras-recebimentos/quickstart.md` against `frontend/src/app/compras/nova/page.tsx`, including SC-001 timing: valid purchase with up to 10 items in 5 minutes or less

**Checkpoint**: User Story 1 is independently functional and testable.

---

## Phase 4: User Story 2 - Acompanhar compras e pendencias (Priority: P2)

**Goal**: Operator can open compras, see recent in-transit or pending purchases, filter by period/supplier/status, view pending products, and open purchase detail.

**Independent Test**: Open `/compras`, apply and clear filters, view pending products, and open a purchase detail with enough operational information for action.

### Implementation for User Story 2

- [X] T021 [P] [US2] Create purchase filters with date range, supplier, status, apply, and clear controls in `frontend/src/components/compras/purchase-filters.tsx`
- [X] T022 [P] [US2] Create responsive purchase list cards/table with supplier, date, status, total, pending indicator, empty state, error state, and detail links in `frontend/src/components/compras/purchase-list.tsx`
- [X] T023 [P] [US2] Create pending products panel with product, supplier, purchase origin, pending quantity, loading, empty, error, and detail links in `frontend/src/components/compras/pending-products-panel.tsx`
- [X] T024 [P] [US2] Create purchase history presentation for receipts and losses in `frontend/src/components/compras/purchase-history.tsx`
- [X] T025 [US2] Create base purchase detail component with header, supplier/date/status/total, items, received/lost/pending quantities, and history areas in `frontend/src/components/compras/purchase-detail.tsx`
- [X] T026 [US2] Replace the compras placeholder with list, filters, default recent in-transit view, pending products panel, and new purchase action in `frontend/src/app/compras/page.tsx`
- [X] T027 [US2] Implement filter orchestration in `frontend/src/app/compras/page.tsx` using official date and supplier filters plus local status filtering when needed
- [X] T028 [US2] Apply the default 30-day in-transit or pending recency rule in `frontend/src/app/compras/page.tsx`
- [X] T029 [US2] Create the purchase detail route using `usePurchase`, `usePurchaseReceipts`, and `usePurchaseLosses` in `frontend/src/app/compras/[id]/page.tsx`
- [X] T030 [US2] Add not found, loading, empty, and recoverable error handling for purchase detail in `frontend/src/app/compras/[id]/page.tsx`
- [X] T031 [US2] Validate the US2 quickstart scenarios for default list, filters, pending products, and detail from `specs/011-compras-recebimentos/quickstart.md` against `frontend/src/app/compras/page.tsx` and `frontend/src/app/compras/[id]/page.tsx`, including SC-002 timing: locate recent in-transit or pending purchases in 30 seconds or less

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Registrar recebimento parcial (Priority: P3)

**Goal**: Operator can register a partial or total physical receipt for a pending purchase item after review and confirmation.

**Independent Test**: From a purchase detail, register a valid receipt quantity less than or equal to the pending quantity and verify detail, pending list, and history update.

### Implementation for User Story 3

- [X] T032 [P] [US3] Create receipt dialog with quantity, receipt date, observation, review step, confirm action, loading state, and error state in `frontend/src/components/compras/receipt-dialog.tsx`
- [X] T033 [US3] Add local receipt validation for positive quantity and visible pending quantity limit in `frontend/src/components/compras/purchase-validation.ts`
- [X] T034 [US3] Wire `useRegisterPurchaseReceipt` into `frontend/src/components/compras/receipt-dialog.tsx`, showing official errors without marking the action complete
- [X] T035 [US3] Integrate receipt actions for pending items in `frontend/src/components/compras/purchase-detail.tsx`
- [X] T036 [US3] Ensure receipt success refreshes detail, histories, in-transit list, pending products, and `queryKeys.estoque` when present through `frontend/src/hooks/use-purchases.ts`
- [X] T037 [US3] Validate the US3 quickstart scenarios for partial receipt and receipt failure from `specs/011-compras-recebimentos/quickstart.md` against `frontend/src/components/compras/receipt-dialog.tsx`, including SC-003 timing: register a partial receipt within 1 minute after opening purchase detail

**Checkpoint**: User Stories 1, 2, and 3 work independently.

---

## Phase 6: User Story 4 - Registrar perda, extravio ou avaria (Priority: P4)

**Goal**: Operator can register loss, extravio, or avaria for a pending item after review and confirmation without showing stock entry.

**Independent Test**: From a purchase detail, register a valid loss with one allowed motive and verify pending quantity and loss history update without any stock entry message.

### Implementation for User Story 4

- [ ] T038 [P] [US4] Create loss dialog with quantity, closed motive selection, loss date, observation, review step, confirm action, loading state, and error state in `frontend/src/components/compras/loss-dialog.tsx`
- [ ] T039 [US4] Add local loss validation for positive quantity, visible pending quantity limit, and allowed motives `Perda`, `Extravio`, and `Avaria` in `frontend/src/components/compras/purchase-validation.ts`
- [ ] T040 [US4] Wire `useRegisterPurchaseLoss` into `frontend/src/components/compras/loss-dialog.tsx`, showing official errors without marking the action complete
- [ ] T041 [US4] Integrate loss actions for pending items in `frontend/src/components/compras/purchase-detail.tsx`
- [ ] T042 [US4] Ensure loss success refreshes detail, histories, in-transit list, and pending products without presenting stock entry through `frontend/src/hooks/use-purchases.ts`
- [ ] T043 [US4] Validate the US4 quickstart scenarios for loss success and loss validation from `specs/011-compras-recebimentos/quickstart.md` against `frontend/src/components/compras/loss-dialog.tsx`, including SC-004 timing: register loss, extravio, or avaria within 1 minute after opening purchase detail

**Checkpoint**: User Stories 1, 2, 3, and 4 work independently.

---

## Phase 7: User Story 5 - Usar compras no celular, tablet e desktop (Priority: P5)

**Goal**: All purchase list, create, detail, receipt, and loss flows remain usable on smartphone, tablet, and desktop.

**Independent Test**: Run the main flows at approximately 390px, tablet, and desktop widths without overlapped text, inaccessible buttons, or hidden primary actions.

### Implementation for User Story 5

- [ ] T044 [US5] Adjust responsive layout for list, filters, and pending products in `frontend/src/app/compras/page.tsx`
- [ ] T045 [US5] Adjust responsive layout for the purchase form and item editor in `frontend/src/components/compras/purchase-form.tsx` and `frontend/src/components/compras/purchase-item-editor.tsx`
- [ ] T046 [US5] Adjust responsive layout for detail, item actions, and history in `frontend/src/components/compras/purchase-detail.tsx` and `frontend/src/components/compras/purchase-history.tsx`
- [ ] T047 [US5] Adjust responsive layout and focus states for receipt and loss review dialogs in `frontend/src/components/compras/receipt-dialog.tsx` and `frontend/src/components/compras/loss-dialog.tsx`
- [ ] T048 [US5] Validate the US5 quickstart responsive scenario from `specs/011-compras-recebimentos/quickstart.md` against `/compras`, `/compras/nova`, and `/compras/[id]`

**Checkpoint**: All user stories are functionally complete and responsive.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Verify guardrails, regressions, and build quality across the complete feature.

- [ ] T049 Verify the feature does not expose cancellation, edit purchase, stock adjustment, transfer, or mass import actions in `frontend/src/app/compras/page.tsx`, `frontend/src/app/compras/nova/page.tsx`, and `frontend/src/app/compras/[id]/page.tsx`
- [ ] T050 Verify the frontend does not calculate critical stock, average cost, profit, rankings, dashboards, or financial metrics in `frontend/src/components/compras/`, `frontend/src/hooks/use-purchases.ts`, and `frontend/src/services/purchases.ts`
- [ ] T051 Verify official backend error messages are surfaced with clear fallbacks across `frontend/src/services/purchases.ts`, `frontend/src/hooks/use-purchases.ts`, and `frontend/src/components/compras/`
- [ ] T052 Run `npm run lint` in `frontend/` and fix any issues in `frontend/src/app/compras/`, `frontend/src/components/compras/`, `frontend/src/hooks/use-purchases.ts`, `frontend/src/services/purchases.ts`, and `frontend/src/types/purchase.ts`
- [ ] T053 Run `npm run typecheck` in `frontend/` and fix any type issues in `frontend/src/app/compras/`, `frontend/src/components/compras/`, `frontend/src/hooks/use-purchases.ts`, `frontend/src/services/purchases.ts`, and `frontend/src/types/purchase.ts`
- [ ] T054 Run `npm run build` in `frontend/` and fix any build issues in `frontend/src/app/compras/`, `frontend/src/components/compras/`, `frontend/src/hooks/use-purchases.ts`, `frontend/src/services/purchases.ts`, and `frontend/src/types/purchase.ts`
- [ ] T055 Validate existing `/fornecedores` and `/produtos` pages still load through their hooks after compras query keys and routes change in `frontend/src/hooks/use-suppliers.ts`, `frontend/src/hooks/use-products.ts`, and `frontend/src/config/routes.ts`
- [ ] T056 Update completion evidence in `specs/011-compras-recebimentos/quickstart.md` only if implementation validation reveals necessary corrections to the documented manual scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Phase 1 and blocks all user stories.
- **Phase 3 US1**: Depends on Phase 2 and provides the MVP.
- **Phase 4 US2**: Depends on Phase 2; benefits from US1 for created purchase data but remains testable with existing purchases.
- **Phase 5 US3**: Depends on Phase 2 and needs a purchase with pending item from US1 or existing data.
- **Phase 6 US4**: Depends on Phase 2 and needs a purchase with pending item from US1 or existing data.
- **Phase 7 US5**: Depends on the target story screens/components being present.
- **Phase 8 Polish**: Depends on the selected stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start after foundational tasks. Delivers the MVP purchase creation flow.
- **US2 (P2)**: Can start after foundational tasks. Uses the same hooks/services and can be implemented alongside US1 after the base contracts exist.
- **US3 (P3)**: Can start after foundational tasks and base detail surface exists.
- **US4 (P4)**: Can start after foundational tasks and base detail surface exists.
- **US5 (P5)**: Final responsive pass after screens and dialogs exist.

### Within Each User Story

- Shared types before services and hooks.
- Services before hooks that call them.
- Hooks before route pages and components that submit mutations.
- Validation helpers before final form/dialog wiring.
- Story validation before moving to the next priority checkpoint.

## Parallel Opportunities

- T002, T003, T004, and T005 can be done in parallel after T001 starts.
- T006 and T009 can be done in parallel because they touch different files.
- T013 can be done in parallel with T014 once shared types are available, then integrated by T016.
- T021, T022, T023, and T024 can be done in parallel before T026 and T029 integrate them.
- T032 and T038 can be done in parallel after the detail component has stable item action props.
- T044 through T047 can be split by screen/component after all core flows exist.
- T052, T053, and T054 should run sequentially, but fixes can be scoped by file groups.

## Parallel Example: User Story 2

```text
Task: "Create purchase filters with date range, supplier, status, apply, and clear controls in frontend/src/components/compras/purchase-filters.tsx"
Task: "Create responsive purchase list cards/table with supplier, date, status, total, pending indicator, empty state, error state, and detail links in frontend/src/components/compras/purchase-list.tsx"
Task: "Create pending products panel with product, supplier, purchase origin, pending quantity, loading, empty, error, and detail links in frontend/src/components/compras/pending-products-panel.tsx"
Task: "Create purchase history presentation for receipts and losses in frontend/src/components/compras/purchase-history.tsx"
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for US1.
3. Validate purchase creation independently.
4. Continue with US2, US3, US4, and US5 in priority order.

### Incremental Delivery

1. US1 delivers purchase creation in transit.
2. US2 adds operational visibility and detail.
3. US3 adds physical receipt.
4. US4 adds losses without stock entry.
5. US5 hardens responsive operation.

## Notes

- Keep implementation frontend-only unless a later approved feature changes the backend contract.
- Do not add mocks for suppliers, products, purchases, receipts, or losses.
- Do not add cancellation, edit purchase, automatic stock entry on creation, manual stock adjustment, transfer, mass import, analytics, or dashboard behavior.
- Keep official quantity, pending balance, stock entry, and loss acceptance rules in the backend.
- Preserve Dark Only, Mobile First, and existing Design System conventions.
