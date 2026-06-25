# Implementation Plan: Financeiro: Despesas + Categorias de Despesa

**Branch**: `016-financeiro-despesas-categorias` | **Date**: 2026-06-23 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-financeiro-despesas-categorias/spec.md`

## Summary

Preencher o gap financeiro de despesas operacionais criando gestao de categorias
de despesa, lancamento de despesas por categoria e forma de pagamento, consulta
filtrada por competencia/categoria e integracao com visoes financeiras. O
backend ja possui entidade e fluxo parcial de `Despesa`, mas precisa completar
`CategoriaDespesa`, status ativo/inativo, forma de pagamento obrigatoria e
contratos de leitura mais ricos. O frontend deve substituir o placeholder
financeiro por uma experiencia mobile-first para categorias e despesas.

## Technical Context

**Language/Version**: Backend .NET 8 / C# com ASP.NET Core, EF Core e Npgsql;
frontend TypeScript 5.7 com React 19 e Next.js 15.

**Primary Dependencies**: MediatR, Entity Framework Core, Fluent API,
Repository Pattern, TanStack React Query, `apiClient`, componentes UI locais e
lucide-react. Nenhuma dependencia nova planejada.

**Storage**: PostgreSQL via EF Core. A feature pode exigir migration para
adicionar status ativo em categoria de despesa, descricao de categoria se ainda
nao existir, forma de pagamento em despesa e ajustes de constraint/indice.

**Testing**: Backend com `dotnet build Amani_ImportadosERP.sln` e testes
existentes quando disponiveis; frontend com `npm run lint`, `npm run typecheck`
e `npm run build`; validacao manual orientada por [quickstart.md](./quickstart.md).

**Target Platform**: ERP web oficial da Amani, operavel em smartphone, tablet e
desktop, com API ASP.NET Core e frontend Next.js.

**Project Type**: Aplicacao web full stack em repositorio unico: backend em
`src/` e frontend em `frontend/`.

**Performance Goals**: Criar categoria e lancar despesa em ate 2 minutos;
localizar despesas por mes/categoria em ate 30 segundos; consultas de despesas
devem aplicar filtros no backend e evitar carregamento integral do historico.

**Constraints**: Backend e fonte das regras; frontend nao calcula totais
financeiros criticos; categorias inativas preservam historico e nao aparecem em
novos lancamentos; despesas exigem forma de pagamento entre Dinheiro, PIX,
CartaoDebito e CartaoCredito; sem edicao/exclusao de despesa, rateio, centro de
custo, recorrencia ou despesa fiado nesta feature; Dark Theme e Mobile First.

**Scale/Scope**: Uma feature operacional com CRUD parcial de categoria de
despesa, criacao/listagem filtrada de despesas, nova area financeira no
frontend e integracao com dashboards/visoes financeiras existentes. Volume
esperado de MVP: dezenas a centenas de despesas por mes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Controllers recebem contratos e
  delegam para Application; regras de validacao ficam em Application/Domain.
- **Estoque por movimentacoes**: PASS. Feature nao altera estoque nem introduz
  saldo fixo.
- **Compras e mercadorias em transito**: PASS. Feature nao altera compras ou
  recebimentos.
- **Recebimentos, perdas e rastreabilidade**: PASS. Despesas sao historicas;
  categorias inativas preservam registros antigos.
- **Vendas, custo medio e inventario inicial**: PASS. Feature nao altera vendas,
  custo medio ou inventario inicial.
- **Contratos de API e DTOs**: PASS. Contratos serao DTOs explicitos; entidades
  internas nao serao expostas.
- **Persistencia e mapeamentos**: PASS. Novos campos/constraints exigem Fluent
  API e migration quando necessario; repositories mediam acesso.
- **Backend como fonte das regras**: PASS. Validacao de categoria ativa, forma de
  pagamento e filtros financeiros fica no backend.
- **Analytics e escalabilidade**: PASS. Listagem e visoes financeiras usam
  filtros no backend; dashboards consomem agregacoes existentes/ajustadas.
- **Mobile First**: PASS. Quickstart cobre smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos focam cadastro rapido e consulta por
  periodo/categoria.
- **Priorizacao do produto**: PASS. Entrega controle financeiro operacional
  antes de rateio, recorrencia ou contas a pagar.
- **Identidade visual**: PASS. Frontend segue Design System e Dark Theme
  existentes.
- **Simplicidade antes de sofisticacao**: PASS. Sem novas dependencias; escopo
  evita centros de custo, recorrencia e edicao/exclusao de despesa.

## Project Structure

### Documentation (this feature)

```text
specs/016-financeiro-despesas-categorias/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- api-categorias-despesa.md
|   |-- api-despesas.md
|   `-- frontend-flows.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
src/Amani.ImportadosERP.Domain/
|-- Entities/
|   |-- CategoriaDespesa.cs       # adicionar descricao/status ativo
|   `-- Despesa.cs                # adicionar forma de pagamento; reforcar valor > 0
`-- Enums/
    `-- FormaPagamento.cs         # reutilizar ou estender enum existente para despesas

src/Amani.ImportadosERP.Application/
|-- Commands/
|   |-- CriarDespesaCommand.cs
|   |-- CriarCategoriaDespesaCommand.cs       # novo
|   |-- AtualizarCategoriaDespesaCommand.cs   # novo
|   `-- InativarCategoriaDespesaCommand.cs    # novo
|-- Commands/Handlers/
|-- DTOs/
|   |-- CriarDespesaDto.cs
|   |-- DespesaListDto.cs
|   |-- CategoriaDespesaDto.cs                # novo
|   |-- CriarCategoriaDespesaDto.cs           # novo
|   `-- AtualizarCategoriaDespesaDto.cs       # novo
|-- Interfaces/
|   |-- IDespesaRepository.cs
|   `-- ICategoriaDespesaRepository.cs        # novo
|-- Queries/
|   |-- ObterListaDespesasQuery.cs
|   |-- ObterCategoriasDespesaQuery.cs        # novo
|   `-- ObterCategoriaDespesaPorIdQuery.cs    # novo
`-- Queries/Handlers/

src/Amani.ImportadosERP.Api/Controllers/
|-- DespesasController.cs
`-- CategoriasDespesaController.cs            # novo

