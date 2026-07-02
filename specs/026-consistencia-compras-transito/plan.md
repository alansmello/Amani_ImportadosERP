# Implementation Plan: Consistência de Compras em Trânsito e Limpeza do Dashboard Gerencial

**Branch**: `026-consistencia-compras-transito` | **Date**: 2026-07-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/026-consistencia-compras-transito/spec.md`

## Summary

Unificar o total oficial de compra como soma dos valores líquidos dos itens menos desconto geral mais acréscimo geral; aplicar os ajustes gerais proporcionalmente aos itens para valorizar somente a parcela ainda pendente; e reutilizar essa regra na listagem, no detalhe, nas compras em trânsito e nos indicadores gerenciais. O backend continuará como fonte dos cálculos, sem persistir totais derivados nem regravar histórico. O dashboard receberá valores separados de trânsito ao custo e ao preço de venda atual, incorporará esses valores às visões realista e potencial e deixará de buscar ou renderizar na home o resumo de alertas e os dois blocos de incompletude definidos como dívida técnica.

## Technical Context

**Language/Version**: C# 12 com .NET 8 no backend; TypeScript 5.7, React 19 e Next.js 15 no frontend

**Primary Dependencies**: ASP.NET Core, Entity Framework Core com Npgsql, MediatR, Repository Pattern; Next.js App Router, TanStack Query 5, Tailwind CSS 3, Lucide React e Design System local

**Storage**: PostgreSQL existente; nenhuma alteração de schema, migration ou regravação de dados históricos

**Testing**: `dotnet build Amani_ImportadosERP.sln`, `npm run lint`, `npm run typecheck`, `npm run build` e roteiro manual em [quickstart.md](quickstart.md); sem nova infraestrutura automatizada por decisão explícita do produto

**Target Platform**: API .NET e aplicação web responsiva em navegadores modernos, com validação em smartphone, tablet e desktop

**Project Type**: Aplicação web full stack em monorepo, com alterações coordenadas em Domain, Application, Infra.Data, contratos de API e frontend

**Performance Goals**: Consultas gerenciais devem filtrar e projetar no banco somente compras e itens relevantes à data de referência; nenhuma métrica pode carregar o histórico integral; a home não fará a chamada de alertas removida; com massa representativa do volume atual, ao menos 9 de 10 carregamentos repetidos de cada seção de compras e patrimônio devem concluir em até 2 segundos

**Constraints**: Backend como fonte oficial; total não persistido; trânsito separado do estoque; recebimentos e perdas preservados; custo médio inalterado; contratos evoluídos por adição; nenhum recálculo histórico destrutivo; nenhuma mudança funcional na F024 ou F025; Dark Theme e Mobile First

**Scale/Scope**: Uma política financeira de compra, quatro caminhos de leitura de compra, três contratos gerenciais compatíveis, dois grids da home e um adaptador da tela `/compras`; nenhuma nova entidade persistida

## Constitution Check

*GATE: aprovado antes da Phase 0 e reavaliado após o design da Phase 1.*

- **I. Arquitetura e separação**: PASS — a fórmula fica no Domain/Application; consultas agregadas ficam em repositório de leitura; controllers continuam apenas delegando.
- **II. Estoque por movimentações**: PASS — total e trânsito são leituras comerciais; nenhuma movimentação ou saldo fixo é criado.
- **III. Compras, recebimentos, vendas, custos e lucro**: PASS — compra continua em trânsito, recebimento físico continua como único evento de entrada e perdas continuam sem gerar estoque; custo médio não muda.
- **IV. Contratos de API e DTOs**: PASS — DTOs explícitos serão estendidos sem expor entidades e sem AutoMapper; campos existentes serão preservados quando houver consumidor conhecido.
- **V. Persistência, histórico e mapeamentos**: PASS — não há migration nem mutação de histórico; totais continuam derivados dos dados comerciais já persistidos.
- **VI. Backend como fonte das regras**: PASS — total, rateio, pendência e indicadores patrimoniais serão calculados no backend; o frontend apenas formata e apresenta.
- **VII. Analytics e escalabilidade**: PASS — um read repository especializado filtrará por data e projetará somente os campos necessários; recebimentos e perdas serão agregados antes da materialização; a consulta não carregará o histórico completo.
- **VIII. Mobile First**: PASS — cards e lista serão validados nos três breakpoints oficiais sem rolagem horizontal da página.
- **IX. Experiência operacional**: PASS — valores artificiais e blocos sem ação são removidos; os indicadores passam a informar custo, potencial e natureza do dado.
- **X. Priorização do produto**: PASS — a entrega corrige confiança operacional e gerencial sem abrir módulos novos.
- **XI. Identidade visual**: PASS — os cards existentes e tokens do Design System serão reutilizados no Dark Theme.
- **XII. Simplicidade**: PASS — não há dependência, tabela, cache ou infraestrutura nova; a solução usa cálculos puros e consultas especializadas existentes.

**Reavaliação pós-design**: PASS. As decisões de [research.md](research.md), o modelo lógico de [data-model.md](data-model.md), os [contratos](contracts/api-contracts.md) e o roteiro de [quickstart.md](quickstart.md) mantêm todos os gates sem exceção. A ausência de testes automatizados permanece uma decisão de produto registrada, compensada pelos builds e pelo roteiro manual obrigatório.

## Project Structure

### Documentation (this feature)

```text
specs/026-consistencia-compras-transito/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── api-contracts.md
├── checklists/
│   └── requirements.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── Amani.ImportadosERP.Domain/
│   ├── Entities/Compra.cs
│   ├── Entities/CompraItem.cs                         # referência de valor líquido, sem mudança prevista
│   └── Services/CompraCalculoFinanceiro.cs              # política pura de total, rateio e pendência
├── Amani.ImportadosERP.Application/
│   ├── DTOs/CompraEmTransitoDto.cs
│   ├── DTOs/Dashboards/{ResumoMercadoriasEmTransitoDto,DashboardFinanceiroGerencialDto,DashboardOperacionalDto}.cs
│   ├── Interfaces/IDashboardOperacionalRepository.cs
│   ├── Mappers/CompraMapper.cs
│   └── Queries/Handlers/{ObterListaComprasQueryHandler,ObterComprasEmTransitoQueryHandler,ObterDashboardFinanceiroGerencialQueryHandler,ObterDashboardOperacionalQueryHandler}.cs
├── Amani.ImportadosERP.Infra.Data/Repositories/
│   ├── DashboardFinanceiroRepository.cs
│   ├── DashboardGraficoRepository.cs
│   └── DashboardOperacionalRepository.cs
└── Amani.ImportadosERP.Api/Controllers/{ComprasController,DashboardGerencialController,DashboardFinanceiroController}.cs # verificação, sem regra nova

frontend/src/
├── app/compras/page.tsx
├── components/compras/purchase-list.tsx
├── components/dashboard/
│   ├── dashboard-home.tsx
│   ├── dashboard-kpi-grid.tsx
│   ├── dashboard-patrimonial-grid.tsx
│   ├── dashboard-alerts.tsx                           # remover da home e excluir se ficar sem consumidor
│   └── index.ts
├── hooks/use-dashboard.ts                               # referência preservada, sem remoção do hook de alertas
├── services/dashboard.ts                               # referência preservada, sem remoção do endpoint de alertas
└── types/{purchase,dashboard}.ts
```

**Structure Decision**: corrigir `Compra.Total()` e introduzir uma política pura de cálculo no domínio para as leituras materializadas. Os repositórios gerenciais manterão projeções agregadas, espelhando a mesma fórmula oficial sem persistir resultados derivados. O endpoint de trânsito será estendido com valores oficiais; os contratos gerenciais serão aditivos; a remoção de alertas será restrita à home, preservando endpoints e contratos legados.

## Complexity Tracking

Não há violações constitucionais ou complexidade adicional que exija justificativa.
