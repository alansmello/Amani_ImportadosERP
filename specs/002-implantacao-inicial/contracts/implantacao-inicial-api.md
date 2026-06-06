# API Contracts: Implantacao Inicial

All endpoints are backend API contracts for deployment opening balances. Request
and response bodies must use explicit DTOs. Controllers must not contain business
rules.

## POST /api/implantacao/inventario-inicial

Registers opening inventory as stock movements.

Request:

```json
{
  "data": "2026-06-05",
  "origem": "ImplantacaoInicial",
  "itens": [
    {
      "produtoId": "00000000-0000-0000-0000-000000000000",
      "quantidade": 10,
      "valorUnitario": 25.50
    }
  ]
}
```

Success:

- `201 Created` or `200 OK`
- Body contains the registered date, origin, item count and generated stock
  movement identifiers.

Validation:

- Reject empty item list.
- Reject duplicated `produtoId` within the same request.
- Reject nonexistent product.
- Reject quantity less than or equal to zero.
- Reject negative `valorUnitario` when provided.
- Generate one `EstoqueMovimentacao` with `Tipo = InventarioInicial` for each
  accepted item.
- Do not create or update stock balance fields in product.
- Do not create purchase or sale records.

## POST /api/implantacao/saldo-inicial-caixa

Registers the cash amount available at deployment date as a traceable financial
event.

Request:

```json
{
  "valor": 1500.00,
  "data": "2026-06-05",
  "origem": "ImplantacaoInicial",
  "descricao": "Saldo de caixa na data de implantacao"
}
```

Success:

- `201 Created` or `200 OK`
- Body contains the generated financial event identifier, value, date and origin.

Validation:

- Reject negative value.
- Reject missing date.
- Reject missing or unsupported origin.
- Do not treat the event as sale revenue.
- Do not update dashboard financeiro behavior in this feature.

## POST /api/implantacao/contas-receber-iniciais

Registers an old customer receivable that predates ERP operation.

Request:

```json
{
  "clienteId": "00000000-0000-0000-0000-000000000000",
  "valor": 350.00,
  "dataVencimento": "2026-06-20",
  "origem": "SaldoInicial",
  "descricao": "Debito anterior a implantacao"
}
```

Success:

- `201 Created` or `200 OK`
- Body contains the generated receivable identifier, customer identifier, value,
  due date and origin.

Validation:

- Reject nonexistent customer.
- Reject value less than or equal to zero.
- Reject missing due date.
- Reject missing or unsupported origin.
- Reuse the existing receivable/payment model when possible.
- Do not create artificial sales.
- Do not alter inactive customer sales behavior.

## Cross-Cutting Contract Rules

- All responses must expose enough identifiers for validation and later
  operational lookup.
- Invalid references return a clear validation result.
- Historical records created by these endpoints must preserve origin.
- No endpoint in this feature deletes existing history.
- No endpoint in this feature changes purchase, sale, stock exit, average cost,
  profit, dashboard, frontend, mobile, authentication, multi-user or spreadsheet
  import behavior.
