# F027 Validation Evidence

Feature: Devolucoes e Reembolsos de Compras
Branch: 027-devolucoes-reembolsos-compras
Feature flag: `DevolucoesReembolsosComprasEnabled=false` until explicit production approval.

## Production Safety Gates

| Gate | Status | Evidence | Responsible | Date/Time UTC | Notes |
|---|---|---|---|---|---|
| Implementation request explicitly approved | Pending | User requested `/speckit-implement` |  |  | Phase 1 only in this pass |
| Production schema approval explicitly granted | Blocked | Requires later approval after rehearsal and reconciliation |  |  | Do not apply migration to production |
| Backup/restoration rehearsal completed | Pending |  |  |  | Isolated copy only |
| Baseline before migration captured | Pending | `artifacts/f027-production-baseline.sql` |  |  |  |
| Migration SQL reviewed as expand-only | Pending | `artifacts/f027-migration-generated.sql` |  |  |  |
| Post-migration checks passed | Pending | `artifacts/f027-post-migration-check.sql` |  |  |  |
| Baseline after migration reconciled | Pending |  |  |  |  |
| Feature flag remains disabled after deploy | Pending | Configuration evidence |  |  |  |

## Build And Static Validation

| Command | Status | Date/Time UTC | Result | Notes |
|---|---|---|---|---|
| `dotnet restore` | Pending |  |  |  |
| `dotnet build --no-restore` | Pending |  |  |  |
| `npm --prefix frontend ci` | Pending |  |  |  |
| `npm --prefix frontend run build` | Pending |  |  |  |
| `git diff --check` | Pending |  |  |  |

## Migration Rehearsal

| Item | Value |
|---|---|
| Database/source copy | Pending |
| PostgreSQL version | Pending |
| Backup identifier | Pending |
| Backup checksum | Pending |
| Restore duration | Pending |
| Migration duration | Pending |
| Lock observations | Pending |
| SQL review result | Pending |

## Baseline Reconciliation

| Area | Before | After | Difference | Status | Notes |
|---|---:|---:|---:|---|---|
| compras count/hash |  |  |  | Pending |  |
| compra_items count/hash |  |  |  | Pending |  |
| compra_item_recebimentos count/hash |  |  |  | Pending |  |
| compra_item_perdas count/hash |  |  |  | Pending |  |
| estoque_movimentacoes count/hash |  |  |  | Pending |  |
| vendas count/hash |  |  |  | Pending |  |
| venda_items count/hash |  |  |  | Pending |  |
| pagamentos_recebidos count/hash |  |  |  | Pending |  |
| despesas count/hash |  |  |  | Pending |  |
| eventos_financeiros count/hash |  |  |  | Pending |  |

## Manual Scenarios

Record IDs, timestamps, screenshots, and observed responses for each scenario in the quickstart.

| Quickstart section | Scenario | Status | Evidence/IDs | Notes |
|---|---|---|---|---|
| 4 | Reembolso parcial e temporalidade | Pending |  |  |
| 5 | Reembolsos multiplos, teto e idempotencia | Pending |  |  |
| 6 | Cancelamento de reembolso | Pending |  |  |
| 7 | Devolucao antes do recebimento | Pending |  |  |
| 8 | Devolucao depois do recebimento | Pending |  |  |
| 9 | Estoque insuficiente e atomicidade | Pending |  |  |
| 10 | Custo com recebimentos em valores diferentes | Pending |  |  |
| 11 | Compensacao da devolucao apos recebimento | Pending |  |  |
| 12 | Alocacao e prejuizo liquido | Pending |  |  |
| 13 | Formulas financeiras | Pending |  |  |
| 14 | Regressao funcional completa | Pending |  |  |

## Concurrency And Replay

| Operation | Attempts | Expected valid effects | Observed valid effects | Status | Notes |
|---|---:|---:|---:|---|---|
| Reembolso | 10 | 1 |  | Pending |  |
| Devolucao | 10 | 1 |  | Pending |  |
| Compensacao/cancelamento | 10 | 1 |  | Pending |  |

## Performance

| Flow | Runs | Passing runs under 2s | Status | Notes |
|---|---:|---:|---|---|
| Lista de compras | 10 |  | Pending |  |
| Detalhe da compra | 10 |  | Pending |  |
| Historico da compra | 10 |  | Pending |  |
| Estoque/historico | 10 |  | Pending |  |
| Dashboard financeiro | 10 |  | Pending |  |
| Dashboard operacional | 10 |  | Pending |  |

## Responsive And Operational UX

| Breakpoint/user | Device | Operation time <= 2 min | Information lookup <= 30 sec | Status | Notes |
|---|---|---:|---:|---|---|
| 360 px / user 1 |  |  |  | Pending |  |
| 360 px / user 2 |  |  |  | Pending |  |
| 768 px / user 1 |  |  |  | Pending |  |
| 768 px / user 2 |  |  |  | Pending |  |
| 1440 px / user 1 |  |  |  | Pending |  |
| 1440 px / user 2 |  |  |  | Pending |  |

