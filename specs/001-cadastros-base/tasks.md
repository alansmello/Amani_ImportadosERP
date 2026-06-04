# Tasks: Cadastros Base

**Input**: Design documents from `/specs/001-cadastros-base/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Automated tests were not requested in the specification and no test project exists in the current solution. Validation tasks use build and quickstart scenarios.

**Organization**: Tasks are grouped by user story and ordered by layer within each story: Domain, Application, Infra.Data, Infra.IoC and API.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel when it touches different files and has no dependency on incomplete tasks.
- **[Story]**: Maps task to the user story: US1 Clientes, US2 Fornecedores/Categorias, US3 Produtos.
- Every task includes exact file paths.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current context and avoid touching excluded modules.

- [ ] T001 Review `specs/001-cadastros-base/spec.md`, `specs/001-cadastros-base/plan.md`, `specs/001-cadastros-base/data-model.md`, and `specs/001-cadastros-base/contracts/cadastros-base-api.md`
- [ ] T002 Inspect existing cadastro code in `src/Amani.ImportadosERP.Domain/Entities`, `src/Amani.ImportadosERP.Application/Services`, `src/Amani.ImportadosERP.Application/Interfaces`, `src/Amani.ImportadosERP.Infra.Data/Repositories`, and `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations`
- [ ] T003 Confirm no implementation work will modify `src/Amani.ImportadosERP.Application/Services/CompraService.cs`, `src/Amani.ImportadosERP.Application/Services/VendaService.cs`, stock repositories, cost repositories, sales controllers, purchase controllers, or frontend files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared contracts and repository capabilities needed by all cadastro user stories.

**CRITICAL**: No user story endpoint work should begin until this phase is complete.

### Application

- [ ] T004 [P] Create `src/Amani.ImportadosERP.Application/DTOs/AtualizarClienteDto.cs` with cliente update input fields
- [ ] T005 [P] Create `src/Amani.ImportadosERP.Application/DTOs/ClienteDto.cs` with cliente output fields including active state
- [ ] T006 [P] Create `src/Amani.ImportadosERP.Application/DTOs/AtualizarFornecedorDto.cs` with fornecedor update input fields
- [ ] T007 [P] Create `src/Amani.ImportadosERP.Application/DTOs/FornecedorDto.cs` with fornecedor output fields
- [ ] T008 [P] Create `src/Amani.ImportadosERP.Application/DTOs/CriarCategoriaDto.cs` with categoria create input fields
- [ ] T009 [P] Create `src/Amani.ImportadosERP.Application/DTOs/AtualizarCategoriaDto.cs` with categoria update input fields
- [ ] T010 [P] Create `src/Amani.ImportadosERP.Application/DTOs/CategoriaDto.cs` with categoria output fields
- [ ] T011 [P] Create `src/Amani.ImportadosERP.Application/DTOs/AtualizarProdutoDto.cs` with produto update input fields
- [ ] T012 Update `src/Amani.ImportadosERP.Application/DTOs/ProdutoDto.cs` only if needed so product output matches `contracts/cadastros-base-api.md`
- [ ] T013 Extend `src/Amani.ImportadosERP.Application/Interfaces/IClienteRepository.cs` with list, tracked get, save, and active-filter read operations
- [ ] T014 Extend `src/Amani.ImportadosERP.Application/Interfaces/IFornecedorRepository.cs` with list, tracked get, and save operations
- [ ] T015 Extend `src/Amani.ImportadosERP.Application/Interfaces/IProdutoRepository.cs` with list, tracked get, and save operations
- [ ] T016 Create `src/Amani.ImportadosERP.Application/Interfaces/ICategoriaRepository.cs` with add, list, get by id, tracked get, and save operations

### Infra.Data

- [ ] T017 Extend `src/Amani.ImportadosERP.Infra.Data/Repositories/ClienteRepository.cs` to implement the new `IClienteRepository` methods without deleting cliente records
- [ ] T018 Extend `src/Amani.ImportadosERP.Infra.Data/Repositories/FornecedorRepository.cs` to implement the new `IFornecedorRepository` methods
- [ ] T019 Extend `src/Amani.ImportadosERP.Infra.Data/Repositories/ProdutoRepository.cs` to implement the new `IProdutoRepository` methods without stock fields or stock movement changes
- [ ] T020 Create `src/Amani.ImportadosERP.Infra.Data/Repositories/CategoriaRepository.cs` implementing `ICategoriaRepository`

**Checkpoint**: Shared DTOs and repository interfaces are ready for story-specific implementation.

---

## Phase 3: User Story 1 - Manter clientes operacionais (Priority: P1) MVP

**Goal**: Allow operators to create, list, get, update and inactivate clientes without deleting history.

**Independent Test**: Create a cliente, list it, get it by id, update it, inactivate it, and confirm the active state changed while history remains intact.

### Domain

- [ ] T021 [US1] Add `Ativo` state and default active initialization to `src/Amani.ImportadosERP.Domain/Entities/Cliente.cs`
- [ ] T022 [US1] Add cliente name update and inactivation behavior to `src/Amani.ImportadosERP.Domain/Entities/Cliente.cs`

### Application

- [ ] T023 [US1] Extend `src/Amani.ImportadosERP.Application/Services/ClienteService.cs` with create returning `ClienteDto`, list with optional active filter, get by id, update, and inactivate operations
- [ ] T024 [US1] Ensure `src/Amani.ImportadosERP.Application/Services/ClienteService.cs` maps Cliente to DTOs explicitly without AutoMapper and does not return domain entities

### Infra.Data

- [ ] T025 [US1] Update `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ClienteMapping.cs` to map the `Ativo` property with default active value
- [ ] T026 [US1] Add an EF migration in `src/Amani.ImportadosERP.Infra.Data/Migrations` for the cliente active state only

### Infra.IoC

- [ ] T027 [US1] Register `ClienteService` in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`

