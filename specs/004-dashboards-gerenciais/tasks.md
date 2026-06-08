# Tasks: Dashboards Gerenciais

**Input**: Design documents from `/specs/004-dashboards-gerenciais/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/dashboard-gerencial-api.md](./contracts/dashboard-gerencial-api.md)

**Tests**: The feature did not request TDD or automated test creation. Validation tasks use build checks and the manual API scenarios documented in [quickstart.md](./quickstart.md).

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently after the foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel because it touches different files and does not depend on incomplete tasks.
- **[Story]**: User story label from [spec.md](./spec.md). Setup, Foundational, and Polish tasks do not use a story label.
- Every task includes concrete file paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare the feature file structure and align with the existing Clean Architecture layout.

- [ ] T001 Review approved dashboard plan, contract, and quickstart before implementation in `specs/004-dashboards-gerenciais/plan.md`, `specs/004-dashboards-gerenciais/contracts/dashboard-gerencial-api.md`, and `specs/004-dashboards-gerenciais/quickstart.md`
- [ ] T002 [P] Review existing MediatR query conventions in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroQueryHandler.cs` and `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardQueryHandler.cs`
- [ ] T003 [P] Review existing aggregate repository conventions in `src/Amani.ImportadosERP.Infra.Data/Repositories/CustoProdutoRepository.cs` and `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs`
- [ ] T004 Review current financial dashboard compatibility behavior in `src/Amani.ImportadosERP.Api/Controllers/DashboardFinanceiroController.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, filters, interfaces, and constitution gates that block every user story.

**CRITICAL**: No user story work should begin until this phase is complete.

- [ ] T005 Create `DashboardFiltroDto`, `DashboardFiltroAplicadoDto`, and filter enum/value fields in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardFiltroDto.cs`
- [ ] T006 [P] Create shared `AvisoDadoIncompletoDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/AvisoDadoIncompletoDto.cs`
- [ ] T007 [P] Create shared `IndicadorGerencialDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/IndicadorGerencialDto.cs`
- [ ] T008 Implement dashboard filter normalization and validation in `src/Amani.ImportadosERP.Application/Services/DashboardFiltroService.cs`
- [ ] T009 Create `IDashboardFinanceiroRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardFinanceiroRepository.cs`
- [ ] T010 [P] Create `IDashboardOperacionalRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardOperacionalRepository.cs`
- [ ] T011 [P] Create `IDashboardRankingRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardRankingRepository.cs`
- [ ] T012 [P] Create `IDashboardAlertaRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardAlertaRepository.cs`
- [ ] T013 [P] Create `IDashboardGraficoRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardGraficoRepository.cs`
- [ ] T014 Register `DashboardFiltroService` in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [ ] T015 Validate constitution gates for dashboards in `specs/004-dashboards-gerenciais/tasks.md`: stock by movements, purchases in transit, receipts, losses without stock entry, sales stock validation, average cost from real entries, DTOs, Repository Pattern, no AutoMapper, backend-owned rules

**Checkpoint**: Shared DTOs, filter rules, and repository contracts exist; user story implementation can start.

---

## Phase 3: User Story 1 - Acompanhar resultado financeiro (Priority: P1) MVP

**Goal**: Provide the financial dashboard with revenue, profit, purchases, expenses, operational balance, open receivables, and received values using period filters.

**Independent Test**: Call `GET /api/dashboard-gerencial/financeiro?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD` and verify all financial totals match known sales, purchases, expenses, receivables, and payments.

### Implementation for User Story 1

