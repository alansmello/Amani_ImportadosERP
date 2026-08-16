# Tasks: Devoluções e Reembolsos de Compras

**Input**: documentos de design em `/specs/027-devolucoes-reembolsos-compras/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/api-contracts.md` e `quickstart.md`

**Tests**: a feature não autoriza criar nova infraestrutura automatizada. As tarefas incluem builds, verificações SQL, ensaio de migration e validação manual determinística conforme o quickstart.

**Organization**: as tarefas estão agrupadas por história de usuário para permitir implementação e validação incremental. Este documento não autoriza sua própria execução: implementar código ou gerar migration depende de solicitação explícita posterior para `/speckit-implement`; aplicar schema produtivo, habilitar a feature ou liberar em produção depende de uma segunda aprovação após o gate da US6.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode ser executada em paralelo após suas dependências, pois atua em arquivos distintos
- **[Story]**: história de usuário atendida pela tarefa
- Todos os caminhos são relativos à raiz do repositório

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: preparar controles e evidências antes de implementar comportamentos da F027

- [X] T001 Adicionar `DevolucoesReembolsosComprasEnabled` desligado por padrão em `src/Amani.ImportadosERP.Application/Interfaces/IFeatureSettings.cs`, `src/Amani.ImportadosERP.Infra.IoC/Services/ConfigurationFeatureSettings.cs`, `src/Amani.ImportadosERP.Api/appsettings.json` e `src/Amani.ImportadosERP.Api/appsettings.Development.json`
- [X] T002 [P] Criar o baseline não destrutivo de contagens, hashes e somatórios legados em `artifacts/f027-production-baseline.sql`
- [X] T003 [P] Criar a verificação SQL idempotente das cinco tabelas, índices, FKs e ausência de dados inesperados em `artifacts/f027-post-migration-check.sql`
- [X] T004 [P] Criar o modelo de registro de evidências, aprovações e reconciliações em `artifacts/f027-validation-evidence.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: criar o modelo append-only, persistência e contratos compartilhados que bloqueiam todas as histórias

**⚠️ CRITICAL**: nenhuma história de usuário pode ser implementada antes da conclusão desta fase; a migration não deve ser aplicada em produção nesta fase

- [X] T005 [P] Criar a entidade e os enums de devolução com invariantes de momento, motivo, quantidade, observação e idempotência em `src/Amani.ImportadosERP.Domain/Entities/CompraItemDevolucao.cs`
- [X] T006 [P] Criar a entidade de compensação única e auditável da devolução em `src/Amani.ImportadosERP.Domain/Entities/CompraItemDevolucaoCompensacao.cs`
- [X] T007 [P] Criar a entidade de reembolso positivo com referência externa normalizada e operação idempotente em `src/Amani.ImportadosERP.Domain/Entities/CompraReembolso.cs`
- [X] T008 [P] Criar a entidade de cancelamento integral e único do reembolso em `src/Amani.ImportadosERP.Domain/Entities/CompraReembolsoCancelamento.cs`
- [X] T009 [P] Criar a entidade de alocação monetária opcional por item, perda ou devolução em `src/Amani.ImportadosERP.Domain/Entities/CompraReembolsoAlocacao.cs`
- [X] T010 [P] Implementar total reembolsado, saldo reembolsável, custo financeiro líquido e situação derivada em `src/Amani.ImportadosERP.Domain/Services/CompraCalculoFinanceiro.cs`
- [X] T011 [P] Implementar valor bruto F026, recuperação associada e prejuízo líquido sem misturar custo de estoque em `src/Amani.ImportadosERP.Domain/Services/CompraRecuperacaoFinanceira.cs`
- [X] T012 [P] Definir operações append-only, consultas temporais e idempotência em `src/Amani.ImportadosERP.Application/Interfaces/ICompraItemDevolucaoRepository.cs` e `src/Amani.ImportadosERP.Application/Interfaces/ICompraReembolsoRepository.cs`
- [X] T013 [P] Criar DTOs de registro, listagem e compensação de devoluções conforme o contrato em `src/Amani.ImportadosERP.Application/DTOs/Devolucoes/`
- [X] T014 [P] Criar DTOs de registro, alocação, listagem e cancelamento de reembolsos conforme o contrato em `src/Amani.ImportadosERP.Application/DTOs/Reembolsos/`
- [X] T015 [P] Criar mapeamento explícito entre devoluções, compensações e DTOs em `src/Amani.ImportadosERP.Application/Mappers/CompraDevolucaoMapper.cs`
- [X] T016 [P] Criar mapeamento explícito entre reembolsos, cancelamentos, alocações e DTOs em `src/Amani.ImportadosERP.Application/Mappers/CompraReembolsoMapper.cs`
- [X] T017 [P] Mapear tabela, checks, FKs `Restrict` e índices de devolução em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemDevolucaoMapping.cs`
- [X] T018 [P] Mapear unicidade e FKs `Restrict` da compensação de devolução em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemDevolucaoCompensacaoMapping.cs`
- [X] T019 [P] Mapear valor, referência externa parcial única e índices do reembolso em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraReembolsoMapping.cs`
- [X] T020 [P] Mapear cancelamento único e FKs `Restrict` do reembolso em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraReembolsoCancelamentoMapping.cs`
- [X] T021 [P] Mapear alocações, checks monetários e referências mutuamente exclusivas em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraReembolsoAlocacaoMapping.cs`
- [X] T022 Registrar os cinco `DbSet` e aplicar somente os novos mappings em `src/Amani.ImportadosERP.Infra.Data/Context/AmaniDbContext.cs`
- [X] T023 [P] Implementar persistência, agregações temporais, replay idempotente e consultas de elegibilidade em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraItemDevolucaoRepository.cs`
- [X] T024 [P] Implementar persistência, teto líquido, referência externa, alocações e replay idempotente em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraReembolsoRepository.cs`
- [X] T025 Registrar repositories, serviços de domínio e feature settings sem dependência nova em `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`
- [X] T026 Gerar uma única migration expand-only e atualizar apenas o snapshot em `src/Amani.ImportadosERP.Infra.Data/Migrations/`, sem DML, backfill ou alteração destrutiva de tabelas existentes

