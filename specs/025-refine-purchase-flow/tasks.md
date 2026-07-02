# Tasks: Refinamento do Fluxo de Nova Compra

**Input**: Design documents from `/specs/025-refine-purchase-flow/`

**Prerequisites**: [plan.md](plan.md), [spec.md](spec.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/ui-contracts.md](contracts/ui-contracts.md), [quickstart.md](quickstart.md)

**Tests**: Não criar framework, projeto ou suíte automatizada nesta feature. A validação obrigatória combina lint, typecheck, builds e os roteiros manuais de `quickstart.md`.

**Organization**: As tarefas estão agrupadas por história para permitir implementação e validação incremental. Nenhuma tarefa autoriza alteração de backend, contrato, migration, estoque, recebimento, perda ou custo médio.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode ser executada em paralelo por atuar em arquivo diferente e não depender de tarefa incompleta.
- **[Story]**: história de usuário atendida (`US1`, `US2`, `US3`, `US4`).
- Todos os itens possuem caminho exato do arquivo ou diretório afetado.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Preparar os módulos específicos de Compra sem criar abstração compartilhada com Venda.

- [X] T001 Criar os módulos tipados vazios `frontend/src/components/compras/purchase-item-composer.tsx` e `frontend/src/components/compras/purchase-summary.tsx` com as props definidas em `specs/025-refine-purchase-flow/contracts/ui-contracts.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Centralizar fábrica, detecção de conteúdo e validação individual antes de alterar o fluxo visual.

**⚠️ CRITICAL**: Nenhuma história deve integrar o novo fluxo antes desta fase estar concluída.

- [X] T002 Implementar `createPurchaseDraftItem`, `createEmptyPurchaseDraft` e `hasPurchaseItemContent` em `frontend/src/components/compras/purchase-validation.ts`, mantendo o item vazio com todos os campos comerciais em branco
- [X] T003 Implementar `validatePurchaseItemDraft` com referência, inteiro positivo, custo/ajustes não negativos e duplicidade que ignora somente `editingItemId`, e refatorar `validatePurchaseDraft` para reutilizá-la em `frontend/src/components/compras/purchase-validation.ts`

**Checkpoint**: Fábricas e validações puras estão prontas para compositor, carrinho e submit.

---

## Phase 3: User Story 1 — Compor um item por vez (Priority: P1) 🎯 MVP

**Goal**: Manter exatamente um formulário de item, incluir somente itens válidos no carrinho e limpar o compositor após cada inclusão.

**Independent Test**: Incluir três produtos sucessivamente e confirmar que existe um único formulário, os três itens aparecem no carrinho e fornecedor/data/ajustes gerais permanecem intactos.

### Implementation for User Story 1

- [X] T004 [P] [US1] Implementar os campos, erros e ação “Incluir item na compra” do compositor único em `frontend/src/components/compras/purchase-item-composer.tsx`, preservando quantidade inteira e unidade principal
- [X] T005 [P] [US1] Implementar estado vazio e listagem básica ordenada de itens confirmados por nome, quantidade e custo em `frontend/src/components/compras/purchase-summary.tsx`
- [X] T006 [US1] Alterar o draft inicial para `items: []`, adicionar `composerItem`, integrar validação/inclusão/reset e substituir o mapeamento de editores pelo compositor e resumo em `frontend/src/components/compras/purchase-form.tsx`

**Checkpoint**: US1 funciona como MVP independente; vários itens são compostos por um único formulário e exibidos no carrinho.

---

## Phase 4: User Story 2 — Revisar e corrigir o carrinho (Priority: P2)

**Goal**: Editar, cancelar edição e remover itens confirmados sem duplicação, perda de valores ou mudança de ordem.

**Independent Test**: Com três itens, editar o segundo e confirmar todos os campos; editá-lo novamente e cancelar; remover outro item; conferir identidade, valores e ordem após cada ação.

### Implementation for User Story 2

- [X] T007 [P] [US2] Adicionar indicação de item em edição e ações tipadas de editar/remover, desabilitando ações incompatíveis durante edição ou envio, em `frontend/src/components/compras/purchase-summary.tsx`
- [X] T008 [US2] Implementar `editingItemId`, cópia para o compositor, substituição por `id` no mesmo índice, cancelamento sem mutar o original e remoção local em `frontend/src/components/compras/purchase-form.tsx`
- [X] T009 [US2] Adicionar título/ação de atualização e cancelamento de edição sem alteração direta do item confirmado em `frontend/src/components/compras/purchase-item-composer.tsx`

**Checkpoint**: US2 preserva integralmente o carrinho durante edição, cancelamento e remoção.

---

## Phase 5: User Story 3 — Conferir e registrar a compra (Priority: P3)

**Goal**: Exibir uma prévia consultiva e registrar somente itens confirmados, sem ignorar conteúdo parcial nem alterar o contrato oficial.

**Independent Test**: Montar uma compra com ajustes, conferir os valores, deixar conteúdo parcial e verificar o bloqueio, limpar explicitamente, registrar e confirmar compra em trânsito sem mudança de estoque.

### Implementation for User Story 3

- [X] T010 [P] [US3] Implementar bruto, descontos, acréscimos, líquido por item, subtotal e total preenchido com rótulos consultivos em `frontend/src/components/compras/purchase-summary.tsx`
- [X] T011 [P] [US3] Adicionar ação explícita de limpar nova composição e mensagens para incluir, atualizar, cancelar ou limpar antes do registro em `frontend/src/components/compras/purchase-item-composer.tsx`
- [X] T012 [US3] Bloquear submit quando `composerItem` tiver conteúdo ou houver edição ativa, enviar exclusivamente `draft.items` e preservar todo o estado em falha em `frontend/src/components/compras/purchase-form.tsx`

**Checkpoint**: US3 conclui a compra somente a partir do carrinho confirmado e mantém o contrato `POST /api/compras` inalterado.

---

## Phase 6: User Story 4 — Operar em diferentes dispositivos (Priority: P4)

**Goal**: Tornar compositor, carrinho, prévia e ações utilizáveis em smartphone, tablet e desktop sem rolagem horizontal da página.

**Independent Test**: Repetir inclusão, edição, remoção e proteção de conteúdo parcial em aproximadamente 390 px, 768 px e 1440 px.

### Implementation for User Story 4

- [X] T013 [P] [US4] Ajustar campos, ações, foco visível e mensagens do compositor para Mobile First e Dark Theme em `frontend/src/components/compras/purchase-item-composer.tsx`
- [X] T014 [P] [US4] Ajustar cards, quebra de nomes, valores e ações do carrinho sem tabela larga em `frontend/src/components/compras/purchase-summary.tsx`
- [X] T015 [US4] Organizar compositor antes do resumo em smartphone e layout em colunas somente no breakpoint desktop em `frontend/src/components/compras/purchase-form.tsx`

**Checkpoint**: US4 atende smartphone, tablet e desktop com os mesmos comportamentos das histórias anteriores.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Remover legado da tela, executar verificações e comprovar que regras de domínio e Venda não regrediram.

- [X] T016 Remover importações e usos restantes e excluir o editor repetido `frontend/src/components/compras/purchase-item-editor.tsx` somente após `purchase-item-composer.tsx` estar integrado
- [X] T017 Executar `npm run lint`, `npm run typecheck` e `npm run build` em `frontend/` e corrigir somente problemas relacionados aos arquivos de `frontend/src/components/compras/`
- [X] T018 [P] Executar `dotnet build Amani_ImportadosERP.sln` e confirmar que nenhum arquivo em `src/` ou migration foi alterado
- [ ] T019 Executar os cenários funcionais 1–7 de `specs/025-refine-purchase-flow/quickstart.md` e registrar data, ambiente e resultado na seção 7 do mesmo arquivo
- [ ] T020 Executar a regressão de compra em trânsito, recebimento parcial, perda, estoque, custo médio e Venda descrita em `specs/025-refine-purchase-flow/quickstart.md` e registrar evidências na seção 7
- [ ] T021 Executar a matriz responsiva de 390 px, 768 px e 1440 px de `specs/025-refine-purchase-flow/quickstart.md` e atualizar o status da F025 em `docs/roadmap/RoadMap_AmaniERP.md` somente se todos os gates passarem

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: início imediato.
- **Foundational (Phase 2)**: depende de T001 e bloqueia todas as histórias.
- **US1 (Phase 3)**: depende de T002–T003 e entrega o MVP.
- **US2 (Phase 4)**: depende da integração básica de US1, pois amplia compositor, resumo e formulário existentes.
- **US3 (Phase 5)**: depende de US1; T012 deve considerar o estado de edição entregue por US2.
- **US4 (Phase 6)**: depende dos componentes funcionais das histórias anteriores; T013 e T014 podem ser executadas em paralelo.
- **Polish (Phase 7)**: depende de todas as histórias incluídas na entrega.

### User Story Completion Order

```text
Setup → Foundational → US1 (MVP) → US2 → US3 → US4 → Polish
```

- **US1** é o primeiro incremento demonstrável e resolve o acúmulo de formulários.
- **US2** usa o carrinho da US1, mas sua validação é independente pelo roteiro de edição/remoção.
- **US3** usa os itens confirmados da US1 e o estado de edição da US2 para proteger o envio.
- **US4** não altera regras; aplica a experiência das US1–US3 nos três grupos de dispositivo.

### Within Each User Story

- Validações puras antes da integração no formulário.
- Componentes filhos antes da orquestração em `purchase-form.tsx`.
- Estado e transições antes do submit final.
- Verificação independente no checkpoint antes de avançar.

### Parallel Opportunities

- T004 e T005 podem ocorrer em paralelo após T003.
- T007 pode ser preparada em paralelo à lógica de edição de T008, desde que o contrato de props de T001 seja respeitado.
- T010 e T011 podem ocorrer em paralelo porque afetam arquivos diferentes.
- T013 e T014 podem ocorrer em paralelo.
- T018 pode ocorrer em paralelo às verificações de frontend de T017.

---

## Parallel Examples

### User Story 1

```text
Task T004: implementar o compositor em frontend/src/components/compras/purchase-item-composer.tsx
Task T005: implementar a listagem em frontend/src/components/compras/purchase-summary.tsx
```

### User Story 3

```text
Task T010: implementar a prévia em frontend/src/components/compras/purchase-summary.tsx
Task T011: implementar limpeza explícita em frontend/src/components/compras/purchase-item-composer.tsx
```

### User Story 4

```text
Task T013: responsividade do compositor em frontend/src/components/compras/purchase-item-composer.tsx
Task T014: responsividade do carrinho em frontend/src/components/compras/purchase-summary.tsx
```

---

## Implementation Strategy

### MVP First — User Story 1

1. Concluir T001–T003.
2. Implementar T004–T006.
3. Parar e validar o checkpoint da US1.
4. Demonstrar um único compositor adicionando vários itens ao carrinho.

### Incremental Delivery

1. **US1**: compositor único e carrinho básico.
2. **US2**: edição, cancelamento e remoção com ordem preservada.
3. **US3**: prévia e submit protegido.
4. **US4**: experiência responsiva completa.
5. **Polish**: remoção do legado, builds e regressão de domínio.

### Scope Guards

- Não alterar `frontend/src/hooks/use-purchases.ts` nem `frontend/src/services/purchases.ts` salvo incompatibilidade comprovada e documentada antes da mudança.
- Não alterar arquivos em `src/`, migrations ou contratos de API.
- Não modificar componentes de Venda; eles entram somente no roteiro de regressão.
- Não corrigir nesta feature a inconsistência preexistente de total oficial entre consultas de Compra.
- Não adicionar dependência ou infraestrutura de testes automatizados.

## Notes

- Cada tarefa deve terminar com o arquivo compilável antes da próxima tarefa dependente.
- Os marcadores `[P]` consideram arquivos distintos; coordenação ainda é necessária quando props compartilhadas mudarem.
- O resultado oficial continua vindo do backend; valores do carrinho são prévias de revisão.
- A feature só está concluída após T017–T021, mesmo que a interação visual pareça pronta.
