# Tasks: Consistência de Pagamentos e Taxas de Operadora

**Input**: Design documents from `/specs/020-consistencia-pagamentos-taxas/`

**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Não criar infraestrutura nem tarefas de testes automatizados. A validação obrigatória usa os comandos de qualidade existentes e os cenários manuais de `specs/020-consistencia-pagamentos-taxas/quickstart.md`, conforme decisão aprovada no roadmap.

**Organization**: Tarefas agrupadas por história de usuário para permitir implementação e validação incremental. IDs e caminhos estão em ordem de execução recomendada.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: pode executar em paralelo porque altera arquivos diferentes e não depende de tarefa incompleta.
- **[Story]**: história correspondente da especificação (`US1`, `US2`, `US3`).
- Tarefas de Setup, Foundational e Polish não recebem rótulo de história.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: confirmar a linha de base antes de alterar o fluxo financeiro, sem adicionar dependências ou projetos.

- [X] T001 Executar os comandos de qualidade atuais e registrar qualquer falha preexistente na seção de evidências de `specs/020-consistencia-pagamentos-taxas/quickstart.md`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: alinhar os contratos compartilhados de pagamento antes das histórias de usuário.

**⚠️ CRITICAL**: nenhuma história deve alterar o fluxo de pagamento antes da conclusão desta fase.

- [X] T002 [P] Remover `PercentualTaxaOperadora` do contrato suportado de novo pagamento em `src/Amani.ImportadosERP.Application/DTOs/RegistrarPagamentoDto.cs` e `src/Amani.ImportadosERP.Application/Commands/RegistrarPagamentoCommand.cs`
- [X] T003 [P] Remover `percentualTaxaOperadora` de `RegisterPaymentPayload` e tipar a forma de pagamento com o tipo canônico existente em `frontend/src/types/receivable.ts`

**Checkpoint**: contratos compartilhados alinhados; histórias podem começar sem manter o percentual manual legado.

---

## Phase 3: User Story 1 — Receber cartão de crédito com regra única (Priority: P1) 🎯 MVP

**Goal**: usar o mesmo modal nos dois acessos, aceitar apenas liquidação integral de Crédito e registrar pagamento/despesa de modo consistente.

**Independent Test**: usar uma conta de Crédito de R$ 100,00 pelos caminhos Lista Geral e `Clientes → Ver contas`; ambos devem solicitar somente líquido, e R$ 96,50 deve liquidar a conta e gerar despesa de R$ 3,50.

### Implementation for User Story 1

- [X] T004 [P] [US1] Adicionar `FormaPagamento` à projeção de detalhe e buscar somente as vendas relacionadas ao cliente em `src/Amani.ImportadosERP.Application/DTOs/ContaReceberDetalheDto.cs` e `src/Amani.ImportadosERP.Infra.Data/Repositories/ContaReceberRepository.cs`
- [X] T005 [P] [US1] Refatorar a regra de pagamento para identificar a forma antes do cálculo; tratar forma ausente como pagamento simples sem despesa; rejeitar conta paga; e, no Crédito, exigir bruto igual ao saldo, desconto zero, percentual efetivo derivado e pagamento/despesa na mesma transação em `src/Amani.ImportadosERP.Application/Commands/Handlers/RegistrarPagamentoCommandHandler.cs`
- [X] T006 [US1] Atualizar o mapeamento do request para o comando sem percentual manual e preservar mensagens 400 operacionais em `src/Amani.ImportadosERP.Api/Controllers/ContasReceberController.cs`
- [X] T007 [P] [US1] Adicionar `formaPagamento` ao tipo de detalhe por cliente e alinhar a nulabilidade ao contrato em `frontend/src/types/receivable.ts`
- [X] T008 [US1] Incluir forma de pagamento no estado do modal e repassá-la ao abrir Pagamento pelo detalhe do cliente em `frontend/src/components/financeiro/receivable-client-detail.tsx`
- [X] T009 [US1] Unificar o modal para Crédito com um único campo líquido, bruto integral somente leitura, prévia da diferença, payload com bruto igual ao saldo e bloqueio durante confirmação em `frontend/src/components/financeiro/receivable-payment-modal.tsx`
- [X] T010 [P] [US1] Invalidar lista, agrupamento por cliente, detalhes por cliente e despesas de operadora após pagamento em `frontend/src/hooks/use-receivables.ts`
- [ ] T011 [US1] Executar e registrar os cenários 1 a 4 e o fallback sem forma identificável, cronometrando conclusão do Crédito em até 60 segundos e atualização das consultas em até 2 segundos, conforme `specs/020-consistencia-pagamentos-taxas/quickstart.md`