**Checkpoint**: modelo, contratos internos e schema aditivo prontos; a feature continua desligada

---

## Phase 3: User Story 1 — Registrar reembolso de compra (Priority: P1) 🎯 MVP

**Goal**: registrar créditos parciais ou integrais por sua data efetiva, sem movimentar estoque nem alterar o total original da compra

**Independent Test**: registrar R$ 80,00 em uma compra oficial de R$ 300,00 e comprovar total original R$ 300,00, situação parcial, custo líquido R$ 220,00 e entrada no caixa somente a partir da data do crédito

- [ ] T027 [US1] Implementar registro serializável de reembolso, teto oficial F026, alocações opcionais, idempotência e bloqueio pela feature flag em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`
- [ ] T028 [US1] Expor `POST` e `GET /api/compras/{compraId}/reembolsos` com respostas 201/200/400/404/409 em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`
- [ ] T029 [P] [US1] Projetar total reembolsado, saldo, custo líquido e situação nas consultas de compra em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraRepository.cs`
- [ ] T030 [US1] Acrescentar campos aditivos de reembolso em `src/Amani.ImportadosERP.Application/DTOs/CompraListDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/Response/CompraResponseDto.cs` e `src/Amani.ImportadosERP.Application/Mappers/CompraMapper.cs`
- [ ] T031 [P] [US1] Incorporar créditos por data ao caixa sem alterar compras brutas nem pagamentos de clientes em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs`
- [ ] T032 [US1] Acrescentar reembolsos líquidos e entradas totais nos contratos e handlers financeiros em `src/Amani.ImportadosERP.Application/DTOs/DashboardFinanceiroDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardFinanceiroGerencialDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardCaixaResumoDto.cs`, `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroQueryHandler.cs` e `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardFinanceiroGerencialQueryHandler.cs`
- [ ] T033 [P] [US1] Adicionar tipos tolerantes ao rollout aditivo para resumos e comandos de reembolso em `frontend/src/types/purchase.ts` e `frontend/src/types/dashboard.ts`
- [ ] T034 [US1] Implementar chamadas e mutations idempotentes com invalidação de compras e financeiro em `frontend/src/services/purchases.ts` e `frontend/src/hooks/use-purchases.ts`
- [ ] T035 [P] [US1] Criar diálogo Mobile First de revisão e confirmação do reembolso, preservando formulário em erro em `frontend/src/components/compras/refund-dialog.tsx`
- [ ] T036 [US1] Integrar resumo, histórico e ação de reembolso no detalhe sem calcular valores oficiais no cliente em `frontend/src/components/compras/purchase-detail.tsx` e `frontend/src/components/compras/purchase-summary.tsx`
- [ ] T037 [P] [US1] Exibir badges separados de situação logística e reembolso na lista em `frontend/src/components/compras/purchase-list.tsx`
- [ ] T038 [US1] Exibir reembolsos e entradas totais mantendo recebimentos de clientes separados em `frontend/src/services/dashboard.ts`, `frontend/src/hooks/use-dashboard.ts` e `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [ ] T039 [US1] Executar os cenários de reembolso parcial, múltiplo, integral, limite, referência externa e caixa das seções 4, 5 e 13 de `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar evidências em `artifacts/f027-validation-evidence.md`

