# Data Model: Revisão do Dashboard Gerencial

## Overview

A feature não cria entidade transacional nova. Ela adiciona modelos de leitura derivados de dados existentes e índices para suportar consultas agregadas. Todos os valores monetários usam a precisão já definida pelo banco (`decimal(18,2)` nos dados de origem) e datas de filtro permanecem normalizadas em UTC pelo `DashboardFiltroService`.

## Existing Sources of Truth

### Venda e VendaItem

- `Venda.DataVenda`, `Venda.Cancelada`, `Venda.Desconto`, `Venda.Acrescimo`
- `VendaItem.Quantidade`, `PrecoUnitario`, `Desconto`, `Acrescimo`, `ProdutoId`
- Relação: uma Venda possui muitos VendaItems.
- Uso: faturamento e lucro bruto do período.
- Regra: venda cancelada é sempre excluída.

### PagamentoRecebido e ContaReceber

- `PagamentoRecebido.Valor`: dinheiro efetivamente recebido; fonte de entradas.
- `PagamentoRecebido.ValorBrutoLiquidado`: parcela da obrigação liquidada; fonte do saldo de recebíveis.
- `PagamentoRecebido.DataPagamento`: corte temporal de entradas e liquidações.
- `ContaReceber.Valor`, `CreatedAt`, `DataVencimento`: valor original, existência na data de referência e classificação vencida/a vencer.
- Relação: uma ContaReceber possui muitos PagamentosRecebidos.

### Compra, CompraItem e Despesa

- `Compra.DataCompra`, `Compra.Status` e total dos itens formam a parcela de compras nas saídas estimadas.
- `Despesa.DataCompetencia` e `Despesa.Valor` formam a parcela de despesas.
- `DespesaOperadora` permanece fora desta feature.

### EventoFinanceiro

- `Tipo = SaldoInicialCaixa`, `Valor` e `Data` representam o marco de implantação.
- Evento com `Data < dataInicial`: compõe caixa inicial.
- Evento com `dataInicial <= Data <= dataFinal`: compõe ajuste de implantação.
- Evento com `Data > dataFinal`: não compõe a consulta.

### EstoqueMovimentacao e Produto

- Saldo por produto até a data de referência:
  - soma `InventarioInicial`;
  - soma `Entrada` somente quando vinculada a `CompraItemId`;
  - subtrai `Saida`.
- Custo médio considera somente movimentos de entrada elegíveis com `ValorUnitario` conhecido.
- `Produto.PrecoVenda` fornece o potencial bruto ao preço atual.
- Mercadoria em trânsito não possui movimento de entrada e, portanto, não integra o saldo.

## Read Models

### DashboardFinanceiroGerencialDto

Campos existentes permanecem inalterados. Campos novos são nullable durante o rollout e devem ser preenchidos pelo handler final, inclusive quando o resultado real for zero.

| Field | Type | Rule |
|---|---|---|
| `SaidasPeriodo` | `decimal?` | `TotalCompras + TotalDespesas`; não inclui DespesaOperadora |
| `CaixaInicialPeriodo` | `decimal?` | saldo inicial anterior + entradas anteriores - compras anteriores - despesas anteriores |
| `AjusteImplantacaoPeriodo` | `decimal?` | soma de saldos iniciais datados dentro do período |
| `CaixaFinalPeriodo` | `decimal?` | caixa inicial + ajuste + valores recebidos - saídas |
| `ContasReceberVencidas` | `decimal?` | saldo positivo com vencimento anterior à data de referência |
| `ContasReceberAVencer` | `decimal?` | saldo positivo com vencimento igual ou posterior à data de referência |
| `ValorEstoqueAoCusto` | `decimal?` | saldo positivo multiplicado pelo custo médio, somente quando calculável |
| `ValorEstoqueAoPrecoVenda` | `decimal?` | todo saldo positivo multiplicado pelo preço de venda atual |
| `LucroPotencialEstoque` | `decimal?` | diferença preço-custo somente para produtos com custo calculável |
| `QuantidadeEstoqueSemCusto` | `int?` | soma das unidades positivas sem custo médio |
| `ValorVendaEstoqueSemCusto` | `decimal?` | preço de venda atual das unidades sem custo médio |
| `ValorTotalRealistaOperacao` | `decimal?` | caixa final + recebíveis abertos + estoque ao custo |
| `ValorTotalPotencialOperacao` | `decimal?` | caixa final + recebíveis abertos + estoque ao preço de venda |

