# API Contract: Despesas de Operadora

## GET /api/despesas-operadora

Lists operator expenses with filters.

Query parameters:

| Name | Type | Required | Notes |
|------|------|----------|-------|
| `dataInicio` | date | no | Inclusive start date |
| `dataFim` | date | no | Inclusive end date |
| `formaPagamento` | string | no | `CartaoDebito` or `CartaoCredito` |

Response:

```json
[
  {
    "id": "guid",
    "vendaId": "guid",
    "formaPagamento": "CartaoDebito",
    "valorBruto": 100,
    "valorLiquido": 98.01,
    "percentualTaxa": 1.99,
    "valorTaxa": 1.99,
    "dataRegistro": "2026-06-22T12:00:00.000Z"
  }
]
```

Rules:

- Filters are applied in the backend.
- Date filter uses full day boundaries in UTC, following existing controllers.
- Empty result returns `200 []`.
- Non-card payment methods should be rejected for `formaPagamento` filter.

Validation errors:

- `400 { "error": "Forma de pagamento invalida para despesa de operadora" }`
- `400 { "error": "Periodo invalido" }`