## Approval Log

| Approval | Name | Role | Date/Time UTC | Decision | Notes |
|---|---|---|---|---|---|
| Technical implementation |  |  |  | Pending |  |
| Production schema application |  |  |  | Pending | Required separately |
| Feature flag enablement |  |  |  | Pending | Required separately |

## Phase 3 Implementation Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Backend build after US1 implementation | Passed | `dotnet build Amani_ImportadosERP.sln --no-restore` | 0 errors; NU1900 warnings from unreachable Azure DevOps package vulnerability feed |
| Frontend typecheck/build | Blocked | `npm run typecheck` from `frontend` failed because `npm` is not available in PATH | No Node/npm/yarn/pnpm executable was available in this execution environment |
| Quickstart sections 4, 5 and 13 | Blocked | Requires isolated database copy, F027 migration applied outside production, feature flag enabled only in the isolated environment, and executable frontend/backend runtime | T039 remains unchecked until scenarios are actually executed |
| Production safety | Preserved | No production migration was applied and `DevolucoesReembolsosComprasEnabled` remains disabled in configuration | Schema/application release still requires later explicit approval |

## Phase 4 Implementation Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Backend build after US2 implementation | Passed | `dotnet build Amani_ImportadosERP.sln --no-restore` | 0 errors; NU1900 warnings from unreachable Azure DevOps package vulnerability feed |
| Frontend typecheck/build | Blocked | Node/npm/yarn/pnpm are not available in PATH in this execution environment | Frontend changes were implemented by static inspection only |
| Quickstart section 7 | Blocked | Requires isolated database copy, F027 migration applied outside production, feature flag enabled only in the isolated environment, and runtime validation of absence of stock movement | T047 remains unchecked until the scenario is actually executed |
| Production safety | Preserved | No production migration was applied and `DevolucoesReembolsosComprasEnabled` remains disabled in configuration | Devolução anterior records are append-only and do not touch stock/financeiro |

## Phase 5 Implementation Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Backend build after US3 implementation | Passed | `dotnet build Amani_ImportadosERP.sln --no-restore` | 0 errors; NU1900 warnings from unreachable Azure DevOps package vulnerability feed |
| Frontend typecheck/build | Blocked | Node/npm/yarn/pnpm are not available in PATH in this execution environment | Frontend changes were implemented by static inspection only |
| Quickstart sections 8, 9 and 10 | Blocked | Requires isolated database copy, F027 migration applied outside production, feature flag enabled only in isolated environment, stock data, and runtime validation of physical stock movement/cost temporal behavior | T056 remains unchecked until scenarios are actually executed |
| Production safety | Preserved | No production migration was applied and `DevolucoesReembolsosComprasEnabled` remains disabled in configuration | Devolução posterior creates append-only F027 event plus stock saída; no production data was touched |

## Phase 6 Implementation Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Backend build after US4 implementation | Passed | `dotnet build Amani_ImportadosERP.sln --no-restore` | 0 errors; NU1900 warnings from unreachable Azure DevOps package vulnerability feed |
| Frontend typecheck/build | Blocked | Node/npm/yarn/pnpm are not available in PATH in this execution environment | Frontend changes were implemented by static inspection only |
| Quickstart sections 12 and 14 | Blocked | Requires isolated database copy, F027 migration applied outside production, feature flag enabled only in isolated environment, controlled allocations, and full legacy regression | T063 remains unchecked until scenarios are actually executed |
| Production safety | Preserved | No production migration was applied and `DevolucoesReembolsosComprasEnabled` remains disabled in configuration | Recovery indicators are read-only/additive; no production data was touched |

## Phase 7 Implementation Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Backend build after US5 implementation | Passed | `dotnet build Amani_ImportadosERP.sln --no-restore` | 0 errors; NU1900 warnings from unreachable Azure DevOps package vulnerability feed |
| Frontend typecheck/build | Blocked | Node/npm/yarn/pnpm are not available in PATH in this execution environment | Frontend correction dialog and hooks were implemented by static inspection only |
| Quickstart sections 6 and 11 | Blocked | Requires isolated database copy, F027 migration applied outside production, feature flag enabled only in isolated environment, and runtime validation of idempotency, temporal effects, stock restoration and double-correction rejection | T071 remains unchecked until scenarios are actually executed |
| Production safety | Preserved | No production migration was applied and `DevolucoesReembolsosComprasEnabled` remains disabled in configuration | Corrections are append-only compensations/cancellations; no destructive route or production data mutation was introduced |

