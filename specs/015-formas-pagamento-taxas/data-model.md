# Data Model: Formas de Pagamento na Venda + Taxas de Operadora

## FormaPagamento

Enum canonical values:

- `Dinheiro`
- `PIX`
- `CartaoDebito`
- `CartaoCredito`
- `Fiado`

Validation:

- Required for every new sale.
- Unknown values are rejected.

## Venda

Represents a completed sale.

Fields impacted:

- `Id`: sale identifier.
- `ClienteId`: customer.
- `DataVenda`: sale date.
- `Desconto`: sale-level discount.
- `Acrescimo`: sale-level increase.
- `FormaPagamento`: required enum value.
- `PercentualTaxaAplicado`: nullable decimal. Stores transaction-specific
  percentage used for card methods; null or zero for methods without fee.
- `Cancelada`, `DataCancelamento`: existing cancellation state.
- `Items`: existing sale items.

Relationships:

- Has many `VendaItem`.
- Has zero or one generated `ContaReceber`.
- Has zero or many `DespesaOperadora`.
- Generates stock movements as today.

Validation:

- Sale cannot be persisted without `FormaPagamento`.
- Fee override cannot be negative.
- Card fee cannot produce negative net value.
- Stock validation remains unchanged.

State transitions:

- Draft in UI -> confirmed items -> payment method modal -> persisted sale.
- Persisted active sale -> canceled sale, preserving financial history or using
  explicit compensation defined during implementation.

## ConfiguracaoFormaPagamento

Represents default fee settings per payment method.

Fields:

- `Id`: identifier.
- `FormaPagamento`: unique enum value.
- `PercentualTaxa`: decimal percentage, minimum 0.
- `AtualizadoEm`: timestamp for audit/read freshness.

Relationships:

- No direct ownership. Used as default input for sale and payment calculations.

Validation:

- One configuration per `FormaPagamento`.
- PercentualTaxa must be >= 0.
- Seed required for all five payment methods.
- Dinheiro, PIX and Fiado default to 0 unless business changes later.

## ContaReceber

Represents a receivable from sale or manual financial flow.

Fields impacted:

- `Id`
- `VendaId`: nullable link to sale.
- `ClienteId`: nullable for manual/inicial records according to existing model.
- `Valor`: gross receivable amount.
- `DataVencimento`
- `Origem`
- `Pagamentos`

Potential new/derived behavior:

- Immediate payment for Dinheiro, PIX and CartaoDebito.
- Pending status for CartaoCredito and Fiado.
- CartaoCredito due date is next business day.
- Fiado due date defaults to the sale date, with no operator fee.

Validation:

- `Valor` must be positive.
- Payment amount plus discount plus recognized operator fee cannot settle more
  than current gross balance.

## PagamentoRecebido

Represents a payment event for a receivable.

Fields impacted:

- `Id`
- `ContaReceberId`
- `Valor`: effective amount received.
- `Desconto`: optional commercial discount, default 0.
- `ValorBrutoLiquidado`: amount of receivable balance closed by this payment.
- `DataPagamento`

Relationships:

- Belongs to `ContaReceber`.
- May be associated indirectly with a `DespesaOperadora` when a card fee closes
  part of the gross balance.

Validation:

- `Valor` must be positive.
- `Desconto` must be >= 0.
- `Valor + Desconto <= Saldo` for non-card-fee settlement.
- For card-credit settlement, `Valor + Desconto + TaxaOperadoraReconhecida <= Saldo`.
- Commercial discount is not operator expense.

## DespesaOperadora

Represents a card operator cost.

Fields:

- `Id`: identifier.
- `VendaId`: required sale link.
- `FormaPagamento`: `CartaoDebito` or `CartaoCredito`.
- `ValorBruto`: gross sale or gross settled amount.
- `ValorLiquido`: effective amount received after fee.
- `PercentualTaxa`: applied fee percentage.
- `DataRegistro`: timestamp.

Relationships:

- Belongs to `Venda`.
- For debit, created during sale creation.
- For credit, created during receivable payment when net value differs from
  gross settled value due to operator fee.

Validation:

- FormaPagamento must be card method.
- ValorBruto > 0.
- ValorLiquido > 0.
- ValorLiquido <= ValorBruto.
- PercentualTaxa >= 0.
- Create only when `ValorBruto - ValorLiquido > 0`.

## State Matrix

| FormaPagamento | ContaReceber | Pagamento inicial | DespesaOperadora |
|----------------|--------------|-------------------|------------------|
| Dinheiro | Criada e paga | Valor bruto | Nao |
| PIX | Criada e paga | Valor bruto | Nao |
| CartaoDebito | Criada e paga | Valor liquido | Sim, se taxa > 0 |
| CartaoCredito | Criada pendente D+1 util | Nenhum na venda | Sim, no recebimento se taxa > 0 |
| Fiado | Criada pendente | Nenhum na venda | Nao |

## Data Retention

- Sales, receivables, payments and operator expenses are historical records and
  must not be silently deleted to correct operational state.
- Corrections should be explicit business operations or compensation records.
