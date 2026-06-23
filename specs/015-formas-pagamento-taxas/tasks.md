# Tasks: Formas de Pagamento na Venda + Taxas de Operadora

**Input**: Design documents from `/specs/015-formas-pagamento-taxas/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: No dedicated backend test project is present. Validation tasks use `dotnet build`, frontend `lint`/`typecheck`/`build`, and the quickstart scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and validation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label, only in user story phases
- Every task includes an exact repository path

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm current implementation points and prepare files that every story will use.

- [X] T001 Review current sale creation flow in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T002 Review current receivable payment flow in `src/Amani.ImportadosERP.Application/Commands/Handlers/RegistrarPagamentoCommandHandler.cs`
- [X] T003 [P] Review current sale frontend submit flow in `frontend/src/app/vendas/nova/page.tsx`
- [X] T004 [P] Review current receivable payment modal in `frontend/src/components/financeiro/receivable-payment-modal.tsx`
- [X] T005 [P] Review current route registry in `frontend/src/config/routes.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain model, persistence, shared contracts and dependency injection required before any user story can be completed.

**Critical**: No user story work should begin until this phase is complete.

- [X] T006 [P] Create `FormaPagamento` enum with Dinheiro, PIX, CartaoDebito, CartaoCredito and Fiado in `src/Amani.ImportadosERP.Domain/Enums/FormaPagamento.cs`
- [X] T007 [P] Create `ConfiguracaoFormaPagamento` entity with FormaPagamento, PercentualTaxa and AtualizadoEm in `src/Amani.ImportadosERP.Domain/Entities/ConfiguracaoFormaPagamento.cs`
- [X] T008 [P] Create `DespesaOperadora` entity with VendaId, FormaPagamento, ValorBruto, ValorLiquido, PercentualTaxa and DataRegistro in `src/Amani.ImportadosERP.Domain/Entities/DespesaOperadora.cs`
- [X] T009 Extend `Venda` with FormaPagamento and PercentualTaxaAplicado invariants in `src/Amani.ImportadosERP.Domain/Entities/Venda.cs`
- [X] T010 Extend `PagamentoRecebido` with Desconto and ValorBrutoLiquidado invariants in `src/Amani.ImportadosERP.Domain/Entities/PagamentoRecebido.cs`
- [X] T011 [P] Create Fluent mapping for `ConfiguracaoFormaPagamento` in `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ConfiguracaoFormaPagamentoMapping.cs`
- [X] T012 [P] Create Fluent mapping for `DespesaOperadora` in `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/DespesaOperadoraMapping.cs`
- [X] T013 Update `VendaMapping` for FormaPagamento and PercentualTaxaAplicado in `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/VendaMapping.cs`
- [X] T014 Update `PagamentoRecebidoMapping` for Desconto and ValorBrutoLiquidado in `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/PagamentoRecebidoMapping.cs`
- [X] T015 Register new entity mappings in `src/Amani.ImportadosERP.Infra.Data/AppDbContext.cs`
- [X] T016 [P] Create `IConfiguracaoFormaPagamentoRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IConfiguracaoFormaPagamentoRepository.cs`
- [X] T017 [P] Create `IDespesaOperadoraRepository` in `src/Amani.ImportadosERP.Application/Interfaces/IDespesaOperadoraRepository.cs`
- [X] T018 [P] Implement `ConfiguracaoFormaPagamentoRepository` in `src/Amani.ImportadosERP.Infra.Data/Repositories/ConfiguracaoFormaPagamentoRepository.cs`
- [X] T019 [P] Implement `DespesaOperadoraRepository` with date/payment filters in `src/Amani.ImportadosERP.Infra.Data/Repositories/DespesaOperadoraRepository.cs`
- [X] T020 Register new repositories in `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [X] T021 Add EF migration for Venda, PagamentoRecebido, ConfiguracaoFormaPagamento and DespesaOperadora schema changes in `src/Amani.ImportadosERP.Infra.Data/Migrations/`
- [X] T022 Add seed data for default payment method fees in `src/Amani.ImportadosERP.Infra.Data/Migrations/`
- [X] T023 Update database snapshot after migration in `src/Amani.ImportadosERP.Infra.Data/Migrations/AppDbContextModelSnapshot.cs`
- [X] T024 [P] Create backend DTOs for payment settings in `src/Amani.ImportadosERP.Application/DTOs/ConfiguracaoFormaPagamentoDto.cs`
- [X] T025 [P] Create backend DTOs for operator expenses in `src/Amani.ImportadosERP.Application/DTOs/DespesaOperadoraListDto.cs`
- [X] T026 Update sale DTOs with FormaPagamento, PercentualTaxaOverride and financial feedback fields in `src/Amani.ImportadosERP.Application/DTOs/CriarVendaDto.cs`
- [X] T027 Update sale result DTO with financial feedback fields in `src/Amani.ImportadosERP.Application/DTOs/VendaResultDto.cs`
- [X] T028 [P] Create frontend payment setting types in `frontend/src/types/payment-settings.ts`
- [X] T029 [P] Create frontend operator expense types in `frontend/src/types/operator-expense.ts`
- [X] T030 Update sale frontend types with payment method and financial response fields in `frontend/src/types/sale.ts`
- [X] T031 Update receivable frontend types with discount and gross settlement fields in `frontend/src/types/receivable.ts`

**Checkpoint**: Foundation ready. User stories can now be implemented in priority order.

---

## Phase 3: User Story 1 - Registrar forma de pagamento no fechamento da venda (Priority: P1) MVP

**Goal**: Require payment method selection after sale item confirmation and before sale persistence.

**Independent Test**: Confirming sale items opens a required payment modal; canceling the modal does not create a sale or receivable; submitting with any payment method creates a sale with coherent financial feedback.

### Implementation for User Story 1

- [X] T032 [P] [US1] Create payment settings service GET method in `frontend/src/services/payment-settings.ts`
- [X] T033 [P] [US1] Create payment settings query hook in `frontend/src/hooks/use-payment-settings.ts`
- [X] T034 [P] [US1] Create sale payment modal shell with method selection and override input in `frontend/src/components/vendas/sale-payment-modal.tsx`
- [X] T035 [US1] Update sale service payload to send FormaPagamento and PercentualTaxaOverride in `frontend/src/services/sales.ts`
- [X] T036 [US1] Update sale form submit flow to open payment modal before calling create in `frontend/src/app/vendas/nova/page.tsx`
- [X] T037 [US1] Update sale form validation to block persistence without payment method in `frontend/src/components/vendas/sale-validation.ts`
- [X] T038 [US1] Add financial feedback display after sale creation in `frontend/src/app/vendas/nova/page.tsx`
- [X] T039 [US1] Add FormaPagamento validation and missing-method error handling in `src/Amani.ImportadosERP.Api/Controllers/VendasController.cs`
- [X] T040 [US1] Update `VendaService.CreateAsync` to require FormaPagamento before constructing Venda in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T041 [US1] Update `VendaMapper` and sale response mapping to include FormaPagamento and financial fields in `src/Amani.ImportadosERP.Application/Mappers/VendaMapper.cs`
- [ ] T042 [US1] Validate quickstart scenario 1 manually, record elapsed time for sale payment selection, and record result in `specs/015-formas-pagamento-taxas/quickstart.md`

**Checkpoint**: US1 is independently functional and sale persistence cannot occur without payment method.

---

## Phase 4: User Story 2 - Automatizar recebimentos imediatos e taxas de debito (Priority: P1)

**Goal**: Automatically create receivables and immediate payments for Dinheiro, PIX and CartaoDebito, with debit card operator expense when applicable.

**Independent Test**: Create Dinheiro, PIX and CartaoDebito sales; money/PIX receivables are paid by gross value, debit is paid by net value and has a visible operator expense.

### Implementation for User Story 2

- [X] T043 [P] [US2] Add helper for card fee and net amount calculation in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T044 [US2] Inject receivable, payment setting and operator expense repositories into `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T045 [US2] Implement Dinheiro and PIX immediate receivable payment routing in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T046 [US2] Implement CartaoDebito net payment and DespesaOperadora creation in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T047 [US2] Implement transactional persistence for sale, stock movements, receivable, payment and operator expense in `src/Amani.ImportadosERP.Application/Services/VendaService.cs` and `src/Amani.ImportadosERP.Infra.Data/`
- [X] T048 [US2] Update `ContaReceberRepository` to load sale-created paid accounts with payments for list/detail projections in `src/Amani.ImportadosERP.Infra.Data/Repositories/ContaReceberRepository.cs`
- [ ] T049 [US2] Validate that failures during receivable, payment or operator expense creation do not leave a persisted sale without matching financial records in `specs/015-formas-pagamento-taxas/quickstart.md`
- [X] T050 [US2] Update `VendaResultDto` response values for Pago, ValorBruto, ValorLiquido, PercentualTaxaAplicado and DespesaOperadoraId in `src/Amani.ImportadosERP.Application/DTOs/VendaResultDto.cs`
- [X] T051 [US2] Add FormaPagamento to `VendaListDto` and sale list mapping in `src/Amani.ImportadosERP.Application/DTOs/VendaListDto.cs`
- [X] T052 [US2] Update frontend sale feedback copy for Dinheiro, PIX and Debito in `frontend/src/app/vendas/nova/page.tsx`
- [X] T053 [US2] Create operator expense service list method for validation reuse in `frontend/src/services/operator-expenses.ts`
- [ ] T054 [US2] Validate quickstart scenarios 2 and 3 manually and record result in `specs/015-formas-pagamento-taxas/quickstart.md`

