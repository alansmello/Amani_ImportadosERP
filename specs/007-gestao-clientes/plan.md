# Implementation Plan: Gestao de Clientes no Frontend

**Branch**: `007-gestao-clientes` | **Date**: 2026-06-11 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-gestao-clientes/spec.md`

## Summary

Transformar a rota de Clientes do frontend Amani ERP em um modulo operacional real para listar, buscar, consultar, cadastrar, editar e inativar clientes usando os contratos existentes do backend. A implementacao permanece no projeto `frontend/`, segue o padrao Mobile First e Dark Only da base, replica a arquitetura da Feature 006 de Produtos e adiciona somente a camada especifica de clientes, incluindo filtro por status ativo/inativo e confirmacao de inativacao segura.

O escopo nao inclui remocao definitiva, historico de vendas, contas a receber por cliente, saldo financeiro, limite de credito, rankings, dashboards, autenticacao, autorizacao, importacao/exportacao ou calculos gerenciais no frontend.

## Technical Context

**Language/Version**: TypeScript com React e Next.js App Router no projeto `frontend/`; versoes atuais do projeto: Next.js 15, React 19 e TypeScript 5.7.

**Primary Dependencies**: Next.js App Router, TypeScript, Tailwind CSS, componentes Shadcn/UI locais, TanStack Query, Lucide React e `fetch` encapsulado por `frontend/src/services/api-client.ts`. Nenhuma nova dependencia e planejada.

**Storage**: N/A no frontend. Clientes permanecem persistidos pelo backend. O frontend mantem apenas estado de tela, formulario, filtro de status, termo de busca e cache de consulta em memoria.

**Testing**: Validacao obrigatoria por `npm run lint`, `npm run typecheck` e `npm run build` dentro de `frontend/`; validacao manual responsiva em smartphone, tablet e desktop; validacao manual contra API real ou ambiente local equivalente.

**Target Platform**: Web responsiva em navegadores modernos para smartphone, tablet e desktop.

**Project Type**: Frontend web application separado do backend .NET existente.

**Performance Goals**: A lista deve renderizar estado inicial imediatamente, exibir loading durante chamadas de rede e permitir busca local sobre clientes carregados sem nova chamada enquanto a API nao oferecer busca oficial. Alternancia entre ativos, inativos e todos deve refazer a consulta com filtro suportado pela fonte oficial e manter estados claros.

**Constraints**: Dark Only; Mobile First; sem dados mockados; sem regra critica de negocio no frontend; sem historico comercial, contas a receber, metricas, rankings, dashboards ou calculos financeiros no frontend; sem remocao definitiva de cliente; inativacao apenas mediante confirmacao explicita.

**Scale/Scope**: Um modulo operacional com quatro rotas principais (`/clientes`, `/clientes/novo`, `/clientes/[id]`, `/clientes/[id]/editar`), services/hooks de cliente e componentes reutilizaveis de cliente seguindo o padrao de Produtos, com acao adicional de inativacao segura.

## API Contract Findings

### Clientes

- `GET /api/clientes?ativo=true`: retorna clientes ativos.
- `GET /api/clientes?ativo=false`: retorna clientes inativos.
- `GET /api/clientes`: retorna clientes sem filtro de status.
- `GET /api/clientes/{id}`: retorna cliente por identificador ou `404`.
- `POST /api/clientes`: cria cliente e retorna o cliente criado.
- `PUT /api/clientes/{id}`: atualiza cliente e retorna `204`.
- `POST /api/clientes/{id}/inativar`: inativa cliente e retorna `204`.
- Nao existe endpoint de remocao definitiva de cliente.
- Campos reais de cliente: `id`, `nome`, `email`, `telefone`, `ativo`.
- Campos reais de criacao/edicao: `nome`, `email`, `telefone`.

## Routes

```text
frontend/src/app/clientes/page.tsx
frontend/src/app/clientes/novo/page.tsx
frontend/src/app/clientes/[id]/page.tsx
frontend/src/app/clientes/[id]/editar/page.tsx
```

- `/clientes`: pagina principal com titulo, descricao, botao "Novo Cliente", filtro de status, busca simples, tabela/lista responsiva, estados de loading/erro/vazio e acoes "Detalhes", "Editar" e "Inativar" somente para clientes ativos.
- `/clientes/novo`: formulario de cadastro com nome obrigatorio, email opcional e telefone opcional.
- `/clientes/[id]`: consulta de cliente por ID, exibindo apenas dados do contrato real e status ativo/inativo, com link para edicao e acao de inativacao quando aplicavel.
- `/clientes/[id]/editar`: formulario de edicao com dados atuais carregados por ID e os mesmos campos aceitos no cadastro.

## Component Plan

```text
frontend/src/components/clientes/
|-- customer-actions.tsx
|-- customer-details.tsx
|-- customer-form.tsx
|-- customer-form-fields.tsx
|-- customer-inactivate-dialog.tsx
`-- customer-table.tsx
```

