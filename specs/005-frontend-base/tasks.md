# Tasks: Configuracao Inicial do Frontend Amani ERP

**Input**: Design documents from `/specs/005-frontend-base/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/frontend-foundation-contract.md, quickstart.md

**Tests**: Automated tests are not required by the specification. Validation tasks use lint, typecheck, build, responsive inspection, and quickstart checks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

- Frontend app lives under `frontend/`
- Backend projects remain under existing `src/` and are not modified for this feature
- Validation references live under `specs/005-frontend-base/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the frontend project and required toolchain without implementing user stories.

- [X] T001 Create the Next.js App Router TypeScript project in `frontend/`
- [X] T002 Install runtime dependencies Next.js, React, Tailwind CSS, Shadcn/UI prerequisites, TanStack Query, Lucide React, and utility dependencies in `frontend/package.json`
- [X] T003 [P] Configure TypeScript compiler settings and path aliases in `frontend/tsconfig.json`
- [X] T004 [P] Configure Next.js settings in `frontend/next.config.ts`
- [X] T005 [P] Configure Tailwind CSS and PostCSS entry files in `frontend/tailwind.config.ts` and `frontend/postcss.config.mjs`
- [X] T006 [P] Configure Shadcn/UI project metadata and aliases in `frontend/components.json`
- [X] T007 [P] Add npm scripts for `lint`, `typecheck`, `build`, and `dev` in `frontend/package.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build core infrastructure that MUST be complete before any user story can be implemented.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T008 Define the Amani design tokens, Inter font wiring, dark-only CSS variables, and global base styles in `frontend/src/app/globals.css`
- [X] T009 Mirror Amani design tokens and responsive breakpoints in `frontend/tailwind.config.ts`
- [X] T010 [P] Create shared class name utility in `frontend/src/lib/cn.ts`
- [X] T011 [P] Create design token exports for documentation and component reuse in `frontend/src/lib/design-tokens.ts`
- [X] T012 [P] Create navigation, API, and UI state TypeScript contracts in `frontend/src/types/navigation.ts`, `frontend/src/types/api.ts`, and `frontend/src/types/ui-state.ts`
- [X] T013 Create route constants for Dashboard, Clientes, Produtos, Compras, Vendas, Estoque, Financeiro, and Configuracoes in `frontend/src/config/routes.ts`
- [X] T014 Create centralized navigation configuration for desktop sidebar, mobile bottom navigation, and More grouping in `frontend/src/config/navigation.ts`
- [X] T015 Configure TanStack Query client defaults in `frontend/src/lib/query-client.ts`
- [X] T016 Create global app providers for TanStack Query and future providers in `frontend/src/providers/app-providers.tsx`
- [X] T017 Create normalized API error helpers in `frontend/src/services/errors.ts`
- [X] T018 Create base HTTP API client wrapper without business endpoints in `frontend/src/services/api-client.ts`
- [X] T019 Wire Inter, global providers, dark-only metadata, and the application shell placeholder in `frontend/src/app/layout.tsx`
- [X] T020 Validate constitution gates for this feature in `specs/005-frontend-base/tasks.md`: no frontend business rules, no CRUDs, no real dashboard data, Mobile First, official Design System, backend-owned metrics, and simplicity

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel.

**Phase 2 Constitution Validation**: PASS. The foundational frontend code defines visual tokens, route/navigation contracts, providers, and network primitives only. It does not implement CRUDs, authentication, real dashboard data, external integrations, or frontend calculations for stock, cost, profit, rankings, alerts, financial indicators, or operational metrics. Backend-owned rules remain behind future API contracts.

---

## Phase 3: User Story 1 - Acessar base responsiva do ERP (Priority: P1) MVP

**Goal**: Users can open a responsive ERP shell on smartphone, tablet, and desktop without layout breakage.

**Independent Test**: Open the app at smartphone, tablet, and desktop widths and verify that shell, content area, and navigation remain usable without horizontal scroll or overlapping elements.

### Implementation for User Story 1

- [X] T021 [P] [US1] Implement `PageContainer` with responsive padding and `1440px` desktop max width in `frontend/src/components/layout/page-container.tsx`
- [X] T022 [P] [US1] Implement responsive shell viewport helper in `frontend/src/hooks/use-responsive-shell.ts`
- [X] T023 [US1] Implement `AppShell` layout with content region, mobile bottom spacing, desktop sidebar space, and tablet-safe behavior in `frontend/src/components/layout/app-shell.tsx`
- [X] T024 [P] [US1] Implement `PageHeader` with compact operational typography in `frontend/src/components/layout/page-header.tsx`
- [X] T025 [US1] Integrate `AppShell`, `PageContainer`, and `PageHeader` into the root application layout in `frontend/src/app/layout.tsx`
- [X] T026 [US1] Validate smartphone, tablet, and desktop shell behavior against `specs/005-frontend-base/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and testable as the MVP shell.

