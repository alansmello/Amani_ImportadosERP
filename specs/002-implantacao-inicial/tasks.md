# Tasks: Implantacao Inicial

**Input**: Design documents from `/specs/002-implantacao-inicial/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests were not requested in the specification and no test project exists in the current solution. Validation tasks use build, review and quickstart scenarios.

**Organization**: Tasks are grouped by functional flow/user story and ordered by layer within each story: Domain, Application DTOs/Interfaces/Services, Infra.Data, Infra.IoC, API and manual validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when it touches different files and has no dependency on incomplete tasks.
- **[Story]**: Maps task to the user story: US1 Inventario Inicial, US2 Saldo Inicial de Caixa, US3 Contas a Receber Iniciais.
- Every task includes exact file paths.

## Phase 1: Setup and Safety Review

**Purpose**: Confirm context, avoid out-of-scope changes and preserve Feature 001 behavior.

- [X] T001 Review `specs/002-implantacao-inicial/spec.md`, `specs/002-implantacao-inicial/plan.md`, `specs/002-implantacao-inicial/data-model.md`, and `specs/002-implantacao-inicial/contracts/implantacao-inicial-api.md`
- [X] T002 Inspect existing stock flow in `src/Amani.ImportadosERP.Domain/Entities/EstoqueMovimentacao.cs`, `src/Amani.ImportadosERP.Application/Interfaces/IEstoqueMovimentacaoRepository.cs`, and `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueMovimentacaoRepository.cs`
- [X] T003 Inspect existing financial structures in `src/Amani.ImportadosERP.Domain/Entities`, `src/Amani.ImportadosERP.Application/Services`, `src/Amani.ImportadosERP.Application/Interfaces`, and `src/Amani.ImportadosERP.Infra.Data/Repositories` before deciding whether a new financial event entity is needed
- [X] T004 Inspect existing accounts receivable flow in `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs`, `src/Amani.ImportadosERP.Application/Interfaces/IContaReceberRepository.cs`, `src/Amani.ImportadosERP.Infra.Data/Repositories/ContaReceberRepository.cs`, and `src/Amani.ImportadosERP.Api/Controllers/ContasReceberController.cs`
- [X] T005 Confirm implementation will not modify dashboard financeiro, frontend, mobile, authentication, spreadsheet import, purchase/sale rules, average cost, profit, or inactive customer sale behavior

---

## Phase 2: Foundational Contracts and Shared Plumbing

**Purpose**: Create shared contracts and service registration needed by all implantation flows.

**CRITICAL**: No endpoint should be exposed until shared DTOs, service dependencies and persistence decisions are complete.

### Application DTOs

- [X] T006 [P] Create `src/Amani.ImportadosERP.Application/DTOs/RegistrarInventarioInicialDto.cs` with data, origem, and itens fields
- [X] T007 [P] Create `src/Amani.ImportadosERP.Application/DTOs/RegistrarInventarioInicialItemDto.cs` with produtoId, quantidade, and valorUnitario fields
- [X] T008 [P] Create `src/Amani.ImportadosERP.Application/DTOs/InventarioInicialResultadoDto.cs` with data, origem, quantidadeItens, and movimentacoesIds fields
- [X] T009 [P] Create `src/Amani.ImportadosERP.Application/DTOs/RegistrarSaldoInicialCaixaDto.cs` with valor, data, origem, and descricao fields
- [X] T010 [P] Create `src/Amani.ImportadosERP.Application/DTOs/SaldoInicialCaixaResultadoDto.cs` with eventoFinanceiroId, valor, data, and origem fields
- [X] T011 [P] Create `src/Amani.ImportadosERP.Application/DTOs/RegistrarContaReceberInicialDto.cs` with clienteId, valor, dataVencimento, origem, and descricao fields
- [X] T012 [P] Create `src/Amani.ImportadosERP.Application/DTOs/ContaReceberInicialResultadoDto.cs` with contaReceberId, clienteId, valor, dataVencimento, and origem fields

### Application Service and API Shell

- [X] T013 Create `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs` with constructor dependencies only and no business methods implemented yet
- [X] T014 Register `Amani.ImportadosERP.Application.Services.ImplantacaoService` in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [X] T015 Create `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs` with route `api/implantacao`, injected `ImplantacaoService`, and no endpoints yet

**Checkpoint**: Shared DTOs and service/controller shell exist before story-specific implementation.

---

## Phase 3: User Story 1 - Registrar inventario inicial de produtos (Priority: P1) MVP

**Goal**: Register initial product stock exclusively as traceable stock movements.

**Independent Test**: Use an existing product to register inventory through `POST /api/implantacao/inventario-inicial`, then confirm one `InventarioInicial` stock movement per item and no fixed product stock field.

### Domain

- [X] T016 [US1] Add `InventarioInicial` to `TipoMovimentacao` in `src/Amani.ImportadosERP.Domain/Entities/EstoqueMovimentacao.cs`
- [X] T017 [US1] Update `src/Amani.ImportadosERP.Domain/Entities/EstoqueMovimentacao.cs` constructor rules to allow `InventarioInicial` with null `CompraId` and null `VendaId`
- [X] T018 [US1] Add date input support for inventory movements in `src/Amani.ImportadosERP.Domain/Entities/EstoqueMovimentacao.cs` without changing purchase or sale movement behavior
- [X] T019 [US1] Ensure `src/Amani.ImportadosERP.Domain/Entities/Produto.cs` still has no fixed stock balance field after inventory changes

### Application

- [X] T020 [US1] Implement empty-item validation in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T021 [US1] Implement duplicated produtoId validation for inventory items in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T022 [US1] Implement positive quantity validation for inventory items in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T023 [US1] Implement non-negative valorUnitario validation for inventory items in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T024 [US1] Implement product existence validation using `IProdutoRepository` in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T025 [US1] Implement inventory movement creation using `IEstoqueMovimentacaoRepository.AdicionarRangeAsync` in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T026 [US1] Map generated inventory movements to `InventarioInicialResultadoDto` explicitly in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`

