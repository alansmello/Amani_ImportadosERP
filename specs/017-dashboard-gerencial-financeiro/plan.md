# Implementation Plan: Dashboard Gerencial e Financeiro

**Branch**: `017-dashboard-gerencial-financeiro` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-dashboard-gerencial-financeiro/spec.md`

## Summary

Substituir o placeholder da home por um dashboard gerencial e financeiro real
no frontend. A tela deve consumir dados ja calculados pelos dashboards do
backend, aplicar filtros de periodo, exibir KPIs, rankings, alertas e series
graficas, e preservar Dark Theme, Mobile First e ausencia total de formulas de
metricas no cliente.

## Technical Context

**Language/Version**: Frontend TypeScript 5.7 com React 19 e Next.js 15.
Backend existente em .NET 8 apenas como fonte de contratos ja implementados.

**Primary Dependencies**: TanStack React Query, `apiClient`, componentes UI
locais, lucide-react e Design System existente. Nova dependencia proposta:
Recharts para graficos responsivos e declarativos, justificada em
[research.md](./research.md). Backend existente em .NET 8 pode receber extensao
pontual de contrato oficial para ranking de clientes se o endpoint atual nao
fornecer esses dados.

**Storage**: N/A para a feature de frontend. Persistencia e agregacoes continuam
no backend e no banco existente.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` no frontend;
`dotnet build Amani_ImportadosERP.sln` para garantir contratos backend
compilando; validacao manual orientada por [quickstart.md](./quickstart.md).

**Target Platform**: ERP web oficial da Amani em smartphone, tablet e desktop.

**Project Type**: Aplicacao web full stack em monorepo, com escopo
predominantemente frontend e possivel ajuste backend estritamente limitado ao
ranking oficial de clientes.

**Performance Goals**: Home carregada e legivel em ate 10 segundos com dados
disponiveis; troca de filtro aplicada em ate 30 segundos sem misturar periodos;
graficos e rankings limitados para manter leitura rapida.

**Constraints**: Todos os numeros, rankings, alertas e series vem do backend;
frontend pode formatar valores e datas, mas nao calcula metricas criticas;
Dark Theme obrigatorio; Mobile First; sem exportacao, sem drill-down avancado e
sem formulas alternativas no cliente.

**Scale/Scope**: Uma home gerencial com filtros de mes, ano e intervalo,
KPIs financeiros, rankings de produtos e clientes, alertas, graficos e estados
de dados insuficientes. Volume esperado de MVP: dezenas a centenas de vendas,
despesas, recebiveis e movimentacoes por mes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Controllers e regras backend nao
  serao alterados; frontend consumira services/hooks dedicados.
- **Estoque por movimentacoes**: PASS. Feature apenas exibe agregacoes; nao
  cria campo fixo de estoque nem movimentacao.
- **Compras e mercadorias em transito**: PASS. Feature nao altera compras ou
  recebimentos.
- **Recebimentos, perdas e rastreabilidade**: PASS. Feature apenas reflete
  alertas/indicadores existentes.
- **Vendas, custo medio e inventario inicial**: PASS. Lucro e custo medio
  exibidos devem vir do backend; sem recalculo no frontend.
- **Contratos de API e DTOs**: PASS. Frontend criara tipos explicitos alinhados
  aos DTOs existentes; se ranking de cliente faltar, backend adicionara DTO
  explicito sem expor entidades internas.
- **Persistencia e mapeamentos**: PASS. Sem mudanca de persistencia.
- **Backend como fonte das regras**: PASS. Plano proibe formulas, rankings,
  alertas e metricas no cliente.
- **Analytics e escalabilidade**: PASS. Dashboard consome consultas agregadas
  existentes e aplica filtros/limites no backend.
- **Mobile First**: PASS. Quickstart valida smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Home prioriza leitura rapida, filtros
  simples e estados claros.
- **Priorizacao do produto**: PASS. Usa dados operacionais/financeiros
  existentes sem antecipar exportacao ou drill-down.
- **Identidade visual**: PASS. Dark Theme e Design System existentes sao
  obrigatorios.
- **Simplicidade antes de sofisticacao**: PASS. Uma dependencia grafica leve e
  isolada sera adicionada apenas para evitar implementacao manual fragil.

## Project Structure

### Documentation (this feature)

```text
specs/017-dashboard-gerencial-financeiro/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- api-dashboard.md
|   `-- frontend-flows.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/src/
|-- app/
|   `-- page.tsx                         # substituir placeholder pela home real
|-- components/
|   `-- dashboard/
|       |-- dashboard-home.tsx            # composicao da home
|       |-- dashboard-period-filter.tsx   # mes/ano/intervalo
|       |-- dashboard-kpi-grid.tsx        # KPIs financeiros
|       |-- dashboard-ranking-list.tsx    # rankings retornados pelo backend
|       |-- dashboard-alerts.tsx          # alertas gerenciais
|       |-- dashboard-chart-section.tsx   # series graficas
|       |-- dashboard-section-state.tsx   # loading/error/empty por bloco
|       `-- dashboard-formatters.ts       # formatacao, sem formulas
|-- hooks/
|   `-- use-dashboard.ts                  # queries e chaves por filtro
|-- services/
|   `-- dashboard.ts                      # contratos dos endpoints de dashboard
|-- types/
|   `-- dashboard.ts                      # DTOs TypeScript espelhando backend
`-- lib/
    `-- query-client.ts                   # usar queryKeys.dashboard existente

