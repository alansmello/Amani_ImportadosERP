# Tasks: Gestao de Clientes no Frontend

**Input**: Design documents from `/specs/007-gestao-clientes/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/customer-management-contract.md, quickstart.md

**Tests**: Automated tests were not explicitly requested. Validation tasks focus on lint, typecheck, build, and manual quickstart scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare customer module files and shared frontend contracts without changing behavior yet.

- [X] T001 Create customer route directories and placeholder route files in `frontend/src/app/clientes/novo/page.tsx`, `frontend/src/app/clientes/[id]/page.tsx`, and `frontend/src/app/clientes/[id]/editar/page.tsx`
- [X] T002 Create customer component directory and placeholder component files in `frontend/src/components/clientes/customer-actions.tsx`, `frontend/src/components/clientes/customer-details.tsx`, `frontend/src/components/clientes/customer-form.tsx`, `frontend/src/components/clientes/customer-form-fields.tsx`, `frontend/src/components/clientes/customer-inactivate-dialog.tsx`, and `frontend/src/components/clientes/customer-table.tsx`
- [X] T003 [P] Create frontend customer types in `frontend/src/types/customer.ts`
- [X] T004 [P] Create customer service shell in `frontend/src/services/customers.ts`
- [X] T005 [P] Create customer query hook shell in `frontend/src/hooks/use-customers.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement typed API access and reusable customer primitives required by all user stories.

**CRITICAL**: No user story page should be considered complete until this phase is complete.

- [X] T006 Implement `Customer`, `CustomerPayload`, and `CustomerStatusFilter` types in `frontend/src/types/customer.ts`
- [X] T007 Implement `customersService.list`, `getById`, `create`, `update`, and `inactivate` using `/api/clientes` in `frontend/src/services/customers.ts`
- [X] T008 Implement `customerQueryKeys`, `useCustomers`, `useCustomer`, `useCreateCustomer`, `useUpdateCustomer`, and `useInactivateCustomer` in `frontend/src/hooks/use-customers.ts`
- [X] T009 Implement shared active/inactive status badge rendering helper or inline component support in `frontend/src/components/clientes/customer-details.tsx`
- [X] T010 Validate constitution guardrails for this frontend-only feature in `specs/007-gestao-clientes/tasks.md`: no stock, sales, finance, dashboards, rankings, document field, or definitive customer deletion tasks are introduced

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Consultar carteira de clientes (Priority: P1) MVP

**Goal**: Users can open `/clientes`, see real active customers by default, filter status, search locally, and open customer actions from a responsive list.

**Independent Test**: Access `/clientes` with existing customers, verify active customers appear by default, search filters by name/email/phone, status filter can show active/inactive/all, empty/error/loading states render, and no mock data appears.

### Implementation for User Story 1

- [X] T011 [P] [US1] Implement responsive customer table/cards with name, email, phone, status, and action slot in `frontend/src/components/clientes/customer-table.tsx`
- [X] T012 [P] [US1] Implement basic customer actions for details and edit links in `frontend/src/components/clientes/customer-actions.tsx`
- [X] T013 [US1] Replace the clientes placeholder with customer list page state, status filter, search input, loading, error, empty, and no-results states in `frontend/src/app/clientes/page.tsx`
- [X] T014 [US1] Wire `useCustomers` refetch and status filter behavior into `frontend/src/app/clientes/page.tsx`
- [ ] T015 [US1] Verify `/clientes` responsive behavior manually against quickstart scenarios in `specs/007-gestao-clientes/quickstart.md`

**Checkpoint**: User Story 1 is fully functional and testable independently as the MVP.

---

## Phase 4: User Story 2 - Cadastrar cliente (Priority: P2)

**Goal**: Users can create a customer with required name and optional email/phone using the same form pattern as Products.

**Independent Test**: Open `/clientes/novo`, submit empty name to see validation, submit valid customer, and confirm the created customer is visible afterward.

### Implementation for User Story 2

