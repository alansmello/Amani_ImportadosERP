# Feature Specification: Formas de Pagamento na Venda + Taxas de Operadora

**Feature Branch**: `015-formas-pagamento-taxas`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "F015 - Integrar a forma de pagamento ao momento da venda, automatizando o roteamento financeiro correto e registrando taxas de operadora de cartão como despesa."

## Clarifications

### Session 2026-06-22

- Q: Quando o modal obrigatorio de forma de pagamento deve ocorrer em relacao a persistencia/conclusao da venda? -> A: Antes de persistir/concluir a venda.
- Q: O vencimento D+1 de vendas em CartaoCredito deve usar dia corrido ou dia util? -> A: Proximo dia util.
- Q: Como liquidar CartaoCredito quando o valor recebido e liquido da taxa de operadora? -> A: Valor recebido mais taxa liquidam saldo bruto.
- Q: Quem pode editar as taxas de formas de pagamento ate existir autorizacao granular? -> A: Qualquer usuario autenticado.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar forma de pagamento no fechamento da venda (Priority: P1)

Como operador de vendas, quero escolher a forma de pagamento antes da venda ser persistida e finalizada financeiramente, para que o sistema registre corretamente se o dinheiro ja entrou ou se ainda existe valor a receber.

**Why this priority**: Esta e a melhoria operacional central. Sem ela, vendas pagas a vista continuam exigindo trabalho manual no financeiro, mesmo quando o recebimento ja ocorreu.

**Independent Test**: Pode ser testada criando vendas com cada forma de pagamento disponivel e verificando se a venda so e concluida apos a escolha da forma, com mensagem final coerente para pagamento imediato ou conta pendente.

**Acceptance Scenarios**:

1. **Given** uma venda pronta para confirmacao, **When** o operador confirma os itens da venda, **Then** o sistema deve exigir a selecao de uma forma de pagamento antes de persistir e concluir a venda.
2. **Given** uma venda paga em dinheiro ou PIX, **When** o operador conclui a venda, **Then** o sistema deve informar que o recebimento foi registrado imediatamente pelo valor integral.
3. **Given** uma venda em cartao de credito ou fiado, **When** o operador conclui a venda, **Then** o sistema deve informar que uma conta a receber foi gerada para acompanhamento posterior.
4. **Given** uma venda em cartao de credito concluida antes de um dia nao util, **When** a conta a receber e gerada, **Then** seu vencimento deve cair no proximo dia util.

---

### User Story 2 - Automatizar recebimentos imediatos e taxas de debito (Priority: P1)

Como responsavel financeiro, quero que vendas pagas em dinheiro, PIX ou cartao de debito sejam baixadas automaticamente quando aplicavel, para que o financeiro reflita a realidade sem lancamento duplicado.

**Why this priority**: A maior parte das vendas nao deveria permanecer pendente quando o pagamento ja foi recebido. O debito tambem precisa registrar a taxa de operadora sem depender de calculo manual.

**Independent Test**: Pode ser testada criando vendas em dinheiro, PIX e debito, validando que dinheiro/PIX ficam quitados pelo valor cheio e que debito fica quitado com valor liquido e despesa de operadora registrada.

**Acceptance Scenarios**:

1. **Given** uma venda em dinheiro, **When** a venda e concluida, **Then** a conta financeira relacionada deve ficar paga pelo valor bruto total.
2. **Given** uma venda em PIX, **When** a venda e concluida, **Then** a conta financeira relacionada deve ficar paga pelo valor bruto total.
3. **Given** uma venda em cartao de debito com taxa aplicavel, **When** a venda e concluida, **Then** a conta financeira relacionada deve ficar paga e a diferenca entre valor bruto e liquido deve aparecer como despesa de operadora.

---

### User Story 3 - Receber credito ou fiado com valor efetivo e desconto (Priority: P2)

Como responsavel financeiro, quero registrar pagamentos posteriores informando valor efetivamente recebido e desconto quando houver, para encerrar contas corretamente e registrar eventuais diferencas de operadora.

**Why this priority**: Cartao de credito e fiado continuam gerando contas pendentes. O recebimento posterior precisa aceitar diferencas reais sem quebrar o saldo da conta.

**Independent Test**: Pode ser testada criando uma venda em credito e outra fiado, registrando pagamentos posteriores com valor e desconto, e validando saldo, status e despesa de operadora quando existir diferenca de cartao.

**Acceptance Scenarios**:

