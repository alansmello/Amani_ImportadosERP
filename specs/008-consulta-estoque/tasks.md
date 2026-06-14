# Tasks: Consulta de Estoque

**Input**: Design documents from `/specs/008-consulta-estoque/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/consulta-estoque-api.md`, `quickstart.md`

**Tests**: A solucao ainda nao possui projeto de testes automatizados. As tarefas de teste abaixo definem validacoes de regressao obrigatorias por build e cenarios HTTP descritos no `quickstart.md`.

**Organization**: Tarefas agrupadas pelas fases solicitadas. Labels `[US1]` a `[US3]` indicam rastreabilidade com as historias da especificacao.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo quando nao altera o mesmo arquivo nem depende da tarefa anterior.
- **[Story]**: Historia coberta pela tarefa (`US1`, `US2`, `US3`).
- Cada tarefa referencia caminhos concretos do repositorio.

## Phase 1: Setup e gates

**Purpose**: Confirmar premissas da feature antes de implementar leitura.

- [X] T001 Confirmar que a feature e somente leitura e nao gera migration: revisar `specs/008-consulta-estoque/plan.md` e garantir que nenhuma tarefa altera entidades, mappings ou schema.
- [X] T002 Validar gates constitucionais para os fluxos afetados (estoque por movimentacoes, sem campo fixo de saldo, analytics por consultas agregadas, DTOs explicitos sem AutoMapper, controllers sem regra de negocio, backend como fonte das regras), registrando conformidade em `specs/008-consulta-estoque/quickstart.md`.

**Checkpoint**: Escopo de leitura confirmado, sem schema afetado.

## Phase 2: Application - Contratos de saida (DTOs)

**Purpose**: Definir os contratos de resposta com mapeamento manual, sem AutoMapper.

- [X] T003 [P] [US1] Criar `EstoqueProdutoSaldoDto` com `ProdutoId`, `NomeProduto`, `CategoriaId` e `Saldo` em `src/Amani.ImportadosERP.Application/DTOs/Estoque/EstoqueProdutoSaldoDto.cs`.
- [X] T004 [P] [US2] Criar `EstoqueMovimentacaoItemDto` com `Id`, `Data`, `Tipo`, `Quantidade`, `Origem`, `CompraId`, `CompraItemId`, `VendaId` e `ValorUnitario` em `src/Amani.ImportadosERP.Application/DTOs/Estoque/EstoqueMovimentacaoItemDto.cs`.
- [X] T005 [US2] Criar `EstoqueProdutoMovimentacoesDto` com `ProdutoId`, `NomeProduto`, `SaldoAtual`, `TotalMovimentacoes` e `Movimentacoes` em `src/Amani.ImportadosERP.Application/DTOs/Estoque/EstoqueProdutoMovimentacoesDto.cs`.

**Checkpoint**: Contratos de resposta prontos antes de Queries e repository.

## Phase 3: Infra.Data - Leitura agregada

**Purpose**: Estender o repository de consulta com agregacao no banco, preservando `ObterSaldoAsync`.

- [X] T006 [US1] Estender `IEstoqueConsultaRepository` com `ObterSaldosAsync(Guid? categoriaId, bool apenasComSaldo)` retornando saldo agregado por produto em `src/Amani.ImportadosERP.Application/Interfaces/IEstoqueConsultaRepository.cs`.
- [X] T007 [US2] Estender `IEstoqueConsultaRepository` com `ObterMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo, int limite)` e `ContarMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo)` em `src/Amani.ImportadosERP.Application/Interfaces/IEstoqueConsultaRepository.cs`.
- [X] T008 [US1] Implementar `ObterSaldosAsync` por agregacao no banco (LEFT JOIN do cadastro de produto com soma de entradas mais inventario inicial menos saidas), incluindo produtos sem movimentacao com saldo zero e aplicando filtros de categoria e apenas com saldo, em `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs`.
- [X] T009 [US2] Implementar `ObterMovimentacoesAsync` aplicando filtros de periodo e tipo e o limite na consulta, ordenando por `Data` decrescente e, no desempate, por `CreatedAt` decrescente, sem materializar o historico integral; implementar `ContarMovimentacoesAsync` com os mesmos filtros e contagem antes do limite por agregacao no banco, em `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs`.
- [X] T010 [US1] Garantir que `ObterSaldoAsync(Guid produtoId)` existente permanece inalterado e continua usado por `VendaService`, em `src/Amani.ImportadosERP.Infra.Data/Repositories/EstoqueConsultaRepository.cs`.