**Checkpoint**: US1 funciona isoladamente; os dois acessos são equivalentes, Crédito liquida integralmente e nenhum campo legado aparece.

---

## Phase 4: User Story 2 — Configurar somente a taxa aplicável (Priority: P2)

**Goal**: permitir edição apenas da taxa de Débito e normalizar configurações legadas das demais formas para zero.

**Independent Test**: na aba de taxas, somente Débito possui edição; atualização válida persiste, valores fora de `0 <= taxa < 100` falham e qualquer atualização das demais formas é recusada.

### Implementation for User Story 2

- [X] T012 [P] [US2] Reforçar na entidade que apenas `CartaoDebito` aceita atualização e que sua taxa deve permanecer no intervalo `0 <= taxa < 100` em `src/Amani.ImportadosERP.Domain/Entities/ConfiguracaoFormaPagamento.cs`
- [X] T013 [US2] Restringir o caso de uso de atualização ao Débito, preservar o valor anterior em erro e retornar mensagem operacional para formas não editáveis em `src/Amani.ImportadosERP.Application/Commands/Handlers/AtualizarConfiguracaoFormaPagamentoCommandHandler.cs`
- [X] T014 [P] [US2] Criar a migration somente de dados com `Up` zerando taxas fora do Débito, `Down` sem inventar valores anteriores e snapshot inalterado em `src/Amani.ImportadosERP.Infra.Data/Migrations/20260626223710_NormalizeNonDebitPaymentFees.cs`, `src/Amani.ImportadosERP.Infra.Data/Migrations/20260626223710_NormalizeNonDebitPaymentFees.Designer.cs` e `src/Amani.ImportadosERP.Infra.Data/Migrations/AmaniDbContextModelSnapshot.cs`
- [X] T015 [US2] Confirmar que o endpoint traduz formas inválidas e violações da nova regra em respostas 400 sem regra de negócio no controller em `src/Amani.ImportadosERP.Api/Controllers/ConfiguracoesFormasPagamentoController.cs`
- [X] T016 [P] [US2] Refatorar a aba de taxas para renderizar input/salvar somente no Débito e textos informativos para Dinheiro, PIX, Crédito e Fiado em `frontend/src/components/configuracoes/payment-fees-form.tsx`
- [ ] T017 [US2] Executar e registrar o cenário 5, incluindo normalização, limites de Débito, recusa das demais formas e atualização válida concluída em até 30 segundos, conforme `specs/020-consistencia-pagamentos-taxas/quickstart.md`

**Checkpoint**: US2 funciona isoladamente; configuração e persistência expressam que somente Débito possui taxa padrão.

---

## Phase 5: User Story 3 — Preservar pagamentos sem operadora e Débito (Priority: P3)

**Goal**: garantir que a correção de Crédito e configuração não altere o roteamento financeiro já correto de Dinheiro, PIX, Débito, Fiado e contas manuais.

**Independent Test**: criar/receber uma operação de cada forma e confirmar status, saldo e ausência/presença de despesa conforme a matriz do `data-model.md`.

### Implementation for User Story 3

- [X] T018 [P] [US3] Validar explicitamente taxa de Débito menor que 100 e preservar roteamento de Dinheiro, PIX, Débito, Crédito e Fiado em `src/Amani.ImportadosERP.Application/Services/VendaService.cs`
- [X] T019 [P] [US3] Manter override e taxa configurada somente no Débito e mostrar Crédito como taxa apurada no recebimento em `frontend/src/components/vendas/sale-payment-modal.tsx`
- [ ] T020 [US3] Executar e registrar a matriz de regressão do cenário 6 para Dinheiro, PIX, Débito, Fiado e conta manual conforme `specs/020-consistencia-pagamentos-taxas/quickstart.md`

**Checkpoint**: todas as formas preservam o comportamento aprovado e somente cartões geram despesas nos momentos definidos.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: validar integração, responsividade, migrations e conformidade antes de considerar a feature concluída.

