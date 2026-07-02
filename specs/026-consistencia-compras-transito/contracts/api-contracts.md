# Contracts: Consistência de Compras em Trânsito e Dashboard

## Estratégia de compatibilidade

- Endpoints e campos existentes permanecem disponíveis.
- Campos novos são aditivos.
- Totais existentes mantêm o tipo monetário, mas passam a seguir a regra oficial corrigida.
- Endpoints de alertas permanecem publicados; a home apenas deixa de consumi-los.

## Compras

### `GET /api/compras`

O formato permanece:

```json
[
  {
    "id": "guid",
    "fornecedorId": "guid",
    "dataCompra": "2026-07-02T00:00:00Z",
    "status": "EmTransito",
    "totalCompra": 380.00
  }
]
```

**Semântica corrigida de `totalCompra`**: soma dos valores líquidos dos itens menos desconto geral mais acréscimo geral.

### `GET /api/compras/{id}`

O formato permanece. O campo `total` passa a usar a mesma semântica de `totalCompra` da listagem. `items[].valorTotal` continua representando o valor líquido do item antes do rateio dos ajustes gerais.

### `GET /api/compras/em-transito`

Campos adicionados ao nível da compra:

```json
[
  {
    "compraId": "guid",
    "fornecedorId": "guid",
    "dataCompra": "2026-07-02T00:00:00Z",
    "status": "ParcialmenteRecebida",
    "totalCompra": 380.00,
    "valorPendenteCusto": 170.05,
    "motivoValorPendenteIndisponivel": null,
    "itens": [
      {
        "itemId": "guid",
        "produtoId": "guid",
        "quantidadeComprada": 10,
        "quantidadeRecebida": 5,
        "quantidadePerdida": 0,
        "quantidadePendente": 5
      }
    ]
  }
]
```

Regras:

- `totalCompra` é sempre o total oficial completo.
- `valorPendenteCusto` considera somente quantidades pendentes e inclui rateio dos ajustes gerais.
- Quando o rateio for impossível por dados comerciais inválidos, `valorPendenteCusto` é `null` e o motivo é preenchido; zero continua reservado para uma pendência legitimamente zerada.

## Dashboard gerencial

### `GET /api/dashboard-gerencial/financeiro`

Campos adicionados:

```json
{
  "valorMercadoriasEmTransitoAoCusto": 170.05,
  "valorMercadoriasEmTransitoAoPrecoVenda": 270.00,
  "motivoValorMercadoriasEmTransitoAoCustoIndisponivel": null,
  "motivoValorMercadoriasEmTransitoAoPrecoVendaIndisponivel": null,
  "valorTotalRealistaOperacao": 1970.05,
  "valorTotalPotencialOperacao": 2220.00
}
```

Regras:

- `valorTotalRealistaOperacao` inclui trânsito ao custo.
- `valorTotalPotencialOperacao` inclui trânsito ao preço de venda atual.
- Se o custo oficial do trânsito estiver incompleto, `valorMercadoriasEmTransitoAoCusto` e `valorTotalRealistaOperacao` são `null`, o motivo é preenchido e `avisos` recebe o código `TRANSITO_CUSTO_INDISPONIVEL`.
- Se a valorização à venda estiver incompleta, `valorMercadoriasEmTransitoAoPrecoVenda` e `valorTotalPotencialOperacao` são `null`, o motivo é preenchido e `avisos` recebe o código `TRANSITO_PRECO_VENDA_INDISPONIVEL`.
- A indisponibilidade de custo não impede valor de venda/potencial válido, e a indisponibilidade de venda não altera o custo já calculado.
- Estoque valorizado continua restrito a saldo físico disponível.
- `totalCompras`, `saidasPeriodo`, `caixaInicialPeriodo` e `caixaFinalPeriodo` passam a usar o total oficial completo das compras.

### `GET /api/dashboard-gerencial/operacional`

Campos novos e alias preservado:

```json
{
  "mercadoriasEmTransitoQuantidade": 7,
  "mercadoriasEmTransitoValor": 170.05,
  "mercadoriasEmTransitoValorCusto": 170.05,
  "mercadoriasEmTransitoValorCustoCompleto": true,
  "motivoMercadoriasEmTransitoValorCustoIndisponivel": null,
  "mercadoriasEmTransitoValorVenda": 270.00,
  "motivoMercadoriasEmTransitoValorVendaIndisponivel": null
}
```

`mercadoriasEmTransitoValor` permanece como subtotal calculável para compatibilidade. Quando `mercadoriasEmTransitoValorCustoCompleto` for `false`, `mercadoriasEmTransitoValorCusto` é `null`, o motivo é obrigatório e o campo legado não pode ser apresentado como total oficial.

### `GET /api/dashboard-gerencial`

O consolidado recebe os mesmos campos dentro de `financeiro` e `operacional`. `alertas` e `resumoAlertas` permanecem no contrato.

### `GET /api/dashboard-gerencial/graficos`

A série `ComprasPorPeriodo` mantém o formato atual, mas seus pontos e `totalConsolidado` passam a incluir ajustes por item e ajustes gerais conforme a regra oficial.

### `GET /api/dashboard-financeiro`

O formato permanece. `totalCompras` e `caixaAtual` passam a refletir o total oficial completo das compras.

### `GET /api/dashboard-gerencial/alertas`

Sem alteração de contrato. A home não fará mais essa chamada, mas o endpoint é preservado para compatibilidade e refinamento futuro.

## Contratos de frontend

### Compras

- `PurchaseInTransit` recebe `totalCompra`, `valorPendenteCusto` e motivo opcional.
- A adaptação `totalCompra: 0` é removida.
- A lista formata zero como moeda legítima e usa o motivo somente para indisponibilidade real.
- Na visão em trânsito, “Valor da compra” apresenta `totalCompra`; `valorPendenteCusto` pode aparecer como contexto secundário sem substituir o total oficial.

### Dashboard

- `DashboardFinancialKpis` recebe os dois valores de trânsito anuláveis e seus motivos de indisponibilidade.
- `DashboardOperationalSummary` recebe nomes explícitos de custo e venda, indicador de completude, motivos e mantém o subtotal legado existente.
- `DashboardPatrimonialGrid` adiciona cards de trânsito ao custo e à venda e atualiza as descrições dos valores realista e potencial.
- Cards com valor oficial indisponível exibem o motivo, não R$ 0,00; o card independente permanece disponível quando seus próprios dados forem válidos.
- `DashboardHome` deixa de criar a query de alertas e remove o bloco correspondente.
- `DashboardKpiGrid` deixa de renderizar “Dados financeiros incompletos”.
- `DashboardPatrimonialGrid` deixa de renderizar “Estoque com lacunas de custo”.
- Avisos continuam no tipo e podem ser usados por outras seções.