1. **Given** uma venda em cartao de credito pendente, **When** o usuario registra o recebimento com valor efetivo menor que o bruto por causa de taxa, **Then** o sistema deve registrar o pagamento, usar a taxa reconhecida para liquidar o saldo bruto correspondente e criar despesa de operadora pela diferenca.
2. **Given** uma venda fiado pendente, **When** o usuario registra um pagamento com desconto comercial, **Then** o sistema deve aceitar o desconto desde que pagamento mais desconto nao ultrapasse o saldo.
3. **Given** uma conta a receber com saldo aberto, **When** o usuario tenta registrar pagamento mais desconto acima do saldo, **Then** o sistema deve rejeitar a operacao com mensagem clara e manter o saldo anterior.

---

### User Story 4 - Configurar taxas e consultar despesas de operadora (Priority: P3)

Como usuario autenticado, quero ajustar taxas por forma de pagamento e consultar despesas de operadora, para manter os calculos aderentes aos contratos reais e acompanhar o custo financeiro das vendas com cartao.

**Why this priority**: A automacao precisa ser configuravel para continuar correta quando as taxas mudarem. A visibilidade das despesas permite conferencia e gestao financeira.

**Independent Test**: Pode ser testada alterando a taxa de uma forma de pagamento, criando uma venda com essa forma, aplicando opcionalmente uma taxa especifica da transacao e conferindo a listagem de despesas por periodo e forma.

**Acceptance Scenarios**:

1. **Given** uma taxa configurada para cartao de debito, **When** um usuario autenticado altera essa taxa, **Then** novas vendas devem usar a taxa atualizada como padrao.
2. **Given** uma venda com cartao, **When** o operador informa uma taxa especifica para aquela transacao, **Then** o sistema deve usar a taxa da transacao apenas naquele fechamento.
3. **Given** despesas de operadora registradas, **When** um usuario autenticado filtra por periodo ou forma de pagamento, **Then** a lista deve exibir somente registros correspondentes com data, forma, valor bruto, taxa aplicada e valor liquido.

### Edge Cases

- Se o operador tentar concluir uma venda sem forma de pagamento, a venda nao deve ser persistida nem finalizada financeiramente e deve haver orientacao clara para selecionar uma forma.
- Se a taxa configurada ou informada for zero, o sistema deve aceitar a venda e nao criar despesa de operadora quando nao houver diferenca.
- Se a taxa informada for negativa ou tornar o valor liquido invalido, o sistema deve rejeitar a operacao.
- Se uma venda em cartao de credito for recebida pelo valor bruto integral, nao deve haver despesa de operadora.
- Se uma venda em cartao de credito for recebida por valor liquido com taxa reconhecida, a conta deve poder ser quitada pelo valor bruto liquidado por pagamento mais taxa de operadora.
- Se o pagamento posterior for parcial, a conta deve permanecer pendente pelo saldo restante.
- Se uma venda for cancelada depois de ter recebimento ou despesa de operadora associados, o historico financeiro deve permanecer rastreavel e o plano de implementacao deve definir a compensacao permitida conforme regras existentes de cancelamento.
- Se filtros de despesas nao encontrarem resultados, a tela deve mostrar estado vazio sem erro.
- Em smartphone, tablet e desktop, os fluxos de venda, pagamento e consulta devem permanecer utilizaveis sem perda de informacao essencial.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support exactly these payment methods for sales: Dinheiro, PIX, CartaoDebito, CartaoCredito and Fiado.
- **FR-002**: System MUST require a payment method selection after the operator confirms sale items and before the sale is persisted or financially finalized.
- **FR-003**: System MUST keep the sale amount, selected payment method, effective configured or overridden fee, and resulting financial status traceable for each sale.
- **FR-004**: System MUST treat Dinheiro and PIX sales as immediately received for the full sale amount.
- **FR-005**: System MUST treat CartaoDebito sales as immediately received, using the system-calculated net amount after the applicable operator fee.
- **FR-006**: System MUST register an operator expense whenever a card transaction has a positive difference between gross sale amount and net amount received.
- **FR-007**: System MUST treat CartaoCredito sales as pending receivables after sale completion, with due date on the next business day.
- **FR-008**: System MUST treat Fiado sales as pending receivables for the full sale amount and without operator fee.
- **FR-009**: System MUST calculate card fees and net card values in the authoritative business layer, not rely on the user interface as the source of financial calculation.
- **FR-010**: Users MUST be able to view configured fee percentages for payment methods before confirming the payment method of a sale.
- **FR-011**: Users MUST be able to override the payment fee for a single sale transaction without changing the default configured fee.
- **FR-012**: Until authentication and granular authorization are implemented, any ERP operator with access to the settings screen MUST be able to view and edit default fee percentages; after authentication exists, this rule MUST map to authenticated ERP users unless a stricter role is defined.
- **FR-013**: System MUST seed default market-reference fee percentages so the payment flow is usable before manual configuration.
- **FR-014**: Users MUST receive immediate feedback after sale completion indicating whether the sale was received immediately or generated a pending receivable.
- **FR-015**: Users MUST be able to register receivable payments with an optional discount amount.
- **FR-016**: System MUST reject a receivable payment when payment amount plus discount exceeds the current receivable balance.
- **FR-017**: System MUST preserve a payment history for receivables that distinguishes actual amount received from discount granted.
- **FR-018**: System MUST allow users to inform the effective amount received for a pending card-credit receivable.
- **FR-019**: System MUST register an operator expense for card-credit receivables when the effective received amount is lower than the gross amount being settled due to operator fee.
- **FR-020**: System MUST allow a card-credit receivable to be settled by the effective amount received plus the recognized operator fee, so the gross receivable balance can be closed without manual adjustment.
- **FR-021**: Users MUST be able to list operator expenses with filters for date range and payment method.
- **FR-022**: Operator expense listings MUST show registration date, payment method, gross value, fee percentage, net value and the related sale reference.
- **FR-023**: System MUST keep unsupported capabilities outside the feature scope: credit-card installments, split payment, payment reversal with refund, and automatic bank reconciliation.
- **FR-024**: System MUST preserve existing stock behavior for sales: confirmed sales continue to generate stock outflow and validate available stock before confirmation.
- **FR-025**: The official user interface MUST support smartphone, tablet and desktop layouts for sale payment selection, receivable payment, fee configuration and operator expense listing.
- **FR-026**: System MUST use user-friendly validation messages for invalid fees, invalid discounts, missing payment method, and unavailable receivable balances.

