# Implementation Plan: Dashboards Gerenciais

**Branch**: `004-dashboards-gerenciais` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-dashboards-gerenciais/spec.md`

## Summary

Criar consultas gerenciais para transformar dados operacionais e financeiros do ERP em dashboards financeiro e operacional, rankings, alertas e graficos. A solucao planejada e de leitura e agregacao: controllers apenas recebem filtros e delegam para Application; Application normaliza filtros, aplica regras de calculo e coordena casos de uso; Infra.Data fornece consultas agregadas via repositories; Domain continua preservando entidades historicas existentes.

Nao ha implementacao nesta fase, nem geracao de tasks. O plano define os impactos tecnicos, contratos e dependencias para posterior aprovacao.

## Technical Context

**Language/Version**: C# / .NET 8

**Primary Dependencies**: ASP.NET Core Web API, Entity Framework Core, Npgsql, MediatR ja existentes no projeto

**Storage**: PostgreSQL via `AmaniDbContext`, usando historico existente de produtos, vendas, compras, recebimentos, perdas, movimentacoes de estoque, despesas, contas a receber e pagamentos

**Testing**: Validacao por build da solucao e chamadas HTTP dos contratos; nao ha projeto de testes automatizados existente nesta solucao

**Target Platform**: Backend web API

**Project Type**: ASP.NET Core web service em Clean Architecture

**Performance Goals**: Consultas gerenciais devem responder adequadamente para uso diario do ERP, evitando carregar todo o historico em memoria quando houver agregacao possivel na persistencia. Rankings e graficos devem aceitar limite e filtros para manter volume de resposta controlado.

**Constraints**: Sem frontend nesta feature; sem novas bibliotecas externas; sem AutoMapper; DTOs manuais obrigatorios; controllers sem regra de negocio; backend como fonte das formulas; saldo de estoque por movimentacoes; compra registrada impacta financeiro, mas nao estoque; recebimento fisico confirmado impacta estoque; perdas nao geram estoque; historico preservado.

**Scale/Scope**: Expandir o dashboard financeiro atual e adicionar dashboard operacional, rankings, alertas e graficos. A feature cruza API, Application, Infra.Data e Infra.IoC, mas nao exige nova tabela obrigatoria. Caso limites de alerta configuraveis sejam implementados no futuro, isso deve ser tratado como evolucao separada ou tarefa explicita posterior.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Controllers devem apenas validar filtros basicos e delegar para queries/handlers; formulas e regras ficam em Application, com dados agregados por repositories.
- **Estoque por movimentacoes**: PASS. Estoque disponivel, rankings de estoque, alertas de estoque e evolucao de estoque usam exclusivamente `EstoqueMovimentacao`.
- **Compras e mercadorias em transito**: PASS. Total de compras financeiro usa compra registrada; mercadorias em transito e pendencias usam quantidade comprada menos recebimentos e perdas.
- **Recebimentos, perdas e rastreabilidade**: PASS. Recebimentos confirmados entram no estoque; perdas reduzem pendencia, compoem perda operacional e nao geram estoque.
- **Vendas, custo medio e inventario inicial**: PASS. Receita e quantidade de vendas usam vendas confirmadas; lucro usa custo medio por entradas reais; inventario inicial valorizado continua entrada valida.
- **Contratos de API e DTOs**: PASS. Novas respostas gerenciais usam DTOs explicitos; entidades de dominio nao sao expostas; mapeamentos permanecem manuais.
- **Persistencia e mapeamentos**: PASS. A feature e primariamente de leitura e agregacao; se houver novas consultas, seguem Repository Pattern. Nao ha necessidade inicial de migration.
- **Backend como fonte das regras**: PASS. Filtros, formulas, rankings, alertas e graficos sao calculados no backend.
- **Simplicidade antes de sofisticacao**: PASS. Planeja-se um conjunto pequeno de queries e repositories de leitura, sem BI externo, cache distribuido ou nova dependencia.

## Project Structure

### Documentation (this feature)

```text
specs/004-dashboards-gerenciais/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- dashboard-gerencial-api.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/
|-- Amani.ImportadosERP.Api/
|   `-- Controllers/
|       |-- DashboardFinanceiroController.cs
|       `-- DashboardGerencialController.cs
|-- Amani.ImportadosERP.Application/
|   |-- DTOs/
|   |   `-- Dashboards/
|   |-- Interfaces/
|   |   |-- IDashboardFinanceiroRepository.cs
|   |   |-- IDashboardOperacionalRepository.cs
|   |   |-- IDashboardRankingRepository.cs
|   |   |-- IDashboardAlertaRepository.cs
|   |   `-- IDashboardGraficoRepository.cs
|   `-- Queries/
|       |-- ObterDashboardGerencialQuery.cs
|       |-- ObterDashboardFinanceiroGerencialQuery.cs
|       |-- ObterDashboardOperacionalQuery.cs
|       |-- ObterDashboardRankingsQuery.cs
|       |-- ObterDashboardAlertasQuery.cs
|       `-- ObterDashboardGraficosQuery.cs
|-- Amani.ImportadosERP.Domain/
|   `-- Entities/
|       `-- existing historical entities only
|-- Amani.ImportadosERP.Infra.Data/
|   `-- Repositories/
|       |-- DashboardFinanceiroRepository.cs
|       |-- DashboardOperacionalRepository.cs
|       |-- DashboardRankingRepository.cs
|       |-- DashboardAlertaRepository.cs
|       `-- DashboardGraficoRepository.cs
`-- Amani.ImportadosERP.Infra.IoC/
    `-- DependencyInjection.cs
