# Implementation Plan: Configurações e Categorias (Refinamento, Frontend)

**Branch**: `019-configuracoes-categorias-frontend` | **Date**: 2026-06-25 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-configuracoes-categorias-frontend/spec.md`

## Summary

Converter a página `/configuracoes` de um layout de cards com links para sub-páginas em um layout com
quatro abas horizontais: Categorias de Produto, Categorias de Despesa, Taxas de Operadora e Implantação.
Todo o conteúdo passa a ser gerenciado inline, sem navegação para sub-rotas, exceto os atalhos de
implantação que continuam redirecionando para as telas F010 existentes.

Dois gaps de backend precisam ser preenchidos antes do frontend: `DELETE /api/categorias/{id}` (remoção
de categoria de produto) e `POST /api/categorias-despesa/{id}/reativar` (reativação de categoria de
despesa). Nenhuma migration é necessária — as entidades existem e apenas faltam ação de domínio e
endpoints.

## Technical Context

**Language/Version**: TypeScript 5.7 / React 19 / Next.js 15 (frontend); C# .NET 8 / ASP.NET Core
(backend, pequenas adições)

**Primary Dependencies**: TanStack React Query 5, `apiClient`, componentes UI locais, Tailwind CSS,
MediatR (backend), EF Core (backend). Nenhuma dependência nova de UI — tabs implementadas com
`useState` + Tailwind (zero dependência externa).

**Storage**: PostgreSQL via EF Core. **Sem migration** — nenhuma entidade ou coluna nova; apenas
endpoints e métodos de serviço adicionados.

**Testing**: Frontend: `npm run lint`, `npm run typecheck`, `npm run build` em `frontend/`. Backend:
`dotnet build Amani_ImportadosERP.sln`. Validação manual orientada por [quickstart.md](./quickstart.md).

**Target Platform**: ERP web oficial da Amani, operável em smartphone, tablet e desktop, com API
ASP.NET Core e frontend Next.js.

**Project Type**: Aplicação web full stack em repositório único: backend em `src/` e frontend em
`frontend/`.

**Performance Goals**: CRUD de categoria de produto em menos de 1 minuto; atualização de taxa de
operadora em menos de 1 minuto; toggle de status de categoria de despesa em menos de 30 segundos.

**Constraints**: Backend é fonte de todas as regras e validações; frontend não calcula nenhuma métrica
financeira; sem field de estoque ou custo médio envolvidos; Dark Theme obrigatório; Mobile First;
sem nova dependência de UI ou de biblioteca de componentes.

**Scale/Scope**: Feature de refinamento com escopo pequeno: ~8 arquivos frontend modificados ou
criados, ~8 arquivos backend modificados ou criados, zero migrations.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS — controllers apenas recebem, delegam para Application e retornam; `CategoriaService` e handlers MediatR contêm a lógica; frontend sem regra de negócio.
- **Estoque por movimentações**: PASS — feature não toca entidade Produto, estoque, movimentações nem saldo.
- **Compras e mercadorias em trânsito**: PASS — não afetado por esta feature.
- **Recebimentos, perdas e rastreabilidade**: PASS — não afetado por esta feature.
- **Vendas, custo médio e inventário inicial**: PASS — categorias de produto não são entidades de movimentação; não há cálculo de custo.
- **Contratos de API e DTOs**: PASS — DTOs explícitos para cada operação (`CriarCategoriaDto`, `AtualizarCategoriaDto`, novos `ReativarCategoriaDespesaCommand`); sem AutoMapper; payloads de frontend mapeados explicitamente nos serviços.
- **Persistência e mapeamentos**: PASS — Fluent API existente preservada; `ICategoriaRepository` estendido com `RemoverAsync`; `ICategoriaDespesaRepository` estendido com `ReativarAsync`; sem migration.
- **Backend como fonte das regras**: PASS — validação de nome duplicado, bloqueio de remoção com vínculos e controle de status ocorrem no backend; frontend exibe os erros retornados.
- **Analytics e escalabilidade**: PASS — feature não gera dashboards nem consultas analíticas; listas de configurações são de baixo volume por natureza.
- **Mobile First**: PASS — tabs com layout responsivo; em mobile os labels das abas colapsam para ícone+texto curto; listas e formulários empilham verticalmente.
- **Experiência operacional**: PASS — tabs eliminam salto entre sub-páginas; CRUD de categoria inline com confirmação rápida; menos cliques que o fluxo atual.
- **Priorização do produto**: PASS — feature é Fase 3 (refinamento); fluxos operacionais essenciais (compras, vendas, estoque, financeiro) não são afetados.
- **Identidade visual**: PASS — Dark Theme; Design System local (cards, badges, inputs, buttons); sem nova dependência visual externa.
- **Simplicidade antes de sofisticação**: PASS — tabs com `useState` puro (zero nova dependência); componente `ProductCategoriesManager` segue exatamente o padrão de `ExpenseCategoriesManager` já existente.

## Project Structure

### Documentation (this feature)

```text
specs/019-configuracoes-categorias-frontend/
├── plan.md              ← este arquivo
├── research.md          ← Phase 0 (gaps de backend, decisões de implementação)
├── data-model.md        ← Phase 1 (entidades e tipos de frontend)
├── quickstart.md        ← Phase 1 (cenários de validação)
└── contracts/
    └── configuracoes-frontend.md  ← Phase 1 (endpoints consumidos)