- [X] T016 [P] [US2] Implement controlled name, email, and phone fields with validation messages in `frontend/src/components/clientes/customer-form-fields.tsx`
- [X] T017 [US2] Implement create/edit reusable customer form shell with submit error and success feedback in `frontend/src/components/clientes/customer-form.tsx`
- [X] T018 [US2] Implement `/clientes/novo` create page using `CustomerForm` and `useCreateCustomer` in `frontend/src/app/clientes/novo/page.tsx`
- [X] T019 [US2] Ensure successful customer creation invalidates customer lists and navigates to a context where the new customer is visible in `frontend/src/app/clientes/novo/page.tsx`
- [ ] T020 [US2] Verify create customer quickstart scenario manually in `specs/007-gestao-clientes/quickstart.md`

**Checkpoint**: User Stories 1 and 2 work independently.

---

## Phase 5: User Story 3 - Consultar detalhes de cliente (Priority: P3)

**Goal**: Users can open a specific customer and review real fields and status without financial or commercial history.

**Independent Test**: Open details for an existing customer from the list, confirm name/email/phone/status/ID render, then open a non-existing ID and confirm not-found state.

### Implementation for User Story 3

- [ ] T021 [P] [US3] Implement customer details display with ID, name, email, phone, status, and neutral missing-value text in `frontend/src/components/clientes/customer-details.tsx`
- [ ] T022 [US3] Implement `/clientes/[id]` detail page with `useCustomer`, loading, error, not-found, back navigation, and edit link in `frontend/src/app/clientes/[id]/page.tsx`
- [ ] T023 [US3] Integrate `CustomerActions` into the detail page without exposing definitive deletion in `frontend/src/app/clientes/[id]/page.tsx`
- [ ] T024 [US3] Verify customer details quickstart scenario manually in `specs/007-gestao-clientes/quickstart.md`

**Checkpoint**: User Stories 1, 2, and 3 work independently.

---

## Phase 6: User Story 4 - Editar cliente existente (Priority: P4)

**Goal**: Users can edit allowed customer fields and see updated data without retyping all fields.

**Independent Test**: Open `/clientes/{id}/editar`, confirm current values are prefilled, update name/email/phone, save, and confirm details/list reflect changes.

### Implementation for User Story 4

- [ ] T025 [US4] Extend `CustomerForm` to support edit mode and initial customer values in `frontend/src/components/clientes/customer-form.tsx`
- [ ] T026 [US4] Implement `/clientes/[id]/editar` page with customer loading, not-found handling, `CustomerForm`, and `useUpdateCustomer` in `frontend/src/app/clientes/[id]/editar/page.tsx`
- [ ] T027 [US4] Ensure successful customer update invalidates list and detail cache in `frontend/src/hooks/use-customers.ts`
- [ ] T028 [US4] Verify edit customer quickstart scenario manually in `specs/007-gestao-clientes/quickstart.md`

**Checkpoint**: User Stories 1 through 4 work independently.

---

## Phase 7: User Story 5 - Inativar cliente com seguranca (Priority: P5)

**Goal**: Users can inactivate an active customer with explicit confirmation while preserving future lookup through inactive/all filters.

**Independent Test**: Open an active customer, confirm inactivation, verify it disappears from active list and appears in inactive/all views with status clear.

### Implementation for User Story 5

- [ ] T029 [P] [US5] Implement confirmation dialog for customer inactivation in `frontend/src/components/clientes/customer-inactivate-dialog.tsx`
- [ ] T030 [US5] Extend `CustomerActions` to show inactivate action only for active customers in `frontend/src/components/clientes/customer-actions.tsx`
- [ ] T031 [US5] Wire `useInactivateCustomer` into list and detail flows without exposing definitive deletion in `frontend/src/app/clientes/page.tsx` and `frontend/src/app/clientes/[id]/page.tsx`
- [ ] T032 [US5] Ensure successful inactivation invalidates customer lists and detail cache in `frontend/src/hooks/use-customers.ts`
- [ ] T033 [US5] Verify inactivation quickstart scenario manually in `specs/007-gestao-clientes/quickstart.md`

**Checkpoint**: All user stories are independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency, validation, and regression checks across the customer module.

