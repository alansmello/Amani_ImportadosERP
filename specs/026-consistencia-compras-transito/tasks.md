# Tasks: Consistência de Compras em Trânsito e Limpeza do Dashboard Gerencial

**Input**: Design documents from `/specs/026-consistencia-compras-transito/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/api-contracts.md](contracts/api-contracts.md), [quickstart.md](quickstart.md)

**Tests**: Não criar framework, projeto ou suíte automatizada nesta feature. A validação obrigatória combina build, lint, typecheck e os cenários manuais de `quickstart.md`.

**Organization**: As tarefas estão agrupadas por história para permitir implementação e validação incremental. Nenhuma tarefa autoriza migration, backfill, regravação histórica, alteração das regras de recebimento/perda/custo médio ou remoção dos endpoints de alertas.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode ser executada em paralelo por atuar em arquivo diferente e não depender de tarefa incompleta.
- **[Story]**: história de usuário atendida (`US1`, `US2`, `US3`, `US4`).
- Todos os itens possuem caminhos exatos dos arquivos afetados ou do roteiro que será validado.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar o gate de autorização e preparar os contratos internos compartilhados sem alterar persistência ou comportamento existente.

- [X] T001 Confirmar e registrar a aprovação explícita do responsável pelo produto na tabela de evidências de `specs/026-consistencia-compras-transito/quickstart.md`; bloquear T002–T033 enquanto o registro estiver pendente
- [X] T002 [P] Criar o contrato agregado `ResumoMercadoriasEmTransitoDto` com valores anuláveis, subtotal legado calculável, indicadores de completude e motivos em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/ResumoMercadoriasEmTransitoDto.cs`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implementar uma política oficial única de total, rateio e pendência antes de alterar qualquer consulta ou interface.

**⚠️ CRITICAL**: Nenhuma história deve substituir cálculos existentes antes desta fase estar concluída.

