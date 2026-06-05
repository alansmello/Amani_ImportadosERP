# Data Model: Implantacao Inicial

## Overview

A feature adiciona origem rastreavel para registros iniciais sem criar saldos
fixos. O saldo de estoque permanece derivado de `EstoqueMovimentacao`; contas a
receber iniciais reaproveitam `ContaReceber`; saldo inicial de caixa entra como
evento financeiro historico proprio.

## Entities

### EstoqueMovimentacao

Existing entity extended for inventory initialization.

Fields relevant to this feature:

- `Id`: unique identifier.
- `ProdutoId`: existing product identifier. Required.
- `Quantidade`: positive quantity for `InventarioInicial`.
- `Tipo`: movement type. Must include `InventarioInicial`.
- `CompraId`: remains nullable; must be null for `InventarioInicial`.
- `VendaId`: remains nullable; must be null for `InventarioInicial`.
- `Data`: movement date. For inventory initialization, provided by the operator
  or defaulted by the use case when omitted by contract rules.
- `ValorUnitario`: optional unit cost/value. Must be null or non-negative.

Relationships:

- Belongs to `Produto`.
- Does not belong to `Compra` or `Venda` when `Tipo = InventarioInicial`.

Validation rules:

- `ProdutoId` required and must exist.
- `Quantidade` must be greater than zero for inventory initialization.
- `ValorUnitario` cannot be negative.
- `CompraId` and `VendaId` must be null for `InventarioInicial`.

State transitions:

- Created once as historical event.
- No delete/update flow planned for this feature.

### TipoMovimentacao

Existing enum/value set for stock movement classification.

Values after feature planning:

- `Entrada`: purchase or normal stock entry.
- `Saida`: sale or normal stock exit.
- `InventarioInicial`: initial stock registered during ERP deployment.

Validation rules:

- Inventory initialization must use `InventarioInicial`, not `Entrada`.

### EventoFinanceiro

New historical financial event for deployment opening balances.

Fields:

- `Id`: unique identifier.
- `Tipo`: event type. Required; for this feature, `SaldoInicialCaixa`.
- `Valor`: financial value. Required and must be zero or positive according to
  business rule; negative values are rejected.
- `Data`: date of the opening balance. Required.
- `Origem`: origin marker. Required; expected `ImplantacaoInicial`.
- `Descricao`: operator-facing description for audit context. Required or
  defaulted to a clear deployment description.

Relationships:

- No dependency on `Venda`, `Despesa` or dashboard records.

Validation rules:

- `Valor` cannot be negative.
- `Data` required.
- `Origem` required and traceable.

State transitions:

- Created once as historical event.
- Corrections should be future compensating events, not silent overwrites.

### ContaReceber

Existing entity reused for initial receivables.

Fields relevant to this feature:

- `Id`: unique identifier.
- `VendaId`: currently required by the existing model; should become nullable
  only when origin identifies an initial receivable.
- `ClienteId`: required for initial receivables so old debt remains tied to a
  customer.
- `Valor`: amount due. Must be greater than zero.
- `DataVencimento`: due date. Required.
- `Origem`: origin marker. Required for initial receivables; expected
  `SaldoInicial` or `ImplantacaoInicial`.
- `Pagamentos`: existing payment collection remains reusable.

Relationships:

- Initial receivable belongs to `Cliente`.
- Initial receivable does not require `Venda`.
- Payments continue to relate to `ContaReceber`.

Validation rules:

- `ClienteId` required and must exist.
- `Valor` must be greater than zero.
- `DataVencimento` required.
- `Origem` required and must identify opening balance/deployment.
- `VendaId` may be null only when `Origem` is initial/deployment.

State transitions:

- Created as open receivable.
- Existing payment flow can reduce/settle the balance.
- Origin must remain unchanged after creation.

### Produto

Existing entity used as reference for inventory items.

Rules:

- Must exist before inventory initialization item is accepted.
- Must not receive fixed stock fields.

### Cliente

Existing entity used as reference for initial receivables.

Rules:

- Must exist before initial receivable is accepted.
- This feature does not change inactive customer sales behavior.

## DTOs / Contracts

### RegistrarInventarioInicialDto

- `Data`: required deployment/inventory date.
- `Origem`: required, default/expected `ImplantacaoInicial`.
- `Itens`: required non-empty collection of inventory items.

### RegistrarInventarioInicialItemDto

- `ProdutoId`: required existing product identifier.
- `Quantidade`: required and greater than zero.
- `ValorUnitario`: optional, non-negative when provided.

### InventarioInicialResultadoDto

- `Data`: registered date.
- `Origem`: registered origin.
- `QuantidadeItens`: number of accepted items.
- `MovimentacoesIds`: identifiers of generated stock movements.

### RegistrarSaldoInicialCaixaDto

- `Valor`: required, non-negative.
- `Data`: required deployment date.
- `Origem`: required, expected `ImplantacaoInicial`.
- `Descricao`: optional input, but response must expose a clear description.

### SaldoInicialCaixaResultadoDto

- `EventoFinanceiroId`: generated event identifier.
- `Valor`: registered value.
- `Data`: registered date.
- `Origem`: registered origin.

### RegistrarContaReceberInicialDto

- `ClienteId`: required existing customer identifier.
- `Valor`: required and greater than zero.
- `DataVencimento`: required.
- `Origem`: required, expected `SaldoInicial` or `ImplantacaoInicial`.
- `Descricao`: optional context for the old debt.

### ContaReceberInicialResultadoDto

- `ContaReceberId`: generated receivable identifier.
- `ClienteId`: customer identifier.
- `Valor`: registered value.
- `DataVencimento`: due date.
- `Origem`: registered origin.