- [ ] T034 [P] Review customer UI copy for consistency with Produtos and Amani operational language in `frontend/src/app/clientes/page.tsx`, `frontend/src/app/clientes/novo/page.tsx`, `frontend/src/app/clientes/[id]/page.tsx`, and `frontend/src/app/clientes/[id]/editar/page.tsx`
- [ ] T035 [P] Review responsive spacing, touch targets, and text wrapping in customer components under `frontend/src/components/clientes/`
- [ ] T036 Confirm no CPF/CNPJ/document, sales history, accounts receivable, financial metrics, rankings, dashboards, or definitive deletion UI exists under `frontend/src/app/clientes/` and `frontend/src/components/clientes/`
- [ ] T037 Run `npm run lint` in `frontend/`
- [ ] T038 Run `npm run typecheck` in `frontend/`
- [ ] T039 Run `npm run build` in `frontend/`
- [ ] T040 Execute all manual scenarios from `specs/007-gestao-clientes/quickstart.md`
- [ ] T041 Prepare final implementation report with files created/altered and validations executed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational - MVP.
- **US2 (Phase 4)**: Depends on Foundational; benefits from US1 for post-create visibility.
- **US3 (Phase 5)**: Depends on Foundational; benefits from US1 action links.
- **US4 (Phase 6)**: Depends on US2 form component and US3 detail route.
- **US5 (Phase 7)**: Depends on US1 actions/list and US3 detail route.
- **Polish (Phase 8)**: Depends on selected user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational. Suggested MVP.
- **User Story 2 (P2)**: Can start after Foundational, but final verification uses US1 list visibility.
- **User Story 3 (P3)**: Can start after Foundational, but list-to-detail navigation uses US1.
- **User Story 4 (P4)**: Depends on reusable form from US2 and detail/navigation context from US3.
- **User Story 5 (P5)**: Depends on list/detail actions from US1/US3 and mutation hook from Foundation.

### Within Each User Story

- Types/services/hooks before pages that consume them.
- Reusable components before route integration.
- Route integration before manual quickstart validation.
- Story checkpoint before moving to the next priority when implementing sequentially.

## Parallel Opportunities

- T003, T004, and T005 can run in parallel after T001/T002.
- T011 and T012 can run in parallel during US1.
- T016 can run while T013/T014 are being refined, after Foundation.
- T021 can run before T022 in parallel with late US2 validation.
- T029 can run in parallel with T025/T026 because it is a separate component.
- T034 and T035 can run in parallel during polish.

## Parallel Example: User Story 1

```text
Task: "T011 [P] [US1] Implement responsive customer table/cards with name, email, phone, status, and action slot in frontend/src/components/clientes/customer-table.tsx"
Task: "T012 [P] [US1] Implement basic customer actions for details and edit links in frontend/src/components/clientes/customer-actions.tsx"
```

## Parallel Example: User Story 5

```text
Task: "T029 [P] [US5] Implement confirmation dialog for customer inactivation in frontend/src/components/clientes/customer-inactivate-dialog.tsx"
Task: "T027 [US4] Ensure successful customer update invalidates list and detail cache in frontend/src/hooks/use-customers.ts"
```

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate `/clientes` list, status filter, search, loading, error and empty states.

### Incremental Delivery

1. Setup + Foundational -> typed customer API layer ready.
2. US1 -> operational list MVP.
3. US2 -> customer creation.
4. US3 -> customer details.
5. US4 -> customer editing.
6. US5 -> safe inactivation.
7. Polish -> responsive and command validation.

### Validation Strategy

1. Run story-specific manual quickstart scenario after each story.
2. Run full quickstart after all selected stories.
3. Run `npm run lint`, `npm run typecheck`, and `npm run build` before completion.

## Notes

- [P] tasks are different files and can run without waiting on another incomplete task in the same phase.
- [US] labels map each task to the corresponding user story from `spec.md`.
- No automated test tasks were generated because the spec did not request TDD or new test coverage.
- Avoid adding CPF/CNPJ/document fields, financial history, dashboards, rankings, frontend calculations, reactivation, or definitive deletion.
