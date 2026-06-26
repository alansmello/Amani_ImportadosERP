# Tasks: Configurações e Categorias (Refinamento, Frontend)

**Input**: Design documents from `/specs/019-configuracoes-categorias-frontend/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [research.md](./research.md) · [data-model.md](./data-model.md) · [contracts/](./contracts/)

**Tests**: Não solicitados na spec — apenas validação manual via [quickstart.md](./quickstart.md).

**Organization**: Tasks agrupadas por user story para implementação e teste independentes.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependências entre si)
- **[Story]**: A qual user story pertence (US1–US4)
- Caminhos completos em cada task

---

## Phase 1: Setup

**Purpose**: Verificar pré-condições antes de qualquer alteração.

- [X] T001 Verificar build inicial limpo — executar `dotnet build Amani_ImportadosERP.sln` (backend) e `npm run typecheck && npm run lint` em `frontend/` — confirmar zero erros antes de iniciar

**Checkpoint**: Build limpo confirmado.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extensões de interface de domínio e estrutura da página que desbloqueiam todas as user stories.

**⚠️ CRÍTICO**: Nenhuma user story pode ser iniciada antes desta fase estar completa.

- [X] T002 [P] Adicionar método `Reativar()` à entidade de domínio em `src/Amani.ImportadosERP.Domain/Entities/CategoriaDespesa.cs` — simétrico a `Inativar()`: se já ativa, retorna; senão, define `Ativa = true` e chama `Touch()`
- [X] T003 [P] Adicionar assinatura `Task RemoverAsync(Guid id)` à interface `src/Amani.ImportadosERP.Application/Interfaces/ICategoriaRepository.cs`
- [X] T004 [P] Verificar `src/Amani.ImportadosERP.Application/Interfaces/ICategoriaDespesaRepository.cs` — adicionar `Task ReativarAsync(Guid id)` se ausente
- [X] T005 Refatorar `frontend/src/app/configuracoes/page.tsx` — substituir grid de cards por layout de 4 abas horizontais com `useState<string>` para aba ativa: "categorias-produto", "categorias-despesa", "taxas", "implantacao"; conteúdo de cada aba renderizado condicionalmente; aba ativa com indicação visual (underline ou borda); compatível com scroll em viewport mobile

**Checkpoint**: Interfaces estendidas + estrutura de abas funcionando (sem conteúdo real nas abas ainda) → pode iniciar todas as user stories.

---

## Phase 3: User Story 1 — Gerenciar Categorias de Produto (Priority: P1) 🎯 MVP

**Goal**: CRUD completo de categorias de produto inline na aba "Categorias de Produto" da página `/configuracoes`.

**Independent Test**: Acessar `/configuracoes`, abrir aba "Categorias de Produto", criar uma categoria, editar o nome, remover — sem sair da página. Validar que erro de backend é exibido ao tentar remover categoria com produtos vinculados.

### Implementation — Backend

- [X] T006 [P] [US1] Implementar `RemoverAsync(Guid id)` em `src/Amani.ImportadosERP.Infra.Data/Repositories/CategoriaRepository.cs` — localizar por Id, remover via EF Core `Remove` + `SaveChangesAsync`; lançar `KeyNotFoundException` se não encontrada
- [X] T007 [P] [US1] Implementar `RemoverAsync(Guid id)` em `src/Amani.ImportadosERP.Application/Services/CategoriaService.cs` — chamar `_categoriaRepository.RemoverAsync(id)`; capturar `DbUpdateException` (FK violation) e relançar como `InvalidOperationException` com mensagem descritiva

- [X] T008 [US1] Adicionar `DELETE /{id:guid}` em `src/Amani.ImportadosERP.Api/Controllers/CategoriasController.cs` — chamar `_service.RemoverAsync(id)`; retornar `204` no sucesso, `404` se `KeyNotFoundException`, `409 Conflict` se `InvalidOperationException` (categoria com produtos vinculados)

### Implementation — Frontend

- [X] T009 [P] [US1] Adicionar `CreateCategoryPayload` e `UpdateCategoryPayload` em `frontend/src/types/category.ts` — ambos com campo `nome: string`
- [X] T010 [US1] Adicionar `create(payload: CreateCategoryPayload)`, `update(id: string, payload: UpdateCategoryPayload)` e `remove(id: string)` em `frontend/src/services/categories.ts` — seguir padrão de `apiClient` existente; `remove` usa `method: "DELETE"`
- [X] T011 [US1] Adicionar `useCreateCategory()`, `useUpdateCategory()` e `useRemoveCategory()` em `frontend/src/hooks/use-categories.ts` — cada `useMutation` invalida `categoryQueryKeys.all` em `onSuccess`; seguir padrão de `use-expense-categories.ts`
- [X] T012 [US1] Criar `frontend/src/components/configuracoes/product-categories-manager.tsx` — componente com formulário inline (campo "Nome", botão "Criar categoria" / "Salvar") + lista de categorias com botões "Editar" e "Remover"; estado de edição inline (sem modal); erro do backend exibido em banner vermelho; estados loading/error/empty; seguir padrão visual de `expense-categories-manager.tsx`
- [X] T013 [US1] Inserir `<ProductCategoriesManager />` na aba "categorias-produto" de `frontend/src/app/configuracoes/page.tsx` (depende de T005, T012)

**Checkpoint**: US1 completamente funcional e testável de forma independente.

---

## Phase 4: User Story 2 — Gerenciar Categorias de Despesa (Priority: P1)

**Goal**: Criar, editar e fazer toggle ativo/inativo de categorias de despesa inline na aba "Categorias de Despesa".

**Independent Test**: Acessar aba "Categorias de Despesa", criar categoria, inativar (verificar badge "Inativa"), reativar (verificar badge "Ativa"), confirmar que categoria inativa não aparece em `/financeiro/despesas/nova`.

### Implementation — Backend

- [X] T014 [P] [US2] Implementar `ReativarAsync(Guid id)` em `src/Amani.ImportadosERP.Infra.Data/Repositories/CategoriaDespesaRepository.cs` — localizar por Id, chamar `entity.Reativar()`, salvar; lançar `KeyNotFoundException` se não encontrada
- [X] T015 [P] [US2] Criar `src/Amani.ImportadosERP.Application/Commands/ReativarCategoriaDespesaCommand.cs` — record/class com `Guid Id`; implementar `IRequest` (padrão MediatR existente)
- [X] T016 [US2] Criar `src/Amani.ImportadosERP.Application/Commands/Handlers/ReativarCategoriaDespesaCommandHandler.cs` — injetar `ICategoriaDespesaRepository`; chamar `ReativarAsync(command.Id)` (depende de T014, T015)
- [X] T017 [US2] Adicionar `POST /{id:guid}/reativar` em `src/Amani.ImportadosERP.Api/Controllers/CategoriasDespesaController.cs` — enviar `ReativarCategoriaDespesaCommand` via `_mediator.Send`; retornar `204` no sucesso, `404` se `KeyNotFoundException` (depende de T016)
- [X] T018 [US2] Verificar registro do handler em `src/Amani.ImportadosERP.Infra.IoC/DependencyInjection.cs` — MediatR geralmente usa assembly scan; confirmar que o assembly de Application já está registrado; adicionar entrada explícita apenas se necessário

### Implementation — Frontend

- [X] T019 [P] [US2] Adicionar `reactivate(id: string)` em `frontend/src/services/expense-categories.ts` — `POST` para `${BASE_PATH}/${id}/reativar` sem body
- [X] T020 [US2] Adicionar `useReactivateExpenseCategory()` em `frontend/src/hooks/use-expense-categories.ts` — `useMutation` que invalida `expenseCategoriesQueryKeys.all` em `onSuccess` (depende de T019)
- [X] T021 [US2] Atualizar `frontend/src/components/financeiro/expense-categories-manager.tsx` — substituir botão "Inativar" (disabled quando inativa) por toggle contextual: categoria ativa mostra "Inativar"; categoria inativa mostra "Reativar"; ambas exigem confirmação via diálogo de confirmação inline (NÃO usar `window.confirm` — incompatível com Dark Theme e Design System; implementar estado local `confirmingId` que exibe botões "Confirmar" / "Cancelar" inline no card da categoria antes de chamar o endpoint); usar `useReactivateExpenseCategory` para reativação (depende de T020)
- [X] T022 [US2] Inserir `<ExpenseCategoriesManager />` na aba "categorias-despesa" de `frontend/src/app/configuracoes/page.tsx` (depende de T005, T021)

**Checkpoint**: US2 completamente funcional; toggle bidirecional testável independentemente.

---

## Phase 5: User Story 3 — Editar Taxas de Operadora (Priority: P2)

**Goal**: Exibir e editar taxas de todos os métodos de pagamento aplicáveis na aba "Taxas de Operadora".

**Independent Test**: Acessar aba "Taxas de Operadora", confirmar que CartaoDebito e CartaoCredito aparecem, alterar taxa de CartaoDebito, salvar e verificar confirmação. Tentar salvar taxa negativa e verificar erro.

### Implementation — Frontend

- [X] T023 [US3] Atualizar `frontend/src/components/configuracoes/payment-fees-form.tsx` — remover filtro `.filter((s) => s.formaPagamento === "CartaoDebito")`; renderizar todos os métodos retornados pelo backend; ajustar título e descrição do `CardHeader` para refletir que cobre todas as taxas de operadora (depende de T005)
- [X] T024 [US3] Inserir `<PaymentFeesForm />` na aba "taxas" de `frontend/src/app/configuracoes/page.tsx` (depende de T005, T023)

**Checkpoint**: US3 funcional; todos os métodos de pagamento editáveis.

---

## Phase 6: User Story 4 — Atalhos para Implantação (Priority: P3)

**Goal**: Exibir 3 cards de navegação na aba "Implantação" como ponto de entrada consolidado para o fluxo F010.

**Independent Test**: Acessar aba "Implantação", confirmar 3 cards com ícone + título + descrição; clicar em cada card e verificar que navega para `/configuracoes/implantacao` sem erros.

### Implementation — Frontend

- [X] T025 [US4] Inserir conteúdo da aba "implantacao" em `frontend/src/app/configuracoes/page.tsx` — verificar antes se `/configuracoes/implantacao` (F010) suporta query param `?tab=` para deep link direto a cada etapa; se sim, usar URLs distintas por card; se não, todos os 3 cards apontam para `routes.configuracoesImplantacao` (rota única aceitável); renderizar 3 cards com `Card`/`CardHeader`/`CardContent`/`CardFooter`/`Button`: "Inventário Inicial" (ícone `ClipboardCheck`), "Saldo Inicial de Caixa" (ícone `Wallet`), "Contas a Receber Iniciais" (ícone `ReceiptText`); cada card com descrição curta; sem formulário embutido (depende de T005)

**Checkpoint**: US4 funcional; 3 cards de navegação testáveis.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validação final, responsividade e build limpo.

- [X] T026 [P] Executar `dotnet build Amani_ImportadosERP.sln` e corrigir todos os erros de compilação introduzidos em T002–T018
- [X] T027 [P] Executar `npm run typecheck` em `frontend/` e corrigir erros de tipo em todos os arquivos criados/modificados
- [X] T028 [P] Executar `npm run lint` em `frontend/` e corrigir warnings de lint
- [X] T029 Executar `npm run build` em `frontend/` e confirmar build sem erros (depende de T026, T027, T028)
- [X] T030 Validar Cenários 1–5 do `quickstart.md`: abas, CRUD de categorias de produto, toggle de status de despesa, edição de taxas, cards de implantação — **Validado por: Alan de Souza Mello (2026-06-25)**
- [X] T031 Validar Cenário 6 do `quickstart.md`: responsividade em viewport smartphone (375px) — abas acessíveis, formulários usáveis, botões com área de toque adequada — **Validado por: Alan de Souza Mello (2026-06-25)**
- [X] T032 Validar regressão em `/financeiro/despesas/nova`: categorias inativas não aparecem no seletor após toggle; `ExpenseCategoriesManager` em `/financeiro/despesas/categorias` também exibe o toggle corretamente — **Validado por: Alan de Souza Mello (2026-06-25)**

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Nenhuma dependência — pode iniciar imediatamente
- **Phase 2 (Foundational)**: Depende de Phase 1 — **bloqueia todas as user stories**
- **Phase 3 (US1)**: Depende de T003 (interface) + T005 (tabs) — T006/T007/T009 podem rodar em paralelo
- **Phase 4 (US2)**: Depende de T002 (domínio) + T004 (interface) + T005 (tabs) — T014/T015/T019 podem rodar em paralelo
- **Phase 5 (US3)**: Depende apenas de T005 (tabs) — pode iniciar em paralelo com US1/US2 após Foundational
- **Phase 6 (US4)**: Depende apenas de T005 (tabs) — pode iniciar em paralelo com qualquer US após Foundational
- **Phase 7 (Polish)**: Depende de todas as US desejadas estarem completas

### User Story Dependencies

- **US1 (P1)**: Inicia após T003 + T005 — sem dependência de US2/US3/US4
- **US2 (P1)**: Inicia após T002 + T004 + T005 — sem dependência de US1/US3/US4
- **US3 (P2)**: Inicia após T005 — sem dependência de US1/US2/US4
- **US4 (P3)**: Inicia após T005 — sem dependência de US1/US2/US3

### Within Each User Story

- Backend (interface → repository → service/handler → controller) antes do frontend
- Tipos → serviço → hooks → componente → página (frontend)
- Core antes de integração na página

---

## Parallel Opportunities

```text
# Phase 2 — em paralelo após T001:
T002: Adicionar Reativar() à entidade CategoriaDespesa
T003: Adicionar RemoverAsync à ICategoriaRepository
T004: Adicionar ReativarAsync à ICategoriaDespesaRepository
↓ (todos concluídos)
T005: Refatorar page.tsx para tabs

