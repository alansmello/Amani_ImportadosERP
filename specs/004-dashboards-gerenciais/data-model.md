# Data Model: Dashboards Gerenciais

Esta feature nao exige novas entidades persistidas obrigatorias. Os modelos abaixo sao contratos de leitura, filtros e agregacoes gerenciais derivados do historico existente.

## DashboardFiltro

**Purpose**: Representa a entrada de filtros para todas as consultas gerenciais.

**Fields**:

- `DataInicial`: inicio do periodo customizado.
- `DataFinal`: fim do periodo customizado.
- `Mes`: mes de referencia, 1 a 12.
- `Ano`: ano de referencia.
- `LimiteRankings`: quantidade maxima de itens por ranking.
- `TiposGraficos`: series graficas solicitadas.
- `TiposAlertas`: alertas solicitados.

**Validation Rules**:

- Data inicial nao pode ser posterior a data final.
- Mes deve estar entre 1 e 12.
- Ano deve estar dentro do intervalo de dados aceito pelo ERP.
- Periodo customizado prevalece sobre mes/ano.
- Sem filtro informado, usar mes corrente.

## DashboardFiltroAplicado

**Purpose**: Explica ao consumidor qual periodo foi efetivamente usado.

**Fields**:

- `TipoFiltro`: periodo customizado, mes, ano ou padrao.
- `DataInicialEfetiva`
- `DataFinalEfetiva`
- `Mes`
- `Ano`
- `PrecedenciaAplicada`
- `DataReferencia`

## DashboardGerencial

**Purpose**: Resposta consolidada opcional para a tela gerencial.

**Fields**:

- `FiltrosAplicados`
- `Financeiro`
- `Operacional`
- `Rankings`
- `Alertas`
- `Graficos`
- `Avisos`

**Relationships**:

- Compoe os demais modelos de resposta.

## DashboardFinanceiroGerencial

**Purpose**: Resumo financeiro do periodo.

**Fields**:

- `ReceitaTotal`
- `LucroTotal`
- `TotalCompras`
- `TotalDespesas`
- `SaldoOperacional`
- `ContasReceberAbertas`
- `ValoresRecebidos`
- `ValorLucroNaoCalculavel`
- `QuantidadeItensSemCusto`
- `Avisos`

**Rules**:

- Receita usa vendas confirmadas.
- Compras usam compras registradas e nao canceladas.
- Valores recebidos usam pagamentos confirmados no periodo.
- Contas a receber abertas usam saldo pendente ate a data final.
- Lucro sinaliza custo ausente em vez de inventar custo.

## DashboardOperacional

**Purpose**: Resumo operacional do periodo e da data de referencia.

**Fields**:

- `ProdutosCadastrados`
- `EstoqueDisponivelTotal`
- `MercadoriasEmTransitoQuantidade`
- `MercadoriasEmTransitoValor`
- `ComprasEmAberto`
- `ProdutosPendentesRecebimento`
- `PerdasRegistradasQuantidade`
- `PerdasRegistradasValor`
- `QuantidadeVendas`
- `QuantidadeCompras`

**Rules**:

- Estoque disponivel vem de movimentacoes.
- Mercadorias em transito usam pendencia de compra.
- Perdas reduzem pendencia e nao geram estoque.

## RankingProduto

**Purpose**: Produto ordenado por criterio gerencial.

**Fields**:

- `TipoRanking`: mais vendidos, mais lucrativos, maior estoque, menor estoque.
- `Posicao`
- `ProdutoId`
- `ProdutoNome`
- `Quantidade`
- `ValorFinanceiro`
- `CriterioOrdenacao`
- `Aviso`

**Validation Rules**:

- Limite deve ser positivo.
- Empates devem usar criterio estavel.
- Ranking de menor estoque considera apenas produtos elegiveis para venda/reposicao.

## AlertaGerencial

**Purpose**: Situacao operacional que exige atencao.

**Fields**:

- `TipoAlerta`: estoque baixo, sem movimentacao, transito antigo, perdas recorrentes.
- `Severidade`
- `EntidadeTipo`
- `EntidadeId`
- `EntidadeNome`
- `Motivo`
- `ValorAtual`
- `LimiteAplicado`
- `DataReferencia`

**Rules**:

- Alerta ativo aparece somente enquanto a condicao existir.
- Limite aplicado deve ser informado na resposta.

## SerieGrafica

**Purpose**: Serie temporal ou categorica para graficos.

**Fields**:

- `TipoGrafico`: receita, lucro, compras, despesas por categoria, evolucao de estoque.
- `NomeSerie`
- `Granularidade`
- `Unidade`
- `Pontos`
- `TotalConsolidado`

## PontoGrafico

**Purpose**: Ponto individual de uma serie.

**Fields**:

- `Periodo`
- `Rotulo`
- `Valor`
- `Quantidade`
- `Categoria`

## AvisoDadoIncompleto

**Purpose**: Indica que uma metrica possui parte nao calculavel.

**Fields**:

- `Codigo`
- `Mensagem`
- `EntidadeTipo`
- `EntidadeId`
- `Impacto`

**Rules**:

- Deve ser usado quando custo medio ausente afeta lucro.
- Nao deve bloquear indicadores independentes.

## Existing Historical Sources

- `Produto`: cadastro e elegibilidade.
- `Venda` e `VendaItem`: receita, quantidade vendida, lucro e rankings.
- `Compra` e `CompraItem`: total de compras, mercadorias em transito e compras em aberto.
- `CompraItemRecebimento`: entrada fisica confirmada.
- `CompraItemPerda`: perdas, extravios e avarias.
- `EstoqueMovimentacao`: estoque disponivel e evolucao de estoque.
- `Despesa`: despesas totais e por categoria.
- `ContaReceber` e `PagamentoRecebido`: contas abertas e valores recebidos.
- `EventoFinanceiro`: fonte complementar para eventos financeiros quando aplicavel.
