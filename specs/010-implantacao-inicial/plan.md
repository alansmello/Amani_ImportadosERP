# Implementation Plan: Implantacao Inicial no Frontend

**Branch**: `010-implantacao-inicial` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/010-implantacao-inicial/spec.md`

## Summary

Criar o fluxo frontend de Implantacao Inicial para registrar dados reais de
partida da Amani: inventario inicial por produto, saldo inicial de caixa e contas
a receber iniciais por cliente. A implementacao substitui o placeholder atual de
Configuracoes por uma entrada operacional para implantacao, com etapas
independentes, progresso parcial, revisao antes do envio, bloqueio de etapa
concluida e feedback claro de sucesso/erro.

A feature consome endpoints backend ja existentes em `/api/implantacao/*` e
listas oficiais de produtos e clientes. Nao altera backend, banco, regras de
negocio, calculo de estoque, custo medio, saldo financeiro ou recebiveis. O
frontend valida formularios para experiencia, mas a fonte oficial segue
responsavel pelos registros definitivos e rejeicoes.

## Technical Context

**Language/Version**: TypeScript 5.7 com React 19 e Next.js 15 no frontend; backend
existente em .NET 8 apenas como API consumida.

**Primary Dependencies**: Next.js App Router, React, TanStack React Query,
lucide-react, componentes UI locais, `apiClient`, services existentes de
Produtos/Clientes e novo service de Implantacao. Nenhuma dependencia nova.

**Storage**: N/A no frontend. Persistencia fica no backend PostgreSQL existente,
acessada somente pelos endpoints oficiais de implantacao, produtos e clientes.
Estado local temporario deve guardar apenas preenchimento ainda nao confirmado.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` em `frontend/`.
Validacao operacional pelos cenarios do `quickstart.md` em smartphone, tablet e
desktop. Nao ha suite automatizada especifica desta feature no momento.

**Target Platform**: Frontend web oficial do Amani ERP, responsivo para smartphone,
tablet e desktop.

**Project Type**: Web application frontend dentro de `frontend/`, consumindo API
ASP.NET Core existente.

**Performance Goals**: Fluxo deve permanecer responsivo para ate 10 itens de
inventario inicial e ate 10 contas a receber iniciais, conforme criterios de
sucesso da spec. Listas de apoio de produtos e clientes devem ser carregadas uma
vez via queries existentes e reutilizadas no preenchimento.

**Constraints**: Dark Only, Mobile First, sem dados mockados, sem regra critica de
negocio no frontend, sem recalcule de custo medio/saldo/lucro/metricas, sem
reabertura, sem edicao em massa, sem importacao de planilha. Etapa concluida fica
bloqueada para novo envio no escopo da sessao/tela atual; rejeicoes definitivas e
duplicidades oficiais em novo carregamento permanecem responsabilidade do backend.

**Scale/Scope**: Uma area de implantacao acessivel a partir de Configuracoes,
preferencialmente em `/configuracoes/implantacao`, com componentes em
`frontend/src/components/implantacao/`, service/hook/types dedicados, extensao de
rotas/navegacao e reuso dos hooks de produtos/clientes.

## API Contract Findings

### Estado atual

- `ImplantacaoController` expoe:
  - `POST /api/implantacao/inventario-inicial`
  - `POST /api/implantacao/saldo-inicial-caixa`
  - `POST /api/implantacao/contas-receber-iniciais`
- Inventario inicial ja registra movimentacoes de estoque do tipo
  `InventarioInicial`.
- Saldo inicial de caixa registra evento financeiro.
- Conta a receber inicial registra um recebivel por chamada.
- Produtos e clientes ja possuem listagem oficial no frontend e podem ser
  reutilizados como referencias de preenchimento.
- O endpoint de contas a receber iniciais e unitario; a UX de lote da etapa deve
  validar todos os itens antes e enviar sequencialmente. Se algum item falhar, a
  etapa nao deve ser marcada como concluida na interface. Essa regra e de
  conclusao visual/operacional da etapa, nao uma garantia de atomicidade
  transacional no backend atual.
- Nao existe endpoint de status de implantacao. O estado concluido/bloqueado da
  etapa no frontend e um feedback operacional local apos sucesso; ao reabrir a
  tela, eventuais duplicidades devem ser tratadas pela rejeicao oficial do
  backend.

### Contrato planejado no frontend

- `implantationService.registerInitialInventory(payload)`.
- `implantationService.registerInitialCashBalance(payload)`.
- `implantationService.registerInitialReceivable(payload)`.
- Hooks de mutation para cada etapa, com invalidadas de caches afetados quando
  aplicavel:
  - inventario inicial: invalidar produtos/estoque futuro quando existir;
  - saldo inicial: invalidar financeiro/dashboard futuro quando existir;
  - contas a receber iniciais: invalidar clientes/financeiro futuro quando existir.
- Para a etapa de contas a receber em lote, o hook/componente deve validar todos
  os registros locais antes de iniciar envios. Se qualquer chamada falhar, a etapa
  permanece com erro/pendente e nenhum item individual e exibido como concluido na
  interface.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. A feature fica no frontend e consome
  API existente; nenhuma regra de negocio e movida para componentes.
- **Estoque por movimentacoes**: PASS. Inventario inicial e enviado para o backend
  como origem rastreavel; nenhum saldo fixo e criado no frontend.
- **Compras e mercadorias em transito**: PASS. A feature nao registra compras,
  recebimentos de compra ou mercadorias em transito.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature nao registra perdas,
  extravios ou avarias; inventario inicial segue fluxo proprio ja existente.
- **Vendas, custo medio e inventario inicial**: PASS. Inventario inicial permanece
  entrada real definida pelo backend; frontend nao calcula custo medio nem valida
  vendas.
- **Contratos de API e DTOs**: PASS. O frontend usara tipos explicitos alinhados
  aos DTOs existentes; entidades internas nao sao expostas.
- **Persistencia e mapeamentos**: PASS (N/A direto). Sem schema, migration,
  Fluent API ou repository novo.
- **Backend como fonte das regras**: PASS. Validacoes definitivas, rejeicoes,
  registros e calculos permanecem no backend; frontend faz validacao basica.
- **Analytics e escalabilidade**: PASS. Nao ha dashboards, rankings, metricas ou
  consultas agregadas nesta feature.
- **Mobile First**: PASS. O fluxo sera planejado e validado em smartphone, tablet
  e desktop.
- **Experiencia operacional**: PASS. Etapas independentes, revisao antes de envio,
  progresso parcial e bloqueio apos sucesso reduzem erro operacional.
- **Priorizacao do produto**: PASS. Entrega passo zero operacional antes de
  analytics, importacao de planilha e recursos avancados.
- **Identidade visual**: PASS. Feature segue Design System oficial e Dark Only.
- **Simplicidade antes de sofisticacao**: PASS. Reuso de App Router, React Query,
  componentes locais e services existentes; sem dependencia nova.

## Project Structure

### Documentation (this feature)

```text
specs/010-implantacao-inicial/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- implantacao-frontend.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
`-- src/
    |-- app/
    |   `-- configuracoes/
    |       |-- page.tsx
    |       `-- implantacao/
    |           `-- page.tsx
    |-- components/
    |   `-- implantacao/
    |       |-- implantation-flow.tsx
    |       |-- implantation-progress.tsx
    |       |-- initial-inventory-step.tsx
    |       |-- initial-cash-step.tsx
    |       |-- initial-receivables-step.tsx
    |       |-- implantation-review-dialog.tsx
    |       `-- implantation-result-summary.tsx
    |-- config/
    |   |-- navigation.ts
    |   `-- routes.ts
    |-- hooks/
    |   `-- use-implantation.ts
    |-- services/
    |   `-- implantation.ts
    `-- types/
        `-- implantation.ts

src/
`-- Amani.ImportadosERP.Api/
    `-- Controllers/
        `-- ImplantacaoController.cs   # existente; sem alteracao planejada
```

**Structure Decision**: Implementar somente no frontend, como subarea de
Configuracoes, usando componentes especificos de Implantacao e reusando services,
hooks e componentes comuns ja existentes. Nao criar backend, migration, novos
repositories nem dependencia de graficos/importacao.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisoes tecnicas foram resolvidas sem
marcadores pendentes de esclarecimento.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- Frontend/API contract: [contracts/implantacao-frontend.md](./contracts/implantacao-frontend.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. O design limita o frontend a
  apresentacao, navegacao, estado temporario, chamadas ao service e validacao de
  formulario.
- **Estoque por movimentacoes**: PASS. O contrato de inventario inicial usa o
  endpoint existente que cria movimentacoes; nenhum saldo fixo e proposto.
- **Compras e mercadorias em transito**: PASS. Compras permanecem fora do escopo.
- **Recebimentos, perdas e rastreabilidade**: PASS. Sem fluxo de recebimento de
  compra, perda, extravio ou avaria.
- **Vendas, custo medio e inventario inicial**: PASS. O frontend informa dados de
  inventario inicial e nao calcula custo medio, lucro ou saldo.
- **Contratos de API e DTOs**: PASS. Contrato documentado mapeia payloads e
  respostas existentes de forma explicita.
- **Persistencia e mapeamentos**: PASS. Sem alteracoes de persistencia/backend.
- **Backend como fonte das regras**: PASS. O design trata erros do backend como
  fonte oficial e nao replica regras criticas.
- **Analytics e escalabilidade**: PASS. Sem indicadores, rankings ou dashboards.
- **Mobile First**: PASS. Quickstart exige validacao em 390px, tablet e desktop.
- **Experiencia operacional**: PASS. O design inclui revisao, progresso, estados
  por etapa e bloqueio apos sucesso.
- **Priorizacao do produto**: PASS. Foco no passo zero operacional do MVP.
- **Identidade visual**: PASS. Dark Only e Design System existente permanecem
  obrigatorios.
- **Simplicidade antes de sofisticacao**: PASS. Sem dependencias novas; fluxo
  dividido em componentes de etapa claros.

## Validation and Regression Scope

- Configuracoes deixa de ser apenas placeholder e oferece acesso a Implantacao
  Inicial.
- Implantacao carrega produtos e clientes reais; nunca usa mocks.
- Inventario inicial permite montar lote local, revisar e enviar.
- Inventario inicial rejeita item sem produto, quantidade invalida, valor negativo
  ou produto duplicado antes do envio quando possivel.
- Saldo inicial de caixa permite revisar e registrar valor/data/origem/descricao.
- Contas a receber iniciais permitem montar lote local, revisar e enviar chamadas
  unitarias de forma controlada.
- Etapa concluida fica bloqueada para novo envio na sessao/tela atual.
- Falha em item de lote nao marca a etapa como concluida na interface.
- Estados de loading, vazio, erro, sucesso e pendente aparecem quando aplicavel.
- Nenhum calculo de custo medio, saldo, lucro, metrica ou ranking ocorre no
  frontend.
- Nenhuma importacao de planilha, reabertura ou edicao em massa aparece.
- Telas funcionam sem sobreposicao em smartphone, tablet e desktop.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explicitas para:

- criar `types/implantation.ts` com payloads, responses, estados de etapa e itens
  locais;
- criar `services/implantation.ts` com os tres endpoints de implantacao;
- criar `hooks/use-implantation.ts` com mutations por etapa e orquestracao de
  lote para contas a receber;
- adicionar rota `routes.configuracoesImplantacao`;
- criar rota `/configuracoes/implantacao`;
- atualizar `/configuracoes` para expor acesso ao fluxo;
- criar componentes de progresso, etapas, revisao e resumo;
- reutilizar `useProducts` e `useCustomers` para listas de apoio;
- validar bloqueio local de etapa concluida e tudo-ou-nada visual por etapa;
- validar Mobile First, Dark Only e ausencia de calculos gerenciais;
- executar lint, typecheck e build.

## Complexity Tracking

No constitution violations.