### Infra.Data

- [X] T027 [US1] Verify `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueMovimentacaoRepository.cs` persists range inserts without creating purchases, sales, or product stock fields
- [X] T028 [US1] Update `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EstoqueMovimentacaoMapping.cs` if needed to persist `TipoMovimentacao.InventarioInicial` and inventory date correctly
- [X] T029 [US1] Create EF migration in `src/Amani.ImportadosERP.Infra.Data/Migrations` for `TipoMovimentacao.InventarioInicial` persistence changes only if model changes require it

### API

- [X] T030 [US1] Add `POST /api/implantacao/inventario-inicial` endpoint to `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs`
- [X] T031 [US1] Ensure `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs` returns the inventory response DTO and delegates all inventory validation to `ImplantacaoService`
- [X] T032 [US1] Ensure inventory endpoint responses match `specs/002-implantacao-inicial/contracts/implantacao-inicial-api.md`

### Manual Validation

- [X] T033 [US1] Validate successful inventory scenario from `specs/002-implantacao-inicial/quickstart.md`
- [X] T034 [US1] Validate inventory rejection scenarios from `specs/002-implantacao-inicial/quickstart.md`
- [X] T035 [US1] Confirm no product stock balance field was added by inspecting `src/Amani.ImportadosERP.Domain/Entities/Produto.cs` and `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ProdutoMapping.cs`

**Checkpoint**: US1 is complete when initial inventory works independently and stock is still derived only from movements.

---

## Phase 4: User Story 2 - Registrar saldo inicial de caixa (Priority: P2)

**Goal**: Register opening cash as a traceable financial event without treating it as sale revenue.

**Independent Test**: Register a cash opening balance through `POST /api/implantacao/saldo-inicial-caixa` and confirm the generated record has value, date, origin, and is not linked to sale revenue or dashboard changes.

### Reuse Decision