**Checkpoint**: US2 is independently functional for immediate payment methods.

---

## Phase 5: User Story 3 - Receber credito ou fiado com valor efetivo e desconto (Priority: P2)

**Goal**: Generate pending receivables for CartaoCredito and Fiado, support discount on payments, and close credit-card gross balances using received value plus operator fee.

**Independent Test**: Credit sale creates next-business-day pending receivable; credit net settlement closes gross balance and creates operator expense; fiado payment accepts valid discount and rejects `valor + desconto` above saldo.

### Implementation for User Story 3

- [X] T055 [P] [US3] Add next-business-day due date helper in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T056 [US3] Implement CartaoCredito pending receivable creation with next business day due date in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T057 [US3] Implement Fiado pending receivable creation with sale-date due date and no operator fee in `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T058 [P] [US3] Extend `RegistrarPagamentoDto` with Desconto, ValorBrutoLiquidado and PercentualTaxaOperadora in `src/Amani.ImportadosERP.Application/DTOs/RegistrarPagamentoDto.cs`
- [X] T059 [US3] Extend `RegistrarPagamentoCommand` with Desconto, ValorBrutoLiquidado and PercentualTaxaOperadora in `src/Amani.ImportadosERP.Application/Commands/RegistrarPagamentoCommand.cs`
- [X] T060 [US3] Update `ContasReceberController` to map discount and card settlement fields in `src/Amani.ImportadosERP.Api/Controllers/ContasReceberController.cs`
- [X] T061 [US3] Update `RegistrarPagamentoCommandHandler` to validate `Valor + Desconto <= Saldo` for regular payments in `src/Amani.ImportadosERP.Application/Commands/Handlers/RegistrarPagamentoCommandHandler.cs`
- [X] T062 [US3] Update `RegistrarPagamentoCommandHandler` to settle CartaoCredito gross balance with received value plus operator fee in `src/Amani.ImportadosERP.Application/Commands/Handlers/RegistrarPagamentoCommandHandler.cs`
- [X] T063 [US3] Update payment history DTOs with Desconto and ValorBrutoLiquidado in `src/Amani.ImportadosERP.Application/DTOs/PagamentoDetalheDto.cs`
- [X] T064 [US3] Update receivable repository detail projection for payment discounts in `src/Amani.ImportadosERP.Infra.Data/Repositories/ContaReceberRepository.cs`
- [X] T065 [US3] Update receivables service registerPayment payload in `frontend/src/services/receivables.ts`
- [X] T066 [US3] Add discount input and validation messaging to payment modal in `frontend/src/components/financeiro/receivable-payment-modal.tsx`
- [X] T067 [US3] Add card-credit effective amount and gross settlement UI path in `frontend/src/components/financeiro/receivable-payment-modal.tsx`
- [X] T068 [US3] Update `use-receivables` mutation invalidations for payment changes in `frontend/src/hooks/use-receivables.ts`
- [ ] T069 [US3] Validate quickstart scenarios 4, 5 and 6 manually and record result in `specs/015-formas-pagamento-taxas/quickstart.md`

**Checkpoint**: US3 is independently functional for pending receivables, discounts and credit-card settlement.

---

## Phase 6: User Story 4 - Configurar taxas e consultar despesas de operadora (Priority: P3)

**Goal**: Allow authenticated users to edit default payment fees and list operator expenses by date/payment method.

**Independent Test**: Change a default fee, create a sale that uses it, create another sale with override, then filter operator expenses by period and method.

### Implementation for User Story 4

- [X] T070 [P] [US4] Create query for listing payment method settings in `src/Amani.ImportadosERP.Application/Queries/ObterConfiguracoesFormasPagamentoQuery.cs`
- [X] T071 [P] [US4] Create handler for listing payment method settings in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterConfiguracoesFormasPagamentoQueryHandler.cs`
- [X] T072 [P] [US4] Create command for updating payment method fee in `src/Amani.ImportadosERP.Application/Commands/AtualizarConfiguracaoFormaPagamentoCommand.cs`
- [X] T073 [P] [US4] Create handler for updating payment method fee in `src/Amani.ImportadosERP.Application/Commands/Handlers/AtualizarConfiguracaoFormaPagamentoCommandHandler.cs`
- [X] T074 [US4] Create payment settings controller with GET and PUT actions in `src/Amani.ImportadosERP.Api/Controllers/ConfiguracoesFormasPagamentoController.cs`
- [X] T075 [US4] Ensure payment fee editing follows the current ERP access model and does not introduce new authorization roles in `src/Amani.ImportadosERP.Api/Controllers/ConfiguracoesFormasPagamentoController.cs`
- [X] T076 [P] [US4] Create query for operator expense listing in `src/Amani.ImportadosERP.Application/Queries/ObterDespesasOperadoraQuery.cs`
- [X] T077 [P] [US4] Create handler for operator expense listing in `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDespesasOperadoraQueryHandler.cs`
- [X] T078 [US4] Create operator expenses controller with date and payment filters in `src/Amani.ImportadosERP.Api/Controllers/DespesasOperadoraController.cs`
- [X] T079 [P] [US4] Implement payment settings service GET and PUT methods in `frontend/src/services/payment-settings.ts`
- [X] T080 [P] [US4] Implement operator expenses service filters in `frontend/src/services/operator-expenses.ts`
- [X] T081 [P] [US4] Implement payment settings mutations in `frontend/src/hooks/use-payment-settings.ts`
- [X] T082 [P] [US4] Implement operator expenses query hook in `frontend/src/hooks/use-operator-expenses.ts`
- [X] T083 [US4] Create payment fees form with save states in `frontend/src/components/configuracoes/payment-fees-form.tsx`
- [X] T084 [US4] Create payment settings page in `frontend/src/app/configuracoes/formas-pagamento/page.tsx`
- [X] T085 [US4] Create operator expenses list component in `frontend/src/components/financeiro/operator-expenses-list.tsx`
- [X] T086 [US4] Create operator expenses page with filters in `frontend/src/app/financeiro/despesas-operadora/page.tsx`
- [X] T087 [US4] Add configuracoesFormasPagamento and despesasOperadora routes in `frontend/src/config/routes.ts`
- [X] T088 [US4] Add links to settings and finance navigation surfaces in `frontend/src/config/navigation.ts`
- [ ] T089 [US4] Validate quickstart scenario 7 manually, record elapsed time for fee update plus sale validation, and record result in `specs/015-formas-pagamento-taxas/quickstart.md`

