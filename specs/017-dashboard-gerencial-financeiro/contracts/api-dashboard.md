# API Contract: Dashboard Gerencial e Financeiro

Este contrato descreve os endpoints consumidos pela home. Ele documenta o uso
frontend esperado sobre contratos backend existentes; nao redefine regra de
negocio nem autoriza calculos no cliente.

## Period Query

Query params comuns para fontes filtraveis:

```text
mes?: number
ano?: number
dataInicial?: ISO date
dataFinal?: ISO date
limiteRankings?: number
tiposGraficos?: string[]
tiposAlertas?: string[]
```

Rules:
- Modo mes envia `mes` e `ano`.
- Modo ano envia `ano`.
- Modo intervalo envia `dataInicial` e `dataFinal`.
- `dataInicial > dataFinal` deve ser bloqueado na UI e tambem tratado como erro
  de contrato se o backend rejeitar.
- O mesmo periodo deve ser usado para todas as secoes filtraveis.

## GET /api/dashboard-gerencial/financeiro

Uso na home:
- Fonte oficial para KPIs financeiros dependentes de periodo.

Expected fields:
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

UI behavior:
- Mapear `receitaTotal` para faturamento.
- Mapear `lucroTotal` para lucro.
- Mapear `totalDespesas` para despesas.
- Mapear `contasReceberAbertas` para recebiveis.
- Exibir avisos de dados incompletos junto aos KPIs impactados.
- Nao calcular saldo, lucro, despesas, recebiveis ou percentuais derivados.

## GET /api/dashboard-gerencial/operacional

Uso na home:
- Fonte oficial para resumo operacional quando exibido.

Expected fields:
- `filtrosAplicados`
- `produtosCadastrados`
- `estoqueDisponivelTotal`
- `mercadoriasEmTransitoQuantidade`
- `mercadoriasEmTransitoValor`
- `comprasEmAberto`
- `produtosPendentesRecebimento`
- `perdasRegistradasQuantidade`
- `perdasRegistradasValor`
- `quantidadeVendas`
- `quantidadeCompras`

UI behavior:
- Exibir como cards compactos ou resumo lateral.
- Nao calcular totais operacionais a partir de listas.

## GET /api/dashboard-gerencial/rankings

Uso na home:
- Fonte oficial para rankings.

Query params:
- Period query.
- `limiteRankings` recomendado: 5.

Expected fields:
- `filtrosAplicados`
- `rankings[]`
- `avisos[]`

Ranking item:
- `tipoRanking`
- `posicao`
- `produtoId`
- `produtoNome`
- `quantidade`
- `valorFinanceiro`
- `criterioOrdenacao`
- `aviso`

UI behavior:
- Agrupar visualmente por `tipoRanking` quando houver multiplos criterios.
- Usar `posicao` e ordem oficial.
- Exibir ranking de cliente somente a partir de campos oficiais de cliente.
- Se o contrato atual nao fornecer ranking de cliente, a implementacao deve
  adicionar suporte backend oficial em vez de sintetizar dados no frontend.

Customer ranking item, when added or present:
- `tipoRanking`
- `posicao`
- `clienteId`
- `clienteNome`
- `quantidade`
- `valorFinanceiro`
- `criterioOrdenacao`
- `aviso`

## GET /api/dashboard-gerencial/alertas

Uso na home:
- Fonte oficial para alertas financeiros e operacionais.

Expected fields:
- `filtrosAplicados`
- `alertas[]`

Alert item:
- `tipoAlerta`
- `severidade`
- `entidadeTipo`
- `entidadeId`
- `entidadeNome`
- `motivo`
- `valorAtual`
- `limiteAplicado`
- `dataReferencia`

UI behavior:
- Ordenar apenas se o backend nao retornar prioridade visual clara; nesse caso
  usar severidade declarada, sem alterar conteudo ou valores.
- Ausencia de alertas e estado vazio positivo.

## GET /api/dashboard-gerencial/graficos

Uso na home:
- Fonte oficial para series graficas.

Query params:
- Period query.
- `tiposGraficos` conforme tipos suportados pelo backend.

Expected fields:
- `filtrosAplicados`
- `graficos[]`
- `avisos[]`

Serie item:
- `tipoGrafico`
- `nomeSerie`
- `granularidade`
- `unidade`
- `pontos[]`
- `totalConsolidado`

Point item:
- `periodo`
- `rotulo`
- `valor`
- `quantidade`
- `categoria`

UI behavior:
- Renderizar pontos e labels sem recalcular total.
- Exibir estado vazio quando `pontos` vier vazio.
- Exibir aviso de dados incompletos quando `avisos` vier preenchido.

## GET /api/dashboard-financeiro

Uso na home:
- Snapshot financeiro sem filtro no contrato atual.
- Pode alimentar cards globais se a implementacao decidir exibir caixa atual ou
  indicadores nao dependentes do periodo.

Expected fields:
- `totalRecebido`
- `totalAReceber`
- `totalCompras`
- `totalDespesas`
- `caixaAtual`
- `lucroReal`

UI behavior:
- Nao usar como fonte de KPIs de periodo enquanto o endpoint nao aceitar filtros.
- Se exibido junto de dados filtrados, rotular claramente como snapshot atual.

## Error Contract

Invalid filter response:

```json
{
  "erro": "Filtro invalido",
  "detalhes": ["mensagem"]
}
```

UI behavior:
- Mostrar erro de filtro no controle de periodo.
- Nao substituir dados validos anteriores por dados de periodo invalido.
- Permitir nova tentativa apos ajuste do filtro.