- [X] T036 [US2] Document the chosen reuse/new-entity decision for cash opening balance in `specs/002-implantacao-inicial/research.md` after inspecting existing financial structures
- [X] T037 [US2] If an existing financial structure is reusable, identify required changes in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs` before creating any new domain entity
- [X] T038 [US2] If no existing structure is sufficient, create `src/Amani.ImportadosERP.Domain/Entities/EventoFinanceiro.cs` for traceable opening cash events

### Domain

- [X] T039 [US2] If `EventoFinanceiro` is created, add event type support for `SaldoInicialCaixa` in `src/Amani.ImportadosERP.Domain/Entities/EventoFinanceiro.cs`
- [X] T040 [US2] If `EventoFinanceiro` is created, implement value, date, origem, and descricao validation in `src/Amani.ImportadosERP.Domain/Entities/EventoFinanceiro.cs`

### Application and Repositories

- [X] T041 [US2] Create `src/Amani.ImportadosERP.Application/Interfaces/IEventoFinanceiroRepository.cs` only if a new financial event entity is technically necessary
- [X] T042 [US2] Implement saldo inicial de caixa validation in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T043 [US2] Implement saldo inicial de caixa creation using the reused financial structure or `IEventoFinanceiroRepository` in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [X] T044 [US2] Map saldo inicial de caixa result to `SaldoInicialCaixaResultadoDto` explicitly in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`

### Infra.Data

- [X] T045 [US2] Create `src/Amani.ImportadosERP.Infra.Data/Repositories/EventoFinanceiroRepository.cs` only if `IEventoFinanceiroRepository` is created
- [X] T046 [US2] Create `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EventoFinanceiroMapping.cs` only if `EventoFinanceiro` is created
- [X] T047 [US2] Add `DbSet<EventoFinanceiro>` to `src/Amani.ImportadosERP.Infra.Data/Context/AmaniDbContext.cs` only if `EventoFinanceiro` is created
- [X] T048 [US2] Register `IEventoFinanceiroRepository` in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs` only if the repository is created
- [X] T049 [US2] Create EF migration in `src/Amani.ImportadosERP.Infra.Data/Migrations` for saldo inicial de caixa persistence changes only after reuse/new-entity decision is complete

### API

- [X] T050 [US2] Add `POST /api/implantacao/saldo-inicial-caixa` endpoint to `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs`
- [X] T051 [US2] Ensure `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs` returns the saldo inicial de caixa response DTO and delegates validation to `ImplantacaoService`
- [X] T052 [US2] Ensure saldo inicial de caixa endpoint responses match `specs/002-implantacao-inicial/contracts/implantacao-inicial-api.md`

### Manual Validation

- [X] T053 [US2] Validate saldo inicial de caixa scenario from `specs/002-implantacao-inicial/quickstart.md`
- [X] T054 [US2] Confirm saldo inicial de caixa is not treated as sale revenue by inspecting `src/Amani.ImportadosERP.Application/Services/VendaService.cs` and dashboard query handlers in `src/Amani.ImportadosERP.Application/Queries/Handlers`
- [X] T055 [US2] Confirm dashboard financeiro files were not changed for this story

**Checkpoint**: US2 is complete when opening cash is recorded with traceable origin and no sale/dashboard behavior changes.

---

## Phase 5: User Story 3 - Cadastrar contas a receber iniciais (Priority: P3)

**Goal**: Register old customer receivables by reusing the existing accounts receivable model with traceable opening origin.

**Independent Test**: Register an initial receivable through `POST /api/implantacao/contas-receber-iniciais`, verify it appears in existing receivable flows, then register a payment and confirm origin remains unchanged.

### Domain

- [ ] T056 [US3] Add traceable origin support to `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs`
- [ ] T057 [US3] Allow nullable `VendaId` in `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs` only for `SaldoInicial` or `ImplantacaoInicial` origin
- [ ] T058 [US3] Add `ClienteId` support to `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs` for initial receivables
- [ ] T059 [US3] Add factory or constructor path for initial receivables in `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs`
- [ ] T060 [US3] Ensure existing sale-created receivable behavior in `src/Amani.ImportadosERP.Domain/Entities/ContaReceber.cs` still requires `VendaId`

### Application DTOs and Services

- [ ] T061 [US3] Implement cliente existence validation using `IClienteRepository` in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [ ] T062 [US3] Implement positive valor validation for initial receivables in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [ ] T063 [US3] Implement dataVencimento validation for initial receivables in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [ ] T064 [US3] Implement origem validation for `SaldoInicial` or `ImplantacaoInicial` in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [ ] T065 [US3] Implement initial receivable creation using `IContaReceberRepository` in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`
- [ ] T066 [US3] Map initial receivable result to `ContaReceberInicialResultadoDto` explicitly in `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs`

