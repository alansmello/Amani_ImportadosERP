# Implementation Plan: Financeiro Contas a Receber Frontend

**Branch**: `014-financeiro-contas-receber` | **Date**: 2026-06-22 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-financeiro-contas-receber/spec.md`

## Summary

Substituir o placeholder de Financeiro por um módulo operacional de Contas a
Receber: listar com filtros (status + cliente), criar manualmente, registrar
pagamento via modal, editar, excluir e visualizar recebíveis agrupados por
cliente com detalhe por conta. A feature inclui duas extensões de backend —
suporte a criação manual com `ClienteId` e enriquecimento do detalhe por cliente
com `Status` e lista de pagamentos — e não toca nenhuma outra entidade nem
migration.

## Technical Context

**Language/Version**: TypeScript 5.7 com React 19 e Next.js 15 no frontend;
backend existente em .NET 8 como API consumida, com extensões pontuais de
contrato.

**Primary Dependencies**: Next.js App Router, React, TanStack React Query,
lucide-react, componentes UI locais, `apiClient`, `queryKeys.financeiro`,
services/hooks de Clientes para seleção no formulário. Nenhuma dependência nova
planejada.

**Storage**: N/A no frontend. Persistência no backend PostgreSQL via endpoints
oficiais de `ContasReceberController`. Estado local temporário guarda filtros,
modal de pagamento aberto e rascunho do formulário de criação/edição.

**Testing**: `npm run lint`, `npm run typecheck`, `npm run build` em
`frontend/`. Validação operacional pelos cenários de `quickstart.md` em
smartphone, tablet e desktop. Sem suite automatizada específica desta feature.

**Target Platform**: Frontend web oficial do Amani ERP, responsivo para
smartphone, tablet e desktop.

**Project Type**: Web application frontend dentro de `frontend/`, consumindo API
ASP.NET Core existente, com extensões pontuais no backend sem migration.

**Performance Goals**: Cumprir os critérios da spec: criar conta em até 2
minutos; registrar pagamento em até 1 minuto; localizar contas de um cliente em
até 30 segundos. Lista deve permanecer interativa durante filtro por status e
busca por cliente.

**Constraints**: Dark Only, Mobile First, sem dados mockados, sem cálculo local
de saldo/status/juros, sem contas a pagar, sem conciliação bancária, sem
migration, sem dependência nova. Status exibido exclusivamente como campo
retornado pela fonte oficial ("Pago" | "Pendente").

**Scale/Scope**: Módulo financeiro em `/financeiro/contas-receber` substituindo
o placeholder de `/financeiro`. Inclui lista, criação, edição, modal de
pagamento, visão por cliente e detalhe por cliente. Validação manual em lista
com pelo menos 30 contas a receber.

## API Contract Findings

### Estado atual do backend

- `GET /api/contas-receber` retorna `ContaReceberListDto[]` com `Id`, `VendaId`,
  `ClienteId`, `Origem`, `ValorTotal`, `TotalPago`, `Saldo`, `Status` ("Pago" |
  "Pendente") e `DataVencimento`. Status é calculado no handler como
  `saldo <= 0 ? "Pago" : "Pendente"`.
- `GET /api/contas-receber/por-cliente` retorna `ContaReceberPorClienteDto[]`
  com `ClienteId`, `NomeCliente`, `TotalAReceber`. Apenas contas com `Saldo > 0`.
- `GET /api/contas-receber/cliente/{clienteId}` retorna
  `ContaReceberDetalheDto[]` com `ContaId`, `VendaId`, `ClienteId`, `Origem`,
  `ValorTotal`, `TotalPago`, `Saldo`, `DataVencimento`. Apenas contas em aberto.
  **Sem `Status` e sem lista de pagamentos individuais.**
- `POST /api/contas-receber` recebe `CriarContaReceberCommand` com `VendaId`,
  `Valor` e `DataVencimento`. **Não aceita `ClienteId`** — criação manual com
  cliente direto não é suportada hoje.
- `POST /api/contas-receber/{id}/pagamentos` recebe `{ Valor }` e retorna 200.
- `PUT /api/contas-receber/{id}` recebe `{ Valor, DataVencimento }` e retorna 200.
- `DELETE /api/contas-receber/{id}` retorna 200 quando aceito.

### Extensões de backend necessárias (sem migration)

Duas extensões são necessárias para o escopo F014 — ambas operam sobre as
entidades e tabelas existentes, sem nova migration:

**Extensão B1 — Criação manual com ClienteId**:

- Ampliar `CriarContaReceberCommand` com campo opcional `ClienteId` (Guid?).
- Adicionar construtor manual à entidade `ContaReceber`:
  `ContaReceber(Guid clienteId, decimal valor, DateTime dataVencimento)` com
  `Origem = "Manual"`.
- Atualizar `CriarContaReceberCommandHandler` para selecionar o construtor
  correto conforme `ClienteId` ou `VendaId` informado.
- O controller já trata UTC, sem alteração necessária nesse ponto.

**Extensão B2 — Detalhe por cliente enriquecido**:

- Criar `PagamentoDetalheDto` com `Id` (Guid), `Valor` (decimal) e
  `DataPagamento` (DateTime).
- Adicionar `Status` (string) e `List<PagamentoDetalheDto> Pagamentos` ao
  `ContaReceberDetalheDto`.
- Atualizar `ObterEmAbertoDetalhePorClienteAsync` no repositório para incluir os
  pagamentos e calcular o Status ao montar o DTO, seguindo o mesmo padrão do
  `ObterListaContasReceberQueryHandler` (`saldo <= 0 ? "Pago" : "Pendente"`).
- A entidade `PagamentoRecebido` já carrega `Pagamentos` via EF Include no
  repositório; apenas o mapeamento para DTO precisa ser adicionado.

### Contrato planejado no frontend

- `receivablesService.list()` — GET /api/contas-receber → `ReceivableListItem[]`
- `receivablesService.listByClient()` — GET /api/contas-receber/por-cliente →
  `ReceivablesByClient[]`
- `receivablesService.getClientDetail(clienteId)` — GET /api/contas-receber/cliente/{id} →
  `ReceivableClientDetail[]`
- `receivablesService.create(payload)` — POST /api/contas-receber → `{ id }`
- `receivablesService.registerPayment(id, valor)` — POST /{id}/pagamentos → void
- `receivablesService.update(id, payload)` — PUT /{id} → void
- `receivablesService.delete(id)` — DELETE /{id} → void
- `useReceivables.ts` compõe chaves a partir de `queryKeys.financeiro`,
  invalidando a lista e a visão por cliente após mutações.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. Frontend consome APIs existentes;
  extensões de backend ficam nos handlers e repositório, sem regra de negócio
  no controller.
- **Estoque por movimentações**: PASS. A feature não toca estoque; nenhum campo
  fixo de saldo é introduzido.
- **Compras e mercadorias em trânsito**: PASS. A feature não altera compras nem
  recebimentos.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature não registra
  recebimento de compra nem perda; rastreabilidade de pagamentos de contas
  permanece no backend.
- **Vendas, custo médio e inventário inicial**: PASS. A feature não altera
  vendas; link para venda via `VendaId` é somente leitura.
- **Contratos de API e DTOs**: PASS. Extensões usam DTOs explícitos
  (`PagamentoDetalheDto`); entidades internas não são expostas.
- **Persistência e mapeamentos**: PASS. Sem migration; extensões B1/B2 operam
  sobre tabelas existentes; mapeamentos Fluent API permanecem inalterados.
- **Backend como fonte das regras**: PASS. Status, saldo, pagamentos e validações
  financeiras são calculados e retornados pelo backend; o frontend exibe apenas.
- **Analytics e escalabilidade**: PASS. Sem dashboard ou métrica local; filtros
  são aplicados sobre conjunto carregado (escopo esperado: dezenas de contas).
- **Mobile First**: PASS. Lista, modal de pagamento, formulário, visão por
  cliente e detalhe serão planejados e validados em smartphone, tablet e desktop.
- **Experiência operacional**: PASS. Registrar pagamento via modal elimina
  navegação desnecessária; filtro por status e busca por cliente na lista
  reduzem interações para localizar contas.
- **Priorização do produto**: PASS. Entrega controle financeiro de recebíveis
  operacional antes de analytics, conciliação ou juros automáticos.
- **Identidade visual**: PASS. Reuso do Design System oficial e Dark Theme.
- **Simplicidade antes de sofisticação**: PASS. Extensões B1/B2 são mínimas;
  sem dependência nova; padrão service/hook/type do projeto reutilizado.

## Project Structure

### Documentation (this feature)

```text
specs/014-financeiro-contas-receber/
├── plan.md              ← este arquivo
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── receivables-frontend.md
├── checklists/
│   └── requirements.md
└── spec.md
```

### Source Code (repository root)

```text
# Backend (extensões sem migration)
src/Amani.ImportadosERP.Application/
├── Commands/
│   └── CriarContaReceberCommand.cs          ← adicionar ClienteId opcional
├── Commands/Handlers/
│   └── CriarContaReceberCommandHandler.cs   ← suporte a criação manual
├── DTOs/
│   ├── ContaReceberDetalheDto.cs            ← adicionar Status + Pagamentos
│   └── PagamentoDetalheDto.cs               ← novo DTO
src/Amani.ImportadosERP.Application/
└── Interfaces/
    └── IContaReceberRepository.cs           ← assinatura já existe; sem mudança

