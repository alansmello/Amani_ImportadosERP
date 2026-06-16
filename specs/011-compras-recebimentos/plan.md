# Implementation Plan: Compras e Recebimentos

**Branch**: `011-compras-recebimentos` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-compras-recebimentos/spec.md`

## Summary

Criar a superficie frontend de Compras e Recebimentos para operar o ciclo de
compra da Amani: registrar compra como mercadoria em transito, listar e filtrar
compras, acompanhar produtos pendentes, registrar recebimentos parciais e
registrar perdas/extravios/avarias com revisao antes do envio.

A feature substitui o placeholder atual de Compras por fluxos operacionais sobre
endpoints backend ja existentes. Nao altera backend, banco, migrations, regras de
estoque, regras de custo medio, validacoes oficiais de quantidade pendente ou
calculos financeiros. O frontend faz validacoes de formulario e UX, mas a fonte
oficial segue responsavel por aceitar/rejeitar compra, recebimento e perda.

## Technical Context

**Language/Version**: TypeScript 5.7 com React 19 e Next.js 15 no frontend;
backend existente em .NET 8 apenas como API consumida.

**Primary Dependencies**: Next.js App Router, React, TanStack React Query,
lucide-react, componentes UI locais, `apiClient`, services/hooks existentes de
Produtos e Fornecedores, novo service/hook/type de Compras. Nenhuma dependencia
nova planejada.

**Storage**: N/A no frontend. Persistencia fica no backend PostgreSQL existente,
acessada somente pelos endpoints oficiais de compras, recebimentos, perdas,
produtos e fornecedores. Estado local temporario guarda formularios, filtros e
confirmacoes ainda nao enviadas.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` em
`frontend/`. Validacao operacional pelos cenarios de `quickstart.md` em
smartphone, tablet e desktop. Nao ha suite automatizada especifica desta feature
no momento.

**Target Platform**: Frontend web oficial do Amani ERP, responsivo para
smartphone, tablet e desktop.

**Project Type**: Web application frontend dentro de `frontend/`, consumindo API
ASP.NET Core existente.

**Performance Goals**: Fluxos principais devem cumprir os criterios da spec:
criar compra com ate 10 itens em ate 5 minutos; localizar compras em ate 30
segundos; registrar recebimento ou perda em ate 1 minuto apos abrir o detalhe.

**Constraints**: Dark Only, Mobile First, sem dados mockados, sem regra critica
de negocio no frontend, sem calculo de estoque/custo medio/lucro/metricas,
compra criada nao gera estoque, perda nao gera estoque, recebimento/perda exigem
revisao, produto nao repete na mesma compra, motivos de perda restritos a Perda,
Extravio e Avaria, sem cancelamento/edicao/importacao/ajuste manual.

**Scale/Scope**: Uma area operacional em `/compras`, com rotas de lista, nova
compra e detalhe. Formulario de compra planejado para ate 10 itens por fluxo
operacional da spec, reutilizando listas reais de fornecedores e produtos.

## API Contract Findings

### Estado atual

- `ComprasController` expoe:
  - `POST /api/compras`
  - `GET /api/compras`
  - `GET /api/compras/{id}`
  - `GET /api/compras/em-transito`
  - `GET /api/compras/produtos-pendentes`
  - `POST /api/compras/{compraId}/itens/{itemId}/recebimentos`
  - `POST /api/compras/{compraId}/itens/{itemId}/perdas`
  - `GET /api/compras/{compraId}/recebimentos`
  - `GET /api/compras/{compraId}/perdas`
- Criar compra retorna `201 Created` com `{ id }`.
- Criar compra nao gera movimentacao de estoque; compra permanece como intencao
  comercial/mercadoria em transito.
- Recebimento cria movimentacao de entrada em transacao com o recebimento.
- Perda registra prejuizo operacional e nao cria estoque.
- Backend valida quantidade positiva, pendencia excedida, compra/item existentes
  e motivo de perda valido.
- `GET /api/compras` aceita filtros de `dataInicio`, `dataFim` e
  `fornecedorId`; nao ha filtro server-side de status.
- `GET /api/compras/em-transito` e `GET /api/compras/produtos-pendentes`
  retornam visoes oficiais para pendencias operacionais.

### Contrato planejado no frontend