### Infra.Data

- [ ] T067 [US3] Update `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ContaReceberMapping.cs` to persist nullable `VendaId`, required origin, and customer relation for initial receivables
- [ ] T068 [US3] Update `src/Amani.ImportadosERP.Infra.Data/Repositories/ContaReceberRepository.cs` only if existing add/query methods cannot support initial receivables
- [ ] T069 [US3] Create EF migration in `src/Amani.ImportadosERP.Infra.Data/Migrations` for ContaReceber origin, nullable VendaId, and ClienteId changes

### API

- [ ] T070 [US3] Add `POST /api/implantacao/contas-receber-iniciais` endpoint to `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs`
- [ ] T071 [US3] Ensure `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs` returns the conta receber inicial response DTO and delegates validation to `ImplantacaoService`
- [ ] T072 [US3] Ensure contas a receber iniciais endpoint responses match `specs/002-implantacao-inicial/contracts/implantacao-inicial-api.md`

### Manual Validation

- [ ] T073 [US3] Validate contas a receber iniciais scenario from `specs/002-implantacao-inicial/quickstart.md`
- [ ] T074 [US3] Validate existing payment flow against an initial receivable through `src/Amani.ImportadosERP.Api/Controllers/ContasReceberController.cs`
- [ ] T075 [US3] Confirm no artificial sale is created by inspecting `src/Amani.ImportadosERP.Application/Services/VendaService.cs` and `src/Amani.ImportadosERP.Infra.Data/Repositories/VendaRepository.cs`
- [ ] T076 [US3] Confirm sale behavior for inactive cliente remains unchanged in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`

**Checkpoint**: US3 is complete when initial receivables are payable through the existing flow and origin remains traceable.

---

## Phase 6: Polish & Cross-Cutting Validation

**Purpose**: Validate complete feature, migrations, contracts, regressions and architectural constraints.

- [ ] T077 Run `dotnet build Amani_ImportadosERP.sln` from repository root
- [ ] T078 Validate all endpoints in `specs/002-implantacao-inicial/contracts/implantacao-inicial-api.md`
- [ ] T079 Validate all scenarios in `specs/002-implantacao-inicial/quickstart.md`
- [ ] T080 Inspect `src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs` and confirm it contains no business rules
- [ ] T081 Inspect `src/Amani.ImportadosERP.Application/DTOs` and confirm implantacao endpoints use explicit DTOs and no domain entities as contracts
- [ ] T082 Inspect `src/Amani.ImportadosERP.Application/Services/ImplantacaoService.cs` and confirm no AutoMapper usage was introduced
- [ ] T083 Inspect `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations` and confirm all new persisted fields/types use Fluent API
- [ ] T084 Inspect `src/Amani.ImportadosERP.Domain/Entities/Produto.cs` and confirm no fixed stock field was introduced
- [ ] T085 Inspect `src/Amani.ImportadosERP.Application/Services/CompraService.cs` and `src/Amani.ImportadosERP.Application/Services/VendaService.cs` and confirm purchase/sale rules were not changed
- [ ] T086 Inspect dashboard handlers in `src/Amani.ImportadosERP.Application/Queries/Handlers` and confirm dashboard financeiro was not changed
- [ ] T087 Inspect generated migrations in `src/Amani.ImportadosERP.Infra.Data/Migrations` and confirm they only cover Feature 002 persistence changes
- [ ] T088 Run `git status --short` and confirm only intended Feature 002 files changed

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup and Safety Review (Phase 1)**: Start immediately.
- **Foundational Contracts and Shared Plumbing (Phase 2)**: Depends on Phase 1 and blocks all user stories.
- **US1 Inventario Inicial (Phase 3)**: Depends on Phase 2; delivers MVP.
- **US2 Saldo Inicial de Caixa (Phase 4)**: Depends on Phase 2 and must perform reuse decision before new entity tasks.
- **US3 Contas a Receber Iniciais (Phase 5)**: Depends on Phase 2; can run after or alongside US2, but should account for any shared financial origin naming decided in US2.
- **Polish & Cross-Cutting Validation (Phase 6)**: Depends on completed desired user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; recommended MVP.
- **US2 (P2)**: Independent after Foundational, except for shared `ImplantacaoService` shell.
- **US3 (P3)**: Independent after Foundational, but should reuse any shared origin constants/naming introduced by US2 if created.

### Within Each User Story

- Domain changes before Application service methods.
- DTOs and repository interfaces before service methods that call them.
- Repository implementations before service persistence calls.
- Fluent API before migrations.
- Services before controller endpoints.
- Controller endpoints before manual quickstart validation.

### Parallel Opportunities

- T006-T012 can run in parallel because each creates a distinct DTO file.
- T016-T019 and T020-T024 should be mostly sequential within US1 because movement rules affect service construction.
- T036-T038 must remain sequential because they decide reuse before new entity creation.
- T061-T064 can run in sequence in the same service file, while T067 can be prepared separately after domain fields are decided.
- Cross-cutting inspection tasks T080-T087 can run in parallel after implementation and build.

---

## Parallel Example: Foundational DTOs

```text
Task: "T006 Create src/Amani.ImportadosERP.Application/DTOs/RegistrarInventarioInicialDto.cs"
Task: "T009 Create src/Amani.ImportadosERP.Application/DTOs/RegistrarSaldoInicialCaixaDto.cs"
Task: "T011 Create src/Amani.ImportadosERP.Application/DTOs/RegistrarContaReceberInicialDto.cs"
```

## Parallel Example: Final Validation

```text
Task: "T080 Inspect src/Amani.ImportadosERP.Api/Controllers/ImplantacaoController.cs and confirm it contains no business rules"
Task: "T084 Inspect src/Amani.ImportadosERP.Domain/Entities/Produto.cs and confirm no fixed stock field was introduced"
Task: "T086 Inspect dashboard handlers in src/Amani.ImportadosERP.Application/Queries/Handlers and confirm dashboard financeiro was not changed"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for Inventario Inicial.
3. Validate inventory success and rejection scenarios independently.
4. Stop before saldo inicial de caixa and contas a receber iniciais if an MVP checkpoint is needed.