**Checkpoint**: US4 is independently functional for fee configuration and operator expense visibility.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validate the whole feature, regressions, responsiveness and constitution constraints.

- [X] T090 Run backend build for the solution in `Amani_ImportadosERP.sln`
- [X] T091 Run frontend lint in `frontend/package.json`
- [X] T092 Run frontend typecheck in `frontend/package.json`
- [X] T093 Run frontend build in `frontend/package.json`
- [X] T094 Validate that the F015 migration applies cleanly and document rollback command/output in `specs/015-formas-pagamento-taxas/quickstart.md`
- [X] T095 Validate sale cancellation with financial records preserves history in `src/Amani.ImportadosERP.Application/Commands/Handlers/CancelarVendaCommandHandler.cs`
- [X] T096 Validate no frontend critical financial formula is the source of truth in `frontend/src/components/vendas/sale-payment-modal.tsx`
- [ ] T097 Validate Mobile First layouts and elapsed lookup time for all F015 screens against quickstart scenario 8 in `specs/015-formas-pagamento-taxas/quickstart.md`
- [X] T098 Validate existing F013 sale list/detail regressions in `frontend/src/app/vendas/page.tsx`
- [X] T099 Validate existing F014 receivable create/edit/delete regressions in `frontend/src/app/financeiro/contas-receber/page.tsx`
- [X] T100 Update implementation notes if any validation deviates from plan in `specs/015-formas-pagamento-taxas/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 Setup**: No dependencies.
- **Phase 2 Foundational**: Depends on Setup and blocks every user story.
- **Phase 3 US1**: Depends on Foundation.
- **Phase 4 US2**: Depends on Foundation and benefits from US1 frontend flow.
- **Phase 5 US3**: Depends on Foundation and can be implemented after backend sale routing is available.
- **Phase 6 US4**: Depends on Foundation and can run in parallel with US2/US3 after shared entities/repositories exist.
- **Phase 7 Polish**: Depends on all desired user stories.

### User Story Dependencies

- **US1**: MVP. Required for final sale persistence with payment method.
- **US2**: Extends US1 sale routing for immediate payment methods.
- **US3**: Extends sale routing and receivable payment for pending methods.
- **US4**: Provides configuration and visibility; can be implemented after foundational repositories and DTOs.

### Parallel Opportunities

- T003-T005 can run in parallel during setup.
- T006-T008, T011-T012, T016-T019, T024-T025 and T028-T029 can run in parallel during foundation.
- In US1, T032-T034 can run in parallel before integration tasks.
- In US4, backend query/command tasks and frontend service/hook tasks can be split after foundation.

## Parallel Example: User Story 1

```text
Task: T032 Create payment settings service GET method in frontend/src/services/payment-settings.ts
Task: T033 Create payment settings query hook in frontend/src/hooks/use-payment-settings.ts
Task: T034 Create sale payment modal shell in frontend/src/components/vendas/sale-payment-modal.tsx
```

## Parallel Example: User Story 4

```text
Task: T070 Create query in src/Amani.ImportadosERP.Application/Queries/ObterConfiguracoesFormasPagamentoQuery.cs
Task: T076 Create query in src/Amani.ImportadosERP.Application/Queries/ObterDespesasOperadoraQuery.cs
Task: T079 Implement payment settings service in frontend/src/services/payment-settings.ts
Task: T080 Implement operator expenses service in frontend/src/services/operator-expenses.ts
```

## Implementation Strategy

### MVP First

1. Complete Phase 1 and Phase 2.
2. Complete US1.
3. Validate that sale cannot be persisted without payment method.
4. Continue to US2 for the operational UX win: dinheiro/PIX/debito no longer require manual receivable follow-up.

### Incremental Delivery

1. Foundation establishes schema, repositories, DTOs and frontend types.
2. US1 makes sale payment selection mandatory.
3. US2 automates immediate receipts and debit operator expenses.
4. US3 handles pending credit/fiado and discount.
5. US4 exposes configuration and reporting screens.
6. Polish validates build, migrations, regressions and responsive UI.

## Notes

- Tasks marked [P] touch different files and can run in parallel after their phase dependencies are met.
- All user story tasks include [US1], [US2], [US3] or [US4] labels for traceability.
- Backend remains the source of truth for financial calculations.
- Do not add parcelamento, split payment, estorno with refund or automatic bank reconciliation.
