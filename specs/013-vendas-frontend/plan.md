# Implementation Plan: Vendas Frontend

**Branch**: `013-vendas-frontend` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/013-vendas-frontend/spec.md`

## Summary

Substituir o placeholder de Vendas por uma superficie operacional para listar,
filtrar, criar, detalhar e cancelar vendas. A feature consome o contrato
existente de `VendasController`, reaproveita Produtos, Clientes e Estoque para
apoio visual/operacional, e mantem o backend como fonte de validacao de saldo,
saida de estoque, lucro e custo medio.

O modulo permite criar venda com cliente e itens, consolida produtos duplicados
em uma unica linha, exibe mensagem clara de estoque insuficiente, mostra lucro
oficial no detalhe e solicita cancelamento quando o backend aceita. Forma de pagamento,
recebiveis, edicao, devolucao parcial, emissao fiscal e qualquer recalculo local
de custo medio/lucro permanecem fora do escopo.

## Technical Context

**Language/Version**: TypeScript 5.7 com React 19 e Next.js 15 no frontend;
backend existente em .NET 8 apenas como API consumida.

**Primary Dependencies**: Next.js App Router, React, TanStack React Query,
lucide-react, componentes UI locais, `apiClient`, services/hooks existentes de
Clientes, Produtos e Estoque, novo service/hook/type de Vendas. Nenhuma
dependencia nova planejada.

**Storage**: N/A no frontend. Persistencia fica no backend PostgreSQL existente,
acessada somente pelos endpoints oficiais de vendas, clientes, produtos e
estoque. Estado local temporario guarda filtros, rascunho da venda, selecao de
cliente/produtos e estado de confirmacao/cancelamento.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` em
`frontend/`. Validacao operacional pelos cenarios de `quickstart.md` em
smartphone, tablet e desktop. Nao ha suite automatizada especifica desta feature
no momento.

**Target Platform**: Frontend web oficial do Amani ERP, responsivo para
smartphone, tablet e desktop.

**Project Type**: Web application frontend dentro de `frontend/`, consumindo API
ASP.NET Core existente.

**Performance Goals**: Cumprir os criterios da spec: registrar uma venda simples
com ate 3 itens em ate 3 minutos; localizar venda por periodo ou cliente em ate
30 segundos em lista de pelo menos 100 vendas; entender detalhe de venda em ate
1 minuto. O formulario deve manter resposta interativa durante inclusao e
consolidacao de itens.

**Constraints**: Dark Only, Mobile First, sem dados mockados, sem recalculo local
de saldo, lucro ou custo medio, sem forma de pagamento/recebiveis, sem edicao de
venda, sem devolucao parcial, sem emissao fiscal, sem backend novo, sem migration
e sem dependencia nova.

**Scale/Scope**: Uma area operacional em `/vendas`, substituindo o placeholder,
com lista/filtros, criacao de venda em `/vendas/nova`, detalhe em `/vendas/[id]`
e cancelamento. Planejado para pelo menos 100 vendas na validacao manual da
spec.

## API Contract Findings

### Estado atual esperado

- `POST /api/vendas` recebe `clienteId`, `dataVenda`, `desconto`, `acrescimo` e
  `items`.
- Cada item de venda envia `produtoId`, `quantidade`, `precoUnitario`,
  `desconto` e `acrescimo`.
- `GET /api/vendas` lista vendas com filtros opcionais `dataInicio`, `dataFim` e
  `clienteId`.
- `GET /api/vendas/{id}` retorna detalhe com cliente, data, desconto, acrescimo,
  total, lucro e itens.
- `POST /api/vendas/{id}/cancelar` cancela a venda quando o backend aceita.
- O backend valida estoque, gera saida de estoque, calcula lucro por custo medio
  e retorna mensagens de erro como `{ error: string }` em rejeicoes operacionais.
- O contrato atual de venda nao possui forma de pagamento, contas a receber ou
  status explicito no DTO de detalhe; o frontend deve tratar ausencia desses
  campos sem inventar estado financeiro ou status local de cancelamento.

### Contrato planejado no frontend

- `salesService.list(filters)` para listar vendas com filtros de periodo e
  cliente.