- [X] T003 Criar os tipos de entrada/resultado e implementar total oficial, rateio separado de desconto/acréscimo, fechamento determinístico de centavos e valor pendente em `src/Amani.ImportadosERP.Domain/Services/CompraCalculoFinanceiro.cs`
- [X] T004 Alterar `Compra.Total()` para delegar à política oficial sem persistir resultado e sem mudar recebimentos, perdas ou status em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`

**Checkpoint**: A política pura recompõe exatamente R$ 380,00 e R$ 170,05 para a massa de `specs/026-consistencia-compras-transito/quickstart.md`.

---

## Phase 3: User Story 1 — Consultar um total oficial consistente da compra (Priority: P1) 🎯 MVP

**Goal**: Fazer listagem, detalhe, trânsito e dashboard usarem o mesmo total comercial oficial.

**Independent Test**: Registrar a massa de referência e confirmar R$ 380,00 na listagem, detalhe, trânsito, total gerencial e gráfico Compras por Período.

### Implementation for User Story 1

- [X] T005 [P] [US1] Substituir a fórmula local da listagem por `Compra.Total()` em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterListaComprasQueryHandler.cs`
- [X] T006 [P] [US1] Garantir que o mapper de detalhe exponha o total oficial da compra e preserve `items[].valorTotal` como líquido do item em `src/Amani.ImportadosERP.Application/Mappers/CompraMapper.cs`
- [X] T007 [P] [US1] Adicionar `TotalCompra`, `ValorPendenteCusto` anulável e `MotivoValorPendenteIndisponivel` ao contrato em `src/Amani.ImportadosERP.Application/DTOs/CompraEmTransitoDto.cs`
- [X] T008 [US1] Calcular total e pendência com a política oficial no handler e eliminar o mapeamento sem valores em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterComprasEmTransitoQueryHandler.cs` e `src/Amani.ImportadosERP.Application/Services/CompraService.cs`
- [X] T009 [P] [US1] Incluir desconto e acréscimo gerais nas agregações de total de compras atual, anterior, saídas e caixa em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs`
- [X] T010 [P] [US1] Projetar o total oficial completo na série Compras por Período sem carregar entidades além dos dados necessários em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardGraficoRepository.cs`
- [ ] T011 [US1] Executar os cenários 1 e 2 de `specs/026-consistencia-compras-transito/quickstart.md` e registrar os resultados da consistência de R$ 380,00 na tabela de evidências

**Checkpoint**: US1 entrega o MVP; todos os consumidores oficiais concordam sobre o total da compra, sem migration ou alteração histórica.

---

## Phase 4: User Story 2 — Visualizar mercadorias em trânsito no patrimônio operacional (Priority: P2)

**Goal**: Expor trânsito ao custo e à venda e incorporá-lo às visões realista e potencial sem inflar estoque disponível.

**Independent Test**: Com pendências de 5 unidades de A e 2 de B, conferir R$ 170,05 ao custo, R$ 270,00 à venda e as fórmulas patrimoniais do cenário 6.

### Implementation for User Story 2

- [X] T012 [P] [US2] Adicionar valores anuláveis de trânsito, completude e motivos aos DTOs, preservando `MercadoriasEmTransitoValor` como subtotal legado, em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardFinanceiroGerencialDto.cs` e `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardOperacionalDto.cs`
- [X] T013 [US2] Alterar o contrato e implementar a consulta por data de referência que filtra no banco itens pendentes, agrega recebimentos/perdas, projeta `Produto.PrecoVenda`, calcula subtotais e devolve completude/motivos sem mascarar inconsistências em `src/Amani.ImportadosERP.Application/Interfaces/IDashboardOperacionalRepository.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs`
- [X] T014 [P] [US2] Consumir o resumo de trânsito, tornar valor realista/potencial indisponível somente quando seu componente obrigatório falhar e adicionar avisos com motivo em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroGerencialQueryHandler.cs`
- [X] T015 [P] [US2] Preencher quantidade, subtotal legado, valor oficial anulável, completude, motivos e valor de venda no resumo operacional em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardOperacionalQueryHandler.cs`
- [X] T016 [P] [US2] Estender os contratos TypeScript financeiros e operacionais com valores anuláveis, completude e motivos aditivos em `frontend/src/types/dashboard.ts`
- [X] T017 [US2] Adicionar cards independentes de trânsito ao custo e à venda, exibir motivos em vez de zero quando indisponíveis e atualizar as descrições dos valores realista e potencial em `frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx`
- [ ] T018 [US2] Executar os cenários 3–7 de `specs/026-consistencia-compras-transito/quickstart.md` e registrar pendência, indisponibilidade, venda atual e conciliação patrimonial na tabela de evidências

**Checkpoint**: US2 apresenta o patrimônio com trânsito separado; estoque disponível e custo médio permanecem baseados apenas em entradas físicas.

---

## Phase 5: User Story 3 — Consultar compras sem valores artificiais (Priority: P3)

**Goal**: Remover `totalCompra: 0`, distinguir zero legítimo de indisponibilidade e exibir o valor real nas visões da tela `/compras`.

**Independent Test**: Alternar entre visão padrão, filtrada e em trânsito para a mesma compra e conferir total oficial e valor pendente sem “Valor não informado” artificial.

### Implementation for User Story 3

- [X] T019 [P] [US3] Adicionar `totalCompra`, `valorPendenteCusto` e motivo opcional ao tipo `PurchaseInTransit` em `frontend/src/types/purchase.ts`
- [X] T020 [US3] Remover a adaptação `totalCompra: 0` e mapear diretamente os valores oficiais do contrato de trânsito em `frontend/src/app/compras/page.tsx`
- [X] T021 [US3] Formatar zero como moeda legítima, exibir indisponibilidade somente quando houver motivo e apresentar o valor pendente como contexto secundário em `frontend/src/components/compras/purchase-list.tsx`
- [ ] T022 [US3] Executar os cenários 1 e 7 de `specs/026-consistencia-compras-transito/quickstart.md` nas visões padrão, filtrada e em trânsito e registrar os resultados na tabela de evidências

**Checkpoint**: US3 elimina o valor artificial do frontend e mantém o backend como única fonte financeira.

---

## Phase 6: User Story 4 — Ler um dashboard mais objetivo (Priority: P4)

**Goal**: Remover da home alertas e blocos de incompletude sem apagar endpoints, contratos ou avisos usados por outras seções.

