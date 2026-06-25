# Quickstart: Dashboard Gerencial e Financeiro

## Prerequisites

- Backend com dados gerados por compras, vendas, recebiveis, formas de
  pagamento e despesas.
- Frontend configurado com `NEXT_PUBLIC_API_BASE_URL` apontando para a API.
- Dependencias do frontend instaladas.

## Build and Static Validation

From repository root:

```powershell
dotnet build Amani_ImportadosERP.sln
```

From `frontend/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Expected:
- Todos os comandos finalizam sem erro.
- Typecheck nao permite formulas improvisadas usando campos de listas
  operacionais para criar KPIs.

## Manual Scenario 1: Home Real

1. Iniciar backend e frontend.
2. Abrir `/`.
3. Confirmar que o placeholder nao aparece.
4. Confirmar que os KPIs financeiros exibem faturamento, lucro, despesas e
   recebiveis quando ha dados.

Expected:
- Valores batem com a fonte oficial para o periodo.
- A tela mostra loading, erro ou vazio quando apropriado.

## Manual Scenario 2: Filtro por Mes

1. Selecionar modo `Mes`.
2. Escolher um mes/ano com dados.
3. Aplicar filtro.

Expected:
- KPIs, rankings, alertas e graficos atualizam para o mes escolhido.
- Dados de periodo anterior nao permanecem marcados como atuais.

## Manual Scenario 3: Filtro por Ano

1. Selecionar modo `Ano`.
2. Escolher um ano com dados.
3. Aplicar filtro.

Expected:
- Todos os blocos filtraveis refletem o ano.
- Filtro aplicado aparece de forma compreensivel.

## Manual Scenario 4: Intervalo Invalido

1. Selecionar modo `Intervalo`.
2. Informar data inicial maior que data final.
3. Tentar aplicar.

Expected:
- A UI bloqueia a consulta.
- Mensagem orienta corrigir as datas.
- Dados validos anteriores nao sao substituidos por estado enganoso.

## Manual Scenario 5: Falha Parcial

1. Simular falha em uma fonte de dashboard ou usar ambiente com uma secao
   indisponivel.
2. Abrir a home.

Expected:
- A secao afetada mostra erro.
- Secoes carregadas permanecem visiveis.

## Manual Scenario 6: Dados Insuficientes

1. Usar periodo sem vendas/despesas/recebiveis suficientes.
2. Abrir a home ou aplicar filtro para esse periodo.

Expected:
- Secoes sem dados mostram estado vazio.
- Avisos de dados incompletos aparecem quando retornados.
- Nenhum ranking ou KPI e sintetizado no frontend.

## Manual Scenario 7: Responsividade e Dark Theme

Validar em:
- 360px de largura.
- 768px de largura.
- 1280px de largura.

Expected:
- Dark Theme preservado.
- Sem rolagem horizontal indevida.
- Filtros, KPIs, rankings, alertas e graficos legiveis.
- Textos e eixos de graficos nao se sobrepoem.

## Regression Checks

- Navegacao principal continua funcionando.
- Paginas de produtos, clientes, compras, estoque, vendas e financeiro continuam
  acessiveis.
- `apiClient` segue sendo chamado por service module, nao diretamente pelos
  componentes quando existir service.
- `queryKeys.dashboard` e usado para cache/invalidation da feature.
- Ranking de clientes, quando exibido, vem de contrato oficial de backend; nao
  ha derivacao local a partir de vendas ou recebiveis.

## Implementation Notes

- Recharts esta instalado no frontend e e usado somente em
  `dashboard-chart-section.tsx` para renderizar `ResponsiveContainer`,
  `LineChart` e `BarChart`. Series, pontos, unidades, totais e avisos continuam
  sendo propriedade da API; o componente apenas mapeia rotulos e formata valores.
- Ranking de clientes agora faz parte do contrato oficial do backend por meio de
  `RankingClienteDto` e de
  `IDashboardRankingRepository.ObterClientesMaisValiososAsync`. O payload de
  rankings pode conter itens de produto e cliente; o frontend renderiza clientes
  apenas quando `clienteId` e `clienteNome` sao retornados pela API.
- Validacao de 2026-06-25: `npm run lint`, `npm run typecheck`,
  `npm run build` e `dotnet build Amani_ImportadosERP.sln` foram executados com
  sucesso apos a implementacao dos componentes e do contrato backend.
- Auditoria de formulas: componentes, hooks e service de dashboard nao calculam
  faturamento, lucro, despesas, recebiveis, severidade, ranking, totais de series
  ou pontos de grafico. O unico agrupamento local em rankings organiza itens por
  `tipoRanking` ja retornado pela API.
- Auditoria visual: a home usa grids responsivos para 360px, 768px e 1280px,
  preserva Dark Theme por tokens locais e evita sobreposicao com `min-w-0`,
  `break-words`, alturas estaveis de grafico e eixos compactos do Recharts.