- `salesService.getById(id)` para obter detalhe oficial da venda.
- `salesService.create(payload)` para registrar venda confirmada.
- `salesService.cancel(id)` para cancelar venda.
- `use-sales.ts` deve compor chaves a partir de `queryKeys.vendas`, invalidando
  vendas e estoque apos criacao/cancelamento.
- O formulario deve reutilizar `useClients`, `useProducts` e, quando util para
  leitura de disponibilidade, `useStockProducts`, sem usar saldo local como fonte
  de autorizacao da venda.
- A consolidacao de produtos duplicados acontece no rascunho da venda antes do
  envio. O backend continua sendo a fonte final da validacao de estoque.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. A feature fica no frontend e
  consome APIs existentes; nenhuma regra de negocio e movida para componentes.
- **Estoque por movimentacoes**: PASS. Venda confirmada gera saida pelo backend;
  o frontend nao cria movimentacao nem campo fixo de saldo.
- **Compras e mercadorias em transito**: PASS. A feature nao altera compras nem
  recebimentos; depende apenas de saldo previamente gerado por implantacao ou
  compras/recebimentos.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature nao registra
  recebimento ou perda; rastreabilidade de saida permanece no backend.
- **Vendas, custo medio e inventario inicial**: PASS. Vendas validam saldo fisico
  no backend; lucro e apenas exibido quando retornado pela fonte oficial, e custo
  medio permanece como base interna do calculo oficial.
- **Contratos de API e DTOs**: PASS. O frontend usara tipos explicitos alinhados
  aos DTOs de venda; entidades internas nao sao expostas.
- **Persistencia e mapeamentos**: PASS. Sem alteracoes de persistencia, schema,
  migration, Fluent API ou repository.
- **Backend como fonte das regras**: PASS. Validacao de estoque, saida de
  estoque, custo medio, lucro e cancelamento efetivo ficam no backend.
- **Analytics e escalabilidade**: PASS. Sem dashboard ou metrica local; lista usa
  filtros oficiais de periodo/cliente.
- **Mobile First**: PASS. Lista, formulario, detalhe e cancelamento serao
  planejados e validados em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxo prioriza criar venda com poucas
  interacoes, consolidar duplicidades e expor erro de saldo de forma direta.
- **Priorizacao do produto**: PASS. Entrega fluxo operacional essencial de venda
  antes de financeiro, fiscal, devolucao ou analytics.
- **Identidade visual**: PASS. Reuso do Design System oficial e Dark Theme.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencia nova; reuso de
  services, hooks, UI local e React Query.

## Project Structure

### Documentation (this feature)

```text
specs/013-vendas-frontend/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- vendas-frontend.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
`-- src/
    |-- app/
    |   `-- vendas/
    |       |-- page.tsx
    |       |-- nova/
    |       |   `-- page.tsx
    |       `-- [vendaId]/
    |           `-- page.tsx
    |-- components/
    |   `-- vendas/
    |       |-- sales-list.tsx
    |       |-- sales-filters.tsx
    |       |-- sale-form.tsx
    |       |-- sale-item-editor.tsx
    |       |-- sale-detail.tsx
    |       |-- sale-summary.tsx
    |       |-- cancel-sale-dialog.tsx
    |       |-- sale-validation.ts
    |       `-- sale-formatters.ts
    |-- config/
    |   `-- routes.ts
    |-- hooks/
    |   `-- use-sales.ts
    |-- services/
    |   `-- sales.ts
    `-- types/
        `-- sale.ts
```