src/Amani.ImportadosERP.Infra.Data/
|-- EntityConfigurations/
|   |-- CategoriaDespesaMapping.cs
|   `-- DespesaMapping.cs
|-- Repositories/
|   |-- DespesaRepository.cs
|   `-- CategoriaDespesaRepository.cs         # novo
`-- Migrations/
    `-- *DespesasCategorias*

frontend/src/
|-- app/
|   `-- financeiro/
|       |-- page.tsx                          # hub financeiro
|       `-- despesas/
|           |-- page.tsx                      # lista/filtros
|           |-- nova/page.tsx                 # criar despesa
|           `-- categorias/page.tsx           # gerir categorias
|-- components/financeiro/
|   |-- expenses-list.tsx                     # novo
|   |-- expense-form.tsx                      # novo
|   |-- expense-filters.tsx                   # novo
|   `-- expense-categories-manager.tsx        # novo
|-- hooks/
|   |-- use-expenses.ts                       # novo
|   `-- use-expense-categories.ts             # novo
|-- services/
|   |-- expenses.ts                           # novo/estender
|   `-- expense-categories.ts                 # novo
|-- types/
|   |-- expense.ts                            # novo
|   `-- expense-category.ts                   # novo
`-- config/routes.ts                          # novas rotas/navegacao
```

**Structure Decision**: Full stack dentro da estrutura existente. Backend segue
Clean Architecture, com regras em Domain/Application, persistencia em Infra.Data
e controllers finos. Frontend segue padrao service/hook/type/component das
features financeiras F014/F015. A rota `/financeiro` atua como hub de acesso
para contas a receber, despesas operacionais e taxas de operadora; a feature de
despesas tambem fica exposta diretamente na navegacao desktop como "Despesas".

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes foram resolvidas sem
marcadores pendentes.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- API contracts: [contracts/api-categorias-despesa.md](./contracts/api-categorias-despesa.md),
  [contracts/api-despesas.md](./contracts/api-despesas.md)
- Frontend flow contract: [contracts/frontend-flows.md](./contracts/frontend-flows.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Contratos separam DTOs, commands,
  queries, repositories e controllers.
- **Estoque por movimentacoes**: PASS. Sem impacto em estoque.
- **Compras e mercadorias em transito**: PASS. Sem impacto em compras.
- **Recebimentos, perdas e rastreabilidade**: PASS. Data model preserva
  historico de despesas e categorias inativas.
- **Vendas, custo medio e inventario inicial**: PASS. Sem impacto em vendas ou
  custo medio.
- **Contratos de API e DTOs**: PASS. Contracts definem payloads explicitos.
- **Persistencia e mapeamentos**: PASS. Data model identifica mappings,
  constraints e migration provavel.
- **Backend como fonte das regras**: PASS. Validacoes de categoria ativa, valor,
  forma de pagamento e filtros sao de backend.
- **Analytics e escalabilidade**: PASS. Contracts exigem filtros de periodo e
  categoria no backend e dados suficientes para visoes financeiras.
- **Mobile First**: PASS. Frontend contract e quickstart cobrem smartphone,
  tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos priorizam cadastro rapido e
  filtros simples.
- **Priorizacao do produto**: PASS. Itens fora de escopo permanecem fora.
- **Identidade visual**: PASS. Frontend contract exige Design System e Dark
  Theme existentes.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencias novas e sem
  antecipar contas a pagar, centros de custo ou recorrencia.

## Validation and Regression Scope

- Criar categoria ativa.
- Rejeitar categoria sem nome e duplicidade operacional.
- Editar nome/descricao de categoria.
- Inativar categoria e preservar despesas historicas.
- Impedir nova despesa com categoria inativa.
- Criar despesa com data de competencia, categoria ativa, forma de pagamento e
  valor positivo.
- Rejeitar despesa sem categoria, sem forma de pagamento, com forma invalida ou
  valor nao positivo.
- Listar despesas por periodo e categoria.
- Ver despesa operacional em totais financeiros do periodo.
- Garantir que despesas de operadora seguem separadas.
- Validar responsividade e Dark Theme.
- Executar `dotnet build`, `npm run lint`, `npm run typecheck` e `npm run build`.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- estender `CategoriaDespesa` com descricao e status ativo;
- adicionar comandos/queries/DTOs/repository/controller de categorias de despesa;
- garantir unicidade operacional de nome de categoria;
- implementar inativacao de categoria sem exclusao historica;
- estender `Despesa` com forma de pagamento e validacao `Valor > 0`;
- estender `CriarDespesaCommand`, DTOs, handler e mapping;
- validar categoria ativa antes de criar despesa;
- estender listagem de despesas para retornar nome/status da categoria e forma
  de pagamento;
- criar migration quando os campos/constraints nao existirem;
- atualizar `Infra.IoC` com novos repositories/services;
- criar services/hooks/types de frontend para despesas e categorias;
- criar rotas `/financeiro/despesas`, `/financeiro/despesas/nova` e
  `/financeiro/despesas/categorias`;
- atualizar navegacao/rotas do frontend;
- validar dashboard/visoes financeiras com despesas operacionais;
- executar validacoes do quickstart e comandos de build.

## Complexity Tracking

No constitution violations.
