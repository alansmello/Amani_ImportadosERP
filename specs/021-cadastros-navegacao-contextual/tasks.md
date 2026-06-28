# Tasks: Cadastros Auxiliares, Fornecedores e Navegação Contextual

**Input**: Design documents from `/specs/021-cadastros-navegacao-contextual/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Não criar infraestrutura automatizada nesta feature. A validação obrigatória usa build, lint, typecheck e os roteiros manuais de `quickstart.md`, conforme decisão registrada no roadmap.

**Organization**: As tarefas são agrupadas por história para permitir implementação e validação independentes. Tarefas compartilhadas de telefone do Fornecedor ficam na fundação porque atendem US1 e US2.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode executar em paralelo após as dependências declaradas, sem conflito de arquivo.
- **[Story]**: História atendida (`US1`, `US2`, `US3`).
- Cada tarefa contém os caminhos exatos afetados.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirmar uma linha de base reproduzível antes de alterar o código.

- [X] T001 Executar `dotnet build Amani_ImportadosERP.sln`, `npm run lint`, `npm run typecheck` e `npm run build` de `frontend/package.json`, registrando qualquer falha preexistente em `specs/021-cadastros-navegacao-contextual/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Entregar o contrato compartilhado de telefone do Fornecedor usado pelos cadastros oficial e rápido.

**⚠️ CRITICAL**: US1 e US2 dependem desta fase; US3 pode começar após T001, mas a entrega integrada deve preservar esta fundação.

- [X] T002 Implementar `Telefone` opcional, trim, limite de 50 caracteres e atualização atômica de nome/telefone em `src/Amani.ImportadosERP.Domain/Entities/Fornecedor.cs`
- [X] T003 [P] Estender os contratos nullable de telefone em `src/Amani.ImportadosERP.Application/DTOs/FornecedorDto.cs`, `src/Amani.ImportadosERP.Application/DTOs/CriarFornecedorDto.cs` e `src/Amani.ImportadosERP.Application/DTOs/AtualizarFornecedorDto.cs`
- [X] T004 Atualizar criação, alteração e mapeamento explícito de Fornecedor para incluir telefone em `src/Amani.ImportadosERP.Application/Services/FornecedorService.cs`
- [X] T005 Configurar `Telefone` nullable com máximo de 50 caracteres e sem índice único em `src/Amani.ImportadosERP.Infra.Data/EntityConfigurations/FornecedorMapping.cs`
- [X] T006 Gerar a migration `AddTelefoneFornecedor`, incluindo designer e snapshot, em `src/Amani.ImportadosERP.Infra.Data/Migrations/` e validar que ela adiciona somente a coluna nullable de telefone em `AmaniDbContextModelSnapshot.cs`
- [X] T007 [P] Estender `Supplier` e `SupplierPayload` com `telefone: string | null` em `frontend/src/types/supplier.ts` e preservar o payload nos métodos de `frontend/src/services/suppliers.ts`
- [X] T008 [P] Adicionar telefone, valores iniciais, trim, limite e mensagens compartilhadas ao cadastro oficial em `frontend/src/components/fornecedores/supplier-form-fields.tsx` e `frontend/src/components/fornecedores/supplier-form.tsx`
- [X] T009 [P] Fazer a criação inserir/substituir a resposta por `id` nos caches de lista e detalhe antes da invalidação em `frontend/src/hooks/use-suppliers.ts`

**Checkpoint**: O backend e o frontend oficial aceitam telefone opcional de forma retrocompatível; a resposta de criação está pronta para seleção imediata.

---

## Phase 3: User Story 1 - Cadastrar referências sem perder o rascunho (Priority: P1) 🎯 MVP

**Goal**: Criar Fornecedor em Nova Compra/Novo Produto e Categoria em Novo Produto, selecionar a referência retornada e preservar integralmente o formulário hospedeiro.

**Independent Test**: Preencher Compra e Produto, abrir/cancelar/errar/concluir cada modal e confirmar que somente o identificador da referência criada muda, sem perda dos demais campos ou itens.

### Implementation for User Story 1

