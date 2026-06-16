# Implementation Plan: Estoque Frontend

**Branch**: `012-estoque-frontend` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-estoque-frontend/spec.md`

## Summary

Substituir o placeholder de Estoque por uma superficie operacional de leitura
para saldos atuais, historico de movimentacoes por produto e produtos pendentes
de recebimento. A feature consome a consulta oficial de estoque definida na F008
e reaproveita a visao de produtos pendentes da F011, mantendo o frontend sem
calculo de saldo, sem ajuste manual, sem transferencia e sem edicao de
movimentacoes.

O modulo exibe todos os produtos por padrao, inclusive saldo zero; permite busca,
filtro para produtos com saldo, detalhe de historico com filtros de periodo e
tipo, destaque para saldo negativo retornado pela fonte oficial, e atalhos das
pendencias para o detalhe da compra de origem.

## Technical Context

**Language/Version**: TypeScript 5.7 com React 19 e Next.js 15 no frontend;
backend existente em .NET 8 apenas como API consumida.

**Primary Dependencies**: Next.js App Router, React, TanStack React Query,
lucide-react, componentes UI locais, `apiClient`, services/hooks existentes de
Compras e Produtos, novo service/hook/type de Estoque. Nenhuma dependencia nova
planejada.

**Storage**: N/A no frontend. Persistencia fica no backend PostgreSQL existente,
acessada somente pelos endpoints oficiais de estoque e compras. Estado local
temporario guarda busca, filtros de saldo, filtros de historico e selecao de
visao.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` em
`frontend/`. Validacao operacional pelos cenarios de `quickstart.md` em
smartphone, tablet e desktop. Nao ha suite automatizada especifica desta feature
no momento.

**Target Platform**: Frontend web oficial do Amani ERP, responsivo para
smartphone, tablet e desktop.

**Project Type**: Web application frontend dentro de `frontend/`, consumindo API
ASP.NET Core existente.

**Performance Goals**: Cumprir os criterios da spec: localizar saldo de produto
em ate 30 segundos; buscar/filtrar em ate 30 segundos em lista de pelo menos 100
produtos; entender historico em ate 1 minuto. O historico deve respeitar limites
da fonte oficial.

**Constraints**: Dark Only, Mobile First, somente leitura, sem dados mockados, sem
calculo local de saldo, sem criar/editar/excluir movimentacoes, sem ajuste manual,
sem transferencia, sem alerta de estoque minimo, sem somar pendencias ao saldo,
sem dependencia nova.

**Scale/Scope**: Uma area operacional em `/estoque`, substituindo o placeholder,
com lista principal, visao/aba de pendencias e detalhe de movimentacoes por
produto. Planejado para pelo menos 100 produtos na validacao manual da spec.

## API Contract Findings

### Estado atual esperado

- F008 expoe leitura oficial de estoque:
  - lista de produtos com saldo atual calculado pela fonte oficial;
  - historico de movimentacoes por produto com tipo, quantidade, origem e data;
  - filtros de historico por periodo e tipo;
  - limite padrao/maximo e sinalizacao de total quando houver mais registros.
- F011 ja expoe produtos pendentes por `compras/produtos-pendentes` e o frontend
  ja possui `purchasesService.listPendingProducts()` e
  `usePendingPurchaseProducts()`.
- `routes.ts` ja possui `compraDetalhe(id)` para abrir o detalhe da compra de
  origem.

### Contrato planejado no frontend

- `stockService.list(filters)` para lista de produtos com saldo oficial.
- `stockService.getMovements(produtoId, filters)` para historico de
  movimentacoes do produto.
- `use-stock.ts` deve compor chaves a partir de `queryKeys.estoque`, sem
  recalcular saldo nem derivar metricas criticas.
- A visao de pendencias deve reutilizar `usePendingPurchaseProducts()` e tipos de
  compras, enriquecendo nomes com `useProducts()` e `useSuppliers()` quando
  necessario.
- Recebimentos e perdas permanecem no fluxo de Compras; Estoque apenas abre o
  detalhe da compra de origem.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. A feature fica no frontend e
  consome APIs existentes; nenhuma regra de negocio e movida para componentes.
- **Estoque por movimentacoes**: PASS. Saldo e historico sao exibidos a partir da
  fonte oficial; nao ha campo fixo, ajuste manual ou movimentacao criada no
  cliente.
- **Compras e mercadorias em transito**: PASS. Pendencias sao apresentadas como
  itens ainda nao recebidos e nunca como saldo disponivel.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature mostra origem e
  pendencias, mas recebimento/perda permanecem nos fluxos oficiais de Compras.
- **Vendas, custo medio e inventario inicial**: PASS. A feature nao altera venda,
  custo medio ou inventario; apenas exibe movimentacoes reconhecidas pela fonte
  oficial.
- **Contratos de API e DTOs**: PASS. O frontend usara tipos explicitos alinhados
  aos contratos de leitura; entidades internas nao sao expostas.
- **Persistencia e mapeamentos**: PASS. Sem alteracoes de persistencia, schema,
  migration, Fluent API ou repository.
- **Backend como fonte das regras**: PASS. Saldo, historico, origem e pendencias
  vem da fonte oficial; o frontend apenas filtra/exibe conforme contrato.
- **Analytics e escalabilidade**: PASS. Sem dashboards ou metricas; historico usa
  filtros e limites da fonte oficial.
- **Mobile First**: PASS. Lista, filtros, detalhe e pendencias serao planejados e
  validados em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Tela prioriza localizar saldo, auditar
  historico e seguir para compra de origem com poucas interacoes.
- **Priorizacao do produto**: PASS. Entrega leitura operacional essencial de
  estoque antes de alertas, relatorios ou ajustes avancados.
