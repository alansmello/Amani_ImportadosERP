# Contract: Despesas de Operadora

Base: `/api/despesas-operadora`

## GET `/`

Retorna despesas de operadora filtradas por período e forma, junto com o resumo consolidado do total de taxas para o mesmo recorte.

### Query params

- `dataInicio` (opcional): data inicial do recorte.
- `dataFim` (opcional): data final do recorte.
- `formaPagamento` (opcional): `CartaoDebito` ou `CartaoCredito`.

### Response 200

```json
{
  "itens": [
    {
      "id": "uuid",
      "vendaId": "uuid",
      "formaPagamento": "CartaoCredito",
      "valorBruto": 100.00,
      "valorLiquido": 96.50,
      "percentualTaxa": 3.5000,
      "valorTaxa": 3.50,
      "dataRegistro": "2026-06-26T18:00:00Z"
    }
  ],
  "resumo": {
    "totalTaxas": 3.50
  }
}
```

### Regras de consistência

- `resumo.totalTaxas` é a soma de `valorTaxa` de `itens` para exatamente o mesmo filtro aplicado.
- Se `itens` estiver vazio, `resumo.totalTaxas` deve ser `0`.
- O consolidado é informativo e não altera registros financeiros.

### Response 400

```json
{
  "error": "Forma de pagamento invalida para despesa de operadora"
}
```

Outros erros esperados:

- período inválido (`dataInicio` maior que `dataFim`);
- forma fora do conjunto permitido para despesas de operadora.
