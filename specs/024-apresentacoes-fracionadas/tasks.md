# Tasks: Apresentações Comerciais e Conversão Fracionada de Estoque

**Input**: Design documents from `/specs/024-apresentacoes-fracionadas/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md, impact-analysis.md

**Authorization**: implementação autorizada pelo responsável; tarefas de testes automatizados e criação de projeto de testes foram explicitamente removidas do escopo.

**Validation**: sem novo projeto ou tarefas de testes automatizados. A validação será feita por build, lint, typecheck, build do frontend e roteiros manuais documentados.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode executar em paralelo por atuar em arquivos distintos sem dependência incompleta.
- **[Story]**: vincula a tarefa à jornada do spec.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar validação, configuração de rollout e baselines sem habilitar a feature.

- [x] T001 OMITIDA por decisão explícita: não criar projeto xUnit nem infraestrutura de testes
- [x] T002 [P] Criar configuração de feature desligada por padrão em src/Amani.ImportadosERP.Api/appsettings.json e contrato de leitura em src/Amani.ImportadosERP.Application/Interfaces/IFeatureSettings.cs
- [x] T003 [P] Registrar consultas de baseline e conciliação pré-migration em artifacts/f024-stock-fraction-baseline.sql
- [x] T004 [P] Registrar checklist operacional de habilitação/desabilitação em docs/estoque/f024-rollout-runbook.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: implementar a representação racional, o schema expansivo e os contratos compartilhados que bloqueiam todas as histórias.

**⚠️ CRITICAL**: nenhuma user story pode começar antes da conclusão e revisão desta fase.

- [x] T005 [P] OMITIDA por decisão explícita: não criar testes automatizados de QuantidadeRacional
- [x] T006 Implementar o value object com operações verificadas e forma canônica em src/Amani.ImportadosERP.Domain/Common/QuantidadeRacional.cs
- [x] T007 [P] OMITIDA por decisão explícita: não criar testes automatizados de ProdutoApresentacao
- [x] T008 Implementar ProdutoApresentacao e relacionamento de domínio em src/Amani.ImportadosERP.Domain/Entities/ProdutoApresentacao.cs e src/Amani.ImportadosERP.Domain/Entities/Produto.cs
- [x] T009 [P] Estender snapshot imutável e cálculo exato em src/Amani.ImportadosERP.Domain/Entities/VendaItem.cs e integração de criação em src/Amani.ImportadosERP.Domain/Entities/Venda.cs
- [x] T010 [P] Estender quantidade decimal, razão exata e vínculo da linha em src/Amani.ImportadosERP.Domain/Entities/EstoqueMovimentacao.cs
- [x] T011 [P] Criar Fluent API da apresentação em src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ProdutoApresentacaoMapping.cs
- [x] T012 [P] Atualizar mappings de snapshot e razão em src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/VendaItemMapping.cs e src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EstoqueMovimentacaoMapping.cs
- [x] T013 Adicionar DbSet e relacionamentos em src/Amani.ImportadosERP.Infra.Data/Context/AmaniDbContext.cs
- [x] T014 Criar IProdutoApresentacaoRepository em src/Amani.ImportadosERP.Application/Interfaces/IProdutoApresentacaoRepository.cs e implementação em src/Amani.ImportadosERP.Infra.Data/Repositories/ProdutoApresentacaoRepository.cs
- [x] T015 Registrar repository e configurações da feature em src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs
- [x] T016 Gerar migration AddProdutoApresentacoesFracionadas em src/Amani.ImportadosERP.Infra.Data/Migrations/ com tabela/colunas nullable, checks, índices e cast inteiro→numeric sem DML histórico
- [x] T017 Atualizar e revisar o snapshot em src/Amani.ImportadosERP.Infra.Data/Migrations/AmaniDbContextModelSnapshot.cs, confirmando ausência de defaults/backfill em legado
- [x] T018 [P] Criar DTOs compartilhados de apresentação e snapshot em src/Amani.ImportadosERP.Application/DTOs/Produtos/ProdutoApresentacaoDto.cs e src/Amani.ImportadosERP.Application/DTOs/Vendas/VendaItemApresentacaoDto.cs
- [x] T019 [P] Alterar contratos de estoque e ranking de inteiro para decimal em src/Amani.ImportadosERP.Application/DTOs/Estoque/EstoqueProdutoSaldoDto.cs, src/Amani.ImportadosERP.Application/DTOs/Estoque/EstoqueMovimentacaoItemDto.cs e src/Amani.ImportadosERP.Application/DTOs/Dashboards/RankingProdutoDto.cs

**Checkpoint**: schema e contratos suportam razão exata e legado, mas a feature continua desligada.

---

## Phase 3: User Story 1 — Vender por apresentação comercial (Priority: P1) 🎯 MVP

**Goal**: confirmar venda em Caixa 1/1, Ampola 1/4 ou Dose 1/24 e gerar snapshot + movimentação exata.

**Independent Test**: vender 2 ampolas e conferir quantidade informada 2, razão 1/4, projeção 0,50 e saída exata 1/2.

- [x] T020 [P] [US1] OMITIDA por decisão explícita: não criar testes automatizados de criação de venda
- [x] T021 [P] [US1] Adicionar ProdutoApresentacaoId opcional e resposta de snapshot em src/Amani.ImportadosERP.Application/DTOs/CriarVendaItemDto.cs e src/Amani.ImportadosERP.Application/DTOs/Response/VendaItemResponseDto.cs
- [x] T022 [US1] Resolver a apresentação no backend, validar produto/ativo/permissão e criar snapshot em src/Amani.ImportadosERP.Application/Services/VendaService.cs
- [x] T023 [US1] Gerar EstoqueMovimentacao com projeção decimal, razão normalizada e VendaItemId na transação de src/Amani.ImportadosERP.Application/Services/VendaService.cs
- [x] T024 [US1] Mapear os novos campos explicitamente em src/Amani.ImportadosERP.Application/Mappers/VendaMapper.cs
- [x] T025 [P] [US1] Estender tipos e payload aditivos em frontend/src/types/sale.ts e frontend/src/services/sales.ts
- [x] T026 [US1] Integrar seleção obrigatória e preço sugerido da apresentação em frontend/src/components/vendas/sale-item-composer.tsx e frontend/src/components/vendas/sale-form.tsx
- [x] T027 [US1] Exibir apresentação, quantidade comercial e equivalente de estoque no resumo em frontend/src/components/vendas/sale-summary.tsx
- [x] T028 [US1] Validar mensagens e bloqueios locais sem substituir a validação oficial em frontend/src/components/vendas/sale-validation.ts

**Checkpoint**: nova venda por apresentação funciona ponta a ponta com feature controlada.

---

## Phase 4: User Story 2 — Preservar produtos e históricos legados (Priority: P1)

**Goal**: manter comportamento e resultados de produtos/movimentações sem apresentação.

**Independent Test**: aplicar migration sobre baseline e repetir compra, venda, saldo, custo e lucro de produto legado sem diferenças.

- [x] T029 [P] [US2] OMITIDA por decisão explícita: não criar testes automatizados de compatibilidade legada
- [x] T030 [US2] Implementar fallback racional exato para movimentações legadas em src/Amani.ImportadosERP.Application/Services/EstoqueQuantidadeService.cs
- [x] T031 [US2] Preservar fluxo legado quando o produto não possui apresentações em src/Amani.ImportadosERP.Application/Services/VendaService.cs
- [x] T032 [US2] Garantir respostas nullable e sem inferência retroativa em src/Amani.ImportadosERP.Application/Mappers/VendaMapper.cs e src/Amani.ImportadosERP.Application/Services/ProdutoService.cs
- [x] T033 [US2] Executar baseline/migration/conciliação e registrar evidências em docs/estoque/f024-migration-rehearsal.md usando artifacts/f024-stock-fraction-baseline.sql

**Checkpoint**: zero alteração funcional ou de dados para produto legado.

---

## Phase 5: User Story 3 — Validar saldo, custo e lucro pela quantidade convertida (Priority: P1)

**Goal**: usar razão exata em disponibilidade, concorrência, custo médio proporcional e lucro.

**Independent Test**: 24 vendas unitárias de 1/24 esgotam exatamente 1 caixa; a 25ª falha; custo acumulado é uma caixa.

- [x] T034 [P] [US3] OMITIDA por decisão explícita: não criar testes automatizados de estoque racional
- [x] T035 [P] [US3] OMITIDA por decisão explícita: não criar testes automatizados de custo/lucro
- [x] T036 [US3] Alterar IEstoqueConsultaRepository para resultado decimal + componentes exatos em src/Amani.ImportadosERP.Application/Interfaces/IEstoqueConsultaRepository.cs
- [x] T037 [US3] Implementar agregação por produto/tipo/denominador em src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs
- [x] T038 [US3] Somar e comparar agregados exatos sem materializar histórico em src/Amani.ImportadosERP.Application/Services/EstoqueQuantidadeService.cs
- [x] T039 [US3] Validar soma convertida por produto imediatamente antes da gravação em src/Amani.ImportadosERP.Application/Services/VendaService.cs
- [x] T040 [US3] Aplicar custo médio à razão exata em src/Amani.ImportadosERP.Application/Services/VendaService.cs e src/Amani.ImportadosERP.Application/Queries/Handlers/ObterListaVendasQueryHandler.cs
- [x] T041 [US3] Adaptar custo médio e projeções de entrada decimal, excluindo compensações vinculadas a VendaItemId, em src/Amani.ImportadosERP.Infra.Data/Repositories/CustoProdutoRepository.cs e src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardCustoMedioReadService.cs
- [x] T042 [US3] Garantir atomicidade/concorrência de venda e movimentações em src/Amani.ImportadosERP.Infra.Data/Repositories/VendaRepository.cs e src/Amani.ImportadosERP.Application/Services/VendaService.cs

**Checkpoint**: saldo, custo e lucro não dependem de aproximação decimal.

---

## Phase 6: User Story 4 — Manter a apresentação histórica da venda (Priority: P2)

**Goal**: preservar snapshot e cancelar pela mesma razão mesmo após alteração/desativação da apresentação.

**Independent Test**: vender em 1/24, alterar apresentação, cancelar e recuperar exatamente o saldo original mantendo o snapshot antigo.

- [x] T043 [P] [US4] OMITIDA por decisão explícita: não criar testes automatizados de cancelamento
- [x] T044 [US4] Reverter estoque pela razão/projeção originais, vincular VendaItemId e não gravar preço de venda como custo em src/Amani.ImportadosERP.Application/Commands/Handlers/CancelarVendaCommandHandler.cs
- [x] T045 [US4] Incluir snapshot nas consultas e respostas de detalhe/lista em src/Amani.ImportadosERP.Infra.Data/Repositories/VendaRepository.cs e src/Amani.ImportadosERP.Application/Queries/Handlers/ObterListaVendasQueryHandler.cs
- [x] T046 [P] [US4] Exibir snapshot histórico em frontend/src/components/vendas/sale-detail.tsx e frontend/src/components/vendas/sales-list.tsx
- [x] T047 [US4] Preservar cancelamento e mensagens financeiras existentes em frontend/src/components/vendas/cancel-sale-dialog.tsx

**Checkpoint**: configuração futura não altera venda, custo, lucro ou reversão histórica.

---

## Phase 7: User Story 5 — Administrar apresentações do produto (Priority: P2)

**Goal**: cadastrar, editar, listar e desativar apresentações válidas sem excluir histórico.

**Independent Test**: cadastrar 1/1, 1/4 e 1/24; rejeitar denominador zero e 2/1; desativar apresentação usada sem mudar venda antiga.

- [x] T048 [P] [US5] OMITIDA por decisão explícita: não criar testes automatizados do serviço de apresentações
- [x] T049 [P] [US5] Criar DTOs de comando em src/Amani.ImportadosERP.Application/DTOs/Produtos/CriarProdutoApresentacaoDto.cs e src/Amani.ImportadosERP.Application/DTOs/Produtos/AtualizarProdutoApresentacaoDto.cs
- [x] T050 [US5] Implementar regras, normalização por MDC e bloqueio de PermiteCompra em src/Amani.ImportadosERP.Application/Services/ProdutoApresentacaoService.cs
- [x] T051 [US5] Expor endpoints finos aninhados ao produto em src/Amani.ImportadosERP.Api/Controllers/ProdutosController.cs
- [x] T052 [US5] Incluir apresentações nos DTOs e consultas de produto em src/Amani.ImportadosERP.Application/DTOs/ProdutoDto.cs, src/Amani.ImportadosERP.Application/Services/ProdutoService.cs e src/Amani.ImportadosERP.Infra.Data/Repositories/ProdutoRepository.cs
- [x] T053 [P] [US5] Estender tipos, service e hooks em frontend/src/types/product.ts, frontend/src/services/products.ts e frontend/src/hooks/use-products.ts
- [x] T054 [US5] Criar editor Mobile First de apresentações em frontend/src/components/produtos/product-presentations.tsx e integrar em frontend/src/components/produtos/product-form.tsx
- [x] T055 [US5] Exibir fração, fator calculado, preço e estado em frontend/src/components/produtos/product-details.tsx

**Checkpoint**: apresentações são opt-in, auditáveis e seguras para novas vendas.

---

## Phase 8: User Story 6 — Preservar compras, recebimentos, perdas e visão gerencial (Priority: P3)

**Goal**: manter compras na unidade principal e adaptar estoque/dashboard/relatórios ao equivalente exato.

**Independent Test**: compra 3 caixas, recebe 2, perde 1, vende doses e concilia estoque/custo/dashboard sem regressão.

- [x] T056 [P] [US6] OMITIDA por decisão explícita: não criar regressão automatizada de compra/recebimento/perda
- [x] T057 [P] [US6] OMITIDA por decisão explícita: não criar testes automatizados de dashboard
- [x] T058 [US6] Adaptar estoque valorizado à agregação exata em src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardEstoqueRepository.cs
- [x] T059 [US6] Adaptar ranking de quantidade e lucro ao equivalente da unidade principal em src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardRankingRepository.cs
- [x] T060 [US6] Revisar demais projeções de quantidade em src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardQueryHandler.cs e src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardGraficosQueryHandler.cs
- [x] T061 [P] [US6] Atualizar tipos e formatadores decimais em frontend/src/types/stock.ts, frontend/src/types/dashboard.ts e frontend/src/components/estoque/stock-formatters.ts
- [x] T062 [US6] Exibir saldo/movimentação decimal sem ruído em frontend/src/components/estoque/stock-list.tsx, frontend/src/components/estoque/stock-movement-list.tsx e frontend/src/components/estoque/stock-movement-detail.tsx
- [x] T063 [US6] Identificar equivalente na unidade principal nos rankings em frontend/src/components/dashboard/dashboard-ranking-list.tsx e frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx
- [ ] T064 [US6] Executar regressão manual de compras, recebimentos, perdas, dashboard e relatórios e registrar em docs/estoque/f024-regression-results.md

**Checkpoint**: fluxos adjacentes conciliam legado e fracionado sem alterar compras.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: concluir segurança de produção, documentação e validação integral.

- [x] T065 [P] Revisar autorização, erros e logs sem dados sensíveis em src/Amani.ImportadosERP.Api/Controllers/ProdutosController.cs e src/Amani.ImportadosERP.Api/Controllers/VendasController.cs
- [ ] T066 [P] Revisar índices e planos de execução das agregações e registrar resultados em docs/estoque/f024-query-plans.md
- [ ] T067 Executar todos os gates de specs/024-apresentacoes-fracionadas/quickstart.md e anexar evidências em docs/estoque/f024-validation-report.md
- [ ] T068 Validar rollout e rollback lógico em cópia de produção conforme docs/estoque/f024-rollout-runbook.md
- [ ] T069 [P] Atualizar status e resultados finais em docs/roadmap/RoadMap_AmaniERP.md, spec.md e specs/024-apresentacoes-fracionadas/impact-analysis.md somente após autorização/execução
- [ ] T070 Confirmar aprovação explícita antes de habilitar a feature em produção e registrar a decisão em docs/estoque/f024-rollout-runbook.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: inicia sem dependências; não habilita a feature.
- **Foundational (Phase 2)**: depende de Setup e bloqueia todas as histórias.
- **US1, US2 e US3 (Phases 3–5)**: começam após Foundation; US1 depende dos modelos, US2 valida compatibilidade e US3 fecha as regras críticas antes de rollout.
- **US4 (Phase 6)**: depende de US1 e US3 para snapshot/movimentação exatos.
- **US5 (Phase 7)**: pode avançar após Foundation em paralelo com US1, mas integração final depende dos contratos de US1.
- **US6 (Phase 8)**: depende do agregador exato de US3.
- **Polish (Phase 9)**: depende das histórias selecionadas e bloqueia habilitação.

### User Story Dependencies

```text
Foundation
├── US1 Venda por apresentação ──┬── US4 Histórico/cancelamento
│                               └── US3 Saldo/custo/lucro ── US6 Dashboard/regressão
├── US2 Compatibilidade legada
└── US5 Administração de apresentações ── integração com US1
```

### Parallel Opportunities

- T002–T004 podem executar em paralelo.
- Extensões de entidades/mappings T009–T012 podem ser preparadas em paralelo antes da integração.
- Após Foundation, US2 e US5 podem avançar em paralelo com US1; US3 pode iniciar pelos contratos e agregador.
- Frontend de US4 pode avançar após estabilização do contrato de snapshot.
- Dashboard de US6 pode ser dividido entre backend e frontend depois do agregador exato.

## Parallel Examples

### User Story 1

```text
T021 — contratos DTO
T025 — tipos e service frontend
```

### User Story 5

```text
T049 — DTOs de comando
T053 — tipos/service/hooks frontend
```

### User Story 6

```text
T058 — estoque valorizado
T059 — ranking de dashboard
T061 — tipos e formatadores frontend
```

## Implementation Strategy

### MVP seguro

1. Setup e Foundation com feature desligada.
2. US1 + US2 + US3, pois venda fracionada não é liberável sem compatibilidade e exatidão financeira.
3. US4 para cancelamento e auditoria antes de qualquer produção.
4. US5 para administração controlada.
5. US6 e Polish antes do rollout.

O MVP técnico não é somente US1: para esta feature produtiva, o menor incremento liberável é US1+US2+US3+US4, seguido dos gates de migration e rollback.

### Stop points

- Após T019: revisar schema e migration; nenhum fluxo habilitado.
- Após T042: validar 24×1/24, concorrência, custo e lucro.
- Após T047: validar venda/cancelamento sem resíduo.
- Após T064: conciliar dashboard/compras.
- Após T070: somente uma autorização explícita permite habilitação.

## Notes

- Todas as tasks seguem o formato obrigatório; tasks de testes removidas estão marcadas como omitidas por decisão explícita.
- Fração exata é regra de domínio; projeção decimal não pode ser usada isoladamente para saldo.
- Não executar backfill de apresentação, snapshot ou razão em linhas antigas.
- Não executar migration `Down` depois da primeira operação fracionada.
- Não marcar tarefas como concluídas apenas porque os artefatos documentais foram planejados.