- **Identidade visual**: PASS. Reuso do Design System oficial e Dark Theme.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencia nova; reuso de
  services, hooks, UI local e React Query.

## Project Structure

### Documentation (this feature)

```text
specs/012-estoque-frontend/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- estoque-frontend.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
`-- src/
    |-- app/
    |   `-- estoque/
    |       |-- page.tsx
    |       `-- [produtoId]/
    |           `-- page.tsx
    |-- components/
    |   `-- estoque/
    |       |-- stock-list.tsx
    |       |-- stock-filters.tsx
    |       |-- stock-summary.tsx
    |       |-- stock-movement-detail.tsx
    |       |-- stock-movement-filters.tsx
    |       |-- stock-movement-list.tsx
    |       |-- pending-receipts-panel.tsx
    |       `-- stock-formatters.ts
    |-- config/
    |   |-- navigation.ts
    |   `-- routes.ts
    |-- hooks/
    |   `-- use-stock.ts
    |-- services/
    |   `-- stock.ts
    `-- types/
        `-- stock.ts
```

**Structure Decision**: Implementar somente no frontend, substituindo
`frontend/src/app/estoque/page.tsx` e criando uma rota de detalhe por produto.
Reutilizar `usePendingPurchaseProducts`, `useProducts`, `useSuppliers`,
`compraDetalhe(id)`, estados base e UI local. Nao criar backend, migration,
dependencia nova, ajuste de estoque, transferencia, alerta minimo ou edicao de
movimentacao.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes tecnicas foram resolvidas
sem marcadores pendentes de esclarecimento.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- Frontend/API contract: [contracts/estoque-frontend.md](./contracts/estoque-frontend.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. O design limita componentes a
  apresentacao, navegacao, filtros de exibicao, cache e chamadas a services.
- **Estoque por movimentacoes**: PASS. Saldo nao e recalculado no cliente;
  historico e fonte oficial explicam o saldo.
- **Compras e mercadorias em transito**: PASS. Pendencias sao visao operacional
  separada e nao entram no saldo.
- **Recebimentos, perdas e rastreabilidade**: PASS. Pendencias abrem compra de
  origem; recebimentos/perdas seguem no modulo de Compras.
- **Vendas, custo medio e inventario inicial**: PASS. Fora do escopo; apenas
  origens oficiais podem aparecer no historico.
- **Contratos de API e DTOs**: PASS. Contrato documentado mapeia responses e
  filtros de leitura para tipos explicitos.
- **Persistencia e mapeamentos**: PASS. Sem alteracoes de persistencia/backend.
- **Backend como fonte das regras**: PASS. O cliente nao calcula saldo, custo,
  lucro, metricas nem consistencia operacional.
- **Analytics e escalabilidade**: PASS. Historico respeita filtros/limites; sem
  dashboards ou agregacoes locais.
- **Mobile First**: PASS. Quickstart exige validacao em 390px, tablet e desktop.
- **Experiencia operacional**: PASS. Lista padrao mostra todos os produtos;
  filtros e atalho para compra reduzem friccao.
- **Priorizacao do produto**: PASS. Entrega visao de estoque essencial antes de
  alertas e ajustes avancados.
- **Identidade visual**: PASS. Dark Only e Design System existente permanecem.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencias novas; dividido
  em componentes focados.

## Validation and Regression Scope

- `/estoque` deixa de ser placeholder e mostra todos os produtos retornados pela
  fonte oficial, inclusive saldo zero.
- Lista permite busca textual e filtro para produtos com saldo.
- Saldo negativo retornado pela fonte oficial aparece com destaque de
  inconsistencia, sem correcao local.
- Saldo exibido corresponde exatamente ao valor oficial.
- Detalhe do produto mostra saldo atual e historico com tipo, quantidade, data e
  origem.
- Historico permite filtros de periodo e tipo quando suportados pela fonte
  oficial.
- Historico vazio, limitado, indisponivel e produto nao encontrado apresentam
  estados adequados.
- Visao de pendencias mostra produto, fornecedor, compra de origem e quantidade
  pendente.
- Pendencias abrem o detalhe da compra de origem e nao permitem receber/perder
  diretamente dentro de Estoque.
- Pendencias nunca sao somadas ou apresentadas como saldo disponivel.
- Nenhum ajuste manual, transferencia, alerta minimo, edicao ou exclusao de
  movimentacao aparece.
- Telas funcionam sem sobreposicao em smartphone, tablet e desktop.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- criar `types/stock.ts` com saldos, movimentacoes, filtros e tipos de origem;
- criar `services/stock.ts` com lista de estoque e historico de produto;
- criar `hooks/use-stock.ts` com queries e chaves derivadas de `queryKeys.estoque`;
- adicionar rota helper `estoqueDetalhe(produtoId)` em `routes.ts`;
- marcar item de navegacao Estoque como pronto;
- substituir `/estoque` por lista operacional, filtros, resumo e pendencias;
- criar `/estoque/[produtoId]` para detalhe de movimentacoes;
- criar componentes de lista, filtros, resumo, detalhe, filtros de historico,
  lista de movimentacoes e painel de pendencias;
- reutilizar `useProducts`, `useSuppliers` e `usePendingPurchaseProducts`;
- validar todos os produtos por padrao, saldo zero, saldo negativo destacado e
  filtro "com saldo";
- validar historico com filtros de periodo/tipo e estados vazio/erro/loading;
- validar pendencias abrindo detalhe da compra de origem;
- validar ausencia de calculo local de saldo e ausencia de acoes fora de escopo;
- validar Mobile First, Dark Only e ausencia de dados mockados;
- executar lint, typecheck e build.

## Complexity Tracking

No constitution violations.
