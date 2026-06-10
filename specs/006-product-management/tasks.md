# Tasks: Gestao de Produtos no Frontend

**Input**: Design documents from `/specs/006-product-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Automated tests were not explicitly requested. This task list focuses on implementation plus required validation through lint, typecheck, build, and manual responsive/API checks from quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the existing frontend foundation and create the module folders without changing backend scope.

- [X] T001 Review existing frontend scripts and dependencies in frontend/package.json
- [X] T002 Review existing API client and QueryClient conventions in frontend/src/services/api-client.ts and frontend/src/lib/query-client.ts
- [X] T003 [P] Review reusable UI/state components in frontend/src/components/ui and frontend/src/components/states
- [X] T004 [P] Review current Produtos placeholder route in frontend/src/app/produtos/page.tsx
- [X] T005 Create Produtos module directories in frontend/src/components/produtos and frontend/src/app/produtos/[id]/editar

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared product contracts, services, and query hooks that every user story depends on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 [P] Define Product and ProductPayload types in frontend/src/types/product.ts
- [X] T007 [P] Define Category type in frontend/src/types/category.ts
- [X] T008 [P] Define Supplier type in frontend/src/types/supplier.ts
- [X] T009 Implement productsService list/getById/create/update methods in frontend/src/services/products.ts
- [X] T010 [P] Implement categoriesService list method in frontend/src/services/categories.ts
- [X] T011 [P] Implement suppliersService list method in frontend/src/services/suppliers.ts
- [X] T012 Implement product query and mutation hooks in frontend/src/hooks/use-products.ts
- [X] T013 [P] Implement category query hook in frontend/src/hooks/use-categories.ts
- [X] T014 [P] Implement supplier query hook in frontend/src/hooks/use-suppliers.ts
- [X] T015 Verify no delete, inactivation, stock, profit, average cost, dashboard, category CRUD, or supplier CRUD API functions exist in frontend/src/services/products.ts, frontend/src/services/categories.ts, and frontend/src/services/suppliers.ts
- [X] T016 Validate constitution gates for Feature 006 in specs/006-product-management/plan.md

**Checkpoint**: Foundation ready - user story implementation can now begin in priority order or in parallel if staffed.

---

## Phase 3: User Story 1 - Consultar catalogo de produtos (Priority: P1) MVP

**Goal**: Users can open `/produtos`, see real products from the API, search by name, and navigate to product details or editing without mock data.

**Independent Test**: Access `/produtos` with backend products available, confirm real rows appear, search filters the visible list, empty/error/loading states work, and each product exposes only details/edit actions.

### Implementation for User Story 1

- [X] T017 [P] [US1] Create product action buttons without delete/inactivation in frontend/src/components/produtos/product-actions.tsx
- [X] T018 [P] [US1] Create responsive product table/list component in frontend/src/components/produtos/product-table.tsx
- [X] T019 [US1] Replace Produtos placeholder with real list, search, loading, error, empty, and actions in frontend/src/app/produtos/page.tsx
- [X] T020 [US1] Resolve category and supplier display names from support lists in frontend/src/app/produtos/page.tsx
- [X] T021 [US1] Ensure `/produtos` renders no mocked values and no remove/inactivate controls in frontend/src/app/produtos/page.tsx and frontend/src/components/produtos/product-actions.tsx

**Checkpoint**: User Story 1 is independently functional and testable as the MVP.

---

## Phase 4: User Story 2 - Cadastrar produto (Priority: P2)

**Goal**: Users can create a product with name, sale price, cost, required category, and optional supplier using real category and supplier lists.

**Independent Test**: Access `/produtos/novo`, fill valid data, save, confirm success feedback and that the created product becomes visible in the product list; also confirm validation blocks missing/invalid values.

### Implementation for User Story 2

- [X] T022 [P] [US2] Create reusable product form fields with validation messages in frontend/src/components/produtos/product-form-fields.tsx
- [X] T023 [US2] Create product form component for create mode with controlled state and submit handling in frontend/src/components/produtos/product-form.tsx
- [X] T024 [US2] Implement create product route with PageHeader, support-list loading/error states, and ProductForm in frontend/src/app/produtos/novo/page.tsx
- [X] T025 [US2] Wire create mutation success handling, query invalidation, and navigation feedback in frontend/src/app/produtos/novo/page.tsx
- [X] T026 [US2] Handle empty categories as a blocking dependency and empty suppliers as optional in frontend/src/app/produtos/novo/page.tsx
- [X] T027 [US2] Ensure create payload sends only nome, precoVenda, custo, categoriaId, and nullable fornecedorId in frontend/src/components/produtos/product-form.tsx

**Checkpoint**: User Stories 1 and 2 work independently without category/supplier CRUD.

---

## Phase 5: User Story 3 - Consultar detalhes de produto (Priority: P3)

**Goal**: Users can open a product detail page and review the real product fields without frontend business calculations.

**Independent Test**: Open `/produtos/[id]` for an existing product, confirm fields are displayed with category/supplier names when available, and confirm missing products show a not-found state.

### Implementation for User Story 3

- [X] T028 [P] [US3] Create product details display component in frontend/src/components/produtos/product-details.tsx
- [X] T029 [US3] Implement product detail route with loading, error, not-found, and edit navigation in frontend/src/app/produtos/[id]/page.tsx
- [X] T030 [US3] Resolve category and supplier display names for details in frontend/src/app/produtos/[id]/page.tsx
- [X] T031 [US3] Ensure product details do not display stock, profit, average cost, dashboard metrics, status, image, or history in frontend/src/components/produtos/product-details.tsx

**Checkpoint**: User Story 3 works independently after foundational hooks and can be reached from `/produtos`.

---

## Phase 6: User Story 4 - Editar produto existente (Priority: P4)

**Goal**: Users can edit an existing product, with the form prefilled from the API and saved through the real update endpoint.

**Independent Test**: Open `/produtos/[id]/editar`, confirm current values are prefilled, update allowed fields, save, and verify list/details reflect the changed product; invalid values preserve form state and show errors.

### Implementation for User Story 4

- [X] T032 [US4] Extend ProductForm to support edit mode and initial values in frontend/src/components/produtos/product-form.tsx
- [X] T033 [US4] Implement edit product route with product/support-list loading, error, and not-found states in frontend/src/app/produtos/[id]/editar/page.tsx
- [X] T034 [US4] Wire update mutation, success feedback, query invalidation, and post-save navigation in frontend/src/app/produtos/[id]/editar/page.tsx
- [X] T035 [US4] Preserve entered form values and display backend rejection messages on update failure in frontend/src/components/produtos/product-form.tsx
- [X] T036 [US4] Ensure edit payload sends only nome, precoVenda, custo, categoriaId, and nullable fornecedorId in frontend/src/components/produtos/product-form.tsx

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the full feature, responsive behavior, and constitutional exclusions.

- [X] T037 Review all Produtos routes for Dark Only, Mobile First layout, touch targets, and no overlapping text in frontend/src/app/produtos
- [X] T038 Review user-facing labels, empty states, loading states, and error messages across frontend/src/app/produtos and frontend/src/components/produtos
- [X] T039 Run quickstart scenarios for product list, create, details, edit, not found, API failure, SC-001/SC-002/SC-003 timing targets, and responsive review from specs/006-product-management/quickstart.md
- [X] T040 Run npm run lint in frontend/package.json
- [X] T041 Run npm run typecheck in frontend/package.json
- [X] T042 Run npm run build in frontend/package.json
- [X] T043 Verify no mocked product/category/supplier data, delete/inactivation UI, category CRUD, supplier CRUD, stock, profit, average cost, dashboard, or indicator calculation remains in frontend/src

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational completion - MVP.
- **User Story 2 (Phase 4)**: Depends on Foundational completion; benefits from US1 for seeing created product in the list.
- **User Story 3 (Phase 5)**: Depends on Foundational completion; can be reached from US1 actions.
- **User Story 4 (Phase 6)**: Depends on Foundational completion; benefits from US3 navigation and ProductForm from US2.
- **Polish (Phase 7)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 - Consultar catalogo de produtos**: Can start after Foundational; recommended MVP.
- **US2 - Cadastrar produto**: Can start after Foundational; uses shared form components and create mutation.
- **US3 - Consultar detalhes de produto**: Can start after Foundational; uses product detail query and support-list queries.
- **US4 - Editar produto existente**: Should start after US2 form component exists; uses update mutation and detail query.

### Parallel Opportunities

- T003 and T004 can run in parallel during setup.
- T006, T007, and T008 can run in parallel because they create separate type files.
- T010 and T011 can run in parallel because they create separate service files.
- T013 and T014 can run in parallel because they create separate hook files.
- T017 and T018 can run in parallel inside US1.
- T028 can run in parallel with route preparation for US3 after foundational hooks exist.
- Final validation tasks T040, T041, and T042 must run after implementation, but their command execution is independent.

---

## Parallel Example: User Story 1

```text
Task: "T017 [P] [US1] Create product action buttons without delete/inactivation in frontend/src/components/produtos/product-actions.tsx"
Task: "T018 [P] [US1] Create responsive product table/list component in frontend/src/components/produtos/product-table.tsx"
```

## Parallel Example: Foundational Types

```text
Task: "T006 [P] Define Product and ProductPayload types in frontend/src/types/product.ts"
Task: "T007 [P] Define Category type in frontend/src/types/category.ts"
Task: "T008 [P] Define Supplier type in frontend/src/types/supplier.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate `/produtos` independently with real API data.

### Incremental Delivery

1. Add US1 list/search/actions and validate MVP.
2. Add US2 create product and validate the new product appears in US1.
3. Add US3 details and validate details from US1 actions.
4. Add US4 edit and validate updated data appears in US1 and US3.
5. Run Phase 7 validation before implementation is considered complete.

### Scope Guardrails

- Do not implement delete or inactivation.
- Do not implement category or supplier CRUD.
- Do not implement stock, dashboard, profit, average cost, rankings, alerts, or indicators.
- Do not add frontend business rules beyond basic form feedback.
- Do not introduce new dependencies unless a later approved plan update justifies them.

## Notes

- Every task uses exact repository-relative file paths.
- [P] tasks touch different files and do not depend on incomplete tasks.
- [US1], [US2], [US3], and [US4] map to the prioritized user stories in spec.md.
- Commit after each task or logical group if using the optional git hook workflow.