**Checkpoint**: Leitura agregada disponivel sem afetar o calculo de saldo existente.

## Phase 4: Application - Queries, Handlers e mapeamento

**Purpose**: Expressar os casos de uso de leitura via MediatR com mapeamento manual.

- [X] T011 [P] [US1] Criar `ObterSaldosEstoqueQuery` com `CategoriaId` e `ApenasComSaldo` retornando `IReadOnlyCollection<EstoqueProdutoSaldoDto>` em `src/Amani.ImportadosERP.Application/Queries/ObterSaldosEstoqueQuery.cs`.
- [X] T012 [US1] Criar `ObterSaldosEstoqueQueryHandler` delegando ao repository e mapeando manualmente para `EstoqueProdutoSaldoDto` em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterSaldosEstoqueQueryHandler.cs`.
- [X] T013 [P] [US2] Criar `ObterMovimentacoesProdutoQuery` com `ProdutoId`, `DataInicio`, `DataFim`, `Tipo` e `Limite` retornando `EstoqueProdutoMovimentacoesDto` em `src/Amani.ImportadosERP.Application/Queries/ObterMovimentacoesProdutoQuery.cs`.
- [X] T014 [US2] Criar `ObterMovimentacoesProdutoQueryHandler` que valida existencia do produto (404 quando inexistente), calcula `SaldoAtual` pelo historico completo, popula `TotalMovimentacoes` via `ContarMovimentacoesAsync` com os filtros aplicados antes do limite, aplica limite padrao/maximo e mapeia manualmente a origem (`Compra`, `Venda`, `InventarioInicial`) em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterMovimentacoesProdutoQueryHandler.cs`.
- [X] T015 [US3] Implementar no handler de historico a validacao de periodo (`DataInicio` maior que `DataFim` invalido) e de tipo, e a normalizacao de datas em UTC, em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterMovimentacoesProdutoQueryHandler.cs`.
- [X] T016 [US3] Definir constantes de limite padrao (50) e limite maximo (200) do historico e aplica-las no handler em `src/Amani.ImportadosERP.Application/Queries/Handlers/ObterMovimentacoesProdutoQueryHandler.cs`.

**Checkpoint**: Casos de uso de saldo e historico prontos antes da API.

## Phase 5: API - EstoqueController

**Purpose**: Expor os endpoints contratados, mantendo o controller sem regra de negocio.

- [X] T017 [US1] Criar `EstoqueController` com rota `api/estoque` e injetar `IMediator` em `src/Amani.ImportadosERP.Api/Controllers/EstoqueController.cs`.
- [X] T018 [US1] Implementar `GET /api/estoque` com query opcional `categoriaId` e `apenasComSaldo`, delegando a `ObterSaldosEstoqueQuery`, em `src/Amani.ImportadosERP.Api/Controllers/EstoqueController.cs`.
- [X] T019 [US2] Implementar `GET /api/estoque/{produtoId}/movimentacoes` com filtros `dataInicio`, `dataFim`, `tipo` e `limite`, delegando a `ObterMovimentacoesProdutoQuery`, em `src/Amani.ImportadosERP.Api/Controllers/EstoqueController.cs`.
- [X] T020 [US3] Padronizar respostas `400` (produtoId/tipo/periodo invalidos) e `404` (produto inexistente) a partir dos erros da Application em `src/Amani.ImportadosERP.Api/Controllers/EstoqueController.cs`.

**Checkpoint**: Contrato HTTP de consulta de estoque exposto e delegando ao backend.

## Phase 6: IoC e wiring

**Purpose**: Garantir registro e descoberta dos componentes.

- [ ] T021 Confirmar que `IEstoqueConsultaRepository` permanece registrado e que as novas Queries/Handlers sao descobertas pelo registro de assembly do MediatR em `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs` (sem nova interface se a existente foi estendida).

**Checkpoint**: Dependencias resolvidas sem nova abstracao desnecessaria.

## Phase 7: Testes e regressoes

**Purpose**: Validar criterios de aceite e ausencia de efeitos colaterais.

- [ ] T022 Executar `dotnet build` e validar manualmente, via cenarios HTTP do `quickstart.md`, que as consultas respondem em ate 2 segundos para o volume de referencia, usam agregacao/limites e nao materializam historico integral; registrar resultado em `specs/008-consulta-estoque/quickstart.md`, confirmando ausencia de migration pendente.
- [ ] T023 [US1] Validar `GET /api/estoque`: saldo igual a entradas mais inventario inicial menos saidas, produto sem movimentacao com saldo zero, em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T024 [US1] Validar filtros da lista: por categoria e por apenas com saldo positivo, em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T025 [US2] Validar `GET /api/estoque/{produtoId}/movimentacoes`: `saldoAtual`, lista ordenada por data, origem `Compra`/`Venda`/`InventarioInicial` com referencias corretas, em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T026 [US3] Validar filtros de periodo e tipo e que `saldoAtual` reflete o historico completo independente dos filtros em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T027 [US3] Validar limite padrao de 50 sem limite informado, limite maximo de 200 quando excede, e `totalMovimentacoes` refletindo a contagem total dos filtros antes do limite quando houver truncamento, em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T028 [US3] Validar rejeicoes: `produtoId` invalido `400`, `tipo` invalido `400`, periodo invalido `400`, produto inexistente `404`, em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T029 [US2] Validar produto sem movimentacoes: `saldoAtual` zero e `movimentacoes` vazio em `specs/008-consulta-estoque/quickstart.md`.
- [ ] T030 Validar regressao: `VendaService` continua validando saldo fisico via `ObterSaldoAsync`; nenhuma consulta cria, altera ou apaga movimentacao; nenhuma migration nova, em `specs/008-consulta-estoque/quickstart.md`.

**Checkpoint**: Regressao obrigatoria completa antes da validacao final.

## Phase 8: Documentacao/validacao final

**Purpose**: Conferir consistencia final dos artefatos Spec Kit e preparar handoff.

- [ ] T031 Atualizar `specs/008-consulta-estoque/quickstart.md` com resultados finais dos cenarios executados.
- [ ] T032 Conferir que `specs/008-consulta-estoque/contracts/consulta-estoque-api.md` reflete os endpoints implementados.
- [ ] T033 Conferir que `specs/008-consulta-estoque/data-model.md` reflete a leitura sem campo fixo de saldo e sem migration.
- [ ] T034 Executar analise cruzada final entre `spec.md`, `plan.md`, `data-model.md`, `contracts/consulta-estoque-api.md`, `quickstart.md` e `tasks.md`.

**Checkpoint**: Feature pronta para validacao completa conforme a Constituicao.

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1**: Sem dependencias; confirma escopo de leitura.
- **Phase 2**: Pode iniciar apos Phase 1; define DTOs de resposta.
- **Phase 3**: Pode iniciar apos Phase 1; independe dos DTOs, mas e consumida pelos handlers.
- **Phase 4**: Depende das Phases 2 e 3 (DTOs e metodos do repository).
- **Phase 5**: Depende da Phase 4 (Queries/Handlers).
- **Phase 6**: Depende das Phases 3 a 5.
- **Phase 7**: Depende das Phases 1 a 6 implementadas.
- **Phase 8**: Depende da Phase 7.

### User Story Dependencies

- **US1 (P1)**: Lista de saldo; base para o modulo de Estoque do frontend.
- **US2 (P1)**: Historico por produto; depende do calculo de saldo e da leitura de movimentacoes.
- **US3 (P2)**: Filtros e limites; refina US2 com escala e validacoes.

### Parallel Opportunities

- T003 e T004 podem ser executadas em paralelo.
- T011 e T013 podem ser executadas em paralelo apos os DTOs e o repository existirem.

## Implementation Strategy

### MVP First

1. Concluir Phases 1 a 3.
2. Implementar US1 (saldo) em T011-T012, T017-T018 e validar T023-T024.
3. Confirmar que a lista de saldo reflete entradas menos saidas sem campo fixo.

### Incremental Delivery

1. Entregar US1: lista de saldo por produto.
2. Entregar US2: historico de movimentacoes por produto.
3. Entregar US3: filtros, limites e validacoes de borda.
4. Executar regressao completa antes do handoff.

## Notes

- Nao usar AutoMapper em nenhuma tarefa.
- Nao criar campo fixo de saldo nem nova migration.
- Backend centraliza o calculo de saldo e as agregacoes; controllers apenas delegam.
- Saldo e sempre derivado de `EstoqueMovimentacao` (entradas mais inventario inicial menos saidas).
- `ObterSaldoAsync` existente permanece inalterado para preservar `VendaService`.