- [X] T010 [P] [US1] Extrair campos e validação de nome de Categoria reutilizáveis e adaptar o cadastro oficial em `frontend/src/components/configuracoes/product-categories-manager.tsx` e `frontend/src/components/produtos/category-form-fields.tsx`
- [X] T011 [P] [US1] Criar o modal compartilhado de Fornecedor com erros da API, bloqueio de duplo envio, foco e ações responsivas em `frontend/src/components/fornecedores/supplier-quick-create-dialog.tsx`
- [X] T012 [US1] Criar o modal simples de Categoria usando o contrato compartilhado e `useCreateCategory` em `frontend/src/components/produtos/category-quick-create-dialog.tsx`
- [X] T013 [US1] Fazer `useCreateCategory` inserir/substituir a resposta no cache antes da invalidação em `frontend/src/hooks/use-categories.ts`
- [X] T014 [US1] Integrar o modal de Fornecedor, selecionar o registro retornado e bloquear somente a ausência de Produto em `frontend/src/components/compras/purchase-form.tsx`
- [X] T015 [US1] Adicionar gatilhos sempre acessíveis de Categoria e Fornecedor aos seletores em `frontend/src/components/produtos/product-form-fields.tsx` e controlar os dois modais sem reinicializar valores em `frontend/src/components/produtos/product-form.tsx`
- [X] T016 [US1] Manter Novo Produto renderizado sem Categoria/Fornecedor, remover o EmptyState bloqueante e preservar o bloqueio de envio sem Categoria em `frontend/src/app/produtos/novo/page.tsx`
- [ ] T017 [US1] Executar os cenários das seções 5 e 6 de `specs/021-cadastros-navegacao-contextual/quickstart.md`, registrando pelo menos três medições de Fornecedor por host, três de Categoria e 10 execuções representativas para comprovar limites de 60/30 segundos, mínimo de 9 primeiras tentativas sem orientação e preservação do rascunho

**Checkpoint**: US1 funciona isoladamente como MVP; Compra continua mercadoria em trânsito e Produto continua exigindo Categoria.

---

## Phase 4: User Story 2 - Consultar Fornecedor por informação útil (Priority: P2)

**Goal**: Exibir telefone opcional do Fornecedor e eliminar GUIDs visíveis/fallbacks técnicos de Fornecedor, Cliente e Produto.

**Independent Test**: Criar/editar Fornecedor com e sem telefone e percorrer listagem, detalhes e estados ausentes, confirmando “Não informado” e mensagens operacionais sem GUID completo ou abreviado.

### Implementation for User Story 2

- [X] T018 [P] [US2] Substituir ID/Identificador por telefone e “Não informado” nos cards mobile e tabela desktop em `frontend/src/components/fornecedores/supplier-table.tsx`
- [X] T019 [P] [US2] Remover GUID do cabeçalho/card e exibir telefone operacional no detalhe em `frontend/src/components/fornecedores/supplier-details.tsx`
- [X] T020 [P] [US2] Remover GUID do cabeçalho do detalhe de Cliente preservando nome, status e contatos em `frontend/src/components/clientes/customer-details.tsx`
- [X] T021 [P] [US2] Remover GUID do cabeçalho do detalhe de Produto preservando preço, custo, Categoria e Fornecedor em `frontend/src/components/produtos/product-details.tsx`
- [X] T022 [P] [US2] Trocar fallbacks de Cliente abreviado por “Cliente não encontrado” ou “Referência indisponível” em `frontend/src/components/financeiro/receivables-list.tsx` e `frontend/src/app/financeiro/contas-receber/cliente/[clienteId]/page.tsx`
- [X] T023 [P] [US2] Remover linguagem de identificador técnico do filtro de Produto sem alterar o valor interno das opções em `frontend/src/components/estoque/stock-filters.tsx`
- [ ] T024 [US2] Executar o contrato de telefone, compatibilidade de fornecedores existentes e a matriz fechada de GUIDs/fallbacks de `specs/021-cadastros-navegacao-contextual/contracts/apresentacao-identificadores.md` conforme seção 4 de `specs/021-cadastros-navegacao-contextual/quickstart.md`

**Checkpoint**: US2 funciona independentemente dos modais; IDs continuam em rotas, payloads, relações, keys e caches, mas não aparecem nas telas mapeadas.

---

## Phase 5: User Story 3 - Voltar para a origem do trabalho (Priority: P2)

**Goal**: Retornar à origem interna validada e usar fallback específico em acesso direto, reload ou origem inválida, sem sair do ERP.

**Independent Test**: Para cada uma das 21 rotas do contrato, testar entrada por link controlado, acesso direto, reload e `returnTo` externo/malformado, confirmando origem ou fallback esperado.

### Implementation for User Story 3