# Phase 3 (US1) — backend em paralelo:
T006: RemoverAsync em CategoriaRepository
T007: RemoverAsync em CategoriaService
T009: Tipos de category.ts
↓ (T006+T007 concluídos)
T008: DELETE endpoint em CategoriasController
↓ (T009 concluído)
T010: categories.ts service → T011: hooks → T012: componente → T013: tab

# Phase 4 (US2) — backend em paralelo:
T014: ReativarAsync em CategoriaDespesaRepository
T015: ReativarCategoriaDespesaCommand
T019: reactivate() em expense-categories service
↓ (T014+T015 concluídos)
T016: Handler → T017: Controller → T018: IoC check
↓ (T019 concluído)
T020: hook → T021: componente → T022: tab

# Phase 5 (US3) — pode rodar em paralelo com Phase 3 e 4:
T023: PaymentFeesForm update → T024: tab

# Phase 6 (US4) — pode rodar em paralelo com qualquer US:
T025: Implantação tab

# Phase 7 — em paralelo:
T026: dotnet build
T027: npm typecheck
T028: npm lint
↓ (todos concluídos)
T029: npm build → T030: quickstart → T031: responsividade → T032: regressão
```

---

## Implementation Strategy

### MVP First (US1 — Categorias de Produto)

1. Completar Phase 1: Setup (T001)
2. Completar Phase 2: Foundational (T002–T005)
3. Completar Phase 3: US1 backend (T006–T008) + frontend (T009–T013)
4. **PARAR e VALIDAR**: CRUD de categorias de produto funcionando na aba

### Incremental Delivery

1. Setup + Foundational → tabs funcionando (vazio)
2. US1 → aba de categorias de produto operacional (MVP)
3. US2 → toggle de categorias de despesa operacional
4. US3 → edição de taxas inline
5. US4 → cards de implantação
6. Polish → build limpo + validação completa

### Parallel Team Strategy

Com dois desenvolvedores após Phase 2:
- Dev A: US1 (backend DELETE + frontend ProductCategoriesManager)
- Dev B: US2 (backend reativar + frontend toggle em ExpenseCategoriesManager)
- US3 e US4 são solo (frontend puro, cada uma < 2 tarefas)

---

## Notes

- [P] = arquivos diferentes, sem dependências pendentes entre si
- [Story] = rastreabilidade para user story do spec.md
- T005 (refatoração da página de tabs) é o único pré-requisito compartilhado entre todas as US
- Zero migrations: confirmar ausência de novos `dotnet ef migrations add` antes de build
- Commits recomendados: após cada fase ou user story concluída
- Parar em qualquer checkpoint para validar a US independentemente antes de avançar