- [ ] T016 [P] [US1] Create `DashboardFinanceiroGerencialDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardFinanceiroGerencialDto.cs`
- [ ] T017 [P] [US1] Create `ObterDashboardFinanceiroGerencialQuery` in `src/Amani.ImportadosERP.Application/Queries/ObterDashboardFinanceiroGerencialQuery.cs`
- [ ] T018 [US1] Implement aggregate financial query methods for revenue, purchases, expenses, receivables, received values, and missing-cost data in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardFinanceiroRepository.cs`
- [ ] T019 [US1] Implement `DashboardFinanceiroRepository` aggregations in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs`
- [ ] T020 [US1] Implement `ObterDashboardFinanceiroGerencialQueryHandler` with filter normalization, formulas, and incomplete-cost warnings in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroGerencialQueryHandler.cs`
- [ ] T021 [US1] Add `GET /api/dashboard-gerencial/financeiro` action to `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs`
- [ ] T022 [US1] Preserve compatibility or delegate old financial dashboard behavior in `src/Amani.ImportadosERP.Api/Controllers/DashboardFinanceiroController.cs`
- [ ] T023 [US1] Register `IDashboardFinanceiroRepository` implementation in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [ ] T024 [US1] Validate US1 quickstart scenario against `specs/004-dashboards-gerenciais/quickstart.md`

**Checkpoint**: User Story 1 is functional and independently testable.

---

## Phase 4: User Story 2 - Acompanhar operacao e estoque (Priority: P1)

**Goal**: Provide the operational dashboard with product count, stock availability, goods in transit, open purchases, pending receipt products, losses, sales count, and purchase count.

**Independent Test**: Call `GET /api/dashboard-gerencial/operacional?mes=6&ano=2026` with known purchases, partial receipts, losses, sales, and stock movements, then verify all operational totals.

### Implementation for User Story 2

- [ ] T025 [P] [US2] Create `DashboardOperacionalDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardOperacionalDto.cs`
- [ ] T026 [P] [US2] Create `ObterDashboardOperacionalQuery` in `src/Amani.ImportadosERP.Application/Queries/ObterDashboardOperacionalQuery.cs`
- [ ] T027 [US2] Add operational aggregate method signatures for product count, stock total, goods in transit, open purchases, pending products, losses, sales count, and purchase count in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardOperacionalRepository.cs`
- [ ] T028 [US2] Implement stock-by-movements and product count aggregations in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs`
- [ ] T029 [US2] Implement goods-in-transit, open-purchase, pending-product, and loss aggregations from purchases, receipts, and losses in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs`
- [ ] T030 [US2] Implement sales and purchase event counts with period filtering in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs`
- [ ] T031 [US2] Implement `ObterDashboardOperacionalQueryHandler` with filter normalization and operational formulas in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardOperacionalQueryHandler.cs`
- [ ] T032 [US2] Add `GET /api/dashboard-gerencial/operacional` action to `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs`
- [ ] T033 [US2] Register `IDashboardOperacionalRepository` implementation in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [ ] T034 [US2] Validate US2 quickstart scenario against `specs/004-dashboards-gerenciais/quickstart.md`

**Checkpoint**: User Story 2 is functional and independently testable.

---

## Phase 5: User Story 3 - Comparar rankings gerenciais (Priority: P2)

**Goal**: Provide product rankings for most sold, most profitable, highest stock, and lowest stock.

**Independent Test**: Call `GET /api/dashboard-gerencial/rankings?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD&limiteRankings=5` with products that have known sales, profit, costs, and stock balances, then verify ordering and tie-break rules.

### Implementation for User Story 3