- [X] T025 [US3] Implementar allowlist por prefixo operacional, normalização, remoção de `returnTo` aninhado e marcador de transição cliente de uso único com destino/origem e expiração de 10 segundos em `frontend/src/lib/contextual-navigation.ts`
- [X] T026 [US3] Criar `ContextualLink` para registrar transições controladas e `ContextualBackButton` para consumir o marcador, resolver `fallbackHref` e navegar sem `history.back()` em `frontend/src/components/layout/contextual-link.tsx` e `frontend/src/components/layout/contextual-back-button.tsx`
- [X] T027 [US3] Completar helpers tipados de rotas pai, detalhe e edição usados pelos fallbacks e links controlados em `frontend/src/config/routes.ts`
- [X] T028 [P] [US3] Substituir retornos fixos por `ContextualBackButton` nas páginas `frontend/src/app/clientes/novo/page.tsx`, `frontend/src/app/clientes/[id]/page.tsx` e `frontend/src/app/clientes/[id]/editar/page.tsx`
- [X] T029 [P] [US3] Substituir retornos fixos por fallback contratual em `frontend/src/app/compras/nova/page.tsx`, `frontend/src/app/compras/[id]/page.tsx`, `frontend/src/app/configuracoes/formas-pagamento/page.tsx` e `frontend/src/app/estoque/[produtoId]/page.tsx`
- [X] T030 [P] [US3] Substituir retornos fixos e contextualizar links cruzados nas rotas financeiras em `frontend/src/app/financeiro/contas-receber/nova/page.tsx`, `frontend/src/app/financeiro/contas-receber/[id]/editar/page.tsx`, `frontend/src/app/financeiro/contas-receber/cliente/[clienteId]/page.tsx`, `frontend/src/app/financeiro/despesas/nova/page.tsx`, `frontend/src/app/financeiro/despesas/categorias/page.tsx` e `frontend/src/app/financeiro/despesas-operadora/page.tsx`
- [X] T031 [P] [US3] Substituir retornos fixos e contextualizar links detalhe→edição em `frontend/src/app/fornecedores/novo/page.tsx`, `frontend/src/app/fornecedores/[id]/page.tsx`, `frontend/src/app/fornecedores/[id]/editar/page.tsx`, `frontend/src/app/produtos/novo/page.tsx`, `frontend/src/app/produtos/[id]/page.tsx` e `frontend/src/app/produtos/[id]/editar/page.tsx`
- [X] T032 [P] [US3] Substituir retornos fixos por fallback contratual em `frontend/src/app/vendas/nova/page.tsx` e `frontend/src/app/vendas/[vendaId]/page.tsx`
- [X] T033 [P] [US3] Propagar origem validada nos links controlados de Cliente, Fornecedor e Produto em `frontend/src/app/clientes/page.tsx`, `frontend/src/components/clientes/customer-actions.tsx`, `frontend/src/app/fornecedores/page.tsx`, `frontend/src/components/fornecedores/supplier-actions.tsx`, `frontend/src/app/produtos/page.tsx` e `frontend/src/components/produtos/product-actions.tsx`
- [X] T034 [P] [US3] Propagar `ContextualLink` em todas as origens controladas restantes em `frontend/src/app/compras/page.tsx`, `frontend/src/components/compras/purchase-list.tsx`, `frontend/src/components/compras/pending-products-panel.tsx`, `frontend/src/components/estoque/pending-receipts-panel.tsx`, `frontend/src/app/vendas/page.tsx`, `frontend/src/components/vendas/sales-list.tsx`, `frontend/src/components/vendas/sale-form.tsx`, `frontend/src/components/estoque/stock-list.tsx`, `frontend/src/app/financeiro/contas-receber/page.tsx`, `frontend/src/components/financeiro/receivables-list.tsx`, `frontend/src/components/financeiro/receivables-by-client.tsx`, `frontend/src/components/financeiro/receivable-client-detail.tsx`, `frontend/src/app/financeiro/despesas/page.tsx`, `frontend/src/app/financeiro/page.tsx`, `frontend/src/components/layout/desktop-sidebar.tsx` e `frontend/src/components/layout/mobile-bottom-nav.tsx`
- [ ] T035 [US3] Executar a seção 7 de `specs/021-cadastros-navegacao-contextual/quickstart.md`, cobrindo as 21 rotas, allowlist, marcador de uso único, navegação cliente após carregamento inicial por refresh, reload do destino, nova aba, URLs externas/protocol-relative e cancelamento de modal

**Checkpoint**: Todas as páginas mapeadas retornam de modo determinístico e nenhum cenário testado conduz para fora do ERP.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validar migration, qualidade estática, responsividade, Design System e regressões constitucionais.

