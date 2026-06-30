# Tasks: Revisão do Dashboard Gerencial

**Input**: Design documents from `/specs/023-revisao-dashboard-gerencial/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Validation policy**: A F023 não cria projeto, framework, dependência ou infraestrutura de testes unitários ou de integração. A validação usa build, lint, typecheck, revisão de migration/consultas e roteiro manual.

**Organization**: As tarefas estão agrupadas por história de usuário para permitir entrega incremental, com a US1 como MVP.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode executar em paralelo porque altera arquivos diferentes e não depende de tarefa incompleta.
- **[Story]**: identifica a história atendida (`US1`, `US2`, `US3`, `US4`).
- Toda tarefa informa o caminho exato dos arquivos afetados.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Registrar o comportamento atual antes de alterar consultas e contratos.

- [X] T001 Capturar payloads atuais dos endpoints financeiro/alertas, consultas materializadas e planos de execução de referência em `docs/dashboard/f023-dashboard-baseline.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Criar contratos internos e compartilhados que bloqueiam todas as histórias.

**⚠️ CRITICAL**: Nenhuma história deve avançar para integração antes desta fase.

- [X] T002 [P] Criar o read model de caixa com caixa inicial, ajuste, entradas, saídas e caixa final em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardCaixaResumoDto.cs`
- [X] T003 [P] Criar o read model de recebíveis abertos, vencidos e a vencer em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardRecebiveisResumoDto.cs`
- [X] T004 [P] Criar o read model de estoque valorizado, lucro potencial e lacunas de custo em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardEstoqueValorizadoDto.cs`
- [X] T005 [P] Criar os read models de resumo e contagem agrupada de alertas em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardAlertasResumoDto.cs`
- [X] T006 Estender `DashboardFinanceiroGerencialDto` com os campos nullable definidos no contrato, preservando todas as propriedades existentes, em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardFinanceiroGerencialDto.cs`
- [X] T007 Estender `DashboardAlertasDto` com `Resumo` nullable sem remover `Alertas` em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/AlertaGerencialDto.cs`
- [X] T008 Atualizar contratos de leitura financeira e criar o contrato de estoque valorizado em `src/Amani.ImportadosERP.Application/Interfaces/IDashboardFinanceiroRepository.cs` e `src/Amani.ImportadosERP.Application/Interfaces/IDashboardEstoqueRepository.cs`
- [X] T009 [P] Extrair a agregação de custo médio por produto/data de referência, sem fallback para `Produto.Custo`, em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardCustoMedioReadService.cs`
- [X] T010 [P] Estender tipos financeiros e de alertas com campos opcionais/nullables da F023 em `frontend/src/types/dashboard.ts`

**Checkpoint**: DTOs, interfaces, custo médio compartilhado e tipos frontend estão prontos.

---

## Phase 3: User Story 1 - Compreender o resultado financeiro do período (Priority: P1) 🎯 MVP

**Goal**: Distinguir faturamento, entradas, saídas estimadas, lucro, caixa inicial, ajuste de implantação e caixa final.

**Independent Validation**: Preparar vendas à vista/a prazo, pagamentos, compras, despesas e saldo inicial antes/dentro/depois do filtro; conferir manualmente todas as fórmulas sem depender dos indicadores patrimoniais da US2.

- [X] T011 [US1] Substituir materialização de vendas/compras por projeções agregadas, implementar `ObterResumoCaixaAsync` no repository e substituir o guard padrão de caixa em `src/Amani.ImportadosERP.Application/Interfaces/IDashboardFinanceiroRepository.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs`
- [X] T012 [US1] Compor `SaidasPeriodo`, `CaixaInicialPeriodo`, `AjusteImplantacaoPeriodo` e `CaixaFinalPeriodo`, mantendo `ReceitaTotal`, `ValoresRecebidos`, `SaldoOperacional` e avisos existentes em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroGerencialQueryHandler.cs`
- [X] T013 [P] [US1] Expandir os cards financeiros para Faturamento, Entradas, Saídas estimadas, Caixa inicial, Ajuste, Caixa final e Lucro em `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [X] T014 [US1] Integrar o novo grid financeiro preservando filtro aplicado, stale guard e retry isolado em `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T015 [US1] Executar os cenários manuais 5.1–5.3 de `specs/023-revisao-dashboard-gerencial/quickstart.md` e registrar valores esperados/obtidos em `docs/dashboard/f023-validacao-manual.md`

