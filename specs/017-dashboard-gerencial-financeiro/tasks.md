# Tasks: Dashboard Gerencial e Financeiro

**Input**: Design documents from `/specs/017-dashboard-gerencial-financeiro/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated test tasks are not included because the feature specification did not request TDD or new automated test coverage. Validation tasks in the final phase execute `quickstart.md` scenarios and build checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Frontend source: `frontend/src/`
- Feature documentation: `specs/017-dashboard-gerencial-financeiro/`
- Backend contracts referenced for validation: `src/Amani.ImportadosERP.Api/Controllers/` and `src/Amani.ImportadosERP.Application/DTOs/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare dependencies and shared feature structure.

- [X] T001 Add `recharts` dependency to `frontend/package.json` and update `frontend/package-lock.json`
- [X] T002 [P] Create dashboard component barrel or folder baseline in `frontend/src/components/dashboard/`
- [X] T003 [P] Confirm `queryKeys.dashboard` remains available for dashboard queries in `frontend/src/lib/query-client.ts`
- [X] T004 [P] Verify Recharts dependency rationale is preserved in `specs/017-dashboard-gerencial-financeiro/research.md` and referenced in `specs/017-dashboard-gerencial-financeiro/plan.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts, service layer, hooks, and formatting utilities required before any user story UI can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Create dashboard DTO and filter types in `frontend/src/types/dashboard.ts`
- [X] T006 Implement period query serialization helpers for month/year/range filters in `frontend/src/services/dashboard.ts`
- [X] T007 Implement dashboard service methods for `/api/dashboard-gerencial/financeiro`, `/api/dashboard-gerencial/operacional`, `/api/dashboard-gerencial/rankings`, `/api/dashboard-gerencial/alertas`, `/api/dashboard-gerencial/graficos`, and `/api/dashboard-financeiro` in `frontend/src/services/dashboard.ts`
- [X] T008 Implement stable dashboard query keys by normalized period and section in `frontend/src/hooks/use-dashboard.ts`
- [X] T009 Implement React Query hooks for financial KPIs, operational summary, rankings, alerts, graph series, and financial snapshot in `frontend/src/hooks/use-dashboard.ts`
- [X] T010 [P] Implement currency, date, quantity, severity, and label formatters without metric formulas in `frontend/src/components/dashboard/dashboard-formatters.ts`
- [X] T011 [P] Implement reusable loading, empty, error, and incomplete-data section states in `frontend/src/components/dashboard/dashboard-section-state.tsx`
- [X] T012 Validate contract field names against backend DTOs in `src/Amani.ImportadosERP.Application/DTOs/DashboardFinanceiroDto.cs` and `src/Amani.ImportadosERP.Application/DTOs/Dashboards/*.cs`
- [X] T013 Validate dashboard endpoint paths and supported filters against `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs` and `src/Amani.ImportadosERP.Api/Controllers/DashboardFinanceiroController.cs`

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Ver resumo executivo na home (Priority: P1) MVP

**Goal**: Replace the home placeholder with financial KPIs for revenue, profit, expenses, and receivables for the default period.

**Independent Test**: Access `/` with financial data available and verify the four KPIs render from the official source with clear loading, empty, and error states.

### Implementation for User Story 1

- [X] T014 [P] [US1] Create KPI grid component for faturamento, lucro, despesas, and recebiveis in `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [X] T015 [P] [US1] Create dashboard home composition shell with KPI area and section layout in `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T016 [US1] Wire `useDashboardFinancialKpis` data into `dashboard-kpi-grid.tsx` without local metric formulas in `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [X] T017 [US1] Render incomplete-data notices returned with KPI data in `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [X] T018 [US1] Replace `DashboardPlaceholder` with `DashboardHome` in `frontend/src/app/page.tsx`
- [X] T019 [US1] Remove or retire placeholder-only composition usage from `frontend/src/components/dashboard/dashboard-placeholder.tsx`
- [X] T020 [US1] Verify the home preserves app shell navigation and Dark Theme layout in `frontend/src/app/page.tsx`

**Checkpoint**: User Story 1 is independently functional and demoable as MVP.

---

## Phase 4: User Story 2 - Filtrar o painel por periodo (Priority: P1)

**Goal**: Allow month, year, and custom interval filters to refresh all dashboard sections consistently.

**Independent Test**: Select month, year, and valid custom interval filters on `/` and verify all active dashboard queries use the same normalized period; invalid intervals do not trigger requests.

### Implementation for User Story 2

- [X] T021 [P] [US2] Create period filter UI for month, year, and custom interval modes in `frontend/src/components/dashboard/dashboard-period-filter.tsx`
- [X] T022 [US2] Add filter state ownership and default current-month period to `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T023 [US2] Connect normalized period filter to KPI, operational, ranking, alert, and graph hooks in `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T024 [US2] Implement invalid interval validation and inline feedback in `frontend/src/components/dashboard/dashboard-period-filter.tsx`
- [X] T025 [US2] Prevent dashboard queries from running for invalid custom intervals in `frontend/src/hooks/use-dashboard.ts`
- [X] T026 [US2] Ensure stale responses are not presented as current-period data by comparing applied filters in `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T027 [US2] Display the active period summary near the dashboard heading in `frontend/src/components/dashboard/dashboard-home.tsx`

**Checkpoint**: User Stories 1 and 2 work independently with consistent period filtering.

---

## Phase 5: User Story 3 - Consultar rankings e alertas operacionais (Priority: P2)

**Goal**: Show official product rankings, official customer rankings, and financial/operational alerts for the active period.

**Independent Test**: With sales and alert data available, verify product rankings, customer rankings, and alerts render from official dashboard data; the UI must not synthesize customer ranking from sales or receivables.

### Implementation for User Story 3

- [X] T028 [P] [US3] Create ranking list component grouped by official `tipoRanking` in `frontend/src/components/dashboard/dashboard-ranking-list.tsx`
- [X] T029 [P] [US3] Create alerts component with severity, entity, reason, values, and reference date in `frontend/src/components/dashboard/dashboard-alerts.tsx`
- [X] T030 [US3] Wire official product rankings data with `limiteRankings` into `frontend/src/components/dashboard/dashboard-ranking-list.tsx`
- [X] T031 [US3] Add official customer ranking DTO contract in `src/Amani.ImportadosERP.Application/DTOs/Dashboards/RankingClienteDto.cs`
- [X] T032 [US3] Extend dashboard ranking repository interface for customer rankings in `src/Amani.ImportadosERP.Application/Interfaces/IDashboardRankingRepository.cs`
- [X] T033 [US3] Implement customer ranking aggregation in `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardRankingRepository.cs`
- [X] T034 [US3] Extend dashboard ranking query handler to return customer rankings in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardRankingsQueryHandler.cs`
- [X] T035 [US3] Render official customer rankings without local derivation in `frontend/src/components/dashboard/dashboard-ranking-list.tsx`
- [X] T036 [US3] Wire official alert data and empty-alert state into `frontend/src/components/dashboard/dashboard-alerts.tsx`
- [X] T037 [US3] Add rankings and alerts sections to the dashboard home layout in `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T038 [US3] Render ranking and alert incomplete-data notices without changing values in `frontend/src/components/dashboard/dashboard-home.tsx`

**Checkpoint**: User Story 3 works with official product/customer rankings and alert data.

---

## Phase 6: User Story 4 - Acompanhar graficos de evolucao (Priority: P3)

**Goal**: Display official chart series for financial and operational evolution without recalculating points or totals.

**Independent Test**: Select a period with series data and verify responsive charts show official points, labels, units, empty states, and incomplete-data notices.

### Implementation for User Story 4

- [X] T039 [P] [US4] Create chart section component using Recharts primitives in `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T040 [US4] Map `DashboardChartSeries` and `DashboardChartPoint` DTOs to chart props without recalculating totals in `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T041 [US4] Implement responsive chart sizing and tooltip labels for smartphone, tablet, and desktop in `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T042 [US4] Add graph empty state for missing or insufficient `pontos` in `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T043 [US4] Render graph incomplete-data notices from `avisos` in `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T044 [US4] Add graph sections to the dashboard home layout after KPI, ranking, and alert sections in `frontend/src/components/dashboard/dashboard-home.tsx`

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate quality, responsiveness, contracts, and constitutional constraints across the whole feature.

- [X] T045 [P] Run `npm run lint` in `frontend/` and fix issues in affected dashboard files
- [X] T046 [P] Run `npm run typecheck` in `frontend/` and fix TypeScript issues in `frontend/src/types/dashboard.ts`, `frontend/src/services/dashboard.ts`, `frontend/src/hooks/use-dashboard.ts`, and `frontend/src/components/dashboard/`
- [X] T047 Run `npm run build` in `frontend/` and fix production build issues in affected dashboard files
- [X] T048 Run `dotnet build Amani_ImportadosERP.sln` from repository root to validate backend dashboard contracts still compile
- [X] T049 Validate quickstart scenarios 1 through 6 from `specs/017-dashboard-gerencial-financeiro/quickstart.md`
- [X] T050 Validate 360px, 768px, and 1280px responsiveness from `specs/017-dashboard-gerencial-financeiro/quickstart.md`
- [X] T051 Audit dashboard components for prohibited formulas or derived business metrics in `frontend/src/components/dashboard/`, `frontend/src/hooks/use-dashboard.ts`, and `frontend/src/services/dashboard.ts`
- [X] T052 Audit Dark Theme consistency and absence of overlapping dashboard text in `frontend/src/components/dashboard/dashboard-home.tsx`, `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`, and `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T053 Update implementation notes for Recharts and customer-ranking contract behavior in `specs/017-dashboard-gerencial-financeiro/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational; MVP scope.
- **US2 (Phase 4)**: Depends on Foundational and integrates with `dashboard-home.tsx` from US1.
- **US3 (Phase 5)**: Depends on Foundational; integrates into home layout after US1 shell exists.
- **US4 (Phase 6)**: Depends on Setup Recharts task and Foundational; integrates into home layout after US1 shell exists.
- **Polish (Phase 7)**: Depends on all desired user stories.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational; no dependency on other stories.
- **User Story 2 (P1)**: Can start after Foundational, but final integration depends on `dashboard-home.tsx` from US1.
- **User Story 3 (P2)**: Can start after Foundational; final placement depends on `dashboard-home.tsx`.
- **User Story 4 (P3)**: Can start after Setup and Foundational; final placement depends on `dashboard-home.tsx`.

### Parallel Opportunities

- T002, T003, and T004 can run in parallel after T001 is understood.
- T010 and T011 can run in parallel with backend contract validation tasks T012 and T013.
- T014 and T015 can run in parallel inside US1.
- T021 can run in parallel with hook refinements once foundational hooks exist.
- T028 and T029 can run in parallel inside US3.
- T039 can run while US3 components are being implemented, after Recharts is installed.
- T045 and T046 can run in parallel before final build validation.

---

## Parallel Example: User Story 1

```text
Task: "T014 [P] [US1] Create KPI grid component for faturamento, lucro, despesas, and recebiveis in frontend/src/components/dashboard/dashboard-kpi-grid.tsx"
Task: "T015 [P] [US1] Create dashboard home composition shell with KPI area and section layout in frontend/src/components/dashboard/dashboard-home.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T028 [P] [US3] Create ranking list component grouped by official tipoRanking in frontend/src/components/dashboard/dashboard-ranking-list.tsx"
Task: "T029 [P] [US3] Create alerts component with severity, entity, reason, values, and reference date in frontend/src/components/dashboard/dashboard-alerts.tsx"
```

## Parallel Example: User Story 4

```text
Task: "T039 [P] [US4] Create chart section component using Recharts primitives in frontend/src/components/dashboard/dashboard-chart-section.tsx"
Task: "T045 [P] Run npm run lint in frontend/ and fix issues in affected dashboard files"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate `/` shows real KPIs from the official source.
5. Demo the MVP home without filters, rankings, alerts, or graphs if needed.

### Incremental Delivery

1. Setup + Foundational -> typed contracts, services, hooks, and states.
2. US1 -> real executive KPIs on home.
3. US2 -> filters update all active sections consistently.
4. US3 -> rankings and alerts add operational decision support.
5. US4 -> chart series add trend visibility.
6. Polish -> build, responsiveness, and no-formula audit.

### Parallel Team Strategy

1. One developer handles service/hooks/types foundation.
2. One developer builds KPI/filter UI after foundation.
3. One developer builds rankings/alerts while another builds charts after Recharts is installed.
4. Final integration happens in `frontend/src/components/dashboard/dashboard-home.tsx`.

---

## Notes

- Tasks marked [P] touch different files or can proceed without waiting for another incomplete task in the same phase.
- Story labels map to the four user stories in `spec.md`.
- Do not synthesize top clients in the frontend unless the backend contract provides official client-ranking data.
- Do not compute faturamento, lucro, despesas, recebiveis, rankings, alert severities, series totals, or chart points in the frontend.
- Commit after each phase or logical group.
