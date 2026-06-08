# API Contract: Dashboard Gerencial

Base path: `/api/dashboard-gerencial`

Todos os endpoints usam contratos DTO explicitos. Entidades de dominio nao devem ser retornadas diretamente.

## Common Query Parameters

- `dataInicial`: data inicial do periodo customizado.
- `dataFinal`: data final do periodo customizado.
- `mes`: mes numerico, 1 a 12.
- `ano`: ano de referencia.
- `limiteRankings`: limite de itens por ranking.
- `tiposGraficos`: lista de graficos desejados.
- `tiposAlertas`: lista de alertas desejados.

## Filter Rules

- `dataInicial` e `dataFinal` validas formam periodo customizado inclusivo.
- `mes` e `ano` formam o periodo mensal.
- `ano` sem mes forma o ano inteiro.
- Sem filtros, usar mes corrente.
- Periodo customizado prevalece sobre mes/ano.
- Filtro invalido deve retornar erro de validacao com mensagem clara.

## GET `/api/dashboard-gerencial`

Retorna dashboard consolidado.

**Response 200**

```json
{
  "filtrosAplicados": {
    "tipoFiltro": "PeriodoCustomizado",
    "dataInicial": "2026-06-01",
    "dataFinal": "2026-06-30",
    "dataReferencia": "2026-06-30",
    "precedenciaAplicada": "PeriodoCustomizado"
  },
  "financeiro": {},
  "operacional": {},
  "rankings": [],
  "alertas": [],
  "graficos": [],
  "avisos": []
}
```

## GET `/api/dashboard-gerencial/financeiro`

Retorna resumo financeiro.

**Response 200**

```json
{
  "filtrosAplicados": {},
  "receitaTotal": 12500.00,
  "lucroTotal": 4200.00,
  "totalCompras": 5000.00,
  "totalDespesas": 1200.00,
  "saldoOperacional": 6300.00,
  "contasReceberAbertas": 2100.00,
  "valoresRecebidos": 12500.00,
  "valorLucroNaoCalculavel": 0.00,
  "quantidadeItensSemCusto": 0,
  "avisos": []
}
```

## GET `/api/dashboard-gerencial/operacional`

Retorna resumo operacional.

**Response 200**

```json
{
  "filtrosAplicados": {},
  "produtosCadastrados": 80,
  "estoqueDisponivelTotal": 430,
  "mercadoriasEmTransitoQuantidade": 52,
  "mercadoriasEmTransitoValor": 3100.00,
  "comprasEmAberto": 4,
  "produtosPendentesRecebimento": 12,
  "perdasRegistradasQuantidade": 3,
  "perdasRegistradasValor": 180.00,
  "quantidadeVendas": 34,
  "quantidadeCompras": 6
}
```

## GET `/api/dashboard-gerencial/rankings`

Retorna rankings solicitados.

**Response 200**

```json
{
  "filtrosAplicados": {},
  "rankings": [
    {
      "tipoRanking": "ProdutosMaisVendidos",
      "posicao": 1,
      "produtoId": "00000000-0000-0000-0000-000000000000",
      "produtoNome": "Produto A",
      "quantidade": 20,
      "valorFinanceiro": 2400.00,
      "criterioOrdenacao": "QuantidadeVendidaDescValorDescNomeAsc",
      "aviso": null
    }
  ]
}
```

## GET `/api/dashboard-gerencial/alertas`

Retorna alertas ativos.

**Response 200**

```json
{
  "filtrosAplicados": {},
  "alertas": [
    {
      "tipoAlerta": "EstoqueBaixo",
      "severidade": "Alta",
      "entidadeTipo": "Produto",
      "entidadeId": "00000000-0000-0000-0000-000000000000",
      "entidadeNome": "Produto A",
      "motivo": "Estoque disponivel abaixo do limite",
      "valorAtual": 2,
      "limiteAplicado": 5,
      "dataReferencia": "2026-06-30"
    }
  ]
}
```

## GET `/api/dashboard-gerencial/graficos`

Retorna series graficas.

**Response 200**

```json
{
  "filtrosAplicados": {},
  "graficos": [
    {
      "tipoGrafico": "ReceitaPorPeriodo",
      "nomeSerie": "Receita",
      "granularidade": "Dia",
      "unidade": "BRL",
      "totalConsolidado": 12500.00,
      "pontos": [
        {
          "periodo": "2026-06-01",
          "rotulo": "01/06",
          "valor": 900.00,
          "quantidade": null,
          "categoria": null
        }
      ]
    }
  ]
}
```

## Error Responses

**400 - Filtro invalido**

```json
{
  "erro": "Filtro invalido",
  "detalhes": [
    "dataInicial nao pode ser posterior a dataFinal"
  ]
}
```

## Compatibility Note

O endpoint existente `GET /api/dashboard-financeiro` pode ser mantido durante transicao. A regra gerencial completa deve ser exposta pelos endpoints acima; caso o endpoint antigo seja evoluido, ele deve delegar para o mesmo caso de uso financeiro para evitar formulas duplicadas.