**Checkpoint**: reembolsos funcionam independentemente de devoluções e jamais alteram estoque

---

## Phase 4: User Story 2 — Devolver ou recusar item antes do recebimento (Priority: P1)

**Goal**: encerrar quantidade ainda pendente sem criar movimento de estoque e sem presumir reembolso

**Independent Test**: devolver 3 unidades de um item com 7 pendentes e verificar pendência 4, nenhuma movimentação e situação financeira inalterada

- [ ] T040 [P] [US2] Incorporar devoluções anteriores vigentes à quantidade pendente e ao status logístico sem persistir novo estado em `src/Amani.ImportadosERP.Domain/Entities/CompraItem.cs` e `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`
- [ ] T041 [US2] Implementar registro serializável antes do recebimento com revalidação de pendência, motivos, data, idempotência e zero movimento em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`
- [ ] T042 [US2] Expor registro por item e listagem de devoluções da compra em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`
- [ ] T043 [P] [US2] Integrar devoluções anteriores, compensações e cortes temporais nas consultas de trânsito, pendências e alertas em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraRepository.cs`, `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardAlertaRepository.cs`, `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterComprasEmTransitoQueryHandler.cs` e `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterProdutosPendentesRecebimentoQueryHandler.cs`
- [ ] T044 [US2] Acrescentar quantidades devolvidas antes/depois e elegibilidade nos DTOs e mapper em `src/Amani.ImportadosERP.Application/DTOs/CompraEmTransitoDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/ProdutoPendenteRecebimentoDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/Response/CompraItemResponseDto.cs` e `src/Amani.ImportadosERP.Application/Mappers/CompraMapper.cs`
- [ ] T045 [P] [US2] Criar diálogo Mobile First para devolução anterior com motivos, justificativa de `Outro`, revisão e confirmação em `frontend/src/components/compras/return-dialog.tsx`
- [ ] T046 [US2] Integrar ação e quantidades da devolução anterior ao detalhe e painel de pendências em `frontend/src/components/compras/purchase-detail.tsx`, `frontend/src/components/compras/purchase-history.tsx` e `frontend/src/components/compras/pending-products-panel.tsx`
- [ ] T047 [US2] Executar o cenário de devolução anterior e rejeições da seção 7 de `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar pendência e ausência de movimento em `artifacts/f027-validation-evidence.md`

**Checkpoint**: recusas pré-recebimento encerram trânsito sem tocar estoque ou caixa

---

## Phase 5: User Story 3 — Devolver item depois do recebimento (Priority: P1)

**Goal**: retirar fisicamente produto recebido, preservar a entrada original e reverter a mesma base de custo a partir da devolução

**Independent Test**: devolver 2 unidades de um recebimento a R$ 52,70 e comprovar uma saída de estoque, reversão de R$ 105,40, recebimento preservado e pendência não reaberta

