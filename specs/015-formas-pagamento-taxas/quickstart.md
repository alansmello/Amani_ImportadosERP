# Quickstart: Validation Guide

## Prerequisites

- Database available with migrations applied.
- Backend API running.
- Frontend app running.
- At least one active customer and at least one product with stock available.
- F013 sales and F014 accounts receivable flows working.

## Commands

Backend:

```powershell
dotnet build Amani_ImportadosERP.sln
```

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Scenario 1: Required payment method before sale persistence

1. Open `/vendas/nova`.
2. Fill customer and items.
3. Confirm items.
4. Close or cancel the payment modal.

Expected:

- Sale is not created.
- No receivable is created.
- User can return to sale draft and choose payment method.
- Record elapsed time from item confirmation to final payment feedback; it must be <= 30 seconds.

## Scenario 2: Dinheiro and PIX are immediately received

1. Create one sale with Dinheiro.
2. Create one sale with PIX.
3. Open accounts receivable list.

Expected:

- Each sale has a related receivable marked Pago.
- Total paid equals gross sale amount.
- No operator expense exists for either sale.

## Scenario 3: Debit card creates operator expense immediately

1. Confirm default CartaoDebito fee in `/configuracoes/formas-pagamento`.
2. Create a sale with CartaoDebito.
3. Open `/financeiro/despesas-operadora`.
4. Filter by today and CartaoDebito.

Expected:

- Sale feedback says received immediately.
- Receivable is Pago.
- Operator expense is visible with sale reference, gross amount, fee percentage
  and net amount.
- Record elapsed time to locate the filtered operator expense; it must be <= 30 seconds.

## Scenario 4: Credit card creates pending receivable on next business day

1. Create a sale with CartaoCredito.
2. Inspect the generated receivable.

Expected:

- Receivable is Pendente.
- Due date is the next business day.
- No operator expense is created until payment is registered.

## Scenario 5: Credit card net settlement closes gross balance

1. Open the pending credit-card receivable.
2. Register payment with effective received amount below gross value and the
   recognized operator fee.
3. Open operator expenses list.

Expected:

- Receivable can become Pago when received value plus operator fee settles the
  gross balance.
- Operator expense is created for the difference.
- Difference is not recorded as commercial discount.

## Scenario 6: Fiado payment with discount

1. Create a sale with Fiado.
2. Register a partial or full payment with discount.
3. Try another payment where `valor + desconto` exceeds saldo.

Expected:

- Valid payment updates balance.
- Discount is shown in payment history when exposed by UI.
- Excessive payment is rejected and previous balance remains unchanged.

## Scenario 7: Edit default fee and use transaction override

1. Open `/configuracoes/formas-pagamento`.
2. Change CartaoDebito fee.
3. Create a debit sale without override.
4. Create another debit sale with transaction override.

Expected:

- First sale uses the updated default.
- Second sale uses override only for that sale.
- Default setting remains unchanged after override.
- Record elapsed time from opening fee settings to validating the new default in a sale; it must be <= 2 minutes.

## Scenario 8: Responsive UI

Validate `/vendas/nova`, `/financeiro/contas-receber`,
`/financeiro/despesas-operadora` and `/configuracoes/formas-pagamento` at:

- Smartphone width around 390px.
- Tablet width around 768px.
- Desktop width 1280px or wider.

Expected:

- No horizontal scrolling for primary content.
- No overlapping controls or clipped button text.
- Modal content remains usable.
- Record elapsed time to locate operator expenses by period and payment method; it must be <= 30 seconds.

## Regression checks

- Existing sale cancellation still works.
- Existing receivable create/edit/delete list flows still work.
- Existing stock outflow on sale still works.
- Existing sales list and sale detail continue to render.
