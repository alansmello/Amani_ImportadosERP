# Tasks: Vendas Frontend

**Input**: Design documents from `/specs/013-vendas-frontend/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/vendas-frontend.md, quickstart.md

**Tests**: No automated test tasks were generated because the specification does not request TDD or a new automated suite. Validation tasks use lint, typecheck, build, and quickstart scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm existing frontend structure and create feature folders.

- [X] T001 Verify current sales placeholder and shared operational patterns in `frontend/src/app/vendas/page.tsx`, `frontend/src/components/compras/`, and `frontend/src/components/estoque/`
- [X] T002 Create the sales feature directory structure in `frontend/src/components/vendas/`, `frontend/src/app/vendas/nova/`, and `frontend/src/app/vendas/[vendaId]/`
- [X] T003 [P] Review route and navigation conventions in `frontend/src/config/routes.ts` and `frontend/src/config/navigation.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared sales contracts, service layer, query hooks, routes, and utilities that block all user stories.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Create explicit sales types for filters, list items, details, items, payloads, drafts, and validation errors in `frontend/src/types/sale.ts`
- [X] T005 Create sales API service with list, getById, create, and cancel methods in `frontend/src/services/sales.ts`
- [X] T006 Create sales query keys, list/detail queries, create/cancel mutations, and cache invalidation for vendas and estoque in `frontend/src/hooks/use-sales.ts`
- [X] T007 Add `vendasNova()` and `vendaDetalhe(id)` route helpers in `frontend/src/config/routes.ts`
- [X] T008 [P] Create sale formatting helpers for dates, currency, totals, and profit display in `frontend/src/components/vendas/sale-formatters.ts`
- [X] T009 Create sale validation helpers for required cliente, item presence, numeric fields, and duplicate product consolidation in `frontend/src/components/vendas/sale-validation.ts`
- [X] T010 Validate constitution gates for F013 in `specs/013-vendas-frontend/plan.md`: backend-owned stock/profit rules, stock by movements, DTO contracts, Mobile First, Dark Only, operational UX, no local business calculations, no financial/fiscal scope, and no new dependency

**Checkpoint**: Foundation ready. User story implementation can now begin.

---

## Phase 3: User Story 1 - Registrar venda com itens (Priority: P1) MVP

**Goal**: Let an operator create a sale with cliente, products, quantities, prices, discounts, and additions, then submit it only after valid input.

**Independent Test**: Open `/vendas/nova`, select an existing cliente and products with available stock, enter commercial values, confirm, and verify the backend accepts the sale and the user receives clear success feedback.

### Implementation for User Story 1

- [X] T011 [P] [US1] Create the sale item editor for product, quantity, price, discount, and addition fields in `frontend/src/components/vendas/sale-item-editor.tsx`
- [X] T012 [P] [US1] Create the sale summary component for item totals, general discount/addition, and submission readiness in `frontend/src/components/vendas/sale-summary.tsx`
- [X] T013 [US1] Create the sale form component with cliente selection, optional sale date, general discount/addition, item management, validation, and submit flow in `frontend/src/components/vendas/sale-form.tsx`
- [X] T014 [US1] Implement duplicate product consolidation in the sale draft flow in `frontend/src/components/vendas/sale-form.tsx`
- [X] T015 [US1] Integrate `useClients`, `useProducts`, and optional `useStockProducts` as selection/support data in `frontend/src/components/vendas/sale-form.tsx`
- [X] T016 [US1] Create the new sale route that renders the operational form and navigates after success in `frontend/src/app/vendas/nova/page.tsx`
- [X] T017 [US1] Ensure successful creation invalidates vendas and estoque queries and never shows success before backend confirmation in `frontend/src/hooks/use-sales.ts`
- [X] T018 [US1] Validate the new sale flow from quickstart scenarios 2 and 3 using `specs/013-vendas-frontend/quickstart.md`

**Checkpoint**: User Story 1 is independently functional as the MVP increment.

---

## Phase 4: User Story 2 - Bloquear venda sem saldo suficiente (Priority: P2)

**Goal**: Surface backend stock validation failures clearly and keep failed sales as not concluded.

**Independent Test**: Attempt to confirm a sale with insufficient stock and verify that the backend rejection is shown clearly, no success state appears, and the draft remains editable.

### Implementation for User Story 2