### Incremental Delivery

1. Complete shared DTOs, service shell and controller shell.
2. Deliver Inventario Inicial as MVP.
3. Deliver Saldo Inicial de Caixa after reuse/new-entity decision.
4. Deliver Contas a Receber Iniciais reusing the existing receivable/payment flow.
5. Run build, contract validation, quickstart validation and regression checks.

### Recommended Implementation Sequence

1. T001-T005: confirm scope and reusable structures.
2. T006-T015: create shared contracts and shell.
3. T016-T035: implement and validate inventory initial.
4. T036-T055: implement and validate cash opening balance, only creating a new entity if reuse is insufficient.
5. T056-T076: implement and validate initial receivables.
6. T077-T088: run build, contract checks, manual validations and architectural review.

## Architectural Risks

- **Cash event reuse risk**: Existing financial structures may not represent cash opening balance without distorting revenue or expenses; T036-T038 force the reuse decision before entity creation.
- **ContaReceber compatibility risk**: Making `VendaId` nullable can affect existing queries and payment handlers; T056-T060 and T067-T069 isolate this change and require preserving sale-created receivable behavior.
- **Stock history risk**: Treating inventory as `Entrada` would blur purchase and deployment origins; T016-T018 require a dedicated `InventarioInicial` type.
- **Migration scope risk**: Feature 002 likely needs persistence changes across stock movement type, cash event and receivable origin; T087 explicitly audits generated migrations for unrelated changes.

## Notes

- [P] tasks touch different files and can run in parallel after their dependencies.
- Story labels map to the specification user stories.
- This task list intentionally avoids frontend, mobile, authentication, spreadsheet import, dashboard financeiro changes and inactive-customer sale changes.
- This task list intentionally avoids automated test tasks because tests were not requested and the current solution has no test project.
- Migrations are listed as implementation tasks only; no migration is generated by task creation.