- `purchasesService.list(filters)` para listagem com filtros oficiais de data e
  fornecedor.
- `purchasesService.listInTransit()` para a visao padrao de compras em transito.
- `purchasesService.listPendingProducts()` para a visao de produtos pendentes.
- `purchasesService.getById(id)` para detalhe.
- `purchasesService.create(payload)` para nova compra.
- `purchasesService.registerReceipt(compraId, itemId, payload)` para
  recebimento.
- `purchasesService.registerLoss(compraId, itemId, payload)` para perda.
- `purchasesService.listReceipts(compraId)` e `purchasesService.listLosses(compraId)`
  para historico do detalhe.
- `use-purchases.ts` deve orquestrar queries/mutations, invalidando caches de
  compras, pendencias e estoque apos recebimentos, e compras/pendencias apos
  perdas.
- Como o backend nao filtra status na listagem geral, a tela inicial usara as
  visoes oficiais de em transito/produtos pendentes e podera aplicar recorte
  local de 30 dias apenas para apresentacao. Filtros oficiais de data/fornecedor
  permanecem via `GET /api/compras`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. A feature fica no frontend e consome
  APIs existentes; nenhuma regra de negocio e movida para componentes.
- **Estoque por movimentacoes**: PASS. Compra nao gera entrada; recebimento
  confirmado chama fluxo oficial que gera movimentacao; perda nao gera estoque.
- **Compras e mercadorias em transito**: PASS. O plano preserva compra como
  mercadoria em transito ate recebimento fisico confirmado.
- **Recebimentos, perdas e rastreabilidade**: PASS. Recebimento/perda sao por item
  e passam pela fonte oficial; historico sera exibido no detalhe.
- **Vendas, custo medio e inventario inicial**: PASS. A feature nao altera vendas
  nem custo medio; recebimentos alimentam entradas reais para calculos futuros no
  backend.
- **Contratos de API e DTOs**: PASS. O frontend usara tipos explicitos alinhados
  aos DTOs existentes; entidades internas nao sao expostas.
- **Persistencia e mapeamentos**: PASS. Sem schema, migration, Fluent API ou
  repository novo.
- **Backend como fonte das regras**: PASS. Quantidades pendentes, aceite/rejeicao,
  entrada de estoque e perdas permanecem no backend.
- **Analytics e escalabilidade**: PASS. Sem dashboards, rankings ou metricas; uso
  de filtros existentes e visoes operacionais dedicadas.
- **Mobile First**: PASS. Lista, formulario, detalhe, revisao e acoes serao
  planejados para smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos privilegiam acesso rapido a pendencias
  e revisao apenas em acoes auditaveis.
- **Priorizacao do produto**: PASS. Entrega fluxo operacional essencial antes de
  analytics, relatorios, importacao ou automacoes.
- **Identidade visual**: PASS. Reuso do Design System oficial e Dark Theme.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencia nova; reuso de
  services, hooks, UI local e React Query.

## Project Structure

### Documentation (this feature)

```text
specs/011-compras-recebimentos/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- compras-frontend.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
`-- src/
    |-- app/
    |   `-- compras/
    |       |-- page.tsx
    |       |-- nova/
    |       |   `-- page.tsx
    |       `-- [id]/
    |           `-- page.tsx
    |-- components/
    |   `-- compras/
    |       |-- purchase-list.tsx
    |       |-- purchase-filters.tsx
    |       |-- purchase-form.tsx
    |       |-- purchase-item-editor.tsx
    |       |-- purchase-detail.tsx
    |       |-- pending-products-panel.tsx
    |       |-- receipt-dialog.tsx
    |       |-- loss-dialog.tsx
    |       |-- purchase-history.tsx
    |       `-- purchase-validation.ts
    |-- config/
    |   |-- navigation.ts
    |   `-- routes.ts
    |-- hooks/
    |   `-- use-purchases.ts
    |-- services/
    |   `-- purchases.ts
    `-- types/
        `-- purchase.ts

src/
`-- Amani.ImportadosERP.Api/
    `-- Controllers/
        `-- CompraController.cs   # existente; sem alteracao planejada