- [ ] T036 Aplicar a migration em banco de desenvolvimento e validar criação/consulta/alteração de telefone, telefone duplicado, limite e fornecedor legado conforme `specs/021-cadastros-navegacao-contextual/contracts/fornecedores-api.md` e seção 2 de `specs/021-cadastros-navegacao-contextual/quickstart.md`
- [ ] T037 Executar `dotnet build Amani_ImportadosERP.sln` e `npm run lint`, `npm run typecheck`, `npm run build` de `frontend/package.json`, corrigindo apenas falhas introduzidas pela F021
- [ ] T038 Validar modais, seletores, tabelas/cards, mensagens, foco e retorno em 360–430 px, 768–1024 px e ≥1280 px conforme seção 8 de `specs/021-cadastros-navegacao-contextual/quickstart.md`
- [ ] T039 Executar a regressão da seção 9 de `specs/021-cadastros-navegacao-contextual/quickstart.md`, confirmando DTOs explícitos, Fluent API, Repository Pattern, Compra em trânsito, estoque por movimentações, ausência de mudanças em recebimentos/perdas/vendas/custo/financeiro, Mobile First, Dark Theme e nenhuma dependência nova

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências; estabelece a linha de base.
- **Foundational (Phase 2)**: depende de T001; T002–T009 bloqueiam US1 e US2.
- **US1 (Phase 3)**: depende da fundação e entrega o MVP operacional.
- **US2 (Phase 4)**: depende da fundação; pode avançar em paralelo com US1 porque altera arquivos distintos, exceto pela integração final do formulário oficial já concluída na fundação.
- **US3 (Phase 5)**: T025–T027 dependem apenas de T001; migrações T028–T034 dependem de T025–T027 e podem avançar em paralelo por grupos de rotas. Se US1 estiver em execução, T031 ocorre após T016 por compartilharem `frontend/src/app/produtos/novo/page.tsx`. Se US2 estiver em execução, T030/T034 ocorrem após T022 por compartilharem arquivos financeiros.
- **Polish (Phase 6)**: depende das histórias incluídas na entrega; T037 antecede a validação manual final T038–T039.

### User Story Dependencies

- **US1 (P1)**: T002–T009 → T010/T011 → T012/T013 → T014–T016 → T017.
- **US2 (P2)**: T002–T009 → T018–T023 em paralelo → T024.
- **US3 (P2)**: T025 → T026/T027 → T028–T034 em paralelo, respeitando T016→T031 e T022→T030/T034 quando essas histórias estiverem incluídas → T035.
- US2 e US3 não dependem funcionalmente de US1 e permanecem demonstráveis isoladamente; as dependências cruzadas acima evitam somente conflito de edição nos mesmos arquivos.

### Parallel Opportunities

- T003 e T007 podem começar em paralelo com T002 porque alteram contratos separados.
- Após T007, T008 e T009 podem avançar em paralelo.
- Em US1, T010 e T011 podem avançar em paralelo; T012 depende de T010.
- Em US2, T018–T023 são paralelizáveis por conjuntos de arquivos sem sobreposição.
- Em US3, T028–T034 são paralelizáveis após T025–T027.
- US2 e US3 podem ser executadas em paralelo depois de suas respectivas fundações, serializando T022 antes de T030/T034.

---

## Parallel Example: User Story 1

```text
Task T010: compartilhar campos/validação de Categoria
Task T011: criar modal rápido de Fornecedor

Após T010:
Task T012: criar modal rápido de Categoria
Task T013: atualizar cache de Categoria
```

## Parallel Example: User Story 2

```text
Task T018: tabela de Fornecedor
Task T019: detalhe de Fornecedor
Task T020: detalhe de Cliente
Task T021: detalhe de Produto
Task T022: fallbacks financeiros de Cliente
Task T023: linguagem do filtro de Estoque
```

## Parallel Example: User Story 3

```text
Após T025-T027:
Task T028: rotas de Cliente
Task T029: Compra/Configurações/Estoque
Task T030: rotas Financeiras
Task T031: Fornecedor/Produto
Task T032: rotas de Venda
Task T033: links de cadastros
Task T034: links operacionais
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Executar T001.
2. Concluir T002–T009.
3. Concluir T010–T016.
4. Parar e validar T017.
5. Demonstrar criação rápida em Compra e Produto com rascunhos preservados.

### Incremental Delivery

1. Setup + fundação → telefone e caches compartilhados prontos.
2. US1 → cadastros rápidos e estados vazios corrigidos (MVP).
3. US2 → informação operacional e remoção de GUIDs.
4. US3 → retorno contextual seguro em todas as rotas mapeadas.
5. Polish → migration aplicada, comandos de qualidade e validação responsiva/regressiva concluídos.

### Parallel Team Strategy

1. Equipe conclui T001 e a fundação compartilhada.
2. Depois:
   - Fluxo A: T010–T017 (US1).
   - Fluxo B: T018–T024 (US2).
   - Fluxo C: T025–T035 (US3; pode iniciar utilitários após T001).
3. Integrar e concluir T036–T039 em sequência.

---

## Notes

- Não criar projetos, pacotes ou infraestrutura de testes nesta feature.
- Manter controllers sem regra de negócio e mapeamentos explícitos sem AutoMapper.
- Cadastros rápidos reutilizam endpoints oficiais; não criar endpoints paralelos.
- IDs permanecem internos; remover apenas sua apresentação operacional.
- Cancelar modal nunca aciona navegação contextual.
- Cada tarefa concluída deve manter o working tree limitado ao escopo da F021.