- `customer-table.tsx`: tabela responsiva no desktop/tablet e cards legiveis em telas pequenas, exibindo nome, email, telefone, status e acoes por cliente.
- `customer-form.tsx`: composicao cliente para cadastro/edicao, recebe modo (`create` ou `edit`), dados iniciais quando houver e callback de submit.
- `customer-form-fields.tsx`: campos controlados de nome, email e telefone, validacao visual basica e mensagens de erro.
- `customer-details.tsx`: exibicao dos dados principais e status, sem historico comercial, financeiro ou metricas.
- `customer-actions.tsx`: acoes compartilhadas para detalhes, edicao e inativacao quando cliente estiver ativo.
- `customer-inactivate-dialog.tsx`: confirmacao explicita antes de inativar cliente, usando componente de dialog local existente ou padrao Shadcn ja disponivel no projeto.

Reusar `PageHeader`, `LoadingState`, `ErrorState`, `EmptyState`, `Button`, `Input`, `Badge`, `Table`, `Card` e Dialog local quando disponivel. Nao aninhar cards e nao introduzir nova biblioteca de formulario ou modal.

## API Services and Hooks

```text
frontend/src/services/customers.ts
frontend/src/hooks/use-customers.ts
frontend/src/types/customer.ts
```

### Services

- `customersService.list(filter?)`: `GET /api/clientes` com query opcional `ativo=true|false`.
- `customersService.getById(id)`: `GET /api/clientes/{id}`.
- `customersService.create(payload)`: `POST /api/clientes`.
- `customersService.update(id, payload)`: `PUT /api/clientes/{id}`.
- `customersService.inactivate(id)`: `POST /api/clientes/{id}/inativar`.

### Query Hooks

- `useCustomers(statusFilter)`: lista clientes por status e alimenta `/clientes`.
- `useCustomer(id)`: carrega detalhe/edicao.
- `useCreateCustomer()`: mutation de cadastro; invalida lista de clientes ao concluir.
- `useUpdateCustomer()`: mutation de edicao; invalida lista e detalhe do cliente ao concluir.
- `useInactivateCustomer()`: mutation de inativacao; invalida listas de clientes e detalhe do cliente ao concluir.

Chaves devem estender `queryKeys.clientes`, por exemplo `["clientes", "list", statusFilter]` e `["clientes", "detail", id]`.

## Form Strategy

- Formularios usam estado local controlado com TypeScript, seguindo a Feature 006.
- Validacao visual basica no cliente:
  - `nome`: obrigatorio, trim antes de enviar.
  - `email`: opcional; quando informado, validar formato basico.
  - `telefone`: opcional; trim antes de enviar; nao mascarar de forma que altere dado sem clareza.
- Enviar campos opcionais vazios como `null` ou string vazia conforme contrato TypeScript escolhido, preservando compatibilidade com DTOs atuais (`string?` no backend).
- Validacoes operacionais continuam no backend. Mensagens de rejeicao da API devem ser exibidas no formulario sem transformar o frontend em fonte de verdade.
- O formulario de edicao deve bloquear submit enquanto o cliente atual ainda carrega.

## UI State Strategy

- **Loading**: usar `LoadingState` para lista/detalhe e estado de envio nos botoes de formulario/inativacao.
- **Empty**: usar `EmptyState` quando nao houver clientes no filtro selecionado, quando a busca nao encontrar resultado, ou quando o cliente nao existir.
- **Error**: usar `ErrorState` com acao de tentar novamente quando a query permitir `refetch`.
- **Success**: usar mensagem inline ou feedback equivalente apos cadastro/edicao/inativacao, seguido de navegacao para lista ou detalhe.
- **Search**: busca simples local sobre clientes carregados por `nome`, `email` e `telefone`.
- **Status filter**: padrao `ativo`; opcoes `ativos`, `inativos` e `todos`, refletidas na chamada de listagem.
- **Inactivation**: acao visivel somente para cliente ativo; requer dialog de confirmacao; apos sucesso, invalidar cache e direcionar o usuario para contexto em que o status atualizado seja claro.
- **Responsive**: manter botoes com alvo de toque adequado, evitar texto sobreposto e permitir scroll horizontal controlado na tabela se necessario.

## Implementation Strategy