**US1 Validation Note**: Static implementation review passed for PageContainer max width, mobile bottom spacing, desktop sidebar space, tablet-safe content layout, and no horizontal-scroll-prone fixed content. Runtime validation with `npm run lint`, `npm run typecheck`, `npm run build`, and browser viewport checks is pending because `node`/`npm` are not available in this shell.

---

## Phase 4: User Story 2 - Navegar pela estrutura inicial (Priority: P1)

**Goal**: Users can navigate the initial ERP module structure through desktop sidebar and mobile bottom navigation.

**Independent Test**: Traverse all initial routes using desktop and mobile navigation and verify active route state, placeholders, and no operational CRUD behavior.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Implement persistent desktop sidebar with all ERP modules and active state in `frontend/src/components/layout/desktop-sidebar.tsx`
- [ ] T028 [P] [US2] Implement mobile bottom navigation with Dashboard, Vendas, Estoque, Compras, and Mais in `frontend/src/components/layout/mobile-bottom-nav.tsx`
- [ ] T029 [P] [US2] Create reusable module placeholder page component in `frontend/src/components/states/empty-state.tsx`
- [ ] T030 [P] [US2] Create Clientes placeholder route in `frontend/src/app/clientes/page.tsx`
- [ ] T031 [P] [US2] Create Produtos placeholder route in `frontend/src/app/produtos/page.tsx`
- [ ] T032 [P] [US2] Create Compras placeholder route in `frontend/src/app/compras/page.tsx`
- [ ] T033 [P] [US2] Create Vendas placeholder route in `frontend/src/app/vendas/page.tsx`
- [ ] T034 [P] [US2] Create Estoque placeholder route in `frontend/src/app/estoque/page.tsx`
- [ ] T035 [P] [US2] Create Financeiro placeholder route in `frontend/src/app/financeiro/page.tsx`
- [ ] T036 [P] [US2] Create Configuracoes placeholder route in `frontend/src/app/configuracoes/page.tsx`
- [ ] T037 [US2] Integrate desktop and mobile navigation into `AppShell` in `frontend/src/components/layout/app-shell.tsx`
- [ ] T038 [US2] Validate every route in `specs/005-frontend-base/contracts/frontend-foundation-contract.md` loads and shows correct navigation state

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Reconhecer identidade visual oficial (Priority: P1)

**Goal**: Users see a consistent dark-only, premium Amani visual identity across base components and routes.

**Independent Test**: Review routes and components for dark-only behavior, Inter typography, token usage, contrast, spacing, and consistent interaction states.

### Implementation for User Story 3

- [ ] T039 [P] [US3] Add Shadcn-compatible Button component themed with Amani tokens in `frontend/src/components/ui/button.tsx`
- [ ] T040 [P] [US3] Add Shadcn-compatible Card component themed with Amani tokens and no nested-card assumptions in `frontend/src/components/ui/card.tsx`
- [ ] T041 [P] [US3] Add Badge component variants for neutral, success, warning, danger, info, and accent in `frontend/src/components/ui/badge.tsx`
- [ ] T042 [P] [US3] Add Input base component with focus, disabled, and error-ready states in `frontend/src/components/ui/input.tsx`
- [ ] T043 [P] [US3] Add Dialog or modal base component without operational flows in `frontend/src/components/ui/dialog.tsx`
- [ ] T044 [P] [US3] Add Table base styling for future compact operational tables in `frontend/src/components/ui/table.tsx`
- [ ] T045 [US3] Apply Button, Card, Badge, and tokenized styles to navigation and placeholders in `frontend/src/components/layout/desktop-sidebar.tsx`, `frontend/src/components/layout/mobile-bottom-nav.tsx`, and `frontend/src/components/states/empty-state.tsx`
- [ ] T046 [US3] Validate dark-only theme, Inter typography, contrast, focus, hover, active, and disabled states against `specs/005-frontend-base/contracts/frontend-foundation-contract.md`