- [X] T019 [US2] Preserve and expose `{ error }` messages from failed sale creation in `frontend/src/services/sales.ts`
- [X] T020 [US2] Display stock-insufficient and operational creation errors without clearing the draft in `frontend/src/components/vendas/sale-form.tsx`
- [X] T021 [US2] Add item-level visual context for products with no known/available stock without using local stock as final authorization in `frontend/src/components/vendas/sale-item-editor.tsx`
- [X] T022 [US2] Ensure failed creation does not invalidate vendas/estoque as successful completion in `frontend/src/hooks/use-sales.ts`
- [X] T023 [US2] Validate insufficient stock and invalid input paths from quickstart scenario 4 in `specs/013-vendas-frontend/quickstart.md`

**Checkpoint**: User Stories 1 and 2 work independently and together.

---

## Phase 5: User Story 3 - Listar e filtrar vendas (Priority: P3)

**Goal**: Replace `/vendas` placeholder with an operational list that filters sales by period and cliente.

**Independent Test**: Open `/vendas`, apply date and cliente filters, clear filters, and open a listed sale detail.

### Implementation for User Story 3

- [X] T024 [P] [US3] Create sales filters for date range and cliente selection in `frontend/src/components/vendas/sales-filters.tsx`
- [X] T025 [P] [US3] Create sales list with loading, error, empty, filtered-empty, total/profit display, and detail navigation in `frontend/src/components/vendas/sales-list.tsx`
- [X] T026 [US3] Replace the sales placeholder with the list page, filters, new-sale action, and state orchestration in `frontend/src/app/vendas/page.tsx`
- [X] T027 [US3] Map `SaleFilters` to `dataInicio`, `dataFim`, and `clienteId` query params in `frontend/src/services/sales.ts`
- [X] T028 [US3] Use `vendaDetalhe(id)` and `vendasNova()` route helpers from the list page in `frontend/src/app/vendas/page.tsx`
- [X] T029 [US3] Validate list and filtering from quickstart scenario 1 using `specs/013-vendas-frontend/quickstart.md`

**Checkpoint**: User Story 3 is independently functional after foundational tasks.

---

## Phase 6: User Story 4 - Ver detalhe com lucro oficial (Priority: P4)

**Goal**: Show official sale detail with cliente, items, commercial values, total, and backend-returned profit without local recalculation.

**Independent Test**: Open `/vendas/[vendaId]` for an existing sale and verify that the displayed values match the official response and no replacement profit is calculated.

### Implementation for User Story 4

- [X] T030 [P] [US4] Create sale detail component for cliente, date, items, discounts, additions, total, and official profit in `frontend/src/components/vendas/sale-detail.tsx`
- [X] T031 [US4] Create the sale detail route with loading, error, not-found, retry, and no-local-profit behavior in `frontend/src/app/vendas/[vendaId]/page.tsx`
- [X] T032 [US4] Enrich sale detail display with cliente and product names from existing hooks without changing official sale values in `frontend/src/components/vendas/sale-detail.tsx`
- [X] T033 [US4] Display absence of lucro data as unavailable information without calculating profit or average-cost substitutes in `frontend/src/components/vendas/sale-detail.tsx`
- [X] T034 [US4] Validate detail and official-profit behavior from quickstart scenario 5 using `specs/013-vendas-frontend/quickstart.md`

**Checkpoint**: User Story 4 is independently functional after foundational tasks.

---

## Phase 7: User Story 5 - Cancelar venda (Priority: P5)

**Goal**: Allow explicit confirmed cancellation request from the sale detail, preserving official backend state and updating reads after success.

**Independent Test**: Open a sale detail, confirm cancellation, verify success appears only after backend acceptance and official reads refresh; then simulate failure and verify previous state is preserved.

### Implementation for User Story 5

- [X] T035 [P] [US5] Create confirmation dialog for cancel sale with pending, success, error, and retry states in `frontend/src/components/vendas/cancel-sale-dialog.tsx`
- [X] T036 [US5] Integrate cancel action into sale detail without inventing local sale status or cancelability fields in `frontend/src/components/vendas/sale-detail.tsx`
- [X] T037 [US5] Invalidate vendas, sale detail, and estoque queries after successful cancellation in `frontend/src/hooks/use-sales.ts`
- [X] T038 [US5] Preserve previous detail state and show a recoverable message when cancel fails in `frontend/src/app/vendas/[vendaId]/page.tsx`
- [X] T039 [US5] Validate cancellation from quickstart scenario 6 using `specs/013-vendas-frontend/quickstart.md`