**Independent Test**: Abrir a home, confirmar a ausência dos seis elementos removidos e verificar que rankings, gráficos, KPIs e patrimônio continuam independentes.

### Implementation for User Story 4

- [X] T023 [US4] Remover importação, query e seção de resumo de alertas da home sem alterar o hook ou serviço compatível em `frontend/src/components/dashboard/dashboard-home.tsx`
- [X] T024 [P] [US4] Remover somente a renderização do bloco “Dados financeiros incompletos”, preservando os campos e avisos do contrato em `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [X] T025 [US4] Remover o bloco “Estoque com lacunas de custo” e ajustar o grid após os novos cards em `frontend/src/components/dashboard/dashboard-patrimonial-grid.tsx`
- [X] T026 [US4] Excluir o componente sem consumidor e sua exportação, preservando tipos, hook, serviço e endpoint de alertas, em `frontend/src/components/dashboard/dashboard-alerts.tsx` e `frontend/src/components/dashboard/index.ts`
- [ ] T027 [US4] Executar os cenários 8–10 de `specs/026-consistencia-compras-transito/quickstart.md` em smartphone, tablet e desktop e registrar os resultados na tabela de evidências

**Checkpoint**: US4 entrega uma home mais enxuta, sem chamada de alertas e sem eliminar compatibilidade futura.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Confirmar compatibilidade, performance, ausência de mutações históricas e todos os gates de entrega.

- [X] T028 Verificar que `src/Amani.ImportadosERP.Api/Controllers/ComprasController.cs`, `src/Amani.ImportadosERP.Api/Controllers/DashboardGerencialController.cs` e `src/Amani.ImportadosERP.Api/Controllers/DashboardFinanceiroController.cs` preservam rotas existentes e não recebem regra de negócio
- [X] T029 [P] Auditar o diff para confirmar ausência de arquivos em `src/Amani.ImportadosERP.Infra.Data/Migrations/`, ausência de total persistido e ausência de mudanças em recebimento, perda, movimentações e custo médio, registrando o resultado na tabela de evidências de `specs/026-consistencia-compras-transito/quickstart.md`
- [X] T030 [P] Executar `dotnet build Amani_ImportadosERP.sln` e corrigir somente erros relacionados aos arquivos backend listados em `specs/026-consistencia-compras-transito/plan.md`
- [X] T031 [P] Executar `npm run lint`, `npm run typecheck` e `npm run build` em `frontend/` e corrigir somente erros relacionados aos arquivos frontend listados em `specs/026-consistencia-compras-transito/plan.md`
- [ ] T032 Executar integralmente os cenários 1–11 de `specs/026-consistencia-compras-transito/quickstart.md`, comprovar o limite de 2 segundos em 9 de 10 carregamentos e registrar data, ambiente, evidências e resultado de cada gate na tabela do mesmo arquivo
- [ ] T033 Atualizar o status, validações concluídas e débitos técnicos remanescentes da F026 em `docs/roadmap/RoadMap_AmaniERP.md` somente após T028–T032 passarem

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 é o gate inicial e bloqueia todas as tarefas de código; após sua conclusão, T002 pode começar.
- **Foundational (Phase 2)**: T003 depende de T001 e pode ocorrer em paralelo com T002; T004 depende de T003 e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende da política oficial; entrega o MVP e o contrato de trânsito necessário à US3.
- **US2 (Phase 4)**: depende de T002–T004; T017 também depende de T016. Pode começar em paralelo com partes da US1 que não alterem o repositório operacional.
- **US3 (Phase 5)**: depende de T007–T008 e usa o endpoint de trânsito já corrigido pela US1.
- **US4 (Phase 6)**: T023, T024 e T026 independem das regras de compra; T025 depende de T017 por alterar o mesmo grid patrimonial.
- **Polish (Phase 7)**: depende de todas as histórias incluídas na entrega.

### User Story Completion Order

```text
Setup → Foundational → US1 (MVP) ─┬→ US3
                                  └→ US2 → US4 → Polish