### API

- [ ] T028 [US1] Create `src/Amani.ImportadosERP.Api/Controllers/ClientesController.cs` with `POST /api/clientes`, `GET /api/clientes`, `GET /api/clientes/{id}`, `PUT /api/clientes/{id}`, and `POST /api/clientes/{id}/inativar`
- [ ] T029 [US1] Ensure `src/Amani.ImportadosERP.Api/Controllers/ClientesController.cs` delegates all business decisions to `ClienteService` and contains no business rules
- [ ] T030 [US1] Validate the cliente lifecycle manually using `specs/001-cadastros-base/quickstart.md`

**Checkpoint**: US1 is complete when cliente endpoints work independently and client inactivation preserves history.

---

## Phase 4: User Story 2 - Manter fornecedores e categorias (Priority: P2)

**Goal**: Allow operators to create, list, get and update fornecedores and categorias.

**Independent Test**: Create fornecedor and categoria, list both, get both by id, update both, and verify related records remain associated.

### Domain

- [ ] T031 [P] [US2] Review `src/Amani.ImportadosERP.Domain/Entities/Fornecedor.cs` and confirm existing update behavior satisfies fornecedor contract
- [ ] T032 [P] [US2] Review `src/Amani.ImportadosERP.Domain/Entities/Categoria.cs` and confirm existing update behavior satisfies categoria contract

### Application

- [ ] T033 [US2] Extend `src/Amani.ImportadosERP.Application/Services/FornecedorService.cs` with create returning `FornecedorDto`, list, get by id, and update operations
- [ ] T034 [US2] Create `src/Amani.ImportadosERP.Application/Services/CategoriaService.cs` with create returning `CategoriaDto`, list, get by id, and update operations
- [ ] T035 [US2] Ensure `FornecedorService` and `CategoriaService` map entities to DTOs explicitly without AutoMapper

### Infra.Data