### Key Entities *(include if feature involves data)*

- **Venda**: A completed sale of products to a customer. It now carries the chosen payment method and remains connected to stock outflow, receivable status and operator expense when applicable.
- **Forma de Pagamento**: The payment method selected for a sale. Supported values are Dinheiro, PIX, CartaoDebito, CartaoCredito and Fiado.
- **Configuracao de Forma de Pagamento**: Default fee configuration for a payment method, used as the standard fee unless a transaction-specific override is provided.
- **Conta a Receber**: A financial receivable created from a sale or manual financial flow. It may be immediately paid, remain pending, receive later payments, and accept a valid discount during payment registration.
- **Pagamento de Conta a Receber**: A payment event tied to a receivable, including amount effectively paid, optional discount and payment date.
- **Despesa de Operadora**: A financial record representing the cost charged by a card operator, linked to the sale and containing gross amount, net amount, fee percentage, payment method and registration date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 80% of sales paid by Dinheiro, PIX or CartaoDebito require no manual follow-up in accounts receivable after sale completion.
- **SC-002**: Operators can complete sale payment selection and see the final feedback in under 30 seconds after confirming sale items.
- **SC-003**: 100% of card transactions with a positive operator fee difference produce a visible operator expense record.
- **SC-004**: 100% of attempts to register payment plus discount above receivable balance are rejected without changing the receivable balance.
- **SC-005**: ERP operators with access to settings can update a default payment fee and validate its use in a new sale in under 2 minutes.
- **SC-006**: ERP operators with access to finance can locate operator expenses for a selected period and payment method in under 30 seconds.
- **SC-007**: The primary flows for sale payment selection, receivable payment with discount, fee configuration and operator expense consultation are usable without horizontal scrolling or overlapping content on smartphone, tablet and desktop.
- **SC-008**: No card-fee calculation discrepancy is observed between sale feedback, receivable settlement and operator expense records during acceptance testing.

## Assumptions

- Existing sales, stock validation and accounts receivable flows from F013 and F014 are available and remain the base behavior.
- Until authentication and granular authorization exist, any ERP operator with access to the settings screen may edit payment method fee settings.
- Payment method is selected after confirming sale items and before persisting the sale, even if the interface presents this as a required post-confirmation modal.
- Default fee percentages are initial operational defaults and may be changed by ERP operators with settings access until granular authorization exists.
- Transaction-specific fee override is intended only for the current sale or payment event and does not alter default configuration.
- Dinheiro and PIX do not generate operator expenses in this feature.
- CartaoCredito remains a single pending receivable; installments are intentionally outside the scope.
- CartaoCredito D+1 means next business day, not calendar day.
- Fiado represents a pending customer receivable without operator fee and uses the sale date as the default due date unless the sale flow later exposes an explicit due date field.
- The feature preserves Mobile First and supports smartphone, tablet and desktop.
- Financial history should be preserved; corrections should use explicit business operations rather than silent deletion of historical records.
