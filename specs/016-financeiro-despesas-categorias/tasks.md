# Tasks: Financeiro: Despesas + Categorias de Despesa

**Input**: Design artifacts from `/specs/016-financeiro-despesas-categorias/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [data-model.md](./data-model.md), [research.md](./research.md), [quickstart.md](./quickstart.md), [contracts/](./contracts/)

**Tests**: Test tasks are not generated as standalone TDD tasks because the specification did not request TDD. Validation is covered by build commands and quickstart scenarios in the final phase.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after foundational work.

## Phase 1: Setup

**Purpose**: Confirm the existing structure and prepare shared route/service locations.

- [X] T001 Review current expense and category backend files in `src/Amani.ImportadosERP.Domain/Entities/CategoriaDespesa.cs`, `src/Amani.ImportadosERP.Domain/Entities/Despesa.cs`, `src/Amani.ImportadosERP.Api/Controllers/DespesasController.cs`, and `src/Amani.ImportadosERP.Infra.Data/Repositories/DespesaRepository.cs`
- [X] T002 Review current frontend finance patterns in `frontend/src/app/financeiro/contas-receber/page.tsx`, `frontend/src/components/financeiro/receivables-list.tsx`, `frontend/src/services/receivables.ts`, and `frontend/src/hooks/use-receivables.ts`
- [X] T003 Review navigation and route definitions in `frontend/src/config/routes.ts`, `frontend/src/config/navigation.ts`, and `frontend/src/types/navigation.ts`

## Phase 2: Foundational

**Purpose**: Shared backend model, persistence, contracts, and frontend types required by all user stories.

- [X] T004 Extend `CategoriaDespesa` with optional description and active status in `src/Amani.ImportadosERP.Domain/Entities/CategoriaDespesa.cs`
- [X] T005 Extend `Despesa` with required payment method and enforce `Valor > 0` in `src/Amani.ImportadosERP.Domain/Entities/Despesa.cs`
- [X] T006 Add or reuse a payment method enum that supports `Dinheiro`, `PIX`, `CartaoDebito`, and `CartaoCredito` for expenses in `src/Amani.ImportadosERP.Domain/Enums/FormaPagamento.cs`
- [X] T007 Update category mapping with description, active status, and normalized-name uniqueness support in `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CategoriaDespesaMapping.cs`
- [X] T008 Update expense mapping with payment method and competence/occurrence date semantics in `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/DespesaMapping.cs`
- [X] T009 Add EF migration for category status/description, expense payment method, and related constraints in `src/Amani.ImportadosERP.Infra.Data/Migrations/`
- [X] T010 Create category DTOs in `src/Amani.ImportadosERP.Application/DTOs/CategoriaDespesaDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/CriarCategoriaDespesaDto.cs`, and `src/Amani.ImportadosERP.Application/DTOs/AtualizarCategoriaDespesaDto.cs`
- [X] T011 Update expense DTOs with `DataCompetencia`, `FormaPagamento`, category name, and category active flag in `src/Amani.ImportadosERP.Application/DTOs/CriarDespesaDto.cs` and `src/Amani.ImportadosERP.Application/DTOs/DespesaListDto.cs`
- [X] T012 Create category repository interface in `src/Amani.ImportadosERP.Application/Interfaces/ICategoriaDespesaRepository.cs`
- [X] T013 Create category repository implementation in `src/Amani.ImportadosERP.Infra.Data/Repositories/CategoriaDespesaRepository.cs`
- [X] T014 Extend expense repository filtering/projection support in `src/Amani.ImportadosERP.Application/Interfaces/IDespesaRepository.cs` and `src/Amani.ImportadosERP.Infra.Data/Repositories/DespesaRepository.cs`
- [X] T015 Register category repository dependencies in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [X] T016 Create frontend expense and category types in `frontend/src/types/expense.ts` and `frontend/src/types/expense-category.ts`
- [X] T017 Create frontend API services for expenses and categories in `frontend/src/services/expenses.ts` and `frontend/src/services/expense-categories.ts`
- [X] T018 Create frontend query/mutation hooks in `frontend/src/hooks/use-expenses.ts` and `frontend/src/hooks/use-expense-categories.ts`
- [X] T019 Add finance expense routes and navigation entries in `frontend/src/config/routes.ts`, `frontend/src/config/navigation.ts`, and `frontend/src/types/navigation.ts`

## Phase 3: User Story 1 - Cadastrar categorias de despesa (Priority: P1)

**Goal**: Users can create, list, update, and inactivate expense categories while preserving historical classifications.

**Independent Test**: Create a category, list it, edit it, inactivate it, and verify it remains visible for management/history while unavailable for new expenses.

- [X] T020 [P] [US1] Create `CriarCategoriaDespesaCommand`, `AtualizarCategoriaDespesaCommand`, and `InativarCategoriaDespesaCommand` in `src/Amani.ImportadosERP.Application/Commands/`
- [X] T021 [P] [US1] Create `ObterCategoriasDespesaQuery` and `ObterCategoriaDespesaPorIdQuery` in `src/Amani.ImportadosERP.Application/Queries/`
- [X] T022 [US1] Implement category command handlers with required-name, duplicate-name, and inactivation validation in `src/Amani.ImportadosERP.Application/Commands/Handlers/`
- [X] T023 [US1] Implement category query handlers with active/inactive listing support in `src/Amani.ImportadosERP.Application/Queries/Handlers/`
- [X] T024 [US1] Create `CategoriasDespesaController` with list, get-by-id, create, update, and inactivate endpoints in `src/Amani.ImportadosERP.Api/Controllers/CategoriasDespesaController.cs`
- [X] T025 [P] [US1] Create category management component in `frontend/src/components/financeiro/expense-categories-manager.tsx`
- [X] T026 [US1] Create category management route in `frontend/src/app/financeiro/despesas/categorias/page.tsx`
- [X] T027 [US1] Surface empty, loading, error, duplicate-name, and inactivation states in `frontend/src/components/financeiro/expense-categories-manager.tsx`

## Phase 4: User Story 2 - Lancar despesa operacional (Priority: P1)

**Goal**: Users can create an operational expense with active category, competence/occurrence date, amount, description, and payment method.

**Independent Test**: Create a valid expense and verify invalid attempts without category, without payment method, with invalid method, or with non-positive amount are rejected without creating records.

- [X] T028 [US2] Update `CriarDespesaCommand` with competence/occurrence date and payment method in `src/Amani.ImportadosERP.Application/Commands/CriarDespesaCommand.cs`
- [X] T029 [US2] Update `CriarDespesaCommandHandler` to validate active category and allowed payment methods in `src/Amani.ImportadosERP.Application/Commands/Handlers/CriarDespesaCommandHandler.cs`
- [X] T030 [US2] Update `DespesasController` create action to use the explicit expense DTO/command contract in `src/Amani.ImportadosERP.Api/Controllers/DespesasController.cs`
- [X] T031 [P] [US2] Create expense form component with active-category selector and payment method selector in `frontend/src/components/financeiro/expense-form.tsx`
- [X] T032 [US2] Create new expense route in `frontend/src/app/financeiro/despesas/nova/page.tsx`
- [X] T033 [US2] Wire create-expense mutation and cache invalidation in `frontend/src/hooks/use-expenses.ts`
- [X] T034 [US2] Surface validation messages for missing category, inactive category, missing payment method, invalid payment method, and non-positive amount in `frontend/src/components/financeiro/expense-form.tsx`

## Phase 5: User Story 3 - Consultar despesas com filtros (Priority: P2)

**Goal**: Users can list operational expenses by competence/occurrence period and category with reliable empty/loading/error states.

**Independent Test**: Create expenses in different categories and dates, filter by month/category, and verify only matching rows appear within 30 seconds.

- [X] T035 [US3] Update `ObterListaDespesasQuery` with `DataCompetencia` naming and category filter semantics in `src/Amani.ImportadosERP.Application/Queries/ObterListaDespesasQuery.cs`
- [X] T036 [US3] Update `ObterListaDespesasQueryHandler` to return category name, category active flag, and payment method in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterListaDespesasQueryHandler.cs`
- [X] T037 [US3] Update `DespesasController` list action to reject invalid date ranges and filter by competence/occurrence date in `src/Amani.ImportadosERP.Api/Controllers/DespesasController.cs`
- [X] T038 [P] [US3] Create expense filters component in `frontend/src/components/financeiro/expense-filters.tsx`
- [X] T039 [P] [US3] Create expenses list component in `frontend/src/components/financeiro/expenses-list.tsx`
- [X] T040 [US3] Create expenses list route in `frontend/src/app/financeiro/despesas/page.tsx`
- [X] T041 [US3] Connect backend filters to frontend query params and React Query keys in `frontend/src/hooks/use-expenses.ts` and `frontend/src/services/expenses.ts`
- [X] T042 [US3] Add empty, loading, retryable error, and clear-filter states in `frontend/src/components/financeiro/expenses-list.tsx` and `frontend/src/components/financeiro/expense-filters.tsx`

