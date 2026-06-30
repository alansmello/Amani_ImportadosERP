# Implementation Plan: Revisão do Dashboard Gerencial

**Branch**: `023-revisao-dashboard-gerencial` | **Date**: 2026-06-30 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/023-revisao-dashboard-gerencial/spec.md`

## Summary

Expandir de forma aditiva o Dashboard Gerencial para separar faturamento, entradas, saídas estimadas, ajuste de implantação e caixa; detalhar recebíveis; valorizar estoque disponível; e apresentar o valor realista e potencial da operação. O backend continuará como fonte exclusiva das métricas, usando projeções e agregações no PostgreSQL em vez de materializar históricos completos. O contrato financeiro será estendido com campos opcionais para rollout compatível e acompanhado de índices orientados às consultas. O frontend reutilizará filtros, queries independentes e Design System existentes para reorganizar KPIs, resumir alertas, ocultar rankings de estoque e tratar campos novos ausentes como “Indisponível”.

## Technical Context

**Language/Version**: C# 12 / .NET 8 no backend; TypeScript 5.7, React 19 e Next.js 15 no frontend

**Primary Dependencies**: MediatR 12.1, Entity Framework Core 8.0, Npgsql 8.0 e PostgreSQL; TanStack Query 5, Recharts 3, Tailwind CSS 3 e componentes locais do Design System; nenhuma dependência nova de testes

**Storage**: PostgreSQL existente; nenhuma nova entidade de domínio, mas uma migration aditiva para índices das consultas gerenciais

**Validation**: `dotnet build`, `npm run lint`, `npm run typecheck`, `npm run build` e roteiro manual detalhado para cálculos, contratos, falhas parciais, desempenho e responsividade. A F023 não cria projeto, framework, dependência ou infraestrutura de testes unitários ou de integração.

**Target Platform**: API .NET executada em Linux/container com PostgreSQL; aplicação web responsiva em navegadores modernos de smartphone, tablet e desktop

**Project Type**: Aplicação web full stack em monorepo, com backend Clean Architecture e frontend Next.js App Router

**Performance Goals**: Pelo menos 95% das consultas de cada seção visível em até 3 segundos para até 100 mil registros em cada histórico principal; consultas financeiras e patrimoniais agregadas no banco, retornando apenas projeções consolidadas

**Constraints**: Regras e fórmulas somente no backend; estoque exclusivamente por movimentações; mercadoria em trânsito fora do estoque disponível; sem fallback para `Produto.Custo`; despesas de operadora fora das saídas; contratos existentes preservados; seções com falha isoladas; Dark Theme e Mobile First; nenhuma leitura integral de históricos para calcular métricas

**Scale/Scope**: 6 históricos principais com até 100 mil registros cada; extensão de 2 contratos de resposta, 1 handler financeiro, 1 handler de alertas, repositories especializados de leitura, mapeamentos/índices, IoC, tipos/hooks e aproximadamente 6 componentes do Dashboard

## Constitution Check

*GATE: aprovado antes da Phase 0 e reavaliado após o design da Phase 1.*

- **I. Arquitetura e separação de responsabilidades**: PASS — controllers permanecem finos; handlers coordenam casos de uso; repositories de leitura executam consultas; regras não migram para a interface.
- **II. Estoque por movimentações**: PASS — saldo e valorização partem apenas de `EstoqueMovimentacao`; nenhum campo fixo de saldo é criado.
- **III. Compras, recebimentos, vendas, custos e lucro**: PASS — compras em trânsito não entram no estoque; apenas entradas reais e inventário inicial formam custo médio; saídas de venda reduzem saldo.
- **IV. Contratos e DTOs**: PASS — respostas são DTOs aditivos, com mapeamento explícito e sem exposição de entidades ou AutoMapper.
- **V. Persistência, histórico e mapeamentos**: PASS — nenhuma operação histórica é alterada ou removida; índices são configurados por Fluent API e migration aditiva.
- **VI. Backend como fonte das regras**: PASS — caixa, recebíveis, estoque, valor da operação e resumo de alertas são calculados no backend.
- **VII. Analytics e escalabilidade**: PASS — agregações e projeções permanecem no PostgreSQL; o plano remove materialização de históricos completos e adiciona índices orientados aos filtros.
- **VIII. Mobile First**: PASS — KPIs e resumos serão validados em 390 px, 768 px e 1440 px sem rolagem horizontal da página.
- **IX. Experiência operacional**: PASS — rótulos distinguem competência, caixa, estimativa, snapshot e potencial; ausência transitória usa “Indisponível”.
- **X. Priorização do produto**: PASS — a feature melhora controle financeiro e patrimonial de operações já produtivas, sem abrir módulo avançado paralelo.
- **XI. Identidade visual**: PASS — componentes e tokens existentes do Dark Theme serão reutilizados.
- **XII. Simplicidade antes de sofisticação**: PASS — não há reescrita, endpoint novo desnecessário, cache distribuído ou infraestrutura analítica externa.

**Reavaliação pós-design**: PASS. `research.md`, `data-model.md`, os contratos e `quickstart.md` mantêm todos os gates. A ausência deliberada de infraestrutura automatizada não transfere regras ao frontend nem dispensa build, análise estática e validação manual completa.

## Project Structure

### Documentation (this feature)

```text
specs/023-revisao-dashboard-gerencial/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── dashboard-gerencial.openapi.yaml
└── checklists/
    └── requirements.md