- [ ] T048 [US3] Implementar devolução posterior serializável vinculada ao recebimento com validação de elegibilidade, saldo físico e criação atômica da saída em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`
- [ ] T049 [P] [US3] Resolver origem `DevolucaoCompra` por join às tabelas F027 sem alterar `estoque_movimentacoes` em `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs` e `src/Amani.ImportadosERP.Application/DTOs/Estoque/EstoqueMovimentacaoItemDto.cs`
- [ ] T050 [P] [US3] Subtrair devoluções posteriores da base de aquisição pelo `ValorUnitario` do recebimento em `src/Amani.ImportadosERP.Infra.Data/Repositories/CustoProdutoRepository.cs`
- [ ] T051 [P] [US3] Aplicar a mesma semântica temporal de custo nas leituras gerenciais em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardCustoMedioReadService.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardEstoqueRepository.cs`
- [ ] T052 [US3] Acrescentar recebimentos elegíveis e valores de custo oficiais à resposta de detalhe em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraRepository.cs`, `src/Amani.ImportadosERP.Application/DTOs/Response/CompraItemResponseDto.cs` e `src/Amani.ImportadosERP.Application/Mappers/CompraMapper.cs`
- [ ] T053 [P] [US3] Estender os tipos e mutations de devolução para vínculo obrigatório ao recebimento em `frontend/src/types/purchase.ts`, `frontend/src/services/purchases.ts` e `frontend/src/hooks/use-purchases.ts`
- [ ] T054 [US3] Estender o diálogo para selecionar recebimento, mostrar saldo elegível e impedir confirmação inválida em `frontend/src/components/compras/return-dialog.tsx`
- [ ] T055 [US3] Integrar devolução pós-recebimento, origem de estoque e atualização coordenada das consultas em `frontend/src/components/compras/purchase-detail.tsx`, `frontend/src/components/compras/purchase-history.tsx`, `frontend/src/types/stock.ts` e `frontend/src/components/estoque/stock-movement-list.tsx`
- [ ] T056 [US3] Executar os cenários de devolução posterior, estoque insuficiente, custos distintos e temporalidade das seções 8, 9 e 10 de `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar evidências em `artifacts/f027-validation-evidence.md`

**Checkpoint**: saída física, origem e custo conciliam sem apagar recebimentos nem gerar crédito automático

---

## Phase 6: User Story 4 — Auditar recuperação e prejuízo líquido (Priority: P2)

**Goal**: reconciliar ocorrências brutas, valores recuperados e prejuízo líquido separando coorte operacional de fluxo de caixa

**Independent Test**: combinar perda de R$ 50,00, devolução de R$ 120,00 e reembolso de R$ 100,00 com R$ 90,00 alocados e confirmar prejuízo líquido R$ 80,00 e caixa creditado em R$ 100,00