**Checkpoint**: A US1 entrega uma visão financeira funcional e demonstrável como MVP.

---

## Phase 4: User Story 2 - Avaliar recebíveis e patrimônio operacional (Priority: P2)

**Goal**: Exibir recebíveis segmentados, estoque ao custo/preço, lucro potencial e valores realista/potencial da operação.

**Independent Validation**: Preparar contas vencidas/a vencer, pagamentos com desconto, inventário, recebimento, venda, trânsito e produto sem custo; conferir manualmente os totais patrimoniais.

- [X] T016 [US2] Reescrever o saldo de recebíveis com `ValorBrutoLiquidado`, implementar `ObterResumoRecebiveisAsync` e substituir o guard padrão de recebíveis em `src/Amani.ImportadosERP.Application/Interfaces/IDashboardFinanceiroRepository.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs`
- [X] T017 [P] [US2] Implementar saldo por movimentações, valor ao custo/preço, lucro potencial e lacunas de custo em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardEstoqueRepository.cs`
- [X] T018 [US2] Registrar `DashboardCustoMedioReadService` e `IDashboardEstoqueRepository` em `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [X] T019 [US2] Popular recebíveis, estoque, aviso `ESTOQUE_CUSTO_MEDIO_AUSENTE` e valores total realista/potencial em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroGerencialQueryHandler.cs`
- [X] T020 [P] [US2] Substituir o helper duplicado de custo médio pelo serviço compartilhado em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardRankingRepository.cs`
- [X] T021 [P] [US2] Substituir o helper duplicado de custo médio pelo serviço compartilhado em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardGraficoRepository.cs`
- [X] T022 [P] [US2] Criar grid patrimonial para recebíveis, estoque e valor da operação em `frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx`
- [X] T023 [US2] Integrar o grid patrimonial aos dados financeiros sem acoplar sua falha às demais fontes em `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T024 [US2] Executar os cenários manuais 5.4–5.5 de `specs/023-revisao-dashboard-gerencial/quickstart.md` e registrar reconciliação/avisos em `docs/dashboard/f023-validacao-manual.md`

**Checkpoint**: A US2 entrega a posição patrimonial sem incluir trânsito nem presumir custos.

---

## Phase 5: User Story 3 - Interpretar indicadores sem ambiguidade (Priority: P3)

**Goal**: Tornar semântica, indisponibilidade, estados vazios e falhas parciais inequívocos.

**Independent Validation**: Consultar períodos com dados, sem dados, campo novo ausente, resposta stale e falha isolada; confirmar rótulos e continuidade das outras seções.