1. Adicionar tipos frontend para cliente, payload de cliente e filtro de status conforme DTOs atuais.
2. Criar service de clientes usando `apiClient`.
3. Criar hooks TanStack Query para listagem filtrada, detalhe, cadastro, edicao e inativacao.
4. Criar componentes reutilizaveis de clientes espelhando Produtos.
5. Substituir o placeholder de `/clientes` por listagem real, busca, filtro de status e estados.
6. Criar `/clientes/novo` com formulario de cadastro.
7. Criar `/clientes/[id]` com consulta por ID, estados de loading/erro/nao encontrado, link para edicao e inativacao quando ativo.
8. Criar `/clientes/[id]/editar` com carregamento do cliente existente e formulario preenchido.
9. Garantir que nenhuma remocao definitiva seja renderizada.
10. Validar responsividade e executar `npm run lint`, `npm run typecheck` e `npm run build` em `frontend/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. O trabalho fica no frontend e consome controllers existentes; nenhuma regra e movida para controllers ou UI.
- **Estoque por movimentacoes**: PASS. A feature nao le, calcula ou exibe saldo de estoque.
- **Compras e mercadorias em transito**: PASS. A feature nao altera compras, recebimentos ou mercadorias em transito.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature nao cria recebimentos, perdas ou eventos de estoque.
- **Vendas, custo medio e inventario inicial**: PASS. A feature nao implementa vendas, custo medio, lucro ou inventario inicial.
- **Contratos de API e DTOs**: PASS. O frontend usa DTOs reais como contratos tipados e nao expoe entidades de dominio.
- **Persistencia e mapeamentos**: PASS. Sem persistencia frontend, migrations ou mapeamentos de banco.
- **Backend como fonte das regras**: PASS. O frontend apenas coleta dados, envia payloads e apresenta respostas; validacoes operacionais seguem no backend.
- **Analytics e escalabilidade**: PASS. Sem dashboards, rankings, indicadores ou leitura de historico operacional.
- **Mobile First**: PASS. Rotas e componentes serao planejados e validados em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos priorizam listagem, busca, detalhe, formulario direto e inativacao confirmada com poucos passos.
- **Priorizacao do produto**: PASS. Entrega modulo operacional real de clientes antes de analytics, integracoes e recursos avancados.
- **Identidade visual**: PASS. Reusa Design System da Feature 005, Dark Only e componentes existentes.
- **Simplicidade antes de sofisticacao**: PASS. Sem novas dependencias; uso de estado local para formulario e dialog local para confirmacao.

## Project Structure

### Documentation (this feature)

```text
specs/007-gestao-clientes/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- customer-management-contract.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
|-- src/
|   |-- app/
|   |   `-- clientes/
|   |       |-- page.tsx
|   |       |-- novo/
|   |       |   `-- page.tsx
|   |       `-- [id]/
|   |           |-- page.tsx
|   |           `-- editar/
|   |               `-- page.tsx
|   |-- components/
|   |   `-- clientes/
|   |       |-- customer-actions.tsx
|   |       |-- customer-details.tsx
|   |       |-- customer-form.tsx
|   |       |-- customer-form-fields.tsx
|   |       |-- customer-inactivate-dialog.tsx
|   |       `-- customer-table.tsx
|   |-- hooks/
|   |   `-- use-customers.ts
|   |-- services/
|   |   `-- customers.ts
|   `-- types/
|       `-- customer.ts
```

**Structure Decision**: Manter a estrutura do frontend criada na Feature 005 e o desenho operacional validado na Feature 006. Rotas ficam em `frontend/src/app/clientes`, componentes especificos em `frontend/src/components/clientes`, chamadas HTTP em `frontend/src/services`, hooks de dados em `frontend/src/hooks` e contratos frontend em `frontend/src/types`.

## Risks and Dependencies

- **Inativacao existe, remocao definitiva nao**: a UI deve expor somente inativacao confirmada e nunca delete definitivo.
- **Clientes inativos em fluxos futuros**: vendas/financeiro futuros devem decidir como tratar cliente inativo; esta feature apenas mostra e altera status.
- **Sem paginacao/busca oficial**: `GET /api/clientes` retorna lista filtrada por status. A busca sera local sobre dados carregados; paginacao fica como dependencia futura se o volume crescer.
- **Sem documento no contrato atual**: a UI nao deve criar campos de CPF/CNPJ/documento antes do backend suportar o contrato.
- **Mensagens de erro do api-client**: o client atual normaliza erro HTTP com mensagem generica. A implementacao pode melhorar a leitura de `{ error }` sem alterar regra de negocio.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/customer-management-contract.md](./contracts/customer-management-contract.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Artefatos mantem apenas frontend, services tipados e consumo de contratos existentes.
- **Estoque por movimentacoes**: PASS. Data model e contratos nao incluem saldo de estoque.
- **Compras e mercadorias em transito**: PASS. Nenhum fluxo de compra/recebimento e planejado.
- **Recebimentos, perdas e rastreabilidade**: PASS. Sem eventos operacionais de estoque.
- **Vendas, custo medio e inventario inicial**: PASS. Nenhum calculo de vendas, custo medio, lucro ou inventario.
- **Contratos de API e DTOs**: PASS. Contrato documenta DTOs reais, filtro de status e ausencia de delete definitivo.
- **Persistencia e mapeamentos**: PASS. Sem persistencia frontend ou alteracao de banco.
- **Backend como fonte das regras**: PASS. Quickstart valida ausencia de calculos e dependencia do backend para validacoes.
- **Analytics e escalabilidade**: PASS. Sem dashboard/analytics; risco de paginacao documentado como dependencia futura.
- **Mobile First**: PASS. Quickstart exige validacao em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos diretos de lista, busca, filtro, detalhe, cadastro, edicao e inativacao.
- **Priorizacao do produto**: PASS. Entrega modulo operacional real de clientes.
- **Identidade visual**: PASS. Design preserva Dark Only e componentes da base.
- **Simplicidade antes de sofisticacao**: PASS. Sem novas dependencias; uso de estado local e componentes existentes.

## Complexity Tracking

No constitution violations.