- [ ] T057 [US4] Validar e persistir alocações parciais por item, perda ou devolução no fluxo de reembolso em `src/Amani.ImportadosERP.Application/Services/CompraService.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraReembolsoRepository.cs`
- [ ] T058 [P] [US4] Implementar agregações SQL de valor bruto F026, recuperação associada e prejuízo líquido por coorte em `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs`
- [ ] T059 [US4] Expor indicadores aditivos e temporalmente consistentes em `src/Amani.ImportadosERP.Application/DTOs/Dashboards/DashboardOperacionalDto.cs` e `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterDashboardOperacionalQueryHandler.cs`
- [ ] T060 [P] [US4] Criar DTO e projeção cronológica unificada de recebimentos, perdas, devoluções, reembolsos e compensações em `src/Amani.ImportadosERP.Application/DTOs/Response/CompraHistoricoEventoDto.cs`, `src/Amani.ImportadosERP.Application/Mappers/CompraMapper.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraRepository.cs`
- [ ] T061 [US4] Renderizar histórico auditável com datas efetiva e de registro e distinção visual entre logística, estoque e financeiro em `frontend/src/components/compras/purchase-history.tsx`
- [ ] T062 [P] [US4] Adicionar contratos e cartões gerenciais de bruto, recuperado e líquido em `frontend/src/types/dashboard.ts`, `frontend/src/services/dashboard.ts` e `frontend/src/components/dashboard/dashboard-kpi-grid.tsx`
- [ ] T063 [US4] Executar os cenários de alocação, prejuízo líquido e legado das seções 12 e 14 de `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar a conciliação em `artifacts/f027-validation-evidence.md`

**Checkpoint**: gestão identifica impacto bruto, recuperação e prejuízo sem dupla contagem

---

## Phase 7: User Story 5 — Corrigir eventos sem apagar histórico (Priority: P2)

**Goal**: neutralizar devoluções e reembolsos incorretos uma única vez, preservando eventos e temporalidade

**Independent Test**: compensar uma devolução pré e outra pós-recebimento e cancelar um reembolso, comprovando efeitos inversos na data da correção, histórico preservado e rejeição da segunda tentativa

- [ ] T064 [US5] Implementar compensação serializável de devolução e cancelamento de reembolso com motivo, data, idempotência e unicidade em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`
- [ ] T065 [US5] Expor `POST /devolucoes/{id}/compensacoes` e `POST /reembolsos/{id}/cancelamentos` sem rotas destrutivas em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`
- [ ] T066 [P] [US5] Aplicar compensações por data à pendência, trânsito e estado logístico em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraItemDevolucaoRepository.cs`, `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraRepository.cs` e `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterComprasEmTransitoQueryHandler.cs`
- [ ] T067 [P] [US5] Criar entrada compensatória com presença física confirmada e restaurar custo pelo snapshot original em `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueMovimentacaoRepository.cs`, `src/Amani.ImportadosERP.Infra.Data/Repositories/CustoProdutoRepository.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardCustoMedioReadService.cs`
- [ ] T068 [P] [US5] Aplicar cancelamentos por data ao caixa, situação financeira e validade das alocações em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraReembolsoRepository.cs`, `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardFinanceiroRepository.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/DashboardOperacionalRepository.cs`
- [ ] T069 [P] [US5] Criar diálogo único de correção com motivo obrigatório e confirmação física condicional em `frontend/src/components/compras/purchase-event-cancel-dialog.tsx`
- [ ] T070 [US5] Integrar ações de compensação/cancelamento, estados de erro e invalidações de compra, estoque e dashboards em `frontend/src/components/compras/purchase-detail.tsx`, `frontend/src/services/purchases.ts` e `frontend/src/hooks/use-purchases.ts`
- [ ] T071 [US5] Executar os cenários de cancelamento e compensação das seções 6 e 11 de `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar unicidade, temporalidade e restauração em `artifacts/f027-validation-evidence.md`

**Checkpoint**: erros humanos são corrigíveis sem hard delete, reescrita retroativa ou efeito duplicado

---

## Phase 8: User Story 6 — Operar com segurança em produção (Priority: P3)

**Goal**: demonstrar compatibilidade, recuperação e conciliação antes de qualquer ativação produtiva

**Independent Test**: ensaiar migration e aplicação numa cópia representativa, comparar baseline antes/depois e obter zero divergência não explicada em histórico, estoque, custo, trânsito e caixa