- [X] T025 [P] [US3] Adicionar formatadores nullable que diferenciem `null`/`undefined` de zero e retornem “Indisponível” em `frontend/src/components/dashboard/dashboard-formatters.ts`
- [X] T026 [US3] Aplicar rótulos de competência, caixa, estimativa, snapshot/potencial e formatadores nullable em `frontend/src/components/dashboard/dashboard-kpi-grid.tsx` e `frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx`
- [X] T027 [P] [US3] Substituir mensagens técnicas de série vazia pelas mensagens operacionais aprovadas em `frontend/src/components/dashboard/dashboard-chart-section.tsx`
- [X] T028 [P] [US3] Revisar estados `loading`, `empty`, `error`, `incomplete`, `aria-live` e retry sem alterar o Design System em `frontend/src/components/dashboard/dashboard-section-state.tsx`
- [X] T029 [US3] Preservar queries independentes, chaves por filtro e bloqueio de respostas stale em `frontend/src/hooks/use-dashboard.ts` e `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T030 [US3] Executar o roteiro manual de compatibilidade/falha parcial da seção 6 de `specs/023-revisao-dashboard-gerencial/quickstart.md` e registrar evidências em `docs/dashboard/f023-validacao-manual.md`

**Checkpoint**: A US3 impede que indisponibilidade seja exibida como zero e preserva degradação parcial.

---

## Phase 6: User Story 4 - Consultar uma visão gerencial objetiva em qualquer tela (Priority: P4)

**Goal**: Resumir alertas, retirar rankings de estoque da home e consolidar layout Mobile First.

**Independent Validation**: Abrir a home nos três viewports, conferir resumo por total/severidade/tipo, ausência dos rankings de estoque e leitura dos indicadores sem rolagem horizontal.

- [X] T031 [P] [US4] Calcular `DashboardAlertasResumoDto` após filtros, preservando a lista detalhada existente, em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardAlertasQueryHandler.cs`
- [X] T032 [US4] Propagar o resumo de alertas no contrato consolidado sem remover a coleção existente em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardGerencialDto.cs` e `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardGerencialQueryHandler.cs`
- [X] T033 [P] [US4] Renderizar somente total e agrupamentos por severidade/tipo na home, mantendo estados vazio/erro, em `frontend/src/components/dashboard/dashboard-alerts.tsx`
- [X] T034 [P] [US4] Excluir apenas `ProdutosComMaiorEstoque` e `ProdutosComMenorEstoque` da composição visual sem alterar o endpoint em `frontend/src/components/dashboard/dashboard-ranking-list.tsx`
- [X] T035 [US4] Reorganizar KPIs, patrimônio, operacional, rankings, alertas e gráficos com abordagem Mobile First em `frontend/src/components/dashboard/dashboard-home.tsx`, `frontend/src/components/dashboard/dashboard-kpi-grid.tsx` e `frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx`
- [X] T036 [US4] Executar o roteiro manual responsivo da seção 8 de `specs/023-revisao-dashboard-gerencial/quickstart.md` em 390x844, 768x1024 e 1440x900 e registrar evidências em `docs/dashboard/f023-validacao-manual.md`

**Checkpoint**: As quatro histórias estão funcionais e a home está gerencial, enxuta e responsiva.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Ajustar persistência, contratos, desempenho e gates finais sem ampliar o escopo.

- [X] T037 [P] Adicionar índices candidatos de vendas/compras por data e estado em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/VendaMapping.cs` e `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraMapping.cs`
- [X] T038 [P] Adicionar índices candidatos de pagamentos/recebíveis/eventos por data e classificação em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/PagamentoRecebidoMapping.cs`, `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/ContaReceberMapping.cs` e `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EventoFinanceiroMapping.cs`
- [X] T039 [P] Adicionar índices candidatos de estoque/despesas para data, produto e tipo em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EstoqueMovimentacaoMapping.cs` e `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/DespesaMapping.cs`
- [X] T040 Gerar e revisar a migration `AddDashboardGerencialIndexes` em `src/Amani.ImportadosERP.Infra.Data/Migrations/` e atualizar `src/Amani.ImportadosERP.Infra.Data/Migrations/AmaniDbContextModelSnapshot.cs` sem alteração de dados ou coluna de saldo
- [X] T041 Conferir a implementação final contra `specs/023-revisao-dashboard-gerencial/contracts/dashboard-gerencial.openapi.yaml` e corrigir somente divergências compatíveis nos DTOs de `src/Amani.ImportadosERP.Application/DTOs/Dashboards/`
- [X] T042 Executar `dotnet restore` e `dotnet build --configuration Release` sobre `Amani_ImportadosERP.sln`
- [X] T043 Executar `npm ci`, `npm run lint`, `npm run typecheck` e `npm run build` definidos em `frontend/package.json`
- [X] T044 Gerar e revisar `artifacts/f023-dashboard-indexes.sql`, inspecionar planos PostgreSQL das consultas agregadas e registrar índices mantidos/removidos em `docs/dashboard/f023-validacao-manual.md`
- [X] T045 Executar as seções 7–8 e os Exit Criteria de `specs/023-revisao-dashboard-gerencial/quickstart.md`, registrar p95/ambiente/evidências em `docs/dashboard/f023-validacao-manual.md` e confirmar que `Amani_ImportadosERP.sln` e `frontend/package.json` não receberam infraestrutura automatizada

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende de T001 e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da Phase 2; é o MVP.
- **US2 (Phase 4)**: depende da Phase 2 e reutiliza o handler/repository financeiro estabilizado pela US1.
- **US3 (Phase 5)**: pode iniciar após a Phase 2, mas T026 e T029 dependem dos componentes entregues por US1/US2.
- **US4 (Phase 6)**: pode iniciar no backend após a Phase 2; T035 depende dos componentes visuais de US1–US3.
- **Polish (Phase 7)**: depende das histórias selecionadas; migration e validação final exigem US1–US4 concluídas.

