# API Contract: Despesas Operacionais

Base path: `/api/despesas`

Operational expenses are separate from `/api/despesas-operadora`.

## List Expenses

`GET /api/despesas?dataInicio=2026-06-01&dataFim=2026-06-30&categoriaId={guid}`

Response `200 OK`:

```json
[
  {
    "id": "guid",
    "dataCompetencia": "2026-06-10",
    "valor": 120.50,
    "descricao": "Frete da compra",
    "categoriaId": "guid",
    "categoriaNome": "Frete",
    "categoriaAtiva": true,
    "formaPagamento": "PIX"
  }
]
```

Rules:

- Date filters apply to `dataCompetencia`.
- `categoriaId` is optional.
- Invalid ranges where start is after end are rejected.
- Query must filter in backend storage/query layer.

## Create Expense

`POST /api/despesas`

Request:

```json
{
  "dataCompetencia": "2026-06-10",
  "valor": 120.50,
  "descricao": "Frete da compra",
  "categoriaDespesaId": "guid",
  "formaPagamento": "PIX"
}
```

Response `201 Created`:

```json
{
  "id": "guid"
}
```

Validation:

- `categoriaDespesaId` must exist and be active.
- `valor` must be greater than 0.
- `descricao` is required.
- `formaPagamento` must be one of `Dinheiro`, `PIX`, `CartaoDebito`,
  `CartaoCredito`.
- `Fiado` is rejected for expenses in this feature.

Out of scope:

- Updating expenses.
- Deleting expenses.
- Recurring expenses.
- Cost centers and cost allocation.
- Pending expense debt represented as Fiado.
