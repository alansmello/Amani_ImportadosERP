# API Contract: Configuracoes de Formas de Pagamento

## GET /api/configuracoes/formas-pagamento

Returns default fee settings for all supported payment methods.

Response:

```json
[
  {
    "formaPagamento": "Dinheiro",
    "percentualTaxa": 0,
    "atualizadoEm": "2026-06-22T12:00:00.000Z"
  },
  {
    "formaPagamento": "PIX",
    "percentualTaxa": 0,
    "atualizadoEm": "2026-06-22T12:00:00.000Z"
  },
  {
    "formaPagamento": "CartaoDebito",
    "percentualTaxa": 1.99,
    "atualizadoEm": "2026-06-22T12:00:00.000Z"
  },
  {
    "formaPagamento": "CartaoCredito",
    "percentualTaxa": 3.49,
    "atualizadoEm": "2026-06-22T12:00:00.000Z"
  },
  {
    "formaPagamento": "Fiado",
    "percentualTaxa": 0,
    "atualizadoEm": "2026-06-22T12:00:00.000Z"
  }
]
```

Rules:

- Response always contains exactly one item per supported payment method.
- Values are defaults only. Transaction override does not mutate them.

## PUT /api/configuracoes/formas-pagamento/{formaPagamento}

Updates the default fee percentage for one payment method.

Request:

```json
{
  "percentualTaxa": 2.15
}
```

Success response:

```json
{
  "formaPagamento": "CartaoDebito",
  "percentualTaxa": 2.15,
  "atualizadoEm": "2026-06-22T12:05:00.000Z"
}
```

Rules:

- Any authenticated ERP user may update until granular authorization exists.
- `percentualTaxa` must be >= 0.
- Unknown `formaPagamento` returns validation error or 404.

Validation errors:

- `400 { "error": "Forma de pagamento invalida" }`
- `400 { "error": "Percentual de taxa invalido" }`