### DashboardRecebiveisResumoDto

| Field | Type | Validation |
|---|---|---|
| `Abertas` | `decimal` | `>= 0` |
| `Vencidas` | `decimal` | `>= 0` |
| `AVencer` | `decimal` | `>= 0` |

Invariante: `Abertas = Vencidas + AVencer`, respeitada a precisão monetária.

### DashboardCaixaResumoDto

| Field | Type | Meaning |
|---|---|---|
| `CaixaInicial` | `decimal` | posição acumulada antes do início |
| `AjusteImplantacao` | `decimal` | marco inicial ocorrido dentro do filtro |
| `Entradas` | `decimal` | pagamentos recebidos dentro do filtro |
| `Saidas` | `decimal` | compras e despesas registradas dentro do filtro |
| `CaixaFinal` | `decimal` | resultado da fórmula oficial |

### DashboardEstoqueValorizadoDto

| Field | Type | Meaning |
|---|---|---|
| `QuantidadeTotal` | `int` | unidades com saldo positivo |
| `ValorAoCusto` | `decimal` | valor calculável ao custo médio |
| `ValorAoPrecoVenda` | `decimal` | potencial bruto de todas as unidades positivas |
| `LucroPotencialCalculavel` | `decimal` | margem potencial apenas onde há custo |
| `QuantidadeSemCusto` | `int` | unidades sem custo médio |
| `ValorVendaSemCusto` | `decimal` | potencial bruto das unidades sem custo |

### DashboardAlertasResumoDto

| Field | Type | Rule |
|---|---|---|
| `Total` | `int` | quantidade após aplicar `tiposAlertas` |
| `PorSeveridade` | collection of key/count | agrupamento case-insensitive por severidade canônica |
| `PorTipo` | collection of key/count | agrupamento case-insensitive por tipo canônico |

`DashboardAlertasDto.Alertas` permanece intacto e `Resumo` é aditivo/opcional durante rollout.

## Invariants and Validation Rules

1. `ValoresRecebidos` nunca inclui `EventoFinanceiro`.
2. `SaidasPeriodo` nunca inclui `DespesaOperadora` nesta feature.
3. `CaixaFinalPeriodo = CaixaInicialPeriodo + AjusteImplantacaoPeriodo + ValoresRecebidos - SaidasPeriodo`.
4. Recebíveis usam `ValorBrutoLiquidado`, não apenas o valor líquido recebido.
5. Somente saldos de estoque estritamente positivos são valorizados; saldo negativo gera aviso operacional e valor financeiro zero para o produto.
6. Produto sem custo médio não contribui para `ValorEstoqueAoCusto` nem `LucroPotencialEstoque`.
7. Produto sem custo médio continua contribuindo para `ValorEstoqueAoPrecoVenda` e `ValorTotalPotencialOperacao`.
8. Campo novo `null` significa indisponível; `0` significa resultado calculado igual a zero.
9. Todos os cortes temporais usam `FiltrosAplicados` e a mesma `DataReferencia`.

## State Transitions

Não há transição de estado persistente. Durante rollout, cada indicador novo possui apenas dois estados de contrato:

```text
null/ausente (Indisponível) -> valor calculado (inclusive zero)
```

Uma resposta calculada não volta para `null` por condição de negócio; `null` é reservado a compatibilidade/indisponibilidade técnica.

## Persistence and Index Plan

Validar por plano de execução antes de consolidar a migration. Candidatos iniciais:

- `vendas (DataVenda, Cancelada)`;
- `pagamentos_recebidos (DataPagamento)` e FK `ContaReceberId` já indexada por convenção;
- `compras (DataCompra, Status)`;
- `despesas (DataCompetencia)`;
- `contas_receber (CreatedAt, DataVencimento)`;
- `eventos_financeiros (Tipo, Data)`;
- `estoque_movimentacoes (ProdutoId, Data, Tipo)`.

Somente índices demonstravelmente usados nas consultas/planos PostgreSQL entram na migration final, evitando custo desnecessário de escrita.