### User Story Dependencies

- **US1 (P1)**: inicia após Foundational e não depende de outra história.
- **US2 (P2)**: backend de estoque pode iniciar após Foundational; composição final depende da base financeira da US1.
- **US3 (P3)**: mensagens vazias/estados podem iniciar após Foundational; rótulos finais dependem dos cards de US1/US2.
- **US4 (P4)**: resumo backend e filtros de ranking podem iniciar após Foundational; layout final depende de US1–US3.

### Critical Path

```text
T001 → T002–T010 → T011 → T012 → T014 → T016/T017 → T019 → T023 → T026/T029 → T035 → T037–T040 → T041–T045
```

## Parallel Opportunities

### Foundational

- T002, T003, T004 e T005 podem criar read models em paralelo.
- T009 e T010 podem avançar em paralelo aos DTOs, desde que os nomes do contrato permaneçam os definidos em `data-model.md`.

### User Story 1

- T011 (backend) e T013 (frontend) podem executar em paralelo após a Phase 2.
- T012 depende de T011; T014 depende de T012 e T013.

### User Story 2

- T016, T017, T020, T021 e T022 atuam em arquivos distintos e podem executar em paralelo.
- T019 depende de T016–T018; T023 depende de T019 e T022.

### User Story 3

- T025, T027 e T028 podem executar em paralelo.
- T026 depende de T025; T029 deve ser integrado depois que a home das US1/US2 estiver estável.

### User Story 4

- T031, T033 e T034 podem executar em paralelo.
- T032 depende de T031; T035 depende de T033/T034 e dos grids anteriores.

### Cross-Cutting

- T037, T038 e T039 podem configurar grupos de mapeamentos em paralelo.
- T042 e T043 podem executar em paralelo após a implementação, pois validam stacks diferentes.

## Parallel Execution Examples

### US1

```text
Backend: T011 — agregações financeiras e caixa em DashboardFinanceiroRepository.cs
Frontend: T013 — cards financeiros em dashboard-kpi-grid.tsx
Join: T012 → T014
```

### US2

```text
Recebíveis: T016
Estoque: T017
Custo compartilhado: T020 + T021
UI patrimonial: T022
Join: T018 → T019 → T023
```

### US3

```text
Formatadores: T025
Mensagens de gráficos: T027
Estados acessíveis: T028
Join: T026 → T029
```

### US4

```text
Resumo backend: T031
Resumo frontend: T033
Filtro de rankings: T034
Join: T032 → T035
```

## Implementation Strategy

### MVP First (US1 Only)

1. Concluir Setup e Foundational.
2. Executar T011–T015.
3. Parar e validar manualmente faturamento, entradas, saídas, lucro e caixa.
4. Demonstrar o MVP antes de iniciar a camada patrimonial.

### Incremental Delivery

1. **US1**: resultado financeiro e caixa.
2. **US2**: recebíveis, estoque e valor da operação.
3. **US3**: semântica, indisponibilidade e falhas parciais.
4. **US4**: resumo de alertas, rankings enxutos e responsividade.
5. **Polish**: índices, migration, contratos, builds e validação manual final.

### Scope Guardrails

- Não criar projeto, pacote, framework, fixture ou tarefa de testes unitários/de integração.
- Não incluir `DespesaOperadora` em saídas.
- Não usar `Produto.Custo` como fallback.
- Não remover campos/endpoints existentes nem criar o gráfico Entradas versus Saídas.
- Não criar tela dedicada de alertas, exportação ou drill-down.
- Manter regras gerenciais no backend e estoque derivado exclusivamente de movimentações.

## Notes

- Commits devem permanecer na branch `023-revisao-dashboard-gerencial`.
- Cada checkpoint exige atualização de `docs/dashboard/f023-validacao-manual.md` quando houver validação correspondente.
- Marcar tarefas como concluídas somente após implementação e validação previstas.