**Checkpoint**: User Stories 1, 2, and 3 provide a usable and visually consistent frontend foundation.

---

## Phase 6: User Story 4 - Visualizar dashboard inicial placeholder (Priority: P2)

**Goal**: Managers can open a dashboard placeholder that communicates future structure without real metrics or mock operational values.

**Independent Test**: Open `/` and verify structured dashboard regions, no real metrics, no charts, no rankings, no financial values, and responsive card organization.

### Implementation for User Story 4

- [ ] T047 [P] [US4] Implement metric placeholder card without numeric values in `frontend/src/components/dashboard/metric-placeholder-card.tsx`
- [ ] T048 [P] [US4] Implement quick action grid with non-operational navigation shortcuts in `frontend/src/components/dashboard/quick-action-grid.tsx`
- [ ] T049 [US4] Implement dashboard placeholder layout with reserved regions for financial summary, operational summary, stock attention, purchases and sales, future alerts, and quick actions in `frontend/src/components/dashboard/dashboard-placeholder.tsx`
- [ ] T050 [US4] Render the dashboard placeholder on the root route in `frontend/src/app/page.tsx`
- [ ] T051 [US4] Validate the dashboard placeholder against no-real-data rules in `specs/005-frontend-base/contracts/frontend-foundation-contract.md`

**Checkpoint**: User Story 4 works independently on top of the shell and design system.

---

## Phase 7: User Story 5 - Preparar base para comunicacao com backend (Priority: P2)

**Goal**: Product and development teams have standardized frontend service, loading, error, and empty-state patterns for future backend communication.

**Independent Test**: Trigger or inspect demo states and verify loading, error, and empty states are standardized, user-safe, and do not calculate business rules.

### Implementation for User Story 5

- [ ] T052 [P] [US5] Implement standardized loading feedback component in `frontend/src/components/states/loading-state.tsx`
- [ ] T053 [P] [US5] Implement standardized user-safe error feedback component in `frontend/src/components/states/error-state.tsx`
- [ ] T054 [P] [US5] Extend empty state component for future data-empty scenarios in `frontend/src/components/states/empty-state.tsx`
- [ ] T055 [US5] Integrate LoadingState, ErrorState, and EmptyState examples into placeholders without real backend calls in `frontend/src/app/page.tsx`
- [ ] T056 [US5] Document query key and service module conventions in comments or exports in `frontend/src/lib/query-client.ts` and `frontend/src/services/api-client.ts`
- [ ] T057 [US5] Validate that no frontend file calculates stock, cost, profit, financial dashboard, rankings, alerts, or operational metrics in `frontend/src/`

**Checkpoint**: User Story 5 establishes backend readiness without implementing integrations.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all stories.

