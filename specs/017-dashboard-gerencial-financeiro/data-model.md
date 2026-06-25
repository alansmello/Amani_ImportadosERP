# Data Model: Dashboard Gerencial e Financeiro

## DashboardPeriodFilter

Representa o periodo ativo da home.

Fields:
- `mode`: `month`, `year` ou `range`.
- `month`: numero de 1 a 12 quando `mode = month`.
- `year`: ano com quatro digitos para `month` e `year`.
- `startDate`: data inicial ISO quando `mode = range`.
- `endDate`: data final ISO quando `mode = range`.

Validation:
- `month` exige `month` e `year`.
- `year` exige `year`.
- `range` exige `startDate <= endDate`.
- O mesmo filtro normalizado deve alimentar KPIs, rankings, alertas e graficos.

## DashboardAppliedFilter

Filtro retornado pela fonte oficial apos normalizacao.

Fields:
- `tipoFiltro`
- `dataInicial`
- `dataFinal`
- `dataReferencia`
- `mes`
- `ano`
- `precedenciaAplicada`

Relationships:
- Deve acompanhar respostas gerenciais filtraveis para confirmar o periodo
  exibido.

## FinancialKpis

Indicadores financeiros exibidos no topo da home.

Fields:
- `receitaTotal` ou equivalente oficial de faturamento.
- `lucroTotal` ou equivalente oficial de lucro.
- `totalDespesas`.
- `contasReceberAbertas` ou equivalente oficial de recebiveis.
- Campos auxiliares oficiais, como valores recebidos, saldo operacional,
  compras, caixa atual ou avisos, quando retornados.

Rules:
- Valores sao somente exibidos e formatados.
- Nao ha soma, subtracao, margem, percentual ou derivacao no cliente.
- KPIs de periodo usam fonte financeira filtravel.

## OperationalSummary

Resumo operacional retornado para o periodo ativo.

Fields:
- Produtos cadastrados.
- Estoque disponivel total.
- Mercadorias em transito.
- Compras em aberto.
- Produtos pendentes de recebimento.
- Perdas registradas.
- Quantidade de vendas e compras.

Rules:
- Exibicao deve respeitar valores oficiais.
- Campos ausentes devem gerar estado de dado indisponivel, nao calculo local.

## DashboardRanking

Item ordenado retornado pela fonte oficial.

Fields:
- `tipoRanking`
- `posicao`
- identificador da entidade ranqueada
- nome da entidade ranqueada
- `quantidade`
- `valorFinanceiro`
- `criterioOrdenacao`
- `aviso`

Rules:
- Ordem deve ser a retornada pela fonte oficial.
- Limite visual deve ser enviado como parametro quando suportado.
- Ranking de cliente deve vir de contrato oficial de backend; nao pode ser
  sintetizado no frontend.

## CustomerRanking

Item ordenado de cliente retornado pela fonte oficial.

Fields:
- `tipoRanking`
- `posicao`
- `clienteId`
- `clienteNome`
- `quantidade`
- `valorFinanceiro`
- `criterioOrdenacao`
- `aviso`

Rules:
- Deve ser calculado e ordenado no backend.
- Deve usar o mesmo periodo ativo dos demais rankings.
- Deve respeitar `limiteRankings` quando suportado.

## DashboardAlert

Alerta financeiro ou operacional.

Fields:
- `tipoAlerta`
- `severidade`
- `entidadeTipo`
- `entidadeId`
- `entidadeNome`
- `motivo`
- `valorAtual`
- `limiteAplicado`
- `dataReferencia`

Rules:
- Prioridade e severidade devem seguir a resposta oficial.
- Ausencia de alertas e estado vazio valido, nao erro.

## DashboardChartSeries

Serie grafica retornada pela fonte oficial.

Fields:
- `tipoGrafico`
- `nomeSerie`
- `granularidade`
- `unidade`
- `pontos`
- `totalConsolidado`

Relationships:
- Contem muitos `DashboardChartPoint`.

Rules:
- Pontos devem ser renderizados na ordem recebida ou por ordenacao temporal
  explicita se o contrato exigir.
- `totalConsolidado` e exibido somente se retornado; nao recalculado.

## DashboardChartPoint

Ponto de uma serie grafica.

Fields:
- `periodo`
- `rotulo`
- `valor`
- `quantidade`
- `categoria`

Rules:
- `valor` e `quantidade` sao dados oficiais.
- A interface pode formatar rotulo/data, mas nao alterar o valor do ponto.

## IncompleteDataNotice

Aviso de dado incompleto que explica lacunas de calculo ou fonte.

Fields:
- `codigo`
- `mensagem`
- `entidadeTipo`
- `entidadeId`
- `impacto`

Rules:
- Deve ser exibido proximo ao bloco impactado quando possivel.
- Nao deve ser tratado como erro tecnico se a resposta foi bem-sucedida.

## State Transitions

Dashboard section:

```text
idle -> loading -> success
idle -> loading -> empty
idle -> loading -> error
success -> loading (quando filtro muda)
empty -> loading (quando filtro muda)
error -> loading (quando usuario tenta novamente ou filtro muda)
```

Filter:

```text
draft -> valid -> applied
draft -> invalid
applied -> draft (edicao)
```

Validation:
- Filtro invalido nao dispara consulta.
- Dados de filtro aplicado devem corresponder ao filtro ativo antes de serem
  apresentados como atuais.
