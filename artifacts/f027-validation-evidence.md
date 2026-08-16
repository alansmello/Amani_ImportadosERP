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