- [ ] T058 [P] Update frontend validation notes in `specs/005-frontend-base/quickstart.md` if implementation commands differ from the plan
- [ ] T059 [P] Review `specs/005-frontend-base/contracts/frontend-foundation-contract.md` against implemented route/component names and record any intentional naming deviations
- [ ] T060 Run `npm run lint` in `frontend/` and fix any reported issues in `frontend/src/`
- [ ] T061 Run `npm run typecheck` in `frontend/` and fix any reported issues in `frontend/src/`
- [ ] T062 Run `npm run build` in `frontend/` and fix production build issues in `frontend/`
- [ ] T063 Run `npm run dev` in `frontend/` and validate routes from `specs/005-frontend-base/quickstart.md`
- [ ] T064 Validate smartphone viewport 390x844 for bottom navigation, no horizontal scroll, and readable text in `frontend/src/`
- [ ] T065 Validate tablet viewport 768x1024 for no duplicate navigation, no overlap, and usable content in `frontend/src/`
- [ ] T066 Validate desktop viewport 1440x900 for sidebar persistence, `PageContainer` max width, and dashboard grid behavior in `frontend/src/`
- [ ] T067 Run final constitution regression review for Mobile First, official Dark Theme, no frontend business rules, no real dashboard metrics, no CRUDs, no authentication, no external integrations, and backend-owned rules in `specs/005-frontend-base/tasks.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 - Base responsiva (P1)**: Starts after Foundational. This is the MVP and should be completed first.
- **US2 - Navegacao inicial (P1)**: Starts after Foundational; depends on shell concepts from US1 for full integration, but route placeholders can be prepared in parallel after foundation.
- **US3 - Identidade visual (P1)**: Starts after Foundational; can run alongside US1/US2 for base UI files, then integrate once navigation exists.
- **US4 - Dashboard placeholder (P2)**: Starts after US1 and US3 are usable; benefits from navigation in US2.
- **US5 - Backend readiness (P2)**: Starts after Foundational; can run in parallel with US4 after UI state patterns exist.

### Within Each User Story

- Shared types/config before components that consume them.
- Layout containers before route integration.
- UI primitives before applying visual styles to composed components.
- Placeholder components before route pages that render them.
- Service/client utilities before QueryClient usage in examples.

---

## Parallel Opportunities

- Setup tasks T003-T007 can run in parallel after T001 and T002 are complete.
- Foundational tasks T010-T012 can run in parallel after Tailwind/global setup begins.
- Route placeholder tasks T030-T036 can run in parallel once `EmptyState` exists.
- UI component tasks T039-T044 can run in parallel because they touch separate files.
- Dashboard component tasks T047 and T048 can run in parallel before T049.
- State component tasks T052-T054 can run in parallel.
- Polish documentation checks T058 and T059 can run in parallel.

## Parallel Example: User Story 2

```text
Task: "Implement persistent desktop sidebar with all ERP modules and active state in frontend/src/components/layout/desktop-sidebar.tsx"
Task: "Implement mobile bottom navigation with Dashboard, Vendas, Estoque, Compras, and Mais in frontend/src/components/layout/mobile-bottom-nav.tsx"
Task: "Create Clientes placeholder route in frontend/src/app/clientes/page.tsx"
Task: "Create Produtos placeholder route in frontend/src/app/produtos/page.tsx"
Task: "Create Compras placeholder route in frontend/src/app/compras/page.tsx"
```

## Parallel Example: User Story 3

```text
Task: "Add Shadcn-compatible Button component themed with Amani tokens in frontend/src/components/ui/button.tsx"
Task: "Add Shadcn-compatible Card component themed with Amani tokens and no nested-card assumptions in frontend/src/components/ui/card.tsx"
Task: "Add Badge component variants for neutral, success, warning, danger, info, and accent in frontend/src/components/ui/badge.tsx"
Task: "Add Input base component with focus, disabled, and error-ready states in frontend/src/components/ui/input.tsx"
```

## Parallel Example: User Story 5

```text
Task: "Implement standardized loading feedback component in frontend/src/components/states/loading-state.tsx"
Task: "Implement standardized user-safe error feedback component in frontend/src/components/states/error-state.tsx"
Task: "Extend empty state component for future data-empty scenarios in frontend/src/components/states/empty-state.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: US1 responsive shell.
4. Stop and validate smartphone, tablet, and desktop shell behavior.
5. Demo the base shell before adding navigation depth, dashboard, or backend readiness.

### Incremental Delivery

1. Setup + Foundational -> project ready.
2. US1 -> responsive shell MVP.
3. US2 -> navigable route structure.
4. US3 -> official visual identity and component primitives.
5. US4 -> dashboard placeholder.
6. US5 -> backend communication readiness.
7. Polish -> quickstart and constitution validation.

### Governance Guardrails

- Do not implement authentication, user sessions, permissions, SaaS/multi-company concepts, marketplace, external integrations, real dashboards, or complete CRUD flows.
- Do not calculate stock, cost, profit, financial indicators, rankings, alerts, or operational metrics in frontend files.
- Keep backend-owned rules and metrics behind future backend contracts.
- Preserve Mobile First behavior and Dark Only visual identity through every story.

---

## Notes

- [P] tasks touch different files and can run in parallel after their prerequisites.
- [US1]-[US5] labels map to the user stories in `specs/005-frontend-base/spec.md`.
- Each story has an independent test criterion and checkpoint.
- Commit after each phase or coherent task group when using Spec Kit git hooks.