```

**Structure Decision**: Implementar somente no frontend, substituindo o
placeholder de Compras por rotas operacionais e componentes especificos. Reusar
hooks/services de Produtos e Fornecedores para dados de apoio. Nao criar backend,
migration, repository, dependencia nova, importacao, cancelamento ou edicao de
compra.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes tecnicas foram resolvidas sem
marcadores pendentes de esclarecimento.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- Frontend/API contract: [contracts/compras-frontend.md](./contracts/compras-frontend.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. O design limita o frontend a
  apresentacao, navegacao, validacao de formulario, cache e chamadas a services.
- **Estoque por movimentacoes**: PASS. O contrato separa compra, recebimento e
  perda; somente recebimento confirmado usa endpoint que gera entrada.
- **Compras e mercadorias em transito**: PASS. Compra criada continua em transito;
  nao ha caminho de entrada automatica na criacao.
- **Recebimentos, perdas e rastreabilidade**: PASS. Recebimentos e perdas exigem
  revisao, usam itemId/compraId e historico oficial.
- **Vendas, custo medio e inventario inicial**: PASS. Fora do escopo; nenhum
  calculo critico no cliente.
- **Contratos de API e DTOs**: PASS. Contrato documentado mapeia payloads e
  respostas existentes de forma explicita.
- **Persistencia e mapeamentos**: PASS. Sem alteracoes de persistencia/backend.
- **Backend como fonte das regras**: PASS. Erros oficiais sao exibidos; cliente
  nao decide pendencia final nem saldo.
- **Analytics e escalabilidade**: PASS. Sem analytics; usa filtros oficiais e
  visoes de leitura existentes.
- **Mobile First**: PASS. Quickstart exige validacao em 390px, tablet e desktop.
- **Experiencia operacional**: PASS. Padrao abre pendencias recentes; acoes
  auditaveis exigem revisao.
- **Priorizacao do produto**: PASS. Entrega compra -> recebimento -> pendencia.
- **Identidade visual**: PASS. Dark Only e Design System existente permanecem.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencias novas; dividido
  em componentes focados.

## Validation and Regression Scope

- `/compras` deixa de ser placeholder e mostra compras em transito/pendentes dos
  ultimos 30 dias por padrao.
- Lista permite filtros de periodo e fornecedor, e leitura de situacao
  operacional.
- `/compras/nova` carrega produtos e fornecedores reais; nunca usa mocks.
- Nova compra exige fornecedor, data e ao menos um item.
- Nova compra rejeita produto duplicado localmente.
- Ajustes comerciais por item e no total da compra sao aceitos quando informados.
- Criar compra nao mostra entrada de estoque nem saldo disponivel.
- `/compras/[id]` mostra detalhe, itens, pendencias, recebimentos e perdas.
- Recebimento exige revisao antes de envio; quantidade deve ser positiva e nao
  exceder pendencia oficial.
- Perda exige revisao antes de envio; motivo deve ser Perda, Extravio ou Avaria.
- Falhas oficiais mantem dados preenchidos e exibem mensagem do backend.
- Estados loading, vazio, erro, sucesso e confirmacao aparecem quando aplicavel.
- Nenhum calculo de estoque, custo medio, lucro, metrica, ranking ou dashboard
  ocorre no frontend.
- Nenhum cancelamento, edicao, importacao, transferencia ou ajuste manual aparece.
- Telas funcionam sem sobreposicao em smartphone, tablet e desktop.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- criar `types/purchase.ts` com payloads, responses, filtros, motivos e drafts;
- criar `services/purchases.ts` com todos os endpoints de compras;
- criar `hooks/use-purchases.ts` com queries/mutations e invalidacoes;
- adicionar rotas `comprasNova` e `compraDetalhe` em `routes.ts`;
- substituir `/compras` por lista operacional e painel de pendencias;
- criar `/compras/nova`;
- criar `/compras/[id]`;
- criar componentes de formulario, filtros, lista, detalhe, pendencias,
  recebimento, perda e historico;
- reutilizar `useProducts` e `useSuppliers`;
- validar produto unico por compra;
- validar motivos de perda Perda/Extravio/Avaria;
- validar revisao antes de recebimento/perda;
- validar ausencia de entrada de estoque na criacao da compra;
- validar Mobile First, Dark Only e ausencia de calculos criticos;
- executar lint, typecheck e build.

## Complexity Tracking

No constitution violations.