- [ ] T036 [US2] Verify `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/FornecedorMapping.cs` remains sufficient for fornecedor create/list/get/update
- [ ] T037 [US2] Verify `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CategoriaMapping.cs` remains sufficient for categoria create/list/get/update

### Infra.IoC

- [ ] T038 [US2] Register `FornecedorService`, `CategoriaService`, and `ICategoriaRepository` in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`

### API

- [ ] T039 [US2] Create `src/Amani.ImportadosERP.Api/Controllers/FornecedoresController.cs` with `POST /api/fornecedores`, `GET /api/fornecedores`, `GET /api/fornecedores/{id}`, and `PUT /api/fornecedores/{id}`
- [ ] T040 [US2] Create `src/Amani.ImportadosERP.Api/Controllers/CategoriasController.cs` with `POST /api/categorias`, `GET /api/categorias`, `GET /api/categorias/{id}`, and `PUT /api/categorias/{id}`
- [ ] T041 [US2] Ensure fornecedor and categoria controllers delegate all business decisions to Application services and contain no business rules
- [ ] T042 [US2] Validate fornecedor and categoria flows manually using `specs/001-cadastros-base/quickstart.md`

**Checkpoint**: US2 is complete when fornecedor and categoria endpoints work independently.

---

## Phase 5: User Story 3 - Manter produtos para compras e vendas (Priority: P3)

**Goal**: Allow operators to create, list, get and update produtos with valid category and optional supplier references, without touching stock.

**Independent Test**: Create product with valid category and optional supplier, list it, get it by id, update it, reject invalid references, and confirm no stock movement is created.

### Domain

- [ ] T043 [US3] Add product name update behavior to `src/Amani.ImportadosERP.Domain/Entities/Produto.cs` if current methods cannot update all contract fields
- [ ] T044 [US3] Add optional supplier clearing behavior to `src/Amani.ImportadosERP.Domain/Entities/Produto.cs` if needed for `fornecedorId: null` updates
- [ ] T045 [US3] Confirm `src/Amani.ImportadosERP.Domain/Entities/Produto.cs` still has no fixed stock balance field

### Application

- [ ] T046 [US3] Extend `src/Amani.ImportadosERP.Application/Services/ProdutoService.cs` with create returning `ProdutoDto`, list, get by id, and update operations
- [ ] T047 [US3] Add category existence validation in `src/Amani.ImportadosERP.Application/Services/ProdutoService.cs` using `ICategoriaRepository`
- [ ] T048 [US3] Add optional supplier existence validation in `src/Amani.ImportadosERP.Application/Services/ProdutoService.cs` using `IFornecedorRepository`
- [ ] T049 [US3] Ensure `src/Amani.ImportadosERP.Application/Services/ProdutoService.cs` maps Produto to DTOs explicitly without AutoMapper

### Infra.Data

- [ ] T050 [US3] Verify `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ProdutoMapping.cs` remains sufficient and does not add stock fields
- [ ] T051 [US3] Verify `src/Amani.ImportadosERP.Infra.Data/Repositories/ProdutoRepository.cs` list/get/update operations do not create, remove, or query stock movements

### Infra.IoC

- [ ] T052 [US3] Register `ProdutoService` in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`

### API

- [ ] T053 [US3] Create `src/Amani.ImportadosERP.Api/Controllers/ProdutosController.cs` with `POST /api/produtos`, `GET /api/produtos`, `GET /api/produtos/{id}`, and `PUT /api/produtos/{id}`
- [ ] T054 [US3] Ensure `src/Amani.ImportadosERP.Api/Controllers/ProdutosController.cs` delegates reference validation and update rules to `ProdutoService`
- [ ] T055 [US3] Validate produto flows and invalid reference cases manually using `specs/001-cadastros-base/quickstart.md`

**Checkpoint**: US3 is complete when product endpoints work and no stock, purchase, sale, cost-average or profit behavior changes.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validate the complete feature and protect constitution constraints.

