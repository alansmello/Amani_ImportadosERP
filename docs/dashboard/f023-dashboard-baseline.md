# F023 — Baseline do Dashboard Gerencial

**Capturado em**: 30/06/2026  
**Branch**: `023-revisao-dashboard-gerencial`  
**Banco local**: PostgreSQL 16.3 em `amani_db`  
**Objetivo**: registrar o contrato e o comportamento de leitura anteriores à implementação das histórias da F023.

## Contratos atuais

### `GET /api/dashboard-gerencial/financeiro`

Campos retornados antes da F023:

- `filtrosAplicados`
- `receitaTotal`
- `lucroTotal`
- `totalCompras`
- `totalDespesas`
- `saldoOperacional`
- `contasReceberAbertas`
- `valoresRecebidos`
- `valorLucroNaoCalculavel`
- `quantidadeItensSemCusto`
- `avisos`

O handler executa as leituras sequencialmente. Vendas, itens de compra e contas com pagamentos são materializados para soma em memória. `ContasReceberAbertas` usa atualmente `PagamentoRecebido.Valor`, não `ValorBrutoLiquidado`.

### `GET /api/dashboard-gerencial/alertas`

Campos retornados antes da F023:

- `filtrosAplicados`
- `alertas[]`

Cada alerta inclui tipo, severidade, entidade, motivo, valor atual, limite e data de referência. Não existe resumo por total, severidade e tipo.

## Volume local de referência

| Histórico | Registros |
|---|---:|
| Vendas | 29 |
| Pagamentos recebidos | 15 |
| Compras | 28 |
| Despesas | 2 |
| Contas a receber | 19 |
| Movimentações de estoque | 70 |

Este volume é suficiente para registrar forma e resultado das consultas, mas não para validar a meta de 100 mil registros por histórico.

## Planos de execução atuais

As medições abaixo usam `EXPLAIN (ANALYZE, BUFFERS)` em consultas equivalentes às materializações atuais e filtro de junho/2026.

### Vendas com itens

- Plano: `Nested Loop Left Join`.
- Filtro de vendas: `Seq Scan on vendas`.
- Relação com itens: `Bitmap Index Scan` em `IX_venda_items_VendaId`.
- Linhas retornadas: 28.
- Tempo de execução: 1,526 ms.
- Risco: o endpoint transfere todas as vendas/itens do período para calcular totais em memória.

### Compras com itens

- Plano: `Hash Right Join`.
- Filtro de compras: `Seq Scan on compras`.
- Itens: `Seq Scan on compra_items`.
- Linhas retornadas: 17.
- Tempo de execução: 1,233 ms.
- Risco: todas as compras/itens do período são materializadas antes da soma.

### Contas a receber com pagamentos

- Plano: `Nested Loop Left Join`.
- Filtro de contas: `Seq Scan on contas_receber`.
- Relação com pagamentos: `Bitmap Index Scan` em `IX_pagamentos_recebidos_ContaReceberId`.
- Linhas retornadas: 22.
- Tempo de execução: 0,140 ms.
- Risco: contas e pagamentos são materializados; a soma em memória cresce com todo o snapshot.

### Custo médio por movimentações

- Plano: `GroupAggregate` após `Seq Scan on estoque_movimentacoes`.
- Linhas elegíveis: 18 de 70.
- Produtos agrupados: 11.
- Tempo de execução: 0,300 ms.
- Risco: helpers equivalentes estão duplicados nos repositories financeiro, ranking e gráfico.

## Baseline de arquitetura

- `DashboardFinanceiroRepository` usa `Include(...).ToListAsync()` para vendas, compras e recebíveis.
- O custo médio já é agregado no banco, mas sua implementação está duplicada.
- O frontend carrega financeiro, operacional, rankings, alertas e gráficos em queries independentes.
- `DashboardHome` impede renderização de resposta pertencente a filtro anterior.
- O contrato ainda não possui caixa inicial/final, ajuste de implantação, recebíveis segmentados, estoque valorizado, valor da operação ou resumo de alertas.

## Uso desta baseline

Na Phase 7, comparar novamente planos, volume transferido e tempos. O critério principal não é melhorar milissegundos nesta base pequena, mas mover somas e agrupamentos para o PostgreSQL e impedir crescimento linear de memória na API.