**Checkpoint**: User Story 5 is independently functional after foundational tasks and detail route availability.

---

## Phase 8: User Story 6 - Operar vendas em telas pequenas e grandes (Priority: P6)

**Goal**: Ensure listing, creation, detail, cancellation, messages, and totals work in smartphone, tablet, and desktop layouts.

**Independent Test**: Execute the primary flows in smartphone around 390px, tablet, and desktop without overlap, inaccessible controls, or missing essential information.

### Implementation for User Story 6

- [X] T040 [US6] Review and adjust responsive layout of the sales list and filters in `frontend/src/app/vendas/page.tsx`, `frontend/src/components/vendas/sales-list.tsx`, and `frontend/src/components/vendas/sales-filters.tsx`
- [X] T041 [US6] Review and adjust responsive layout of the sale form, item editor, and summary in `frontend/src/app/vendas/nova/page.tsx`, `frontend/src/components/vendas/sale-form.tsx`, `frontend/src/components/vendas/sale-item-editor.tsx`, and `frontend/src/components/vendas/sale-summary.tsx`
- [X] T042 [US6] Review and adjust responsive layout of sale detail and cancel dialog in `frontend/src/app/vendas/[vendaId]/page.tsx`, `frontend/src/components/vendas/sale-detail.tsx`, and `frontend/src/components/vendas/cancel-sale-dialog.tsx`
- [X] T043 [US6] Validate Mobile First and desktop behavior from quickstart scenario 8 using `specs/013-vendas-frontend/quickstart.md`

**Checkpoint**: All user stories are independently functional and responsive.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Validate scope exclusions, consistency, and build quality across the feature.

- [X] T044 Verify absence of form of payment, receivables generation, sale editing, partial return, fiscal issuing, and local stock/profit/average-cost calculation across `frontend/src/app/vendas/` and `frontend/src/components/vendas/`
- [X] T045 [P] Mark the Vendas navigation item as implemented if navigation uses readiness metadata in `frontend/src/config/navigation.ts`
- [X] T046 [P] Review sales copy, labels, empty states, and error messages for consistency with operational Dark Only UI in `frontend/src/app/vendas/` and `frontend/src/components/vendas/`
- [X] T047 Run the full quickstart validation scenarios in `specs/013-vendas-frontend/quickstart.md`
- [X] T048 Run `npm run lint` in `frontend/`
- [X] T049 Run `npm run typecheck` in `frontend/`
- [X] T050 Run `npm run build` in `frontend/`

---

## Bug Fixes (Pos-Implementacao)

### BF003 — Data da venda exibida com um dia a menos por conversao UTC para fuso local

**Data**: 2026-06-22
**Arquivo**: `frontend/src/components/vendas/sale-formatters.ts`
**Funcao**: `formatSaleDate`

**Sintoma**: Vendas registradas no dia 22/06/2026 eram exibidas na lista e no detalhe
como 21/06/2026.

**Causa**: O payload de criacao converte a data selecionada para ISO UTC via
`new Date("2026-06-22").toISOString()`, gerando `"2026-06-22T00:00:00.000Z"`.
O backend armazena e devolve o valor com timezone UTC (`Z`). Na exibicao,
`new Date("2026-06-22T00:00:00Z")` e interpretado como meia-noite UTC; ao
renderizar no navegador em UTC-3, o valor vira `2026-06-21T21:00:00`, e o
`Intl.DateTimeFormat` exibe `21/06/2026` — um dia a menos.

**Correcao**: Extrair apenas a porcao `YYYY-MM-DD` da string antes de construir o
objeto `Date`, usando o construtor local `new Date(year, month - 1, day)` que nao
sofre conversao de fuso:

```ts
// Antes (sofre offset UTC→local)
const date = new Date(value);

// Depois (extrai parte da data, sem offset de fuso)
const datePart = value.slice(0, 10);
const [year, month, day] = datePart.split("-").map(Number);
const date = new Date(year, month - 1, day);
```

**Escopo preservado**: Apenas a funcao de formatacao de display foi alterada.
Nenhuma alteracao no servico, hook, tipo ou payload de criacao. O backend
permanece inalterado.

**Validacao**: `npm run typecheck` passa apos a correcao.

- [X] BF003 Corrigir exibicao de data em `sale-formatters.ts` (`formatSaleDate`)