- [ ] T072 [P] [US6] Exportar e revisar o SQL da migration, comprovando exatamente cinco tabelas novas e ausência de `UPDATE`, `DELETE`, `TRUNCATE`, backfill ou `ALTER` destrutivo em `artifacts/f027-migration-generated.sql`
- [ ] T073 [US6] Ensaiar backup, restauração e migration somente em cópia isolada representativa e registrar versão, checksum, duração, locks e responsáveis em `artifacts/f027-validation-evidence.md`
- [ ] T074 [US6] Executar `artifacts/f027-production-baseline.sql` antes/depois do ensaio e documentar conciliação de compras, recebimentos, perdas, vendas, movimentos, pagamentos e financeiro em `artifacts/f027-validation-evidence.md`
- [ ] T075 [P] [US6] Executar restore/build do backend e lint/typecheck/build do frontend conforme `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar resultados em `artifacts/f027-validation-evidence.md`
- [ ] T076 [US6] Executar a regressão completa dos fluxos legados, incluindo alertas de trânsito e pendências, com a feature desligada e registrar ausência de mudança sem registros F027 em `artifacts/f027-validation-evidence.md`
- [ ] T077 [P] [US6] Executar dez tentativas controladas de replay e concorrência para reembolso, devolução e compensação e registrar no máximo um efeito válido em `artifacts/f027-validation-evidence.md`
- [ ] T078 [P] [US6] Medir dez carregamentos de detalhe, histórico, estoque e dashboards com massa representativa e registrar o critério 9/10 abaixo de dois segundos em `artifacts/f027-validation-evidence.md`
- [ ] T079 [P] [US6] Validar os fluxos completos em 360 px, 768 px e 1440 px, incluindo Dark Theme e ausência de rolagem horizontal, e executar com ao menos dois usuários representativos a medição de operação em até 2 minutos e identificação das informações em até 30 segundos, registrando resultados em `artifacts/f027-validation-evidence.md`
- [ ] T080 [US6] Completar o runbook de deploy gradual, monitoramento, desligamento da flag e rollback lógico sem `Down` em `specs/027-devolucoes-reembolsos-compras/quickstart.md` e registrar aprovações explícitas antes de qualquer produção em `artifacts/f027-validation-evidence.md`

**Checkpoint**: feature tecnicamente pronta, mas produção permanece bloqueada até aprovação nominal documentada

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: consolidar contratos, observabilidade, desempenho e documentação sem ampliar o escopo

- [ ] T081 [P] Revisar respostas e códigos de erro contra `specs/027-devolucoes-reembolsos-compras/contracts/api-contracts.md` em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`
- [ ] T082 [P] Adicionar logs estruturados sem dados sensíveis para operações, conflitos e falhas atômicas em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`
- [ ] T083 Revisar planos de execução e ajustar somente os índices F027 necessários em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/` e na migration F027 de `src/Amani.ImportadosERP.Infra.Data/Migrations/`
- [ ] T084 [P] Revisar acessibilidade, foco, estados de carregamento/sucesso/erro e prevenção de duplo envio em `frontend/src/components/compras/refund-dialog.tsx`, `frontend/src/components/compras/return-dialog.tsx` e `frontend/src/components/compras/purchase-event-cancel-dialog.tsx`
- [ ] T085 Executar integralmente `specs/027-devolucoes-reembolsos-compras/quickstart.md`, fechar todas as evidências em `artifacts/f027-validation-evidence.md` e manter a feature desligada até autorização de produção

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: não possui dependência e começa imediatamente.
- **Foundational (Phase 2)**: depende do Setup e bloqueia todas as histórias.
- **US1, US2 e US3 (Phases 3–5)**: dependem da fundação. Podem avançar em paralelo depois dos contratos compartilhados, mas alterações concorrentes em `CompraService.cs`, `CompraController.cs`, `CompraRepository.cs` e componentes do detalhe precisam ser coordenadas.
- **US4 (Phase 6)**: depende das ocorrências e alocações de US1–US3 para validar a recuperação completa.
- **US5 (Phase 7)**: depende dos eventos originais de US1–US3; suas agregações também atualizam US4.
- **US6 (Phase 8)**: depende de todas as histórias funcionais escolhidas para liberação e bloqueia produção.
- **Polish (Phase 9)**: depende das histórias incluídas na entrega e antecede a aprovação final.

### User Story Dependencies

- **US1 (P1)**: começa após a fundação e funciona sem devolução física.
- **US2 (P1)**: começa após a fundação e funciona sem reembolso e sem estoque.
- **US3 (P1)**: começa após a fundação e funciona sem reembolso, mas exige estoque e recebimento existentes.
- **US4 (P2)**: depende de US1 e das ocorrências de US2/US3 para o cenário completo; cada métrica deve tolerar fontes ainda vazias.
- **US5 (P2)**: depende dos eventos criados por US1–US3 e preserva a independência entre financeiro e logística.
- **US6 (P3)**: depende do escopo funcional completo candidato à implantação.

### Within Each User Story

- Invariantes e persistência antecedem serviços.
- Serviços antecedem endpoints e mutations do frontend.
- Contratos do backend antecedem tipos e componentes do frontend.
- Cálculos oficiais permanecem no backend.
- A tarefa de validação encerra cada história antes da próxima promoção.
- Nenhuma aplicação em produção ocorre como consequência automática da conclusão técnica.