```

- **US1** é o primeiro incremento demonstrável e estabelece total e trânsito oficiais.
- **US2** usa a política comum, mas é validável pelos cards e fórmulas patrimoniais.
- **US3** depende do contrato de trânsito da US1 e é validável apenas na tela de compras.
- **US4** é funcionalmente independente, exceto pelo ajuste final do grid patrimonial após US2.

### Within Each User Story

- Tipos e DTOs antes de handlers e componentes consumidores.
- Política de domínio antes de qualquer substituição de fórmula.
- Projeção/consulta antes da composição dos indicadores.
- Contrato frontend antes da página ou componente que o utiliza.
- Validação manual do checkpoint antes de avançar ao próximo incremento.

### Parallel Opportunities

- Após T001, T002 e T003 podem ocorrer em paralelo.
- Após T004, T005–T007, T009 e T010 podem ocorrer em paralelo por afetarem arquivos distintos.
- T012 e T016 podem ocorrer em paralelo.
- Após T013, T014 e T015 podem ocorrer em paralelo.
- T023 e T024 podem ocorrer em paralelo; T025 aguarda T017.
- T029–T031 podem ocorrer em paralelo após a implementação funcional.

---

## Parallel Examples

### User Story 1

```text
Task T005: corrigir a listagem em src/Amani.ImportadosERP.Application/Queries/Handlers/ObterListaComprasQueryHandler.cs
Task T007: estender o contrato em src/Amani.ImportadosERP.Application/DTOs/CompraEmTransitoDto.cs
Task T009: corrigir agregações em src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs
Task T010: corrigir a série em src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardGraficoRepository.cs
```

### User Story 2

```text
Task T012: estender DTOs em src/Amani.ImportadosERP.Application/DTOs/Dashboards/
Task T016: estender tipos em frontend/src/types/dashboard.ts
```

Após T013:

```text
Task T014: integrar trânsito financeiro em ObterDashboardFinanceiroGerencialQueryHandler.cs
Task T015: integrar trânsito operacional em ObterDashboardOperacionalQueryHandler.cs
```

### User Story 3

```text
Task T019: estender frontend/src/types/purchase.ts
Task T021: preparar apresentação em frontend/src/components/compras/purchase-list.tsx após o contrato de props estar definido
```

### User Story 4

```text
Task T023: remover consulta/renderização de alertas em dashboard-home.tsx
Task T024: remover bloco de avisos em dashboard-kpi-grid.tsx
```

---

## Implementation Strategy

### MVP First — User Story 1

1. Concluir o gate T001; somente após a aprovação registrada, concluir T002–T004.
2. Implementar T005–T010.
3. Executar T011 e parar no checkpoint.
4. Demonstrar R$ 380,00 em todas as leituras oficiais antes de avançar.

### Incremental Delivery

1. **US1**: total oficial e trânsito com valor.
2. **US2**: patrimônio com trânsito ao custo e à venda.
3. **US3**: tela de compras sem zero artificial.
4. **US4**: home limpa e sem consulta de alertas.
5. **Polish**: compatibilidade, builds, roteiro completo e roadmap.

### Scope Guards

- Não criar migration, coluna de total, backfill ou atualização histórica.
- Não iniciar qualquer tarefa de código enquanto T001 estiver pendente.
- Não alterar criação de compra, recebimento, perda, movimentação de estoque ou custo médio.
- Não incluir trânsito em estoque disponível.
- Não remover `/api/dashboard-gerencial/alertas`, `useDashboardAlerts`, `dashboardService.getAlerts` ou tipos de alerta; somente a home deixa de consumi-los.
- Não alterar F024, o compositor da F025 ou componentes de Venda.
- Não criar contas a pagar, estoque mínimo configurável, tela de alertas ou nova infraestrutura de testes.
- Não marcar T033 nem a feature como concluída enquanto os cenários manuais e builds não passarem.

## Notes

- Cada tarefa deve terminar com os arquivos afetados compiláveis antes da próxima tarefa dependente.
- Os marcadores `[P]` consideram arquivos distintos; coordenação continua necessária quando o contrato produzido por uma tarefa ainda não existe.
- O endpoint consolidado preserva `alertas` e `resumoAlertas`; a limpeza é deliberadamente restrita à home.
- Zero monetário legítimo deve ser exibido como moeda; ausência real deve carregar motivo explícito.
- A feature só está concluída após T028–T033.
