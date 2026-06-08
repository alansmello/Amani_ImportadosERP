# Quickstart: Dashboards Gerenciais

Este guia descreve como validar a feature apos implementacao. Ele nao define codigo nem tarefas.

## Prerequisites

- Banco com dados de produtos, vendas, compras, despesas, contas a receber, pagamentos, movimentacoes de estoque, recebimentos e perdas.
- Feature 003 aplicada para que compras em transito, recebimentos parciais e perdas estejam representados historicamente.
- API do ERP executando no ambiente de validacao.

## Validation Scenarios

### 1. Resumo financeiro com periodo customizado

1. Preparar um periodo com vendas confirmadas, compras nao canceladas, despesas, contas a receber abertas e pagamentos recebidos.
2. Consultar `GET /api/dashboard-gerencial/financeiro?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD`.
3. Verificar:
   - Receita total soma vendas confirmadas.
   - Total de compras soma compras registradas no periodo.
   - Total de despesas soma despesas no periodo.
   - Valores recebidos somam pagamentos confirmados no periodo.
   - Contas a receber abertas mostram saldo pendente ate a data final.
   - Lucro sinaliza custo ausente quando aplicavel.

### 2. Resumo operacional com mercadorias em transito

1. Preparar compra com recebimento parcial e outra compra totalmente pendente.
2. Consultar `GET /api/dashboard-gerencial/operacional?mes=6&ano=2026`.
3. Verificar:
   - Compra registrada sem recebimento nao aumenta estoque disponivel.
   - Quantidade recebida aumenta estoque apenas pela quantidade confirmada.
   - Pendencia permanece em mercadorias em transito.
   - Perdas reduzem pendencia e aparecem em perdas registradas.

### 3. Rankings

1. Preparar produtos com quantidades vendidas, lucros e saldos diferentes.
2. Consultar `GET /api/dashboard-gerencial/rankings?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD&limiteRankings=5`.
3. Verificar:
   - Produtos mais vendidos ordenam por quantidade vendida.
   - Produtos mais lucrativos ordenam por lucro total e sinalizam custo ausente.
   - Maior estoque e menor estoque usam saldo por movimentacoes.
   - Empates seguem criterio estavel.

### 4. Alertas

1. Preparar produto abaixo do limite de estoque, produto sem movimentacao, compra antiga em transito e produto com perdas recorrentes.
2. Consultar `GET /api/dashboard-gerencial/alertas?ano=2026`.
3. Verificar:
   - Cada alerta retorna tipo, severidade, entidade, motivo, valor atual e limite.
   - Alertas deixam de aparecer quando a condicao e resolvida.

### 5. Graficos

1. Preparar vendas, compras, despesas e movimentacoes de estoque distribuidas em datas diferentes.
2. Consultar `GET /api/dashboard-gerencial/graficos?dataInicial=YYYY-MM-DD&dataFinal=YYYY-MM-DD`.
3. Verificar:
   - Receita por periodo usa a mesma formula do indicador financeiro.
   - Lucro por periodo usa custo medio por entradas reais.
   - Compras por periodo excluem canceladas.
   - Despesas por categoria somam o mesmo total de despesas.
   - Evolucao de estoque usa saldo acumulado por movimentacoes.

### 6. Filtros e precedencia

1. Consultar qualquer endpoint com `dataInicial/dataFinal` e tambem `mes/ano`.
2. Verificar que o periodo customizado prevalece.
3. Consultar com `dataInicial` posterior a `dataFinal`.
4. Verificar erro de validacao claro e sem calculo parcial.

## Expected Documentation Links

- Data model: [data-model.md](./data-model.md)
- API contract: [contracts/dashboard-gerencial-api.md](./contracts/dashboard-gerencial-api.md)
- Feature spec: [spec.md](./spec.md)