- [ ] T035 [P] [US3] Create `RankingProdutoDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/RankingProdutoDto.cs`
- [ ] T036 [P] [US3] Create `ObterDashboardRankingsQuery` in `src/Amani.ImportadosERP.Application/Queries/ObterDashboardRankingsQuery.cs`
- [ ] T037 [US3] Add ranking method signatures for most sold, most profitable, highest stock, and lowest stock in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardRankingRepository.cs`
- [ ] T038 [US3] Implement most-sold ranking with stable tie-breaks in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardRankingRepository.cs`
- [ ] T039 [US3] Implement most-profitable ranking with average-cost and missing-cost warnings in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardRankingRepository.cs`
- [ ] T040 [US3] Implement highest-stock and lowest-stock rankings from stock movements in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardRankingRepository.cs`
- [ ] T041 [US3] Implement `ObterDashboardRankingsQueryHandler` with limit handling and filter normalization in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardRankingsQueryHandler.cs`
- [ ] T042 [US3] Add `GET /api/dashboard-gerencial/rankings` action to `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs`
- [ ] T043 [US3] Register `IDashboardRankingRepository` implementation in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [ ] T044 [US3] Validate US3 quickstart scenario against `specs/004-dashboards-gerenciais/quickstart.md`

**Checkpoint**: User Story 3 is functional and independently testable.

---

## Phase 6: User Story 4 - Monitorar alertas operacionais (Priority: P2)

**Goal**: Provide active alerts for low stock, no movement, old goods in transit, and recurring losses.

**Independent Test**: Call `GET /api/dashboard-gerencial/alertas?ano=2026` with known low-stock, inactive, delayed-transit, and recurring-loss scenarios, then verify each alert includes reason, value, limit, and severity.

### Implementation for User Story 4

- [ ] T045 [P] [US4] Create `AlertaGerencialDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/AlertaGerencialDto.cs`
- [ ] T046 [P] [US4] Create `ObterDashboardAlertasQuery` in `src/Amani.ImportadosERP.Application/Queries/ObterDashboardAlertasQuery.cs`
- [ ] T047 [US4] Add alert method signatures for low stock, no movement, old transit, and recurring losses in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardAlertaRepository.cs`
- [ ] T048 [US4] Implement low-stock alert calculation from stock movements in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardAlertaRepository.cs`
- [ ] T049 [US4] Implement no-movement alert calculation from stock, sale, purchase, receipt, and loss events in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardAlertaRepository.cs`
- [ ] T050 [US4] Implement old goods-in-transit alert calculation from pending purchases in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardAlertaRepository.cs`
- [ ] T051 [US4] Implement recurring-loss alert calculation from item losses in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardAlertaRepository.cs`
- [ ] T052 [US4] Implement `ObterDashboardAlertasQueryHandler` with default threshold handling and filter normalization in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardAlertasQueryHandler.cs`
- [ ] T053 [US4] Add `GET /api/dashboard-gerencial/alertas` action to `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs`
- [ ] T054 [US4] Register `IDashboardAlertaRepository` implementation in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [ ] T055 [US4] Validate US4 quickstart scenario against `specs/004-dashboards-gerenciais/quickstart.md`

**Checkpoint**: User Story 4 is functional and independently testable.

---

## Phase 7: User Story 5 - Analisar graficos gerenciais (Priority: P3)

**Goal**: Provide chart series for revenue, profit, purchases, expenses by category, and stock evolution.

**Independent Test**: Call `GET /api/dashboard-gerencial/graficos?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD` with known time-distributed data, then verify each series uses the same formulas as the equivalent indicators.

### Implementation for User Story 5

- [ ] T056 [P] [US5] Create `SerieGraficaDto` and `PontoGraficoDto` in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/SerieGraficaDto.cs`
- [ ] T057 [P] [US5] Create `ObterDashboardGraficosQuery` in `src/Amani.ImportadosERP.Application/Queries/ObterDashboardGraficosQuery.cs`
- [ ] T058 [US5] Add graph method signatures for revenue, profit, purchases, expenses by category, and stock evolution in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardGraficoRepository.cs`
- [ ] T059 [US5] Implement revenue and profit time series using the same financial formulas as US1 in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardGraficoRepository.cs`
- [ ] T060 [US5] Implement purchases time series and expenses-by-category series in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardGraficoRepository.cs`
- [ ] T061 [US5] Implement stock evolution series from accumulated stock movements in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardGraficoRepository.cs`
- [ ] T062 [US5] Implement `ObterDashboardGraficosQueryHandler` with graph type filtering and filter normalization in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardGraficosQueryHandler.cs`
- [ ] T063 [US5] Add `GET /api/dashboard-gerencial/graficos` action to `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs`
- [ ] T064 [US5] Register `IDashboardGraficoRepository` implementation in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [ ] T065 [US5] Validate US5 quickstart scenario against `specs/004-dashboards-gerenciais/quickstart.md`

**Checkpoint**: User Story 5 is functional and independently testable.

---

## Phase 8: Consolidated Dashboard & Cross-Story Integration

**Purpose**: Compose all completed sections into the optional consolidated endpoint and ensure shared response structure is consistent.

- [ ] T066 Create `DashboardGerencialDto` consolidated response in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardGerencialDto.cs`
- [ ] T067 Create `ObterDashboardGerencialQuery` in `src/Amani.ImportadosERP.Application/Queries/ObterDashboardGerencialQuery.cs`
- [ ] T068 Implement `ObterDashboardGerencialQueryHandler` composing financial, operational, rankings, alerts, graphs, filters, and warnings in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardGerencialQueryHandler.cs`
- [ ] T069 Add `GET /api/dashboard-gerencial` consolidated action to `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs`
- [ ] T070 Validate consolidated endpoint response structure against `specs/004-dashboards-gerenciais/contracts/dashboard-gerencial-api.md`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, regressions, and cleanup across all dashboard stories.

- [ ] T071 Run `dotnet build` for `Amani_ImportadosERP.sln`
- [ ] T072 Validate invalid-filter responses for date range, month, and year rules against `specs/004-dashboards-gerenciais/contracts/dashboard-gerencial-api.md`
- [ ] T073 Validate period precedence behavior for `dataInicial/dataFinal` over `mes/ano` against `specs/004-dashboards-gerenciais/quickstart.md`
- [ ] T074 Validate zero-data period responses for financial, operational, rankings, alerts, and graphs against `specs/004-dashboards-gerenciais/spec.md`
- [ ] T075 Run regression validation for purchases in transit, partial receipts, losses without stock entry, stock by movements, sales stock validation, initial inventory, average cost, and financial dashboard behavior using `specs/003-mercadorias-transito/quickstart.md` and `specs/004-dashboards-gerenciais/quickstart.md`
- [ ] T076 Review controllers for absence of business rules in `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs` and `src/Amani.ImportadosERP.Api/Controllers/DashboardFinanceiroController.cs`
- [ ] T077 Review all dashboard DTO mappings for explicit manual mapping and no AutoMapper usage in `src/Amani.ImportadosERP.Application/Queries/Handlers/`
- [ ] T078 Update feature implementation notes in `specs/004-dashboards-gerenciais/quickstart.md` if actual endpoint behavior differs from the approved contract

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Financial Dashboard (Phase 3)**: Depends on Foundational.
- **US2 Operational Dashboard (Phase 4)**: Depends on Foundational and can run in parallel with US1 after shared filters/interfaces exist.
- **US3 Rankings (Phase 5)**: Depends on Foundational; most-profitable ranking benefits from US1 formula decisions and stock rankings benefit from US2 stock aggregation.
- **US4 Alerts (Phase 6)**: Depends on Foundational; stock and transit alerts benefit from US2 aggregations.
- **US5 Graphs (Phase 7)**: Depends on Foundational; revenue/profit graphs should reuse US1 formulas and stock evolution should align with US2.
- **Consolidated Dashboard (Phase 8)**: Depends on desired section endpoints being complete.
- **Polish (Phase 9)**: Depends on all desired stories and consolidated work being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; suggested MVP.
- **User Story 2 (P1)**: Can start after Foundational; independent operational increment.
- **User Story 3 (P2)**: Can start after Foundational but should align formulas with US1/US2.
- **User Story 4 (P2)**: Can start after Foundational but should align stock/transit calculations with US2.
- **User Story 5 (P3)**: Can start after Foundational but should reuse formulas from US1/US2 for consistency.

### Within Each User Story

- DTOs before queries and handlers.
- Interface signatures before repository implementations.
- Repository implementations before handlers.
- Handlers before controller actions.
- Controller actions before quickstart validation.

### Parallel Opportunities

- T002 and T003 can run in parallel after T001.
- T006, T007, T010, T011, T012, and T013 can run in parallel after T005.
- US1 and US2 can run in parallel after Phase 2.
- DTO and query creation tasks within each user story marked [P] can run in parallel.
- Repository implementations for US3, US4, and US5 can run in parallel if their shared formulas are already agreed.

---

## Parallel Example: User Story 1

```text
Task: "T016 [P] [US1] Create DashboardFinanceiroGerencialDto in src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardFinanceiroGerencialDto.cs"
Task: "T017 [P] [US1] Create ObterDashboardFinanceiroGerencialQuery in src/Amani.ImportadosERP.Application/Queries/ObterDashboardFinanceiroGerencialQuery.cs"
```

## Parallel Example: User Story 2

```text
Task: "T025 [P] [US2] Create DashboardOperacionalDto in src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardOperacionalDto.cs"
Task: "T026 [P] [US2] Create ObterDashboardOperacionalQuery in src/Amani.ImportadosERP.Application/Queries/ObterDashboardOperacionalQuery.cs"
```

## Parallel Example: User Story 3

```text
Task: "T035 [P] [US3] Create RankingProdutoDto in src/Amani.ImportadosERP.Application/DTOs/Dashboards/RankingProdutoDto.cs"
Task: "T036 [P] [US3] Create ObterDashboardRankingsQuery in src/Amani.ImportadosERP.Application/Queries/ObterDashboardRankingsQuery.cs"
```

## Parallel Example: User Story 4

```text
Task: "T045 [P] [US4] Create AlertaGerencialDto in src/Amani.ImportadosERP.Application/DTOs/Dashboards/AlertaGerencialDto.cs"
Task: "T046 [P] [US4] Create ObterDashboardAlertasQuery in src/Amani.ImportadosERP.Application/Queries/ObterDashboardAlertasQuery.cs"
```

## Parallel Example: User Story 5

```text
Task: "T056 [P] [US5] Create SerieGraficaDto and PontoGraficoDto in src/Amani.ImportadosERP.Application/DTOs/Dashboards/SerieGraficaDto.cs"
Task: "T057 [P] [US5] Create ObterDashboardGraficosQuery in src/Amani.ImportadosERP.Application/Queries/ObterDashboardGraficosQuery.cs"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1 Financial Dashboard).
3. Validate US1 independently with the financial quickstart scenario.
4. Add Phase 4 (US2 Operational Dashboard) to complete the core dashboard MVP.

### Incremental Delivery

1. Setup + Foundational.
2. US1 financial dashboard.
3. US2 operational dashboard.
4. US3 rankings.
5. US4 alerts.
6. US5 graphs.
7. Consolidated endpoint and final validation.

### Parallel Team Strategy

After Phase 2, one developer can work on US1 while another works on US2. After formulas are stable, US3, US4, and US5 can be split by repository/handler/controller responsibilities with careful coordination on shared filters and formulas.

## Notes

- [P] tasks touch different files and can run in parallel.
- All user story tasks carry a `[US#]` label.
- No new persisted dashboard tables are planned.
- Do not add saldo fixo to product, purchase item, or any operational entity.
- Keep controllers free of business formulas.
- Keep DTOs explicit and do not introduce AutoMapper.