---

### BF002 — Formula de lucro inconsistente entre endpoints de vendas e dashboards

**Data**: 2026-06-22
**Arquivos**:
- `src/.../Services/VendaService.cs`
- `src/.../Queries/Handlers/ObterListaVendasQueryHandler.cs`
- `src/.../Queries/Handlers/ObterDashboardQueryHandler.cs`
- `src/.../Infra.Data/Repositories/CustoProdutoRepository.cs`

**Sintoma**: O lucro exibido na tela de Vendas (lista e detalhe) apresentava valores
inconsistentes em dois cenarios distintos:

1. Vendas com `Desconto` ou `Acrescimo` no item mostravam lucro diferente do dashboard.
2. Produtos com custo cadastrado (`Produto.Custo`) mas sem historico de movimentacao
   de estoque com `ValorUnitario` mostravam lucro igual ao preco de venda inteiro
   (como se o custo fosse zero).

**Causa — Parte 1 (formula divergente)**:
Os endpoints de vendas usavam a formula bruta
`(PrecoUnitario - custoMedio) * Quantidade`, ignorando descontos e acrescimos de
item. Os repositorios de dashboard usavam `ValorLiquidoItem - custoMedio * Quantidade`
onde `ValorLiquidoItem = item.ValorTotal()` ja considera desconto e acrescimo por item.

**Causa — Parte 2 (custo medio ignorando Produto.Custo)**:
O `CustoProdutoRepository` so buscava custo em `EstoqueMovimentacoes`
(movimentacoes `InventarioInicial` ou `Entrada` com `CompraItemId != null` e
`ValorUnitario != null`). Quando nenhuma movimentacao com custo existia, retornava
`0m`, fazendo o lucro inflar para o valor cheio de venda. O campo `Produto.Custo`
(custo cadastrado no produto) era completamente ignorado.

**Correcao — Parte 1**: Unificar a formula nos tres handlers/servicos:

```csharp
// Antes (formula bruta — ignora desconto/acrescimo do item)
var lucroItem = (item.PrecoUnitario - custoMedio) * item.Quantidade;

// Depois (formula liquida — consistente com dashboards)
var lucroItem = item.ValorTotal() - custoMedio * item.Quantidade;
```

**Correcao — Parte 2**: Adicionar fallback para `Produto.Custo` no repositorio:

```csharp
// Antes (retornava 0 quando sem movimentacoes com custo)
if (somaQuantidade == 0) return 0m;

// Depois (fallback para custo cadastrado no produto)
if (somaQuantidade > 0)
{
    return somaValor / somaQuantidade;
}
var produto = await _db.Produtos
    .Where(p => p.Id == produtoId)
    .Select(p => new { p.Custo })
    .FirstOrDefaultAsync();
return produto?.Custo ?? 0m;
```

**Precedencia do custo medio**:
1. Custo medio ponderado por movimentacoes (InventarioInicial + Entradas de compra)
2. Fallback: `Produto.Custo` cadastrado no produto
3. Ultimo recurso: `0m` (produto nao encontrado)

**Escopo preservado**: O backend continua sendo a unica fonte do lucro oficial.
Nenhuma regra de negocio foi movida para o frontend. Nenhuma migration necessaria.
O contrato de `ICustoProdutoRepository` (retorno `decimal`) nao foi alterado.

**Validacao**: Zero erros `CS` no build com `dotnet build --no-restore`. API deve
ser reiniciada para aplicar as mudancas.

- [X] BF002-1 Corrigir formula em `VendaService.cs` (metodos `CreateAsync` e `ObterPorIdAsync`)
- [X] BF002-2 Corrigir formula em `ObterListaVendasQueryHandler.cs`
- [X] BF002-3 Corrigir formula em `ObterDashboardQueryHandler.cs`
- [X] BF002-4 Adicionar fallback para `Produto.Custo` em `CustoProdutoRepository.cs`

---

### BF001 — Preco unitario nao atualiza ao trocar produto no item da venda

**Data**: 2026-06-17
**Arquivo**: `frontend/src/components/vendas/sale-form.tsx`
**Funcao**: `updateItem`

**Sintoma**: Ao trocar o produto selecionado em um item ja preenchido, o campo
`precoUnitario` permanecia com o valor do produto anterior em vez de ser
atualizado com o `precoVenda` do novo produto.