## Phase 8 Production-Safety Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| Migration SQL export and static audit | Passed | `dotnet ef migrations script 20260701002458_AddProdutoApresentacoesFracionadas 20260816163250_AddDevolucoesReembolsosCompras --project src/Amani.ImportadosERP.Infra.Data/Amani.ImportadosERP.Infra.Data.csproj --startup-project src/Amani.ImportadosERP.Api/Amani.ImportadosERP.Api.csproj --no-build --output artifacts/f027-migration-generated.sql`; SHA256 `5289B8F15C762AB43E039FEF7E229FE8785BC13D6CB362075D87D05196447AF5` | Exactly 5 `CREATE TABLE`; 0 standalone `UPDATE`, `DELETE`, `TRUNCATE`, `DROP` or `ALTER`; only EF migration-history insert and `ON DELETE RESTRICT` FK clauses |
| Isolated backup/restore/migration rehearsal | Blocked | Requires production-like isolated database copy, backup artifact, restore procedure, PostgreSQL runtime and named responsible operators | T073 remains unchecked until rehearsal is executed outside production |
| Baseline before/after reconciliation | Blocked | Requires running `artifacts/f027-production-baseline.sql` before and after the migration rehearsal on the isolated copy and comparing outputs | T074 remains unchecked until data reconciliation is performed |
| Backend and frontend validation | Partially passed | Backend: `dotnet build Amani_ImportadosERP.sln --no-restore` passed with 0 errors and NU1900 feed warnings; frontend: `npm --prefix frontend run lint`, `npm --prefix frontend run typecheck` and `npm --prefix frontend run build` passed outside the sandbox | `npm --prefix frontend ci` and isolated restore/runtime validation were not executed; T075 remains unchecked |
| Legacy regression with feature disabled | Blocked | Requires migrated isolated copy with `DevolucoesReembolsosComprasEnabled=false` and executable application runtime | T076 remains unchecked |
| Replay/concurrency, performance and responsive-user validation | Blocked | Requires isolated runtime, representative data volume, concurrent requests, browser/device validation and at least two representative users | T077, T078 and T079 remain unchecked |
| Deployment runbook and approval gates | Passed | `specs/027-devolucoes-reembolsos-compras/quickstart.md` section 19 | Documents gradual deployment, monitoring, feature-flag disablement, logical rollback without `Down`, and required named approvals |
| Production safety | Preserved | No production migration was applied, no production data was read/written, and the feature flag remains disabled by default | Production activation still requires explicit approval log |

## Phase 9 Polish Pass

| Item | Status | Evidence | Notes |
|---|---|---|---|
| API contract/error review | Passed | `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`; `specs/027-devolucoes-reembolsos-compras/contracts/api-contracts.md` | Correction endpoints now return `201 Created` for newly-created compensation/cancellation and `200 OK` for idempotent replay; business errors remain mapped to `400`, `404` or `409` |
| Structured logs without sensitive data | Passed | `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs` | F027 command success/failure logs include compra/item/event/operacao IDs and result flags; free-text observations/motives are not logged |
| F027 indexes and migration review | Passed | `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/*Devolucao*`, `*Reembolso*`; `src/Amani.ImportadosERP.Infra.Data/Migrations/20260816163250_AddDevolucoesReembolsosCompras.cs`; `artifacts/f027-migration-generated.sql` | Existing indexes cover idempotency, one-to-one compensation/cancellation, purchase/date lookups, item/moment lookups, receipt lookups, refund external reference and allocation joins; no additional index or migration was introduced |
| Frontend accessibility/static review | Passed | `frontend/src/components/compras/refund-dialog.tsx`, `frontend/src/components/compras/return-dialog.tsx`, `frontend/src/components/compras/purchase-event-cancel-dialog.tsx`; `npm --prefix frontend run lint`; `npm --prefix frontend run typecheck`; `npm --prefix frontend run build` | Dialogs include labels, disabled submitting states and duplicate-submit prevention; correction dialog includes `role=alert`, `aria-invalid` and error association; frontend validation passed with 0 errors |
| Full quickstart execution | Blocked | Requires isolated production-like database, migration rehearsal, frontend toolchain/runtime, browser validation, performance measurements, concurrency attempts and representative users | T085 remains unchecked; feature must remain disabled until these gates are executed and approved |

## Reembolso homologado - dÃ©bito tÃ©cnico de compensaÃ§Ã£o

- Data: 2026-08-16
- Resultado informado na homologaÃ§Ã£o: registro de reembolso homologado.
- DÃ©bito tÃ©cnico registrado: quando uma devoluÃ§Ã£o for compensada e existir reembolso relacionado/alocado, o sistema deve oferecer cancelar/estornar o reembolso ou manter o crÃ©dito financeiro com justificativa auditÃ¡vel.
- Risco se nÃ£o tratado: a logÃ­stica pode ser neutralizada, mas o financeiro permanecer com crÃ©dito vigente, exigindo correÃ§Ã£o manual e podendo distorcer caixa/dashboard.
- Status: documentado como T089; nÃ£o houve alteraÃ§Ã£o de cÃ³digo nesta etapa.