src/Amani.ImportadosERP.Infra.Data/Repositories/
└── ContaReceberRepository.cs                ← enriquecer ObterEmAbertoDetalhePorClienteAsync

# Frontend (novos arquivos)
frontend/src/
├── app/
│   └── financeiro/
│       ├── page.tsx                         ← substituir placeholder por redirect
│       └── contas-receber/
│           ├── page.tsx                     ← lista + visão por cliente (tabs)
│           ├── nova/
│           │   └── page.tsx                 ← formulário de criação
│           ├── [id]/
│           │   └── editar/
│           │       └── page.tsx             ← formulário de edição
│           └── cliente/
│               └── [clienteId]/
│                   └── page.tsx             ← detalhe por cliente
├── components/
│   └── financeiro/
│       ├── receivables-list.tsx
│       ├── receivables-filters.tsx
│       ├── receivables-by-client.tsx
│       ├── receivable-client-detail.tsx
│       ├── receivable-form.tsx
│       ├── receivable-payment-modal.tsx
│       ├── delete-receivable-dialog.tsx
│       └── receivable-formatters.ts
├── config/
│   └── routes.ts                            ← adicionar rotas de contas a receber
├── hooks/
│   └── use-receivables.ts
├── services/
│   └── receivables.ts
└── types/
    └── receivable.ts