- [X] T021 [P] Executar `dotnet build Amani_ImportadosERP.sln` e registrar o resultado em `specs/020-consistencia-pagamentos-taxas/quickstart.md`
- [X] T022 [P] Executar `npm run lint`, `npm run typecheck` e `npm run build` em `frontend/` e registrar os resultados em `specs/020-consistencia-pagamentos-taxas/quickstart.md`
- [ ] T023 Validar o cenário 7 em smartphone, tablet e desktop, incluindo bloqueio de confirmação repetida, e registrar evidências em `specs/020-consistencia-pagamentos-taxas/quickstart.md`
- [X] T024 Revisar migration, contratos, preservação do histórico, gates constitucionais e ausência de alterações em estoque/compras/custo médio usando `specs/020-consistencia-pagamentos-taxas/plan.md` e `specs/020-consistencia-pagamentos-taxas/contracts/`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sem dependências.
- **Foundational (Phase 2)**: depende de T001 e bloqueia as histórias.
- **US1 (Phase 3)**: depende de T002–T003; entrega o MVP financeiro.
- **US2 (Phase 4)**: depende de T002–T003; pode avançar em paralelo com US1 após a fundação.
- **US3 (Phase 5)**: depende da fundação; a validação final deve ocorrer após US1 e US2 para cobrir regressões integradas.
- **Polish (Phase 6)**: depende das histórias incluídas no release.

### User Story Dependency Graph

```text
Setup
  └── Foundational
      ├── US1: Crédito consistente (MVP)
      ├── US2: Taxa somente no Débito
      └── US3: Preservação das demais formas
              └── Validação integrada após US1 + US2
```

### Within Each User Story

- **US1**: contrato/projeção e handler antes do controller; tipos antes da integração do modal; implementação antes dos cenários manuais.
- **US2**: invariável de domínio antes do handler; handler antes da validação do endpoint; migration e UI podem avançar em paralelo; implementação antes do cenário manual.
- **US3**: ajustes de Venda e modal podem avançar em paralelo; regressão somente após ambos.
- Nenhuma tarefa de teste automatizado deve ser adicionada sem nova autorização.

### Parallel Opportunities

- T002 e T003 podem executar em paralelo.
- Após a fundação, US1 e US2 podem ser implementadas em paralelo por pessoas diferentes.
- Em US1, T004, T005, T007 e T010 alteram arquivos independentes e podem avançar em paralelo.
- Em US2, T012, T014 e T016 podem avançar em paralelo; T013 depende de T012.
- Em US3, T018 e T019 podem executar em paralelo.
- T021 e T022 podem executar em paralelo depois da integração.

---

## Parallel Example: User Story 1

```text
Task T004: projetar FormaPagamento no detalhe por cliente.
Task T005: implementar liquidação integral e despesa derivada no handler.
Task T007: alinhar o tipo frontend do detalhe.
Task T010: ampliar invalidação dos caches financeiros.
```

## Parallel Example: User Story 2

```text
Task T012: reforçar invariantes da configuração no Domain.
Task T014: criar migration de normalização dos dados legados.
Task T016: tornar somente Débito editável na interface.
```

## Parallel Example: User Story 3

```text
Task T018: preservar o roteamento financeiro na criação da Venda.
Task T019: preservar a seleção das formas e regra visual no modal da Venda.
```

---

## Implementation Strategy

### MVP First — User Story 1

1. Executar T001.
2. Concluir T002–T003.
3. Implementar T004–T010.
4. Parar e validar T011 pelos dois acessos.
5. Somente então avançar para configuração e regressões.

### Incremental Delivery

1. **Fundação**: remover percentual manual dos contratos compartilhados.
2. **US1**: corrigir o risco financeiro atual e validar isoladamente.
3. **US2**: restringir a configuração e normalizar dados legados.
4. **US3**: confirmar que as demais formas permanecem corretas.
5. **Polish**: executar builds, responsividade e revisão constitucional.

### Suggested Commit Boundaries

1. Contratos compartilhados e projeção de forma de pagamento.
2. Liquidação integral de Crédito no backend.
3. Modal unificado e invalidação de consultas.
4. Taxa exclusiva de Débito e migration de dados.
5. Regressões de Venda e validação final.

---

## Notes

- `[P]` indica arquivos independentes, não ausência de dependências de fase.
- Cada tarefa de história possui rótulo para rastreabilidade com a especificação.
- Os cálculos apresentados no frontend são prévias; o backend permanece fonte oficial.
- Não modificar migrations históricas da F015.
- Não criar nova entidade, coluna, dependência ou suíte automatizada.
- Preservar histórico financeiro e manter pagamento/despesa atômicos.
