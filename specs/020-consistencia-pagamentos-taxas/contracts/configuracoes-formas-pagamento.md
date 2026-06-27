# Contract: Configurações de Formas de Pagamento

Base: `/api/configuracoes/formas-pagamento`

## GET `/`

Retorna as cinco formas para exibição. Somente Débito é editável; as demais devem retornar taxa zero após a normalização.

### Response 200

```json
[
  { "formaPagamento": "Dinheiro", "percentualTaxa": 0.0000, "atualizadoEm": "2026-06-26T00:00:00Z" },
  { "formaPagamento": "PIX", "percentualTaxa": 0.0000, "atualizadoEm": "2026-06-26T00:00:00Z" },
  { "formaPagamento": "CartaoDebito", "percentualTaxa": 1.9900, "atualizadoEm": "2026-06-26T00:00:00Z" },
  { "formaPagamento": "CartaoCredito", "percentualTaxa": 0.0000, "atualizadoEm": "2026-06-26T00:00:00Z" },
  { "formaPagamento": "Fiado", "percentualTaxa": 0.0000, "atualizadoEm": "2026-06-26T00:00:00Z" }
]
```

## PUT `/CartaoDebito`

Atualiza a única taxa configurável.

### Request

```json
{
  "percentualTaxa": 1.99
}
```

Validação: `0 <= percentualTaxa < 100`.

### Response 200

```json
{
  "formaPagamento": "CartaoDebito",
  "percentualTaxa": 1.9900,
  "atualizadoEm": "2026-06-26T15:00:00Z"
}
```

## PUT para forma não editável

Tentativas para `Dinheiro`, `PIX`, `CartaoCredito` ou `Fiado` são recusadas, mesmo quando o valor enviado é zero.

### Response 400

```json
{
  "error": "Somente cartao de debito possui taxa configuravel"
}
```

Taxas de Débito negativas, iguais ou superiores a 100 também retornam 400 e não alteram o valor anterior.

## Compatibilidade de leitura

O contrato de leitura continua retornando todas as formas. A restrição afeta apenas edição e valores normalizados, evitando quebra dos consumidores existentes.

