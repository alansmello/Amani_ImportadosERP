# Frontend Contract: Payment and Operator Fee Flows

## Sale payment modal

Location:

- New component under `frontend/src/components/vendas/`.
- Used by `frontend/src/app/vendas/nova/page.tsx` or by the sale form submit
  flow.

Behavior:

- User fills sale items normally.
- On item confirmation, open required payment modal before calling sale create.
- Modal shows all five payment methods.
- Modal shows configured fee returned by backend.
- For card methods, modal shows backend-provided or backend-compatible estimate
  display only; final calculation comes from sale create response.
- User may enter transaction fee override.
- Submit calls `salesService.create()` with sale data plus payment data.
- Closing/canceling the modal returns to editable sale draft and does not persist
  the sale.

Feedback:

- Dinheiro/PIX/Debito: show "recebido imediatamente" style status.
- Credito/Fiado: show generated receivable status and due date when available.

## Receivable payment modal

Location:

- Existing `components/financeiro/receivable-payment-modal.tsx`.

Behavior:

- Add `desconto` input, optional default 0.
- For card-credit receivables, allow effective received value and gross amount
  being settled when backend contract requires it.
- Validate only basic form shape locally.
- Backend remains source of balance validation.

## Payment fee settings screen

Route:

- `/configuracoes/formas-pagamento`

Behavior:

- List all payment methods and current fee percentages.
- Allow authenticated user to edit and save each percentage.
- Show loading, error, saving and success states.
- Must work on smartphone, tablet and desktop.

## Operator expenses screen

Route:

- `/financeiro/despesas-operadora`

Behavior:

- Filters: date range and payment method.
- List: date, payment method, sale reference, gross value, fee percentage, net
  value and fee value.
- Empty state when no expense matches filters.
- No local aggregation required for MVP.

## Navigation

Add routes to `frontend/src/config/routes.ts`:

- `configuracoesFormasPagamento`
- `despesasOperadora`

Expose navigation from Configuracoes and Financeiro using existing app shell
patterns.