```

### Source Code

```text
Backend (adições mínimas — sem migration):
src/Amani.ImportadosERP.Domain/
└── Entities/
    └── CategoriaDespesa.cs               ← +Reativar() método de domínio

src/Amani.ImportadosERP.Application/
├── Interfaces/
│   ├── ICategoriaRepository.cs           ← +RemoverAsync(Guid id)
│   └── ICategoriaDespesaRepository.cs    ← +ReativarAsync(Guid id)
├── Services/
│   └── CategoriaService.cs               ← +RemoverAsync(Guid id)
└── Commands/
    ├── ReativarCategoriaDespesaCommand.cs (novo)
    └── Handlers/
        └── ReativarCategoriaDespesaCommandHandler.cs (novo)

src/Amani.ImportadosERP.Infra.Data/
└── Repositories/
    ├── CategoriaRepository.cs            ← +RemoverAsync(Guid id)
    └── CategoriaDespesaRepository.cs     ← +ReativarAsync(Guid id)

src/Amani.ImportadosERP.Api/
└── Controllers/
    ├── CategoriasController.cs           ← +DELETE /{id}
    └── CategoriasDespesaController.cs    ← +POST /{id}/reativar

Frontend:
frontend/src/
├── types/
│   └── category.ts                       ← +CreateCategoryPayload, +UpdateCategoryPayload
├── services/
│   └── categories.ts                     ← +create(), +update(), +remove()
├── hooks/
│   ├── use-categories.ts                 ← +useCreateCategory, +useUpdateCategory, +useRemoveCategory
│   └── use-expense-categories.ts         ← +useReactivateExpenseCategory
├── services/
│   └── expense-categories.ts             ← +reactivate(id)
├── components/
│   ├── configuracoes/
│   │   ├── product-categories-manager.tsx  (novo — CRUD de categorias de produto)
│   │   └── payment-fees-form.tsx          ← ampliar para mostrar todos os métodos com taxa
│   └── financeiro/
│       └── expense-categories-manager.tsx ← +botão reativar (toggle ativo/inativo)
└── app/
    └── configuracoes/
        └── page.tsx                       ← refatorar: cards → 4 abas inline
```

**Structure Decision**: Web application (Option 2) — backend em `src/`, frontend em `frontend/`. Sub-rotas
`/configuracoes/formas-pagamento` e `/configuracoes/implantacao` existentes são preservadas para
compatibilidade; o conteúdo de formas de pagamento é também disponibilizado via aba em `/configuracoes`.

## Complexity Tracking

Nenhuma violação constitucional identificada. Sem preenchimento necessário.