src/Amani.ImportadosERP.Application/
|-- DTOs/Dashboards/
|   `-- RankingClienteDto.cs              # novo se contrato atual nao existir
|-- Interfaces/
|   `-- IDashboardRankingRepository.cs    # estender com ranking de clientes
`-- Queries/Handlers/
    `-- ObterDashboardRankingsQueryHandler.cs

src/Amani.ImportadosERP.Infra.Data/
`-- Repositories/
    `-- DashboardRankingRepository.cs     # agregar clientes no backend
```

**Structure Decision**: Implementacao frontend sobre a estrutura existente
service/hook/type/component. A home (`app/page.tsx`) apenas monta o container
de dashboard. Services encapsulam os endpoints, hooks cuidam de cache e estados,
e componentes de dashboard apresentam os dados sem calculos de negocio. O unico
ajuste backend previsto e completar o contrato oficial de ranking de clientes,
caso ausente, mantendo a agregacao no backend.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes foram resolvidas sem
marcadores pendentes.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API/UI contracts: [contracts/api-dashboard.md](./contracts/api-dashboard.md),
  [contracts/frontend-flows.md](./contracts/frontend-flows.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Services/hooks/componentes separam
  transporte, cache e apresentacao.
- **Estoque por movimentacoes**: PASS. Sem alteracao de estoque.
- **Compras e mercadorias em transito**: PASS. Sem alteracao de compras.
- **Recebimentos, perdas e rastreabilidade**: PASS. Painel so exibe dados
  historicos agregados.
- **Vendas, custo medio e inventario inicial**: PASS. Lucro e series usam dados
  retornados; sem custo medio no cliente.
- **Contratos de API e DTOs**: PASS. Contracts documentam filtros e payloads
  consumidos; tipos frontend devem espelhar DTOs; ranking de clientes requer
  DTO oficial se ainda ausente.
- **Persistencia e mapeamentos**: PASS. Sem persistencia nova.
- **Backend como fonte das regras**: PASS. Contracts e quickstart incluem
  verificacao de ausencia de formulas no cliente.
- **Analytics e escalabilidade**: PASS. Filtros e limite de rankings sao
  enviados ao backend; nao ha carregamento integral de historico.
- **Mobile First**: PASS. Quickstart cobre 360px, tablet e desktop.
- **Experiencia operacional**: PASS. Home usa layout escaneavel, filtros curtos
  e estados por bloco.
- **Priorizacao do produto**: PASS. Exportacao e drill-down permanecem fora.
- **Identidade visual**: PASS. Dark Theme e UI local preservados.
- **Simplicidade antes de sofisticacao**: PASS. Recharts e usado somente para
  renderizacao; dados e calculos continuam fora da biblioteca.

## Validation and Regression Scope

- Home substitui placeholder e preserva shell/navegacao.
- Periodo padrao exibe KPIs financeiros.
- Filtros mes, ano e intervalo refazem consultas filtraveis.
- Intervalo invalido e bloqueado antes da consulta.
- KPIs financeiros usam a fonte financeira filtravel definida em contrato.
- Rankings de produtos/clientes, alertas, dados operacionais e graficos usam a
  fonte gerencial.
- Nenhum componente calcula faturamento, lucro, despesas, recebiveis, rankings
  ou series.
- Estados loading, erro e vazio funcionam por bloco.
- Tela segue Dark Theme e nao tem sobreposicao em mobile/tablet/desktop.
- `npm run lint`, `npm run typecheck`, `npm run build` e `dotnet build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- adicionar `recharts` ao frontend e registrar justificativa no PR/commit;
- criar `types/dashboard.ts` espelhando DTOs de dashboard;
- criar `services/dashboard.ts` com queries de periodo e limite de rankings;
- criar `hooks/use-dashboard.ts` com query keys estaveis por filtro;
- substituir `app/page.tsx` pelo container real do dashboard;
- criar componentes de filtro de periodo, KPI grid, rankings, alertas,
  graficos e estados por secao;
- garantir que formatters apenas formatam valores, sem formulas de negocio;
- tratar a ausencia atual de ranking de cliente como gap de contrato oficial;
- adicionar suporte backend oficial para ranking de clientes se o contrato
  existente nao fornecer esses dados;
- nunca sintetizar ranking de cliente no frontend;
- validar que filtros nao misturam respostas de periodos diferentes;
- executar os comandos de validacao do quickstart.

## Complexity Tracking

No constitution violations.