**Structure Decision**: Implementar somente no frontend, substituindo
`frontend/src/app/vendas/page.tsx` e criando rotas para nova venda e detalhe.
Reutilizar services/hooks de Clientes, Produtos e Estoque para selecao e apoio
visual, `queryKeys.vendas`, estados base e UI local. Nao criar backend, migration,
dependencia nova, forma de pagamento, recebiveis, edicao, devolucao parcial,
emissao fiscal ou calculo local de lucro/custo medio.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes tecnicas foram resolvidas
sem marcadores pendentes de esclarecimento.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- Frontend/API contract: [contracts/vendas-frontend.md](./contracts/vendas-frontend.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. O design limita componentes a
  apresentacao, navegacao, validacao de formulario, cache e chamadas a services.
- **Estoque por movimentacoes**: PASS. Saida de estoque e validacao de saldo
  permanecem no backend; o cliente apenas atualiza leituras apos sucesso.
- **Compras e mercadorias em transito**: PASS. Sem impacto em compras; saldo
  disponivel depende das features anteriores.
- **Recebimentos, perdas e rastreabilidade**: PASS. Sem registro de recebimento
  ou perda; rastreabilidade de venda/cancelamento fica no contrato oficial.
- **Vendas, custo medio e inventario inicial**: PASS. O contrato documentado
  trata lucro como dado oficial e custo medio como base interna do backend;
  inventario inicial nao e alterado.
- **Contratos de API e DTOs**: PASS. Contrato documentado mapeia requests,
  responses, erros e filtros para tipos explicitos no frontend.
- **Persistencia e mapeamentos**: PASS. Sem alteracoes de persistencia/backend.
- **Backend como fonte das regras**: PASS. O cliente nao calcula saldo, custo,
  lucro, metricas nem consistencia operacional.
- **Analytics e escalabilidade**: PASS. Lista usa filtros; sem dashboards,
  rankings ou agregacoes locais.
- **Mobile First**: PASS. Quickstart exige validacao em 390px, tablet e desktop.
- **Experiencia operacional**: PASS. Nova venda consolida itens duplicados,
  destaca erros e mantem financeiro/fiscal fora do fluxo.
- **Priorizacao do produto**: PASS. Entrega venda operacional antes de financeiro
  e recursos pos-MVP.
- **Identidade visual**: PASS. Dark Only e Design System existente permanecem.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencias novas; dividido
  em componentes focados.

## Validation and Regression Scope

- `/vendas` deixa de ser placeholder e mostra lista com filtros por data e
  cliente.
- `/vendas/nova` permite selecionar cliente, adicionar itens e informar preco,
  quantidade, desconto e acrescimo.
- Produtos duplicados no rascunho sao consolidados em uma unica linha antes da
  confirmacao.
- Venda sem cliente, sem itens ou com valores invalidos nao pode ser confirmada.
- Venda com saldo suficiente e aceita pelo backend aparece como concluida e
  invalida leituras de vendas e estoque.
- Erro de estoque insuficiente retornado pelo backend aparece de forma clara e a
  venda permanece nao concluida.
- Detalhe exibe cliente, data, itens, totais e lucro retornado pelo backend.
- Ausencia de lucro em resposta oficial e comunicada sem calculo substituto.
- Cancelamento exige confirmacao, atualiza as leituras oficiais apos sucesso e
  nao inventa status local quando o contrato nao retornar esse dado.
- Forma de pagamento, recebiveis, edicao, devolucao parcial e emissao fiscal nao
  aparecem no fluxo.
- Telas funcionam sem sobreposicao em smartphone, tablet e desktop.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- criar `types/sale.ts` com filtros, listagem, detalhe, itens, payloads,
  rascunho e erros de validacao;
- criar `services/sales.ts` com listar, obter detalhe, criar e cancelar venda;
- criar `hooks/use-sales.ts` com queries/mutations e invalidacao de vendas e
  estoque apos criacao/cancelamento;
- adicionar helpers `vendaNova()` e `vendaDetalhe(id)` em `routes.ts`;
- substituir `/vendas` por lista operacional com filtros data/cliente;
- criar `/vendas/nova` para formulario de venda;
- criar `/vendas/[vendaId]` para detalhe e cancelamento;
- criar componentes de lista, filtros, formulario, editor de item, resumo,
  detalhe, dialog de cancelamento, formatadores e validacao;
- reutilizar `useClients`, `useProducts` e, quando util, `useStockProducts` para
  apoio visual de disponibilidade sem autorizar venda localmente;
- consolidar produtos duplicados no rascunho da venda;
- tratar `{ error }` de estoque insuficiente e outros erros operacionais;
- validar ausencia de forma de pagamento, recebiveis, edicao, devolucao parcial,
  emissao fiscal e calculo local de lucro/custo medio, tratando custo medio como
  base interna do backend;
- validar Mobile First, Dark Only e ausencia de dados mockados;
- executar lint, typecheck e build.

## Complexity Tracking

No constitution violations.
