# Implementation Plan: Consistência de Pagamentos e Taxas de Operadora

**Branch**: `020-consistencia-pagamentos-taxas` | **Date**: 2026-06-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/020-consistencia-pagamentos-taxas/spec.md`

## Summary

Unificar o pagamento de contas a receber para que o detalhe por cliente carregue o mesmo contexto de forma de pagamento já disponível na lista geral. Para Cartão de Crédito, o backend passará a exigir liquidação integral do saldo bruto, desconto zero e percentual efetivo derivado da diferença entre bruto e líquido; pagamento e despesa permanecem transacionais. A configuração de taxas será restringida ao Cartão de Débito, com normalização dos percentuais legados das demais formas por migration somente de dados. A consulta de despesas de operadora passará a retornar resumo consolidado de taxas no backend, mantendo consistência com os filtros aplicados na listagem. O frontend continuará usando um único modal, removerá os campos legados de percentual/bruto do fluxo simples, exibirá somente Débito como configuração editável e mostrará o total consolidado de taxas sem cálculo manual no cliente.

## Technical Context

**Language/Version**: C# / .NET 8 no backend; TypeScript 5.7, React 19 e Next.js 15 no frontend

**Primary Dependencies**: ASP.NET Core, MediatR, Entity Framework Core com Npgsql; TanStack Query 5, Radix Dialog, componentes UI locais e Tailwind CSS

**Storage**: PostgreSQL via EF Core; uma migration somente de dados normaliza `PercentualTaxa` para zero nas formas diferentes de `CartaoDebito`; nenhuma coluna ou tabela nova

**Testing**: `dotnet build Amani_ImportadosERP.sln`; `npm run lint`, `npm run typecheck` e `npm run build` em `frontend/`; validação manual orientada por `quickstart.md`; sem nova infraestrutura automatizada por decisão registrada no roadmap

**Target Platform**: ERP web autenticado, operável em smartphone, tablet e desktop

**Project Type**: Aplicação web full stack em monorepo, com backend Clean Architecture em `src/` e frontend Next.js em `frontend/`

**Performance Goals**: pagamento refletido nas consultas relacionadas em até 2 segundos após confirmação em ambiente local; atualização de taxa de Débito concluída em até 30 segundos pelo usuário; recebimento de Crédito concluído em até 60 segundos; total consolidado de taxas visível em até 10 segundos após aplicação do filtro

**Constraints**: backend é a fonte da consistência financeira; Crédito aceita somente liquidação integral; somente Débito possui taxa configurável; históricos financeiros não podem ser reescritos; sem nova dependência e sem novo framework de testes

**Scale/Scope**: alteração localizada em contratos financeiros existentes, handlers de pagamento e configuração, uma migration de dados, consulta agregada de despesas de operadora e componentes/tipos/hooks frontend relacionados; volume operacional atual de ERP de pequeno negócio com agregação por filtro em leitura operacional

## Constitution Check

*GATE: aprovado antes da pesquisa e reavaliado após o design.*

- **Arquitetura e responsabilidades**: PASS — controllers continuam apenas traduzindo contratos; liquidação, taxa e despesa ficam em Application/Domain.
- **Estoque por movimentações**: PASS — nenhuma entidade, saldo ou movimentação de estoque é alterada.
- **Compras e mercadorias em trânsito**: PASS — fluxo de Compra não é afetado.
- **Recebimentos, perdas e rastreabilidade**: PASS — recebimentos físicos e perdas de Compra não são afetados; histórico financeiro é preservado.
- **Vendas, custo médio e inventário inicial**: PASS — criação da Venda, saída de estoque, custo médio e inventário não mudam; apenas o recebimento financeiro posterior de Crédito é refinado.
- **Contratos de API e DTOs**: PASS — DTOs explícitos serão estendidos/reduzidos deliberadamente; entidades não serão expostas e não haverá AutoMapper.
- **Persistência e mapeamentos**: PASS — Repository Pattern e transação existente são preservados; migration altera somente dados de configuração e não reescreve histórico.
- **Backend como fonte das regras**: PASS — saldo integral, elegibilidade da taxa, despesa e percentual efetivo são validados/calculados no backend; frontend apresenta somente prévia.
- **Analytics e escalabilidade**: PASS — a tela de despesas passa a usar agregação de taxa no backend para o mesmo filtro da listagem, sem transferir cálculo consolidado crítico para o frontend.
- **Mobile First**: PASS — modal e configuração serão validados em smartphone, tablet e desktop.
- **Experiência operacional**: PASS — Crédito terá um único campo financeiro editável e comportamento idêntico nos dois acessos.
- **Priorização do produto**: PASS — corrige fluxo financeiro operacional antes de novos recursos.
- **Identidade visual**: PASS — componentes e Dark Theme existentes serão reutilizados.
- **Simplicidade antes de sofisticação**: PASS — um modal, contratos existentes, nenhuma entidade e nenhuma dependência nova.

**Reavaliação pós-design**: PASS. `research.md`, `data-model.md`, contratos e `quickstart.md` mantêm todos os gates; não foi identificada violação que exija exceção.

## Project Structure

### Documentation (this feature)

```text
specs/020-consistencia-pagamentos-taxas/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── contas-receber.md
│   ├── configuracoes-formas-pagamento.md
│   └── despesas-operadora.md
└── checklists/
    └── requirements.md
