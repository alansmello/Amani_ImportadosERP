# Implementation Plan: Refinamento do Fluxo de Nova Compra

**Branch**: `025-refine-purchase-flow` | **Date**: 2026-07-01 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/025-refine-purchase-flow/spec.md`

## Summary

Substituir o conjunto crescente de formulários de item da tela de Nova Compra por um compositor único e um carrinho de itens confirmados. O estado geral da compra continuará separado do item em composição; inclusão, edição, cancelamento e remoção ocorrerão localmente antes do envio. A edição substituirá o item pelo mesmo identificador e na mesma posição, o envio será bloqueado quando houver conteúdo não confirmado no compositor, e a prévia financeira será explicitamente consultiva. O payload de criação, os hooks, os serviços e todo o backend permanecem inalterados, preservando compra em trânsito, recebimentos, perdas, estoque e custo médio.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19 e Next.js 15 no frontend; C# 12 e .NET 8 no backend inalterado

**Primary Dependencies**: React, Next.js App Router, Tailwind CSS 3, Lucide React, TanStack Query 5 e Design System local

**Storage**: PostgreSQL existente, sem alteração de schema ou dados; rascunho e compositor permanecem somente em memória no navegador até o registro

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build`, `dotnet build Amani_ImportadosERP.sln` e roteiro manual em [quickstart.md](quickstart.md); sem nova infraestrutura de testes automatizados por decisão vigente do projeto

**Target Platform**: Aplicação web responsiva em navegadores modernos, validada em smartphone, tablet e desktop

**Project Type**: Aplicação web full stack em monorepo, com mudança funcional restrita ao frontend

**Performance Goals**: Inclusão, edição, remoção e recálculo da prévia em até 100 ms para carrinhos de até 100 itens; nenhuma chamada adicional de rede durante a composição local

**Constraints**: Preservar o contrato atual de criação de compra; não alterar estoque, recebimento, perdas, custo médio, venda ou histórico; não oferecer apresentações comerciais em compras; não criar migration ou dependência; manter Mobile First, Dark Theme e acessibilidade dos controles existentes

**Scale/Scope**: Reestruturar 3 arquivos do módulo de compras, substituir o editor repetido por 1 compositor específico e criar 1 resumo específico; hooks, services, tipos de payload e backend entram apenas em verificação de regressão

## Constitution Check

*GATE: aprovado antes da Phase 0 e reavaliado após o design da Phase 1.*

- **I. Arquitetura e separação**: PASS — a mudança fica em componentes e validações de interface; nenhuma regra de domínio migra para a apresentação.
- **II. Estoque por movimentações**: PASS — criar compra continua sem movimentação; o plano não altera saldo ou histórico.
- **III. Compras, recebimentos, vendas, custos e lucro**: PASS — compra permanece em trânsito, somente recebimento físico gera entrada e custo médio, e vendas não são modificadas.
- **IV. Contratos de API e DTOs**: PASS — `CreatePurchasePayload`, `CriarCompraDto` e `CriarCompraItemDto` permanecem inalterados.
- **V. Persistência, histórico e mapeamentos**: PASS — não há migration, mapping, repository ou atualização de registros históricos.
- **VI. Backend como fonte das regras**: PASS — validações locais melhoram a UX; a operação oficial continua processada pelo backend. A prévia financeira não redefine o total oficial.
- **VII. Analytics e escalabilidade**: PASS — nenhuma consulta analítica ou materialização de histórico é adicionada.
- **VIII. Mobile First**: PASS — compositor e resumo serão empilhados em smartphone e organizados em colunas somente quando houver largura suficiente.
- **IX. Experiência operacional**: PASS — um único ponto de entrada reduz rolagem e permite revisão intencional antes do registro.
- **X. Priorização do produto**: PASS — a feature melhora diretamente o fluxo operacional de compras.
- **XI. Identidade visual**: PASS — componentes, tokens, estados e Dark Theme existentes serão reutilizados.
- **XII. Simplicidade**: PASS — a solução usa estado React local e componentes específicos do domínio, sem biblioteca ou abstração genérica nova.

**Reavaliação pós-design**: PASS. As decisões de [research.md](research.md), o modelo de estado de [data-model.md](data-model.md) e os [contratos de interface](contracts/ui-contracts.md) mantêm todos os gates sem exceções ou justificativas de complexidade.

## Project Structure

### Documentation (this feature)

```text
specs/025-refine-purchase-flow/
├── spec.md
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contracts.md
└── checklists/
    └── requirements.md
```

`tasks.md` será criado posteriormente pela fase `/speckit-tasks`.

### Source Code (repository root)

```text
frontend/src/
├── app/compras/nova/page.tsx                 # Rota existente, sem mudança funcional prevista
├── components/compras/
│   ├── purchase-form.tsx                     # Orquestra draft, compositor, edição e envio
│   ├── purchase-item-editor.tsx              # Editor repetido atual a ser substituído
│   ├── purchase-item-composer.tsx            # Novo compositor único específico de compra
│   ├── purchase-summary.tsx                  # Novo carrinho e prévia comercial
│   └── purchase-validation.ts                # Fábricas, validação individual/final e payload
├── hooks/use-purchases.ts                     # Contrato existente, sem mudança prevista
├── services/purchases.ts                      # POST existente, sem mudança prevista
└── types/purchase.ts                          # Tipos existentes; alterar somente se a implementação exigir estado nomeado

src/
├── Amani.ImportadosERP.Api/Controllers/CompraController.cs
├── Amani.ImportadosERP.Application/Services/CompraService.cs
├── Amani.ImportadosERP.Application/DTOs/{CriarCompraDto,CriarCompraItemDto}.cs
├── Amani.ImportadosERP.Domain/Entities/{Compra,CompraItem}.cs
└── Amani.ImportadosERP.Infra.Data/Repositories/CustoProdutoRepository.cs
```

Os arquivos em `src/` são referências de regressão e não fazem parte da mudança planejada.

**Structure Decision**: manter a arquitetura atual e implementar a feature dentro de `frontend/src/components/compras`. O padrão de Venda serve como referência de interação, mas Compra recebe componentes próprios para não acoplar custo, trânsito e unidade principal a preço, estoque disponível, apresentações ou pagamento de Venda.