- [ ] T056 Run `dotnet build Amani_ImportadosERP.sln` from repository root
- [ ] T057 Validate all public endpoint contracts from `specs/001-cadastros-base/contracts/cadastros-base-api.md`
- [ ] T058 Validate regression checks from `specs/001-cadastros-base/quickstart.md` for compras, vendas, estoque, custo medio and lucro
- [ ] T059 Inspect controllers in `src/Amani.ImportadosERP.Api/Controllers` and confirm they contain no business rules
- [ ] T060 Inspect DTO usage in `src/Amani.ImportadosERP.Application/DTOs` and confirm cadastro endpoints do not expose domain entities as contracts
- [ ] T061 Inspect `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations` and confirm all new persisted fields are mapped with Fluent API
- [ ] T062 Inspect the solution for `AutoMapper` references and confirm none were introduced

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Start immediately.
- **Foundational (Phase 2)**: Depends on Setup and blocks all user stories.
- **US1 Clientes (Phase 3)**: Depends on Foundational.
- **US2 Fornecedores/Categorias (Phase 4)**: Depends on Foundational and can run after or alongside US1 once shared foundations are complete.
- **US3 Produtos (Phase 5)**: Depends on Foundational and benefits from US2 because products need valid categories and optional suppliers.
- **Polish (Phase 6)**: Depends on completed desired user stories.

### User Story Dependencies

- **US1 (P1)**: Independent after Foundational; MVP scope.
- **US2 (P2)**: Independent after Foundational, but enables clean product reference validation.
- **US3 (P3)**: Depends on category repository/service from US2 for full product validation.

### Within Each User Story

- Domain changes before Application services.
- DTOs and repository interfaces before services.
- Repository implementations before service methods that call them.
- Services before controllers.
- Controllers before quickstart validation.

### Parallel Opportunities

- T004-T011 can run in parallel because each creates or updates a distinct DTO file.
- T017-T020 can run in parallel after repository interfaces are updated.
- T031-T032 can run in parallel because they inspect different domain entities.
- T036-T037 can run in parallel because they inspect different mappings.
- Some controller tasks can run in parallel after their services are ready.

---

## Parallel Example: Foundational DTOs

```text
Task: "T004 Create src/Amani.ImportadosERP.Application/DTOs/AtualizarClienteDto.cs"
Task: "T006 Create src/Amani.ImportadosERP.Application/DTOs/AtualizarFornecedorDto.cs"
Task: "T008 Create src/Amani.ImportadosERP.Application/DTOs/CriarCategoriaDto.cs"
Task: "T011 Create src/Amani.ImportadosERP.Application/DTOs/AtualizarProdutoDto.cs"
```

## Parallel Example: User Story 2

```text
Task: "T031 Review src/Amani.ImportadosERP.Domain/Entities/Fornecedor.cs"
Task: "T032 Review src/Amani.ImportadosERP.Domain/Entities/Categoria.cs"
Task: "T036 Verify src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/FornecedorMapping.cs"
Task: "T037 Verify src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CategoriaMapping.cs"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 for Clientes.
3. Validate cliente lifecycle independently.
4. Stop before supplier/category/product work if an MVP checkpoint is needed.

### Incremental Delivery

1. Complete shared DTO and repository foundations.
2. Deliver Clientes as MVP.
3. Deliver Fornecedores and Categorias.
4. Deliver Produtos with reference validation.
5. Run cross-cutting build and regression validation.

### Layer-First Safety Rule

For each user story, keep changes in the requested layer order:
Domain -> Application -> Infra.Data -> Infra.IoC -> API.

Do not modify stock, purchase, sale, cost-average or profit rules while executing
these tasks.

## Notes

- [P] tasks touch different files and can run in parallel after their dependencies are complete.
- Story labels map to the specification user stories.
- This task list intentionally avoids frontend work and new external libraries.
- This task list intentionally avoids automated test tasks because tests were not requested and the current solution has no test project.