## Parallel Opportunities

- No Setup, T002–T004 podem ser executadas em paralelo após a decisão de configuração T001.
- Na fundação, entidades T005–T009, serviços T010–T011, contratos T012–T016 e mappings T017–T021 formam grupos paralelos; T022–T026 integram esses resultados.
- Após a fundação, US1, US2 e US3 podem ser desenvolvidas por frentes diferentes com coordenação dos arquivos compartilhados.
- Em US1, projeções de compra, financeiro, tipos e diálogo podem avançar em paralelo antes da integração.
- Em US3, estoque, custo atual, custo gerencial e tipos frontend são frentes paralelas.
- Em US4 e US5, consultas gerenciais e componentes visuais podem avançar em paralelo depois dos contratos.
- Em US6, builds, concorrência, desempenho e responsividade podem ser executados em paralelo sobre a mesma versão candidata isolada.

## Parallel Example: User Story 1

```text
T029: projeções de reembolso em CompraRepository.cs
T031: integração financeira em DashboardFinanceiroRepository.cs
T033: tipos aditivos em purchase.ts e dashboard.ts
T035: diálogo de reembolso em refund-dialog.tsx
```

## Parallel Example: User Story 2

```text
T040: regras de pendência no domínio
T043: consultas de trânsito e pendências
T045: diálogo de devolução anterior
```

## Parallel Example: User Story 3

```text
T049: origem no histórico de estoque
T050: custo atual por snapshot
T051: custo gerencial temporal
T053: contratos frontend de devolução posterior
```

## Parallel Example: User Story 4

```text
T058: agregações operacionais no banco
T060: histórico cronológico da compra
T062: contratos e cartões do dashboard
```

## Parallel Example: User Story 5

```text
T066: compensação de pendência e trânsito
T067: restauração de estoque e custo
T068: cancelamento financeiro e alocações
T069: diálogo de correção
```

## Implementation Strategy

### MVP First

1. Concluir Setup e Foundational com a feature desligada.
2. Implementar US1 isoladamente.
3. Validar reembolso parcial, múltiplo, teto, idempotência e caixa sem estoque.
4. Parar para revisão antes de avançar ao fluxo físico.

O MVP funcional é **US1 — Registrar reembolso de compra**, pois resolve o retorno do dinheiro ao financeiro mesmo sem devolução física. Ele não está autorizado para produção sem US6.

### Incremental Delivery

1. Setup + Foundational → schema e contratos aditivos com flag desligada.
2. US1 → recuperação financeira independente.
3. US2 → recusa antes do recebimento sem estoque.
4. US3 → devolução pós-recebimento com estoque e custo.
5. US4 → auditoria e prejuízo líquido.
6. US5 → correções compensatórias.
7. US6 + Polish → ensaio, conciliação e gate de produção.

### Production Safety Strategy

1. Gerar e revisar a migration; não aplicá-la diretamente em produção.
2. Executar backup/restauração e baseline em cópia representativa.
3. Implantar schema e código com `DevolucoesReembolsosComprasEnabled=false` somente após aprovação operacional específica.
4. Executar smoke test e conciliação com a flag desligada.
5. Habilitar gradualmente apenas após aprovação nominal documentada.
6. Em incidente, desligar a flag e preservar tabelas e eventos; não executar `Down` após o primeiro dado F027.

## Notes

- `[P]` indica arquivos distintos e ausência de dependência direta pendente.
- As tasks não criam nova suíte automatizada porque isso está fora do escopo autorizado.
- Toda confirmação usa um novo `operacaoId`; dentro do mesmo tipo de comando, replay idêntico retorna o existente e conteúdo divergente gera conflito.
- Devolução e reembolso permanecem transações independentes.
- O total comercial F026 e o snapshot de custo do recebimento são medidas diferentes.
- Ausência de registro F027 deve reproduzir exatamente o comportamento legado.
- Commits devem ser feitos por tarefa ou grupo lógico somente quando solicitados pelo usuário.
