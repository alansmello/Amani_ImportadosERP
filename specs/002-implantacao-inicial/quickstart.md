# Quickstart: Implantacao Inicial

This guide validates that the Implantacao Inicial feature works end-to-end after
implementation.

## Prerequisites

- PostgreSQL database available with the project connection string.
- Existing backend API can be built and run.
- Feature implementation completed from this plan.
- At least one produto exists for inventory validation.
- At least one cliente exists for initial receivable validation.

## Build Validation

From repository root:

```powershell
dotnet build Amani_ImportadosERP.sln
```

Expected outcome:

- Build completes successfully.
- No frontend or mobile build is required.
- No new external package restore is required beyond existing project packages.

## Runtime Validation

Start the API using the normal project profile:

```powershell
dotnet run --project src\Amani.ImportadosERP.Api\Amani.ImportadosERP.Api.csproj
```

Expected outcome:

- API starts.
- Swagger remains available in development.

## Scenario 1: Inventario Inicial

1. Use an existing produto.
2. Register inventory through `POST /api/implantacao/inventario-inicial` with
   date, origin and one or more items.
3. Confirm the response contains generated stock movement identifiers.
4. Query stock through the existing stock/operational flow and confirm the
   initial quantity contributes to product balance.
5. Confirm product cadastro still has no fixed stock balance field.

Expected outcome:

- One stock movement is generated for each inventory item.
- Each movement is identified as `InventarioInicial`.
- No purchase or sale is created.

## Scenario 2: Inventario Validation

1. Try to register inventory with an empty item list.
2. Try to register an item with duplicated product in the same request.
3. Try to register an item with nonexistent product.
4. Try to register zero or negative quantity.
5. Try to register negative unit value.

Expected outcome:

- Each invalid request is rejected with a clear validation result.
- No partial or silent stock balance update is created for invalid data.

## Scenario 3: Saldo Inicial de Caixa

1. Register cash opening balance through
   `POST /api/implantacao/saldo-inicial-caixa`.
2. Confirm the response contains a generated financial event identifier.
3. Confirm the event records value, date and origin.

Expected outcome:

- Cash opening balance is stored as a traceable financial event.
- The event is not treated as sale revenue.
- Dashboard financeiro behavior is not changed by this feature.

## Scenario 4: Contas a Receber Iniciais

1. Use an existing cliente.
2. Register an old receivable through
   `POST /api/implantacao/contas-receber-iniciais`.
3. Confirm the receivable appears in the existing accounts receivable flow.
4. Register a payment using the existing payment flow for accounts receivable.
5. Confirm the receivable origin remains `SaldoInicial` or
   `ImplantacaoInicial`.

Expected outcome:

- Initial receivable is trackable by customer and origin.
- Existing payment behavior can be reused.
- No artificial sale is created.

## Regression Checks

After deployment initialization validation:

1. Confirm existing compra endpoints still create entrada movements normally.
2. Confirm existing venda endpoints still create saida movements and validate
   stock as before.
3. Confirm average cost and profit behavior are unchanged by cash opening
   balance and initial receivables.
4. Confirm dashboard financeiro was not changed as part of this feature.
5. Confirm sale behavior for inactive cliente remains unchanged.

Expected outcome:

- Operational modules keep their prior behavior.
- Initial records are distinguishable from normal operations by origin/type.
