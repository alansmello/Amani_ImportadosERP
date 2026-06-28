# Implementation Plan: Refinamento do Fluxo de Nova Venda

**Branch**: `022-refine-new-sale-flow` | **Date**: 2026-06-28 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/022-refine-new-sale-flow/spec.md`

## Summary

Otimizar a experiência operacional da tela de Nova Venda no Amani ERP sem alterar as regras de negócio e persistência do backend. O plano consiste em: (1) implementar a criação rápida de cliente em um modal Dialog sem abandonar o rascunho de venda, atualizando a listagem e auto-selecionando o cliente criado; (2) centralizar a inclusão de itens através de um único formulário compositor que se autolimpa após a adição; (3) bloquear a adição de produtos duplicados no resumo para evitar mesclagens automáticas silenciosas; (4) exibir uma listagem de resumo detalhada com o valor líquido de cada item e os totais gerais recalculados em tempo real, permitindo a edição (carregar de volta no compositor) ou remoção. O contrato de `CriarVendaDto` e a validação oficial do estoque no backend serão totalmente preservados.

## Technical Context

**Language/Version**: TypeScript 5.7, React 19 e Next.js 15 no frontend; C# 12 e .NET 8 no backend (inalterado)

**Primary Dependencies**: React, Tailwind CSS 3, Lucide React, Radix Dialog (via `@/components/ui/dialog`), TanStack Query 5 (para mutations e queries de suporte)

**Storage**: PostgreSQL (API do backend inalterada)

**Testing**: Compilação estática (`dotnet build` e `npm run build`), validação de tipo (`npm run typecheck`), análise estática (`npm run lint`), e roteiro de teste manual descrito em [quickstart.md](quickstart.md) em smartphone, tablet e desktop. Nenhuma suíte de testes automatizados será criada, conforme diretriz da Fase 4.

**Target Platform**: Aplicação web responsiva (Mobile First) executada em navegadores modernos.

**Project Type**: Aplicação Web SPA (Next.js App Router).

**Performance Goals**: Tempo de recálculo dos totais da venda no resumo de itens inferior a 100ms no frontend; abertura/fechamento do modal de cliente sem redesenhar ou desmontar o formulário hospedeiro; seleção instantânea do novo cliente após o sucesso da mutation.

**Constraints**: Preservação estrita dos princípios de Mobile First e Dark Theme; sem vazamento de validações críticas que substituam o backend; sem alteração no payload final da venda (`CriarVendaDto`); sem novas migrações de dados.

**Scale/Scope**: Adaptação de 4 componentes React (`SaleForm`, `SaleItemEditor`, `SaleSummary` e `SaleValidation`), criação de 1 novo componente Dialog (`QuickCustomerDialog`), e 1 novo componente de compositor (`SaleItemComposer`).

## Constitution Check

*GATE: aprovado antes da pesquisa e reavaliado após o design.*

- **Arquitetura e responsabilidades**: PASS — As validações estruturais de campos ocorrem no frontend, mas a validação de regras de negócio (estoque, saldo financeiro) continua centralizada exclusivamente no backend.
- **Estoque por movimentacoes**: PASS — A feature não altera saldos fixos nem modifica como as movimentações são geradas ou calculadas.
- **Compras e mercadorias em transito**: PASS — Não afeta o ciclo de compras ou mercadorias em trânsito.
- **Recebimentos, perdas e rastreabilidade**: PASS — Não modifica perdas ou recebimentos de compras.
- **Vendas, custo medio e inventario inicial**: PASS — Mantém a validação definitiva de estoque físico no backend ao registrar a venda e o lucro calculado pelo custo médio.
- **Contratos de API e DTOs**: PASS — O contrato de `CriarVendaDto` e o payload retornado na criação de cliente são mantidos inalterados; não se usa AutoMapper.
- **Persistencia e mapeamentos**: PASS — Nenhuma alteração de schema ou persistência.
- **Backend como fonte das regras**: PASS — O cálculo no frontend é estritamente uma estimativa comercial visual; a API do backend continua validando o estoque e processando os totais finais.
- **Analytics e escalabilidade**: PASS — Nenhuma consulta analítica ou de histórico em lote é adicionada.
- **Mobile First**: PASS — O compositor único e o resumo colapsável/responsivo foram projetados para alta usabilidade em smartphones, tablets e desktops.
- **Experiencia operacional**: PASS — Permite cadastrar referências (clientes) sem abandonar o rascunho de venda, e unifica a entrada de itens em um único local limpo.
- **Priorizacao do produto**: PASS — Foca em otimizar o fluxo de maior frequência do ERP (Nova Venda) antes de relatórios ou automações complexas.
- **Identidade visual**: PASS — Segue o Design System existente baseado no Dark Theme, usando Radix Dialog e Tailwind CSS.
- **Simplicidade antes de sofisticacao**: PASS — Reutiliza os componentes visuais de input e botões do projeto, sem adicionar novas dependências complexas de formulário.

**Reavaliação pós-design**: PASS. O design proposto em `research.md` e `data-model.md` cumpre integralmente os requisitos da especificação e da constituição.

## Project Structure

### Documentation (this feature)

```text
specs/022-refine-new-sale-flow/
├── spec.md                  # Especificação funcional
├── plan.md                  # Este plano de implementação
├── research.md              # Decisões de design e pesquisa
├── data-model.md            # Modelagem de estado de tela
├── quickstart.md            # Roteiro de testes manuais
├── contracts/
│   └── ui-contracts.md      # Contratos de payloads e componentes
└── checklists/
    └── requirements.md      # Checklist de qualidade da especificação
```

`tasks.md` será criado subsequentemente pelo comando `/speckit-tasks`.

### Source Code

```text
frontend/src/
├── app/
│   └── vendas/
│       └── nova/
│           └── page.tsx      # Rota da página de nova venda (consome SaleForm)
├── components/
│   ├── clientes/
│   │   └── quick-customer-dialog.tsx   # [Novo] Modal de criação rápida de cliente
│   └── vendas/
│       ├── sale-form.tsx               # Formulário principal reestruturado
│       ├── sale-item-composer.tsx      # [Novo] Compositor único de item
│       ├── sale-summary.tsx            # Resumo e listagem dos itens confirmados
│       └── sale-validation.ts          # Lógica de validação e construção do payload
```
