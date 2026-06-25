# Tasks: Autenticacao e Autorizacao

**Input**: Design documents from `/specs/018-autenticacao-autorizacao/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No TDD suite was explicitly requested. Validation tasks use the quickstart scenarios and build/lint/typecheck commands.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Prepare backend/frontend auth dependencies and configuration surfaces.

- [X] T001 Add JWT authentication package reference to src/Amani.ImportadosERP.Api/Amani.ImportadosERP.Api.csproj
- [X] T002 Add password hashing package reference or framework-compatible hashing dependency to src/Amani.ImportadosERP.Infra.IoC/Amani.ImportadosERP.Infra.IoC.csproj
- [X] T003 [P] Add non-secret JWT configuration placeholders to src/Amani.ImportadosERP.Api/appsettings.json
- [X] T004 [P] Add frontend auth route constant for `/login` in frontend/src/config/routes.ts
- [X] T005 [P] Create auth documentation placeholder for administrative user provisioning in specs/018-autenticacao-autorizacao/quickstart.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core auth model, persistence, services, and middleware that all stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T006 [P] Create Usuario entity in src/Amani.ImportadosERP.Domain/Entities/Usuario.cs
- [X] T007 [P] Create EventoAutenticacao entity in src/Amani.ImportadosERP.Domain/Entities/EventoAutenticacao.cs
- [X] T008 [P] Create ResultadoAutenticacao enum in src/Amani.ImportadosERP.Domain/Enums/ResultadoAutenticacao.cs
- [X] T009 Add Usuarios and EventosAutenticacao DbSets to src/Amani.ImportadosERP.Infra.Data/Context/AmaniDbContext.cs
- [X] T010 [P] Create Usuario Fluent API mapping with unique normalized login in src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/UsuarioConfiguration.cs
- [X] T011 [P] Create EventoAutenticacao Fluent API mapping in src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EventoAutenticacaoConfiguration.cs
- [X] T012 [P] Create IUsuarioRepository contract in src/Amani.ImportadosERP.Application/Interfaces/IUsuarioRepository.cs
- [X] T013 [P] Create IEventoAutenticacaoRepository contract in src/Amani.ImportadosERP.Application/Interfaces/IEventoAutenticacaoRepository.cs
- [X] T014 [P] Create IPasswordHasher contract in src/Amani.ImportadosERP.Application/Interfaces/IPasswordHasher.cs
- [X] T015 [P] Create IJwtTokenService contract in src/Amani.ImportadosERP.Application/Interfaces/IJwtTokenService.cs
- [X] T016 Implement UsuarioRepository in src/Amani.ImportadosERP.Infra.Data/Repositories/UsuarioRepository.cs
- [X] T017 Implement EventoAutenticacaoRepository in src/Amani.ImportadosERP.Infra.Data/Repositories/EventoAutenticacaoRepository.cs
- [X] T018 Implement password hasher service in src/Amani.ImportadosERP.Infra.IoC/Services/PasswordHasher.cs
- [X] T019 Implement JWT token service with 8h absolute expiration and 60min idle metadata in src/Amani.ImportadosERP.Infra.IoC/Services/JwtTokenService.cs
- [X] T020 Define and implement the 60-minute inactivity enforcement strategy across src/Amani.ImportadosERP.Infra.IoC/Services/JwtTokenService.cs and frontend/src/services/auth-storage.ts
- [X] T021 Register auth repositories and auth services in src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs
- [X] T022 Configure AddAuthentication/AddJwtBearer, AddAuthorization, UseAuthentication, and UseAuthorization order in src/Amani.ImportadosERP.Api/Program.cs
- [X] T023 Create authentication migration for Usuario and EventoAutenticacao in src/Amani.ImportadosERP.Infra.Data/Migrations/
- [X] T024 Create frontend auth storage utility in frontend/src/services/auth-storage.ts
- [X] T025 Create frontend auth types in frontend/src/types/auth.ts
- [X] T026 Validate constitution gates for F018 in specs/018-autenticacao-autorizacao/plan.md

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Entrar no ERP com credenciais validas (Priority: P1) MVP

**Goal**: A pessoa autorizada entra no ERP com login/senha, recebe sessao valida e consegue navegar por area protegida sem novo login a cada rota.

**Independent Test**: Provisionar um usuario, chamar login com credenciais validas, acessar uma area protegida com o token e entrar no frontend por `/login`.

### Implementation for User Story 1

- [X] T027 [P] [US1] Create LoginRequestDto in src/Amani.ImportadosERP.Application/DTOs/Auth/LoginRequestDto.cs
- [X] T028 [P] [US1] Create UsuarioAutenticadoDto in src/Amani.ImportadosERP.Application/DTOs/Auth/UsuarioAutenticadoDto.cs
- [X] T029 [P] [US1] Create LoginResponseDto in src/Amani.ImportadosERP.Application/DTOs/Auth/LoginResponseDto.cs
- [X] T030 [P] [US1] Create LoginCommand in src/Amani.ImportadosERP.Application/Commands/Auth/LoginCommand.cs
- [X] T031 [US1] Implement AuthService login orchestration in src/Amani.ImportadosERP.Application/Services/AuthService.cs
- [X] T032 [US1] Record successful login audit event and update UltimoLoginEm in src/Amani.ImportadosERP.Application/Services/AuthService.cs
- [X] T033 [US1] Implement LoginCommandHandler in src/Amani.ImportadosERP.Application/Commands/Handlers/LoginCommandHandler.cs
- [X] T034 [US1] Create AuthController with POST /api/auth/login in src/Amani.ImportadosERP.Api/Controllers/AuthController.cs
- [X] T035 [US1] Add auth service registration for AuthService in src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs
- [X] T036 [US1] Implement administrative first-user provisioning command or startup-safe routine reading credentials from environment/user-secrets in src/Amani.ImportadosERP.Api/
- [X] T037 [US1] Create documented administrative first-user provisioning path without versioned credentials in docs/auth/provisionamento-usuario-admin.md
- [X] T038 [P] [US1] Create frontend auth service for POST /api/auth/login in frontend/src/services/auth.ts
- [X] T039 [P] [US1] Create useAuth hook for login state and actions in frontend/src/hooks/use-auth.ts
- [X] T040 [P] [US1] Create login form component in frontend/src/components/auth/login-form.tsx
- [X] T041 [US1] Create login route page without operational shell content in frontend/src/app/login/page.tsx
- [X] T042 [US1] Update frontend/src/app/layout.tsx to avoid showing AppShell on /login while preserving providers
- [ ] T043 [US1] Validate successful login scenario from specs/018-autenticacao-autorizacao/quickstart.md

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Bloquear acesso nao autenticado (Priority: P1)

**Goal**: Nenhum dado operacional aparece sem sessao valida; somente login e saude tecnica ficam publicos.

**Independent Test**: Abrir rota protegida e chamar `/api/clientes` sem token; ambos devem negar acesso/redirecionar sem retornar dados.

### Implementation for User Story 2

- [X] T044 [US2] Add global authorization policy or equivalent protected-controller convention in src/Amani.ImportadosERP.Api/Program.cs
- [X] T045 [US2] Mark AuthController login as public with AllowAnonymous in src/Amani.ImportadosERP.Api/Controllers/AuthController.cs
- [X] T046 [US2] Create public health endpoint in src/Amani.ImportadosERP.Api/Controllers/HealthController.cs
- [X] T047 [US2] Verify or add authorization coverage for all existing controllers in src/Amani.ImportadosERP.Api/Controllers/
- [X] T048 [US2] Update Swagger security definition for Bearer tokens in src/Amani.ImportadosERP.Api/Program.cs
- [X] T049 [US2] Extend apiClient to attach Authorization and handle 401 in frontend/src/services/api-client.ts
- [X] T050 [US2] Create protected-route middleware for frontend routes in frontend/src/middleware.ts
- [X] T051 [US2] Create auth route state component for loading/expired states in frontend/src/components/auth/auth-route-state.tsx
- [X] T052 [US2] Integrate auth guard into providers or shell boundary in frontend/src/providers/app-providers.tsx
- [ ] T053 [US2] Validate unauthenticated API and frontend redirect scenarios from specs/018-autenticacao-autorizacao/quickstart.md

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Encerrar sessao com seguranca (Priority: P2)

**Goal**: Pessoa autenticada consegue sair, limpar sessao local e exigir novo login ao tentar retornar a area protegida.

**Independent Test**: Fazer login, acionar logout, tentar voltar para rota protegida e confirmar redirecionamento para `/login`.

### Implementation for User Story 3

- [X] T054 [US3] Add logout and clear-session behavior to frontend/src/hooks/use-auth.ts
- [X] T055 [US3] Clear sensitive TanStack Query cache on logout in frontend/src/providers/app-providers.tsx
- [X] T056 [US3] Add desktop logout action to frontend/src/components/layout/desktop-sidebar.tsx
- [X] T057 [US3] Add mobile logout action to frontend/src/components/layout/mobile-bottom-nav.tsx
- [X] T058 [US3] Ensure back navigation after logout remains protected in frontend/src/middleware.ts
- [X] T059 [US3] Register logout audit event behavior in src/Amani.ImportadosERP.Application/Services/AuthService.cs
- [ ] T060 [US3] Validate logout scenario from specs/018-autenticacao-autorizacao/quickstart.md

**Checkpoint**: User Stories 1, 2, and 3 work independently.

---

## Phase 6: User Story 4 - Rejeitar credenciais invalidas com mensagem clara (Priority: P3)

**Goal**: Login invalido, usuario inexistente ou usuario inativo retornam mensagem generica sem vazar detalhes.

**Independent Test**: Tentar login com usuario inexistente, senha errada e usuario inativo; todos negam acesso com mensagem generica e evento de auditoria sem senha.

### Implementation for User Story 4

- [X] T061 [US4] Normalize invalid credential handling in src/Amani.ImportadosERP.Application/Services/AuthService.cs
- [X] T062 [US4] Ensure failed login audit events omit passwords in src/Amani.ImportadosERP.Application/Services/AuthService.cs
- [X] T063 [US4] Ensure AuthController returns generic 401 responses for invalid credentials in src/Amani.ImportadosERP.Api/Controllers/AuthController.cs
- [X] T064 [US4] Add generic invalid credentials copy to frontend/src/components/auth/login-form.tsx
- [ ] T065 [US4] Validate invalid login scenarios from specs/018-autenticacao-autorizacao/quickstart.md

**Checkpoint**: All user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Security hygiene, build validation, and documentation cleanup across all stories.

- [X] T066 [P] Update API auth contract if implementation response fields change in specs/018-autenticacao-autorizacao/contracts/api-auth.md
- [X] T067 [P] Update frontend auth flow contract if route guard behavior changes in specs/018-autenticacao-autorizacao/contracts/frontend-auth-flow.md
- [X] T068 [P] Verify no JWT secrets or initial credentials are versioned in src/Amani.ImportadosERP.Api/appsettings.json and docs/auth/provisionamento-usuario-admin.md
- [X] T069 Validate backend build with dotnet build Amani_ImportadosERP.sln
- [X] T070 Validate frontend lint with npm run lint in frontend/
- [X] T071 Validate frontend typecheck with npm run typecheck in frontend/
- [X] T072 Validate frontend production build with npm run build in frontend/
- [ ] T073 Run full quickstart validation in specs/018-autenticacao-autorizacao/quickstart.md
- [ ] T074 Run regression smoke checks for protected compras, vendas, estoque, financeiro and dashboard routes in frontend/src/app/
- [X] T075 Mark completed implementation tasks in specs/018-autenticacao-autorizacao/tasks.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
- **Polish (Phase 7)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Starts after Foundational. Delivers login and session issuance.
- **US2 (P1)**: Starts after Foundational, but practical validation depends on US1 token issuance.
- **US3 (P2)**: Depends on US1 and US2 for meaningful logout validation.
- **US4 (P3)**: Depends on US1 auth flow but can be implemented after login path exists.

### Within Each User Story

- DTOs/entities before services.
- Services before controllers.
- Backend login/protection before frontend route validation.
- Core implementation before quickstart validation.

### Parallel Opportunities

- T003-T005 can run in parallel after T001-T002.
- T006-T008 and T010-T015 can run in parallel during foundation.
- T027-T030 and T038-T040 can run in parallel in US1.
- T049-T051 can run in parallel in US2 after backend protection shape is decided.
- T056-T057 can run in parallel in US3.
- T066-T068 can run in parallel in Polish.

---

## Parallel Example: User Story 1

```text
Task: "Create LoginRequestDto in src/Amani.ImportadosERP.Application/DTOs/Auth/LoginRequestDto.cs"
Task: "Create UsuarioAutenticadoDto in src/Amani.ImportadosERP.Application/DTOs/Auth/UsuarioAutenticadoDto.cs"
Task: "Create LoginResponseDto in src/Amani.ImportadosERP.Application/DTOs/Auth/LoginResponseDto.cs"
Task: "Create frontend auth service for POST /api/auth/login in frontend/src/services/auth.ts"
Task: "Create login form component in frontend/src/components/auth/login-form.tsx"
```

## Parallel Example: User Story 2

```text
Task: "Extend apiClient to attach Authorization and handle 401 in frontend/src/services/api-client.ts"
Task: "Create protected-route middleware for frontend routes in frontend/src/middleware.ts"
Task: "Create auth route state component for loading/expired states in frontend/src/components/auth/auth-route-state.tsx"
```

---

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1 and validate successful login with a provisioned user.
3. Complete US2 before considering the ERP protected for production.

### Incremental Delivery

1. Foundation: model, repositories, token/hash services, middleware.
2. US1: login and session issuance.
3. US2: transversal protection and frontend guards.
4. US3: logout and cleanup.
5. US4: harden invalid credential behavior.
6. Polish: validate builds, secret hygiene and quickstart.

### Notes

- [P] tasks touch different files and can run concurrently after prerequisites.
- Each task includes a concrete file path.
- No task should introduce profiles, granular permissions, email recovery, SSO or multi-tenant behavior.
- Controllers must remain thin; business decisions stay in Application/Domain.