```

**Structure Decision**: Frontend segue padrão modular de Compras/Vendas/Estoque.
Backend recebe extensões mínimas nos handlers e repositório existentes, sem
alterar schema, migration ou contrato Fluent API.

## Phase 0 Research Summary

Ver [research.md](./research.md). Todas as decisões técnicas foram resolvidas
sem marcadores pendentes de esclarecimento.

## Phase 1 Design Summary

- Data model: [data-model.md](./data-model.md)
- Frontend/API contract: [contracts/receivables-frontend.md](./contracts/receivables-frontend.md)
- Validation guide: [quickstart.md](./quickstart.md)

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Componentes limitados a
  apresentação, navegação, validação de formulário, cache e chamadas a services.
  Extensões de backend ficam na camada Application/Infra.Data.
- **Estoque por movimentações**: PASS. Feature não toca estoque.
- **Compras e mercadorias em trânsito**: PASS. Sem impacto.
- **Recebimentos, perdas e rastreabilidade**: PASS. Pagamentos de contas não
  são movimentações de estoque; rastreabilidade fica no backend.
- **Vendas, custo médio e inventário inicial**: PASS. Link para venda é somente
  leitura; custo médio não é tocado.
- **Contratos de API e DTOs**: PASS. Tipos TypeScript espelham DTOs do backend;
  campos de `PagamentoDetalheDto` mapeados explicitamente.
- **Persistência e mapeamentos**: PASS. Sem migration; Fluent API inalterada.
- **Backend como fonte das regras**: PASS. Status, saldo e validação de valor
  permanecem no backend; o cliente não deriva nem recalcula nada.
- **Analytics e escalabilidade**: PASS. Filtros locais sobre conjunto limitado;
  sem agregações locais.
- **Mobile First**: PASS. Quickstart exige validação em 390px, tablet e desktop.
- **Experiência operacional**: PASS. Modal de pagamento e filtros minimizam
  interações para os fluxos mais frequentes.
- **Priorização do produto**: PASS. Entrega recebíveis operacionais antes de
  analytics e recursos pós-MVP.
- **Identidade visual**: PASS. Dark Only e Design System existente permanecem.
- **Simplicidade antes de sofisticação**: PASS. Sem dependências novas; padrão
  existente reutilizado; extensões B1/B2 são cirúrgicas.

## Validation and Regression Scope

- `/financeiro` redireciona para `/financeiro/contas-receber` ou exibe link
  direto para a área.
- `/financeiro/contas-receber` mostra lista com Status, ValorTotal, TotalPago,
  Saldo, Origem, DataVencimento e nome do cliente.
- Filtro por status ("Pendente"/"Pago") e busca por nome funcionam localmente.
- Quando `VendaId` não é nulo, exibe link navegável para `/vendas/[vendaId]`.
- Tab "Por Cliente" agrupa clientes com `TotalAReceber` e permite navegar ao
  detalhe de cada cliente.
- `/financeiro/contas-receber/nova` permite selecionar cliente, informar valor
  e data de vencimento; criação confirma com a fonte oficial.
- Modal de pagamento abre sobre a lista/detalhe, aceita valor positivo e fecha
  após confirmação oficial.
- `/financeiro/contas-receber/[id]/editar` permite alterar valor e vencimento.
- Exclusão exige diálogo de confirmação e remove da lista apenas após sucesso.
- `/financeiro/contas-receber/cliente/[clienteId]` mostra contas em aberto do
  cliente com Status, ValorTotal, TotalPago, Saldo, DataVencimento e lista de
  pagamentos individuais.
- Estados loading, erro e vazio aparecem em todos os fluxos.
- Telas funcionam sem sobreposição em smartphone, tablet e desktop.
- `npm run lint`, `npm run typecheck` e `npm run build` passam.

## Required Future Task Coverage

O `/speckit-tasks` deve gerar tarefas explícitas para:

- criar `PagamentoDetalheDto` e estender `ContaReceberDetalheDto` com `Status` e
  `List<PagamentoDetalheDto>`;
- ampliar `CriarContaReceberCommand` com `ClienteId` opcional e adicionar
  construtor manual na entidade `ContaReceber`;
- atualizar `CriarContaReceberCommandHandler` para escolher o construtor correto;
- atualizar `ObterEmAbertoDetalhePorClienteAsync` no repositório para incluir
  `Status` e pagamentos individuais no DTO;
- criar `types/receivable.ts` com todos os tipos de listagem, detalhe, por-
  cliente, pagamento, payloads e filtros;
- criar `services/receivables.ts` com list, listByClient, getClientDetail,
  create, registerPayment, update e delete;
- criar `hooks/use-receivables.ts` com queries/mutations e invalidação de
  `queryKeys.financeiro` após cada mutação;
- adicionar rotas de contas a receber em `routes.ts`;
- substituir `app/financeiro/page.tsx` placeholder;
- criar `app/financeiro/contas-receber/page.tsx` com tabs lista / por cliente;
- criar `app/financeiro/contas-receber/nova/page.tsx`;
- criar `app/financeiro/contas-receber/[id]/editar/page.tsx`;
- criar `app/financeiro/contas-receber/cliente/[clienteId]/page.tsx`;
- criar componentes: receivables-list, receivables-filters, receivables-by-
  client, receivable-client-detail, receivable-form, receivable-payment-modal,
  delete-receivable-dialog, receivable-formatters;
- reutilizar `useCustomers` para seleção de cliente no formulário;
- tratar erros operacionais do backend (valor inválido, conta não encontrada);
- validar Mobile First, Dark Only e ausência de dados mockados;
- executar lint, typecheck e build.

## Complexity Tracking

No constitution violations.