**Causa**: A condicao de preenchimento automatico do preco continha o guard
`!item.precoUnitario`, que impedia a atualizacao quando o campo ja tinha algum
valor (mesmo que proveniente de uma selecao anterior automatica).

```ts
// Antes (com bug)
if (field === "produtoId" && value && !item.precoUnitario) {

// Depois (corrigido)
if (field === "produtoId" && value) {
```

**Justificativa**: A troca de produto implica que o operador quer trabalhar com
o novo produto. O `precoVenda` e apenas um ponto de partida editavel; o operador
pode ajustar o preco manualmente apos a selecao. O backend continua sendo a
fonte final de validacao de estoque e calculo de lucro.

**Validacao**: `npm run lint` e `npm run typecheck` passam apos a correcao.

- [X] BF001 Corrigir preenchimento automatico de `precoUnitario` ao trocar produto no item

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion and blocks all user stories.
- **US1 (Phase 3)**: Depends on Foundational; recommended MVP.
- **US2 (Phase 4)**: Depends on Foundational and integrates naturally with US1 form behavior.
- **US3 (Phase 5)**: Depends on Foundational; can be implemented independently after service/hooks exist.
- **US4 (Phase 6)**: Depends on Foundational; pairs with US3 navigation but can be tested with a known sale id.
- **US5 (Phase 7)**: Depends on Foundational and benefits from US4 detail route.
- **US6 (Phase 8)**: Depends on implemented UI surfaces from US1, US3, US4, and US5.
- **Polish**: Depends on all desired stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: MVP; no dependency on other user stories after foundation.
- **User Story 2 (P2)**: Can be implemented with US1 form or after it.
- **User Story 3 (P3)**: Can be implemented independently after foundation.
- **User Story 4 (P4)**: Can be implemented independently after foundation if a sale id is known.
- **User Story 5 (P5)**: Requires the detail surface from US4 for the intended UX.
- **User Story 6 (P6)**: Cross-cuts all UI stories and should finish after visible flows exist.

### Parallel Opportunities

- T003 and T008 can run while T001/T002 are reviewed or created.
- T011 and T012 can run in parallel after foundational tasks.
- T024 and T025 can run in parallel after foundational tasks.
- T030 and T035 can run in parallel after foundational tasks if the detail/cancel request interface is agreed.
- US3 and US4 can start in parallel after foundation if separate developers work on list and detail files.
- T045 and T046 can run in parallel during polish.

---

## Parallel Example: User Story 1

```text
Task: "T011 [P] [US1] Create the sale item editor in frontend/src/components/vendas/sale-item-editor.tsx"
Task: "T012 [P] [US1] Create the sale summary component in frontend/src/components/vendas/sale-summary.tsx"
```

## Parallel Example: User Story 3

```text
Task: "T024 [P] [US3] Create sales filters in frontend/src/components/vendas/sales-filters.tsx"
Task: "T025 [P] [US3] Create sales list in frontend/src/components/vendas/sales-list.tsx"
```

## Parallel Example: User Story 4 and 5

```text
Task: "T030 [P] [US4] Create sale detail component in frontend/src/components/vendas/sale-detail.tsx"
Task: "T035 [P] [US5] Create cancel sale dialog in frontend/src/components/vendas/cancel-sale-dialog.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. Stop and validate `/vendas/nova` with successful sale creation and duplicate consolidation.
5. Demo if ready.

### Incremental Delivery

1. Setup + Foundational -> shared sales contracts, service, hooks, routes, utilities.
2. US1 -> create sale MVP.
3. US2 -> robust insufficient-stock and failed-creation behavior.
4. US3 -> operational listing and filters.
5. US4 -> official detail and profit display.
6. US5 -> cancellation.
7. US6 -> responsive completion.
8. Polish -> scope exclusions, quickstart, lint, typecheck, build.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together.
2. Developer A: US1 and US2 form flow.
3. Developer B: US3 list and filters.
4. Developer C: US4 detail and US5 cancel dialog.
5. Team reconverges on US6 responsiveness and final validation.

## Notes

- [P] tasks are different files or independent validations with no dependency on incomplete tasks.
- [US] labels map directly to user stories in `specs/013-vendas-frontend/spec.md`.
- All business rules for stock validation, average cost, profit, stock movement, and cancellation remain backend-owned.
- Do not add form of payment, receivables, sale editing, partial return, fiscal issuing, or local stock/profit/average-cost calculations.
- Commit after each task or logical group.