```

**Structure Decision**: Usar a Clean Architecture ja existente. Criar contratos gerenciais de leitura na Application, repositories especificos de consulta na Infra.Data e um controller gerencial dedicado. O `DashboardFinanceiroController` atual pode ser mantido temporariamente por compatibilidade ou redirecionado internamente para o novo caso de uso financeiro, mas a regra nova deve morar no fluxo gerencial planejado.

## Existing Code Impact

- `DashboardFinanceiroController` existe com `GET api/dashboard-financeiro` sem filtros. O plano recomenda manter compatibilidade e adicionar filtros somente no novo contrato gerencial ou evoluir esse endpoint com cuidado.
- `ObterDashboardFinanceiroQueryHandler` calcula totais buscando listas completas e somando em memoria. A feature 004 deve substituir essa abordagem por consultas agregadas orientadas a dashboard.
- `DashboardFinanceiroDto` atual possui `TotalRecebido`, `TotalAReceber`, `TotalCompras`, `TotalDespesas`, `CaixaAtual`, `LucroReal`. A nova specification exige `ReceitaTotal`, `LucroTotal`, `TotalCompras`, `TotalDespesas`, `SaldoOperacional`, `ContasReceberAbertas`, `ValoresRecebidos` e avisos de dados incompletos.
- `ObterDashboardQueryHandler` ja calcula vendas e lucro usando `IVendaRepository` e `ICustoProdutoRepository`, mas deve ser revisado para sinalizar custo ausente e alinhar lucro a entradas reais, perdas e filtros.
- `ICompraRepository` ja expoe consultas de compras em transito e produtos pendentes, que podem ser reaproveitadas ou substituidas por agregacoes especificas para indicadores.
- `IEstoqueConsultaRepository` hoje obtem saldo por produto. Dashboards exigem saldos em lote, ranking e evolucao temporal; planeja-se consulta especifica para evitar N consultas por produto.
- `ICustoProdutoRepository` hoje retorna custo medio por produto. Rankings e lucro por periodo exigem estrategia em lote e aviso de custo ausente.
- `IContaReceberRepository`, `IDespesaRepository`, `IVendaRepository`, `ICompraRepository`, `IProdutoRepository`, `CompraItemRecebimentoRepository`, `CompraItemPerdaRepository` e `EstoqueMovimentacaoRepository` sao fontes historicas primarias para agregacoes.

## New Use Cases

- Obter resumo financeiro gerencial com filtros normalizados.
- Obter resumo operacional gerencial com filtros normalizados.
- Obter dashboard gerencial consolidado com secoes opcionais.
- Obter rankings de produtos por vendas, lucro, maior estoque e menor estoque.
- Obter alertas gerenciais ativos de estoque baixo, inatividade, transito antigo e perdas recorrentes.
- Obter series graficas de receita, lucro, compras, despesas por categoria e evolucao de estoque.
- Normalizar e validar filtros gerenciais por periodo customizado, mes e ano.
- Calcular avisos de dados incompletos, especialmente custo medio ausente para lucro.

## New DTOs Needed

- `DashboardFiltroDto`: entrada de consulta com `dataInicial`, `dataFinal`, `mes`, `ano`, `limiteRankings`, `tiposGraficos`, `tiposAlertas`.
- `DashboardFiltroAplicadoDto`: periodo efetivo, tipo de filtro aplicado, precedencia e data de referencia.
- `DashboardGerencialDto`: resposta consolidada com filtros, financeiro, operacional, rankings, alertas, graficos e avisos.
- `DashboardFinanceiroGerencialDto`: receita total, lucro total, total de compras, total de despesas, saldo operacional, contas a receber abertas, valores recebidos.
- `DashboardOperacionalDto`: produtos cadastrados, estoque disponivel total, mercadorias em transito, compras em aberto, produtos pendentes de recebimento, perdas registradas, quantidade de vendas, quantidade de compras.
- `IndicadorGerencialDto`: nome, valor, unidade, tipo monetario/quantitativo e observacoes.
- `RankingProdutoDto`: tipo, posicao, produto, quantidade, valor financeiro, criterio e aviso opcional.
- `AlertaGerencialDto`: tipo, severidade, entidade, motivo, valor atual, limite, data de referencia.
- `SerieGraficaDto` e `PontoGraficoDto`: serie, granularidade, unidade, pontos e total consolidado.
- `AvisoDadoIncompletoDto`: codigo, mensagem, entidade relacionada e impacto no calculo.

## Repositories and Queries

- Criar repositories de leitura gerencial por responsabilidade: financeiro, operacional, rankings, alertas e graficos.
- Reaproveitar repositories existentes quando a consulta for simples e ja estiver agregada corretamente.
- Evitar chamadas por item/produto em loops para custo medio e estoque; preferir consultas em lote para dashboards.
- Manter interfaces na Application e implementacoes em Infra.Data.
- Registrar novas interfaces no `DependencyInjection`.
- Manter handlers MediatR como orquestradores de regras, validacao de filtros e composicao das respostas.

## Endpoints Needed

- `GET /api/dashboard-gerencial`: resposta consolidada opcional com resumo financeiro, resumo operacional, rankings, alertas e graficos.
- `GET /api/dashboard-gerencial/financeiro`: resumo financeiro.
- `GET /api/dashboard-gerencial/operacional`: resumo operacional.
- `GET /api/dashboard-gerencial/rankings`: rankings por tipo e limite.
- `GET /api/dashboard-gerencial/alertas`: alertas ativos por tipo.
- `GET /api/dashboard-gerencial/graficos`: series graficas por tipo.

Todos os endpoints aceitam filtros equivalentes: `dataInicial`, `dataFinal`, `mes`, `ano`, `limiteRankings`, `tiposGraficos`, `tiposAlertas` conforme aplicavel. Periodo customizado prevalece sobre mes/ano.

## Metrics Strategy

### Financial Metrics

- Receita total: vendas confirmadas no periodo, com cancelamentos/estornos/devolucoes reduzindo o total conforme eventos existentes.
- Valores recebidos: pagamentos/baixas confirmados no periodo, independentemente da data original da venda.
- Contas a receber abertas: saldo pendente ate a data final do filtro.
- Total de compras: compras registradas e nao canceladas no periodo financeiro, mesmo em transito.
- Total de despesas: despesas nao canceladas no periodo.
- Saldo operacional: valores recebidos menos compras menos despesas.
- Lucro total: receita liquida menos custo dos produtos vendidos e perdas aplicaveis, com aviso quando houver custo medio ausente.

### Operational Metrics

- Produtos cadastrados: contagem de produtos conforme status elegivel definido no caso de uso.
- Estoque disponivel: entradas menos saidas por movimentacoes ate a data de referencia.
- Mercadorias em transito: quantidade comprada ainda nao resolvida por recebimento fisico ou perda.
- Compras em aberto: compras nao canceladas com pendencia operacional ou financeira relevante.
- Produtos pendentes: itens com quantidade pendente maior que zero.
- Perdas registradas: perdas/extravios/avarias no periodo, com quantidade e valor estimado.
- Quantidade de vendas/compras: contagem de eventos confirmados/no cancelados dentro do filtro.

### Rankings

- Produtos mais vendidos: quantidade vendida decrescente no periodo; desempate por valor vendido e nome/identificador.
- Produtos mais lucrativos: lucro total decrescente no periodo; produtos com custo ausente devem ser sinalizados.
- Maior estoque: estoque disponivel decrescente na data de referencia.
- Menor estoque: estoque disponivel crescente, apenas produtos elegiveis para venda/reposicao.
- Todos os rankings devem aceitar limite e retornar criterio de ordenacao.

### Alerts

- Estoque baixo: saldo disponivel menor ou igual ao limite minimo gerencial.
- Sem movimentacao: ausencia de eventos operacionais na janela definida.
- Compra em transito ha muito tempo: compra com pendencia acima do limite de dias.
- Perdas recorrentes: produto com ocorrencias de perda acima do limite na janela.
- Na ausencia de configuracao persistida de limites, usar parametros padrao definidos no caso de uso e documentados na resposta.

### Period Filters

- `dataInicial` + `dataFinal`: periodo customizado inclusivo.
- `mes` + `ano`: primeiro ao ultimo dia do mes.
- `ano`: ano inteiro.
- Sem filtro: mes corrente.
- Se periodo customizado e mes/ano forem enviados juntos, periodo customizado prevalece e a resposta informa a decisao.
- Indicadores de saldo ate data de referencia usam a data final efetiva; indicadores de eventos usam a janela completa.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/dashboard-gerencial-api.md](./contracts/dashboard-gerencial-api.md) and [quickstart.md](./quickstart.md).

## Dependency Order for Future Tasks

1. Definir DTOs de filtros, respostas, indicadores, rankings, alertas, graficos e avisos.
2. Criar normalizador/validador de filtros gerenciais.
3. Criar interfaces de consulta gerencial na Application.
4. Implementar consultas financeiras agregadas.
5. Implementar consultas operacionais agregadas.
6. Implementar rankings dependentes de vendas, lucro, custo medio e estoque.
7. Implementar alertas dependentes de estoque, movimentacoes, compras em transito e perdas.
8. Implementar graficos dependentes das mesmas formulas dos indicadores.
9. Criar handlers MediatR para cada caso de uso.
10. Criar controller e endpoints gerenciais.
11. Registrar repositories/handlers no IoC quando necessario.
12. Validar contratos com cenarios do quickstart.

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. O design separa controller, query handlers, repositories e DTOs.
- **Estoque por movimentacoes**: PASS. Todas as metricas de estoque dependem de movimentacoes historicas.
- **Compras e mercadorias em transito**: PASS. Compras registradas sao financeiras; pendencias operacionais consideram recebimentos e perdas.
- **Recebimentos, perdas e rastreabilidade**: PASS. Perdas e recebimentos permanecem historicos e nao sao sobrescritos.
- **Vendas, custo medio e inventario inicial**: PASS. Lucro e rankings lucrativos usam custo medio por entradas reais e avisos de custo ausente.
- **Contratos de API e DTOs**: PASS. Contratos documentados usam DTOs explicitos e respostas gerenciais.
- **Persistencia e mapeamentos**: PASS. Sem novas entidades persistidas obrigatorias; novas consultas seguem repositories.
- **Backend como fonte das regras**: PASS. Filtros, formulas e alertas ficam no backend.
- **Simplicidade antes de sofisticacao**: PASS. Nenhuma dependencia nova, cache externo ou motor analitico foi planejado.

## Complexity Tracking

No constitution violations.
