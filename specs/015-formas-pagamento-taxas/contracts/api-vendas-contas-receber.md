# API Contract: Vendas e Contas a Receber

## POST /api/vendas

Creates a sale only after payment method selection.

Request:

```json
{
  "clienteId": "guid",
  "dataVenda": "2026-06-22T00:00:00.000Z",
  "desconto": 0,
  "acrescimo": 0,
  "formaPagamento": "CartaoDebito",
  "percentualTaxaOverride": 1.99,
  "items": [
    {
      "produtoId": "guid",
      "quantidade": 1,
      "precoUnitario": 100,
      "desconto": 0,
      "acrescimo": 0
    }
  ]
}
```

Rules:

- `formaPagamento` is required.
- `percentualTaxaOverride` is optional and applies only to this sale.
- Backend calculates final financial routing and card net values.
- Frontend must not persist a sale before payment method selection.

Success response `201 Created`:

```json
{
  "id": "guid",
  "lucro": 42.5,
  "formaPagamento": "CartaoDebito",
  "statusFinanceiro": "Pago",
  "contaReceberId": "guid",
  "valorBruto": 100,
  "valorLiquido": 98.01,
  "percentualTaxaAplicado": 1.99,
  "despesaOperadoraId": "guid",
  "mensagemFinanceira": "Recebido imediatamente"
}
```

Validation errors:

- `400 { "error": "Forma de pagamento obrigatoria" }`
- `400 { "error": "Taxa invalida" }`
- `400 { "error": "Estoque insuficiente..." }`

## POST /api/contas-receber/{id}/pagamentos

Registers a receivable payment with optional discount and optional card-credit
settlement data.

Request for regular payment:

```json
{
  "valor": 90,
  "desconto": 10
}
```

Request for card-credit net settlement:

```json
{
  "valor": 98.01,
  "desconto": 0,
  "valorBrutoLiquidado": 100,
  "percentualTaxaOperadora": 1.99
}
```

Rules:

- `desconto` defaults to 0.
- Backend validates balance.
- For regular payments: `valor + desconto <= saldo`.
- For card-credit settlement: `valorBrutoLiquidado` may be closed by effective
  received value plus recognized operator fee.
- Operator fee creates `DespesaOperadora`, not discount.

Success response:

```json
{
  "contaReceberId": "guid",
  "status": "Pago",
  "saldo": 0,
  "pagamentoId": "guid",
  "despesaOperadoraId": "guid"
}
```

Validation errors:

- `400 { "error": "Valor invalido" }`
- `400 { "error": "Desconto invalido" }`
- `400 { "error": "Pagamento, desconto e taxa excedem o saldo" }`
- `404` when account does not exist.

## GET /api/contas-receber

Existing list should continue returning receivable financial state. The response
must remain compatible and may include additional fields for discount/payment
history only if the frontend needs them.

## GET /api/contas-receber/cliente/{clienteId}

Detail should include payments with `valor`, `desconto` and `dataPagamento` when
available, preserving existing fields already used by F014.