```

`tasks.md` será criado posteriormente por `/speckit-tasks` e não faz parte deste comando.

### Source Code (repository root)

```text
src/
├── Amani.ImportadosERP.Domain/
│   └── Entities/
│       └── ConfiguracaoFormaPagamento.cs
├── Amani.ImportadosERP.Application/
│   ├── Commands/
│   │   ├── RegistrarPagamentoCommand.cs
│   │   └── Handlers/
│   │       ├── RegistrarPagamentoCommandHandler.cs
│   │       └── AtualizarConfiguracaoFormaPagamentoCommandHandler.cs
│   ├── Services/
│   │   └── VendaService.cs
│   ├── Queries/
│   │   ├── ObterDespesasOperadoraQuery.cs
│   │   └── Handlers/
│   │       └── ObterDespesasOperadoraQueryHandler.cs
│   └── DTOs/
│       ├── RegistrarPagamentoDto.cs
│       ├── ContaReceberDetalheDto.cs
│       └── DespesaOperadoraListDto.cs
├── Amani.ImportadosERP.Infra.Data/
│   ├── Repositories/
│   │   ├── ContaReceberRepository.cs
│   │   └── DespesaOperadoraRepository.cs
│   └── Migrations/
│       ├── 20260626223710_NormalizeNonDebitPaymentFees.cs
│       └── 20260626223710_NormalizeNonDebitPaymentFees.Designer.cs
└── Amani.ImportadosERP.Api/
    └── Controllers/
        ├── ContasReceberController.cs
        ├── ConfiguracoesFormasPagamentoController.cs
        └── DespesasOperadoraController.cs

frontend/src/
├── components/
│   ├── financeiro/
│   │   ├── receivable-payment-modal.tsx
│   │   ├── receivable-client-detail.tsx
│   │   ├── receivables-list.tsx
│   │   └── operator-expenses-list.tsx
│   ├── configuracoes/payment-fees-form.tsx
│   └── vendas/sale-payment-modal.tsx
├── hooks/
│   ├── use-receivables.ts
│   ├── use-payment-settings.ts
│   └── use-operator-expenses.ts
├── services/
│   ├── receivables.ts
│   ├── payment-settings.ts
│   └── operator-expenses.ts
└── types/
    ├── receivable.ts
    ├── payment-settings.ts
    └── operator-expense.ts
```

**Structure Decision**: preservar a aplicação web full stack existente. A mudança atravessa Domain, Application, Infra.Data, API e Frontend somente onde necessário; não haverá projeto, camada ou dependência adicional.

## Complexity Tracking

Nenhuma violação constitucional identificada. Não há exceção de complexidade a justificar.
