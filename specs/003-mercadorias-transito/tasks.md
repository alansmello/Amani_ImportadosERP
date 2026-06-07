# Tasks: Mercadorias em Transito e Recebimento Parcial

**Input**: Design documents from `/specs/003-mercadorias-transito/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/compras-transito-api.md`, `quickstart.md`

**Tests**: A solucao ainda nao possui projeto de testes automatizados. As tarefas de teste abaixo definem validacoes de regressao obrigatorias por build, migration e cenarios HTTP descritos no `quickstart.md`.

**Organization**: Tarefas agrupadas pelas fases solicitadas. Labels `[US1]` a `[US4]` indicam rastreabilidade com as historias da especificacao.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo quando nao altera o mesmo arquivo nem depende da tarefa anterior.
- **[Story]**: Historia coberta pela tarefa (`US1`, `US2`, `US3`, `US4`).
- Cada tarefa referencia caminhos concretos do repositorio.

## Phase 1: Infra/Data Model/Migrations

**Purpose**: Preparar entidades, mapeamentos EF Core, schema e compatibilidade de dados legados.

- [X] T001 Adicionar enum/status operacional da compra com `Criada`, `EmTransito`, `ParcialmenteRecebida`, `Recebida`, `Finalizada` e `Cancelada` em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T002 Atualizar `Compra` para armazenar status operacional e navegar recebimentos/perdas quando necessario em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T003 Atualizar `CompraItem` com navegacoes para recebimentos/perdas e calculos de `QuantidadeRecebida`, `QuantidadePerdida` e `QuantidadePendente` em `src/Amani.ImportadosERP.Domain/Entities/CompraItem.cs`.
- [X] T004 [P] Criar entidade `CompraItemRecebimento` com origem `Operacional` e `Legado/Migrado`, valor unitario e vinculo opcional com movimentacao em `src/Amani.ImportadosERP.Domain/Entities/CompraItemRecebimento.cs`.
- [X] T005 [P] Criar entidade `CompraItemPerda` com motivo `Perda`, `Extravio` ou `Avaria` em `src/Amani.ImportadosERP.Domain/Entities/CompraItemPerda.cs`.
- [X] T006 Atualizar `EstoqueMovimentacao` para incluir `CompraItemId` nullable e navegacao opcional para item de compra em `src/Amani.ImportadosERP.Domain/Entities/EstoqueMovimentacao.cs`.
- [X] T007 Registrar `DbSet` para recebimentos e perdas no `src/Amani.ImportadosERP.Infra.Data/Context/AmaniDbContext.cs`.
- [X] T008 Atualizar mapping de compra para persistir status operacional em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraMapping.cs`.
- [X] T009 Atualizar mapping de item de compra para relacionar recebimentos e perdas em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemMapping.cs`.
- [X] T010 [P] Criar Fluent API de `CompraItemRecebimento` com indices por compra, item e produto em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemRecebimentoMapping.cs`.
- [X] T011 [P] Criar Fluent API de `CompraItemPerda` com indices por compra, item e produto em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/CompraItemPerdaMapping.cs`.
- [X] T012 Atualizar mapping de `EstoqueMovimentacao` para `CompraItemId` nullable em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/EstoqueMovimentacaoMapping.cs`.
- [X] T013 Criar migration `AddMercadoriasTransitoRecebimentoParcial` com status em compras, tabelas de recebimentos/perdas e `CompraItemId` nullable em `src/Amani.ImportadosERP.Infra.Data/Migrations/`.
- [X] T014 Incluir na migration a atualizacao de compras existentes para status `Recebida` em `src/Amani.ImportadosERP.Infra.Data/Migrations/`.
- [X] T015 Incluir na migration a criacao de recebimentos `Legado/Migrado` por item legado, sem criar nova `EstoqueMovimentacao`, em `src/Amani.ImportadosERP.Infra.Data/Migrations/`.
- [X] T016 Garantir na migration que movimentacoes antigas permanecem com `CompraItemId` nulo e rastreaveis por `CompraId + ProdutoId` em `src/Amani.ImportadosERP.Infra.Data/Migrations/`.
- [X] T017 Atualizar `AmaniDbContextModelSnapshot` via migration EF Core em `src/Amani.ImportadosERP.Infra.Data/Migrations/AmaniDbContextModelSnapshot.cs`.

**Checkpoint**: Modelo de dados e migration definidos antes das regras de negocio.

## Phase 2: Domain

**Purpose**: Centralizar invariantes de quantidade, status e rastreabilidade no dominio.

- [X] T018 [US1] Definir regra de status inicial de compra criada como pendente/logistica em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T019 [US2] Implementar validacao de recebimento maior que zero e limitado a `QuantidadePendente` em `src/Amani.ImportadosERP.Domain/Entities/CompraItem.cs`.
- [X] T020 [US3] Implementar validacao de perda maior que zero e limitada a `QuantidadePendente` em `src/Amani.ImportadosERP.Domain/Entities/CompraItem.cs`.
- [X] T021 [US2] Implementar regra para bloquear recebimento em compra `Cancelada` ou `Finalizada` em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T022 [US3] Implementar regra para bloquear perda em compra `Cancelada` ou `Finalizada` em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T023 [US2] Implementar recalculo de status para `ParcialmenteRecebida` e `Recebida` apos recebimentos em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T024 [US3] Implementar recalculo de status para `EmTransito` e `Finalizada` quando perdas resolvem pendencias em `src/Amani.ImportadosERP.Domain/Entities/Compra.cs`.
- [X] T025 [US1] Garantir que nenhuma entidade de produto, compra ou item tenha campo fixo de estoque em `src/Amani.ImportadosERP.Domain/Entities/Produto.cs`, `src/Amani.ImportadosERP.Domain/Entities/Compra.cs` e `src/Amani.ImportadosERP.Domain/Entities/CompraItem.cs`.

**Checkpoint**: Invariantes prontas antes dos casos de uso.

## Phase 3: Application

**Purpose**: Implementar DTOs, interfaces, repositories e services sem AutoMapper, com transacoes nos casos de uso criticos.

- [X] T026 [P] [US2] Criar `RegistrarRecebimentoCompraItemDto` em `src/Amani.ImportadosERP.Application/DTOs/RegistrarRecebimentoCompraItemDto.cs`.
- [X] T027 [P] [US3] Criar `RegistrarPerdaCompraItemDto` em `src/Amani.ImportadosERP.Application/DTOs/RegistrarPerdaCompraItemDto.cs`.
- [X] T028 [P] [US2] Criar `RecebimentoCompraItemDto` em `src/Amani.ImportadosERP.Application/DTOs/RecebimentoCompraItemDto.cs`.
- [X] T029 [P] [US3] Criar `PerdaCompraItemDto` em `src/Amani.ImportadosERP.Application/DTOs/PerdaCompraItemDto.cs`.
- [X] T030 [P] [US4] Criar `CompraEmTransitoDto` e DTO de item em `src/Amani.ImportadosERP.Application/DTOs/CompraEmTransitoDto.cs`.
- [X] T031 [P] [US4] Criar `ProdutoPendenteRecebimentoDto` em `src/Amani.ImportadosERP.Application/DTOs/ProdutoPendenteRecebimentoDto.cs`.
- [X] T032 [US1] Atualizar `CompraItemResponseDto` para expor quantidades comprada, recebida, perdida e pendente em `src/Amani.ImportadosERP.Application/DTOs/Response/CompraItemResponseDto.cs`.
- [X] T033 [US1] Atualizar `CompraResponseDto` e `CompraListDto` para expor status operacional em `src/Amani.ImportadosERP.Application/DTOs/Response/CompraResponseDto.cs` e `src/Amani.ImportadosERP.Application/DTOs/CompraListDto.cs`.
- [X] T034 [US1] Atualizar `CompraMapper` para mapeamento manual de status e quantidades calculadas, sem AutoMapper, em `src/Amani.ImportadosERP.Application/Mappers/CompraMapper.cs`.
- [X] T035 [P] [US2] Criar mapper manual de recebimentos em `src/Amani.ImportadosERP.Application/Mappers/CompraRecebimentoMapper.cs`.
- [X] T036 [P] [US3] Criar mapper manual de perdas em `src/Amani.ImportadosERP.Application/Mappers/CompraPerdaMapper.cs`.
- [X] T037 [US2] Estender `ICompraRepository` com busca de compra por item incluindo itens, recebimentos e perdas em `src/Amani.ImportadosERP.Application/Interfaces/ICompraRepository.cs`.
- [X] T038 [P] [US2] Criar interface `ICompraItemRecebimentoRepository` em `src/Amani.ImportadosERP.Application/Interfaces/ICompraItemRecebimentoRepository.cs`.
- [X] T039 [P] [US3] Criar interface `ICompraItemPerdaRepository` em `src/Amani.ImportadosERP.Application/Interfaces/ICompraItemPerdaRepository.cs`.
- [X] T040 Criar interface de unidade de trabalho/transacao para casos atomicos em `src/Amani.ImportadosERP.Application/Interfaces/IUnitOfWork.cs`.
- [X] T041 [US1] Alterar `CompraService.CreateAsync` para persistir compra e itens sem criar `EstoqueMovimentacao` em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T042 [US1] Definir status inicial da compra criada como `EmTransito` ou equivalente pendente em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T043 [US2] Implementar `RegistrarRecebimentoItemAsync` com validacao de compra, item pertencente, pendencia e status em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T044 [US2] Garantir transacao unica do recebimento: criar recebimento, criar entrada de estoque, vincular `EstoqueMovimentacaoId` e atualizar status em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T045 [US2] Criar `EstoqueMovimentacao` de `Entrada` por recebimento operacional preenchendo `CompraId`, `CompraItemId`, `ProdutoId`, quantidade e valor unitario em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T046 [US3] Implementar `RegistrarPerdaItemAsync` com validacao de compra, item pertencente, motivo, pendencia e status em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T047 [US3] Garantir transacao unica da perda: criar `CompraItemPerda` como a rastreabilidade de prejuizo operacional desta feature e atualizar status, sem criar evento financeiro, despesa ou impacto financeiro separado em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T048 [US3] Garantir que perda/extravio/avaria nao chama `IEstoqueMovimentacaoRepository` nem cria movimentacao em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T049 [US4] Implementar metodos de historico de recebimentos e perdas em `src/Amani.ImportadosERP.Application/Services/CompraService.cs`.
- [X] T050 Atualizar `CustoProdutoRepository` para considerar `InventarioInicial` com valor unitario e `Entrada` de recebimento confirmado, excluindo compra sem recebimento e perdas, em `src/Amani.ImportadosERP.Infra.Data/Repositories/CustoProdutoRepository.cs`.
- [X] T051 Atualizar/validar `EstoqueConsultaRepository` para tratar `InventarioInicial` como entrada fisica valida e preservar saidas de venda em `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs`.
- [X] T052 [P] Implementar `CompraItemRecebimentoRepository` em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraItemRecebimentoRepository.cs`.
- [X] T053 [P] Implementar `CompraItemPerdaRepository` em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraItemPerdaRepository.cs`.
- [X] T054 Implementar unidade de trabalho/transacao EF Core em `src/Amani.ImportadosERP.Infra.Data/Repositories/UnitOfWork.cs`.
- [X] T055 Registrar repositories e unidade de trabalho no container DI em `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs`.

**Checkpoint**: Casos de uso de criacao, recebimento, perda, custo medio e transacoes prontos antes da API.

## Phase 4: API

**Purpose**: Expor os endpoints contratados, mantendo controllers sem regra de negocio.

- [X] T056 [US1] Atualizar `POST /api/compras` para retornar compra criada sem depender de movimentacao automatica em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T057 [US2] Adicionar `POST /api/compras/{compraId}/itens/{itemId}/recebimentos` delegando ao service e retornando `201` em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T058 [US3] Adicionar `POST /api/compras/{compraId}/itens/{itemId}/perdas` delegando ao service e retornando `201` em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T059 [US4] Adicionar `GET /api/compras/em-transito` delegando a consulta de compras pendentes em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T060 [US4] Adicionar `GET /api/compras/produtos-pendentes` delegando a consulta de itens pendentes em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T061 [US4] Adicionar `GET /api/compras/{compraId}/recebimentos` para historico de recebimentos em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T062 [US4] Adicionar `GET /api/compras/{compraId}/perdas` para historico de perdas em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T063 [US1] Atualizar `GET /api/compras/{id}` para incluir status e quantidades calculadas por item em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T064 Padronizar respostas `400`, `404` e `409` dos novos endpoints a partir de erros da Application em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.
- [X] T065 Validar `ModelState`/DTOs dos endpoints de recebimento, perda, historico e mercadorias em transito, garantindo resposta `400 Bad Request` para payload invalido em `src/Amani.ImportadosERP.Api/Controllers/CompraController.cs`.

**Checkpoint**: Contrato HTTP da feature exposto e delegando regras ao backend.

## Phase 5: Consultas/Relatorios

**Purpose**: Disponibilizar visao operacional de transito, pendencias e historicos.

- [X] T066 [US4] Criar query `ObterComprasEmTransitoQuery` em `src/Amani.ImportadosERP.Application/Queries/ObterComprasEmTransitoQuery.cs`.
- [X] T067 [US4] Criar handler de compras em transito excluindo status `Recebida`, `Finalizada` e `Cancelada` em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterComprasEmTransitoQueryHandler.cs`.
- [X] T068 [US4] Criar query `ObterProdutosPendentesRecebimentoQuery` em `src/Amani.ImportadosERP.Application/Queries/ObterProdutosPendentesRecebimentoQuery.cs`.
- [X] T069 [US4] Criar handler de produtos pendentes com `QuantidadePendente > 0` em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterProdutosPendentesRecebimentoQueryHandler.cs`.
- [X] T070 [US4] Criar query `ObterRecebimentosCompraQuery` em `src/Amani.ImportadosERP.Application/Queries/ObterRecebimentosCompraQuery.cs`.
- [X] T071 [US4] Criar handler de historico de recebimentos ordenado por data e incluindo origem `Legado/Migrado` em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterRecebimentosCompraQueryHandler.cs`.
- [X] T072 [US4] Criar query `ObterPerdasCompraQuery` em `src/Amani.ImportadosERP.Application/Queries/ObterPerdasCompraQuery.cs`.
- [X] T073 [US4] Criar handler de historico de perdas ordenado por data e motivo em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterPerdasCompraQueryHandler.cs`.
- [X] T074 [US4] Estender `ICompraRepository` com metodos de consulta para transito, pendencias, recebimentos e perdas em `src/Amani.ImportadosERP.Application/Interfaces/ICompraRepository.cs`.
- [X] T075 [US4] Implementar consultas agregadas de transito, pendencias e historicos no repository em `src/Amani.ImportadosERP.Infra.Data/Repositories/CompraRepository.cs`.

**Checkpoint**: Consultas operacionais entregam pendencias e historicos sem criar campos fixos de estoque.

## Phase 6: Testes e regressoes

**Purpose**: Validar criterios de aceite, compatibilidade e fluxos existentes afetados.

- [ ] T076 Executar `dotnet build` e registrar resultado da compilacao em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T077 [US1] Validar criacao de compra sem aumento de estoque e registrar evidencia em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T078 [US1] Validar que compra criada aparece em mercadorias em transito com pendencia igual a quantidade comprada em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T079 [US2] Validar recebimento parcial gerando somente uma entrada de estoque na quantidade recebida em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T080 [US2] Validar multiplos recebimentos do mesmo item acumulando historico e saldo fisico em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T081 [US2] Validar atomicidade do recebimento simulando falha e confirmando ausencia de recebimento/movimentacao/status parcial em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T082 [US3] Validar perda, extravio e avaria reduzindo pendencia sem criar `EstoqueMovimentacao` em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T083 [US3] Validar atomicidade da perda simulando falha e confirmando ausencia de perda/status parcial em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T084 [US2] Validar rejeicao de recebimento com quantidade zero, negativa ou maior que a pendencia em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T085 [US3] Validar rejeicao de perda com quantidade zero, negativa, motivo invalido ou maior que a pendencia em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T086 [US2] Validar rejeicao de recebimento/perda para item que nao pertence a compra em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T087 Validar payloads invalidos dos endpoints de recebimento, perda, historicos e mercadorias em transito retornando `400 Bad Request` em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T088 [US1] Validar status `Recebida`, `Finalizada`, `ParcialmenteRecebida`, `EmTransito` e exclusao de `Recebida`, `Finalizada`, `Cancelada` da lista de transito em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T089 Validar compatibilidade de compras legadas: status `Recebida`, recebimentos `Legado/Migrado`, pendencia zero e nenhuma nova movimentacao de estoque em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T090 Validar que movimentacoes antigas continuam rastreaveis por `CompraId + ProdutoId` com `CompraItemId` nulo em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T091 Validar vendas existentes: venda antes do recebimento rejeitada, venda acima do recebido rejeitada e venda dentro do saldo fisico aceita em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T092 Validar inventario inicial: registro continua criando movimentacao valida e compondo saldo fisico em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T093 Validar custo medio com `InventarioInicial` e recebimento confirmado, excluindo compra sem recebimento e perdas em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T094 Validar impacto esperado no lucro de produtos com inventario inicial valorizado em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T095 Validar dashboard financeiro mantendo compra registrada como impacto financeiro imediato e sem alteracao por recebimento/perda em `specs/003-mercadorias-transito/quickstart.md`.
- [ ] T096 Validar que inventario inicial, saldo inicial de caixa e contas a receber iniciais nao foram alterados pela feature em `specs/003-mercadorias-transito/quickstart.md`.

**Checkpoint**: Regressao obrigatoria completa antes da validacao final.

## Phase 7: Documentacao/validacao final

**Purpose**: Conferir consistencia final dos artefatos Spec Kit e preparar handoff.

- [ ] T097 Atualizar `specs/003-mercadorias-transito/quickstart.md` com resultados finais dos cenarios executados.
- [ ] T098 Conferir que `specs/003-mercadorias-transito/contracts/compras-transito-api.md` continua refletindo todos os endpoints implementados.
- [ ] T099 Conferir que `specs/003-mercadorias-transito/data-model.md` continua refletindo entidades, status, migration legada e `CompraItemId` nullable.
- [ ] T100 Conferir que `specs/003-mercadorias-transito/plan.md` continua consistente com custo medio, dashboard financeiro, atomicidade e compras legadas.
- [ ] T101 Executar analise cruzada final entre `spec.md`, `plan.md`, `data-model.md`, `contracts/compras-transito-api.md`, `quickstart.md` e `tasks.md`.
- [ ] T102 Registrar no handoff que a Feature 003 altera apenas fluxo fisico/operacional de estoque e nao altera regime financeiro em `specs/003-mercadorias-transito/quickstart.md`.

**Checkpoint**: Feature pronta para implementacao/validacao completa conforme Constituicao 2.0.0.

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Sem dependencias; prepara schema, entidades e migration.
- **Phase 2**: Depende da Phase 1 para regras de entidades e status.
- **Phase 3**: Depende da Phase 2 para services, DTOs, repositories e transacoes.
- **Phase 4**: Depende da Phase 3 para expor endpoints sem regra nos controllers.
- **Phase 5**: Depende das entidades e repositories da Phase 3; pode iniciar apos DTOs de consulta existirem.
- **Phase 6**: Depende das Phases 1-5 implementadas.
- **Phase 7**: Depende da Phase 6 e dos resultados de validacao.

### User Story Dependencies

- **US1 (P1)**: Criacao de compra sem estoque automatico e transito; base para toda a feature.
- **US2 (P1)**: Recebimento por item; depende de US1 e de saldo por movimentacoes.
- **US3 (P2)**: Perdas por item; depende de US1 e das regras de pendencia.
- **US4 (P3)**: Consultas e historicos; depende dos eventos de US2/US3 e do status de US1.

### Parallel Opportunities

- T004-T005 podem ser executadas em paralelo.
- T010-T011 podem ser executadas em paralelo.
- T026-T031 podem ser executadas em paralelo.
- T035-T036 podem ser executadas em paralelo.
- T038-T039 podem ser executadas em paralelo.
- T052-T053 podem ser executadas em paralelo.
- Handlers de consulta T067, T069, T071 e T073 podem ser desenvolvidos em paralelo apos T066, T068, T070 e T072.

## Implementation Strategy

### MVP First

1. Concluir Phases 1 e 2.
2. Implementar US1 em T041-T042, T056, T063 e validacoes T076-T077.
3. Validar que compra criada nao altera estoque e aparece em transito.

### Incremental Delivery

1. Entregar US1: compra sem entrada automatica.
2. Entregar US2: recebimentos parciais com entrada de estoque atomica.
3. Entregar US3: perdas sem estoque e com rastreabilidade.
4. Entregar US4: consultas de transito, pendencias e historicos.
5. Executar regressao completa antes do handoff.

## Notes

- Nao usar AutoMapper em nenhuma tarefa.
- Nao criar campo fixo de estoque.
- Backend centraliza validacoes de quantidade, status, recebimento, perda e custo medio.
- `CompraItemId` em `EstoqueMovimentacao` e nullable por compatibilidade; novas entradas por recebimento operacional devem preencher o campo.
- Recebimentos `Legado/Migrado` sao criados apenas pela migration de compatibilidade e nao geram nova movimentacao de estoque.