## Phase 6: User Story 4 - Refletir despesas no financeiro gerencial (Priority: P3)

**Goal**: Financial views that include expense totals reflect operational expenses for the selected period while keeping operator expenses separate.

**Independent Test**: Create an operational expense in a known period and verify financial views include it in expense totals without merging it into operator expense listings.

- [X] T043 [US4] Identify current dashboard/financial expense aggregation paths in `src/Amani.ImportadosERP.Application/Queries/` and `src/Amani.ImportadosERP.Infra.Data/Repositories/`
- [X] T044 [US4] Map exact financial/dashboard query handlers that consume expense totals in `src/Amani.ImportadosERP.Application/Queries/Handlers/`
- [X] T045 [US4] Update the mapped financial/dashboard query handlers to include operational expenses by `DataCompetencia` in `src/Amani.ImportadosERP.Application/Queries/Handlers/`
- [X] T046 [US4] Ensure operator expenses remain separate from operational expenses in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDespesasOperadoraQueryHandler.cs` and `src/Amani.ImportadosERP.Api/Controllers/DespesasOperadoraController.cs`
- [X] T047 [US4] Update frontend financial/dashboard data types if expense totals changed in `frontend/src/types/` and `frontend/src/services/dashboard.ts`
- [X] T048 [US4] Validate frontend financial/dashboard rendering after operational expense creation in `frontend/src/app/page.tsx` and `frontend/src/app/financeiro/page.tsx`

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality, regressions, responsiveness, and documentation before implementation handoff.

- [X] T049 [P] Update quickstart implementation notes after validation in `specs/016-financeiro-despesas-categorias/quickstart.md`
- [X] T050 Run backend build with `dotnet build Amani_ImportadosERP.sln` for `Amani_ImportadosERP.sln`
- [X] T051 Run frontend lint with `npm run lint` from `frontend/` using `frontend/package.json`
- [X] T052 Run frontend typecheck with `npm run typecheck` from `frontend/` using `frontend/package.json`
- [X] T053 Run frontend production build with `npm run build` from `frontend/` using `frontend/package.json`
- [X] T054 Validate quickstart scenarios 1-8 manually using `specs/016-financeiro-despesas-categorias/quickstart.md`
- [X] T055 Validate responsive layouts for `/financeiro/despesas`, `/financeiro/despesas/nova`, and `/financeiro/despesas/categorias` at smartphone, tablet, and desktop widths in `frontend/src/app/financeiro/despesas/`
- [X] T056 Validate regressions for sales, receivables, stock movement, and operator expenses using `specs/016-financeiro-despesas-categorias/quickstart.md`
- [X] T057 Confirm `AGENTS.md` still points to `specs/016-financeiro-despesas-categorias/plan.md`

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 Setup has no dependencies.
- Phase 2 Foundational depends on Phase 1 and blocks all user stories.
- Phase 3 US1 depends on Phase 2 and is required before US2 because new expenses require active categories.
- Phase 4 US2 depends on Phase 3 for category availability.
- Phase 5 US3 depends on Phase 4 for meaningful expense records.
- Phase 6 US4 depends on Phase 4 and can run after backend expense records exist.
- Final Phase depends on all selected stories.

### User Story Dependencies

- US1: Independent after foundational tasks.
- US2: Depends on US1 category management.
- US3: Depends on US2 expense creation.
- US4: Depends on US2 expense creation and existing financial/dashboard flows.

## Parallel Execution Examples

### US1

- T020 and T021 can run in parallel because commands and queries are separate files.
- T025 can run in parallel with backend handlers after DTO contracts are stable.

### US2

- T031 can run in parallel with T028-T030 once frontend types from T016 are available.
- T033 can run in parallel with T032 after the expense service contract exists.

### US3

- T038 and T039 can run in parallel because filters and list components are separate files.
- T036 and T037 can run in parallel after T035 updates the query contract.

### US4

- T043 and T047 can run in parallel because backend aggregation discovery and frontend type inspection are separate.

## Implementation Strategy

### MVP First

Deliver US1 and US2 first: category management plus expense creation. This provides immediate operational value and creates the data needed for later listing and dashboard validation.

### Incremental Delivery

1. Complete setup and foundational data/contracts.
2. Deliver US1 and validate category lifecycle.
3. Deliver US2 and validate expense creation/rejection rules.
4. Deliver US3 for filtered operational use.
5. Deliver US4 for financial visibility.
6. Run final build, typecheck, quickstart, and responsive validation.

### Notes

- Keep expense edit/delete, recurring expenses, cost centers, cost allocation, and Fiado expense debt out of scope.
- Keep operational expenses separate from card operator expenses.
- Do not move business validation into controllers or frontend-only checks.
