# Tasks: Refinamento do Fluxo de Nova Venda

**Input**: Design documents from `/specs/022-refine-new-sale-flow/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Paths are relative to the repository root.
- Next.js frontend code is under `frontend/src/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and file structure setup.

- [X] T001 Create placeholder files for new components `frontend/src/components/clientes/quick-customer-dialog.tsx` and `frontend/src/components/vendas/sale-item-composer.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core checks and dependency confirmation.

- [X] T002 Verify customer creation and listing queries in `frontend/src/hooks/use-customers.ts` to ensure compatibility with immediate cache updates
- [X] T003 Validate constitution gates for affected ERP flows: stock by movements, purchases in transit, item-level receipts, losses without stock, sales stock validation, average cost from real stock entries, DTOs, Fluent API, Repository Pattern, backend-owned rules and metrics, analytics via aggregated queries, Mobile First, operational UX, product priority, official Design System, and simplicity

---

## Phase 3: User Story 1 - Cadastrar cliente rápido em modal (Priority: P1) 🎯 MVP

**Goal**: Permitir cadastrar um novo cliente através de um modal na própria tela de vendas, mantendo o rascunho da venda e auto-selecionando o cliente criado.

**Independent Test**: Registrar uma nova venda de teste, abrir o modal de cliente rápido, preencher os dados, confirmar e verificar que o cliente foi criado, selecionado e os itens da venda foram mantidos.

### Implementation for User Story 1

- [X] T004 [P] [US1] Implement dialog component structure and form fields in `frontend/src/components/clientes/quick-customer-dialog.tsx` using `@/components/ui/dialog` and `CustomerFormFields`
- [X] T005 [US1] Integrate `QuickCustomerDialog` into `frontend/src/components/vendas/sale-form.tsx` replacing the external link trigger
- [X] T006 [US1] Wire customer creation mutation in `frontend/src/components/vendas/sale-form.tsx` to auto-select the new client and invalidate active customer queries upon success

---

## Phase 4: User Story 2 - Compositor único e limpo de item de venda (Priority: P1)

**Goal**: Substituir a listagem mutável direta por um formulário compositor de item único que limpa seus campos após cada inclusão confirmada.

**Independent Test**: Selecionar um produto, preencher quantidade, verificar preço preenchido, clicar em incluir e constatar que o item foi para o resumo e o compositor foi limpo.

### Implementation for User Story 2

- [X] T007 [P] [US2] Create composer layout and bind fields (Product, Quantity, Price, Discount, Increase) in `frontend/src/components/vendas/sale-item-composer.tsx`
- [X] T008 [P] [US2] Implement auto-fill for product price upon selection in `frontend/src/components/vendas/sale-item-composer.tsx`
- [X] T009 [US2] Add item-level validation rules (e.g. valid quantity and price) in `frontend/src/components/vendas/sale-validation.ts`
- [X] T010 [US2] Replace mapping of multiple editors in `frontend/src/components/vendas/sale-form.tsx` with a single instance of `SaleItemComposer` bound to a local state
- [X] T011 [US2] Implement item inclusion handler in `frontend/src/components/vendas/sale-form.tsx` that appends the composed item to the draft list and resets the composer

---

## Phase 5: User Story 3 - Bloqueio de produto duplicado e edição no resumo (Priority: P2)

**Goal**: Impedir a inserção de produtos duplicados e permitir a edição de itens já confirmados carregando-os de volta no compositor.

**Independent Test**: Tentar inserir o mesmo produto duas vezes e verificar o bloqueio. Clicar em editar em um item do resumo, alterar seus valores no compositor e incluí-lo de volta.

### Implementation for User Story 3

- [X] T012 [P] [US3] Add duplicate product validation helper function to `frontend/src/components/vendas/sale-validation.ts`
- [X] T013 [US3] Implement validation error messages and state feedback for duplicate products in `frontend/src/components/vendas/sale-item-composer.tsx`
- [X] T014 [US3] Add edit and remove action triggers to individual items inside `frontend/src/components/vendas/sale-summary.tsx`
- [X] T015 [US3] Implement edit and remove handlers in `frontend/src/components/vendas/sale-form.tsx` (remove from summary list, populate compositor state, and handle cancelation/restoration)

---

## Phase 6: User Story 4 - Resumo de venda e visualização de totais (Priority: P2)

**Goal**: Exibir a lista detalhada de itens confirmados no resumo de venda com o valor líquido de cada um e atualizar os totais da venda em tempo real.

**Independent Test**: Incluir múltiplos itens com descontos e acréscimos diversos e certificar que os totais exibidos no rodapé do resumo atualizam instantaneamente.

### Implementation for User Story 4

- [X] T016 [US4] Restructure `frontend/src/components/vendas/sale-summary.tsx` to render the list of confirmed items (Name, quantity, price, net value) and dynamically update subtotal, discounts, increases and net total
- [X] T017 [US4] Refactor `handleSubmit` in `frontend/src/components/vendas/sale-form.tsx` to build the payload using only the confirmed items, ignoring partial fields of the compositor
- [X] T018 [US4] Implement reset logic in `frontend/src/components/vendas/sale-form.tsx` to clear client, items list, values, and composer after successful sales registration and payment confirmation

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Design adjustments, code review and manual testing confirmation.

- [X] T019 Refine responsive style details (Mobile First) and Dark Theme colors in `frontend/src/components/vendas/sale-form.tsx` and related components
- [ ] T020 Run verification script and quickstart scenarios in `specs/022-refine-new-sale-flow/quickstart.md`
- [X] T021 Run frontend check commands `npm run lint`, `npm run typecheck`, and `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. Blocks all user stories.
- **User Stories (Phases 3 to 6)**: All depend on Foundational phase completion.
  - Can be developed sequentially in priority order: US1 → US2 → US3 → US4.
- **Polish (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2. Independent of other stories.
- **US2 (P1)**: Depends on Phase 2. Can be developed in parallel to US1.
- **US3 (P2)**: Depends on US2 (requires the compositor to exist).
- **US4 (P2)**: Depends on US2 and US3 (requires summary items and actions to exist).

### Parallel Opportunities

- Setup tasks and Foundational check tasks marked [P] can run in parallel.
- US1 (Quick Customer Dialog) and US2 (Item Composer base) can be implemented in parallel.
- Model validations and interface changes can be designed concurrently.

---

## Parallel Example: User Stories 1 & 2

```bash
# Developer A builds the customer dialog:
Task: "Implement dialog component structure and form fields in frontend/src/components/clientes/quick-customer-dialog.tsx"

# Developer B builds the item composer base:
Task: "Create composer layout and bind fields in frontend/src/components/vendas/sale-item-composer.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. Complete Phase 4: User Story 2
5. **STOP and VALIDATE**: Confirm that the customer dialog works and items can be added via the single compositor.

### Incremental Delivery

1. Setup + Foundation ready
2. Add US1 (Customer Dialog) → Validate → Deliver
3. Add US2 (Composer) → Validate → Deliver
4. Add US3 (Duplicate block & Edit) → Validate → Deliver
5. Add US4 (Detailed Summary) → Validate → Deliver (MVP refinement complete!)