```

### Source Code (repository root)

```text
src/
├── Amani.ImportadosERP.Domain/
│   └── Entities/                         # entidades existentes, sem novo saldo fixo
├── Amani.ImportadosERP.Application/
│   ├── DTOs/Dashboards/                  # contratos financeiros, estoque e resumo de alertas
│   ├── Interfaces/                       # repositories especializados de leitura
│   └── Queries/Handlers/                 # orquestração e fórmulas consolidadas
├── Amani.ImportadosERP.Infra.Data/
│   ├── EntityConfigurations/             # índices por data/status/produto
│   ├── Repositories/                     # consultas agregadas e serviço de custo médio compartilhado
│   └── Migrations/                       # migration aditiva de índices
├── Amani.ImportadosERP.Infra.IoC/
│   └── DependencyInjection.cs
└── Amani.ImportadosERP.Api/
    └── Controllers/DashboardGerencialController.cs

frontend/src/
├── types/dashboard.ts
├── services/dashboard.ts
├── hooks/use-dashboard.ts
└── components/dashboard/
    ├── dashboard-home.tsx
    ├── dashboard-kpi-grid.tsx
    ├── dashboard-alerts.tsx
    ├── dashboard-ranking-list.tsx
    ├── dashboard-chart-section.tsx
    └── dashboard-section-state.tsx

```

**Structure Decision**: manter a Clean Architecture existente e estender os pontos de leitura do Dashboard. A lógica reutilizável de custo médio fica na infraestrutura de leitura, consumida por repositories; handlers recebem somente projeções/DTOs e compõem os indicadores. Nenhum projeto de testes será adicionado.

## Implementation Strategy

1. Estender DTOs e contrato HTTP com campos opcionais, mantendo `ReceitaTotal`, `ValoresRecebidos`, `SaldoOperacional` e demais propriedades atuais.
2. Extrair a leitura compartilhada de custo médio e implementar projeções agregadas para financeiro, recebíveis, caixa e estoque valorizado.
3. Adicionar os índices necessários via Fluent API/migration e revisar tradução e planos de execução no PostgreSQL.
4. Atualizar handlers, endpoint consolidado e resumo de alertas, preservando fórmulas e campos de compatibilidade.
5. Atualizar tipos e componentes do frontend, mantendo queries independentes, tratamento de filtro stale e fallback “Indisponível”.
6. Executar build, lint, typecheck e roteiro manual de cálculos, contratos, falhas parciais, desempenho e Mobile First antes do rollout.
