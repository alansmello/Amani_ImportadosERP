# Research: Formas de Pagamento na Venda + Taxas de Operadora

## Decision: Payment method is part of sale creation

**Decision**: The payment modal appears after item confirmation but before the
sale is persisted. The sale creation payload includes the selected payment
method and optional transaction fee override.

**Rationale**: The backend must route the financial result atomically with sale
creation. Persisting a sale first and routing later would create an intermediate
state that the business does not need and that would complicate recovery.

**Alternatives considered**:
- Persist sale then complete payment in a second step: rejected because it
  creates pending operational state and rollback complexity.
- Put payment fields directly in the sale form: rejected because the spec asks
  for a required post-confirmation modal and that better separates item review
  from financial routing.

## Decision: Extend current VendaService rather than introducing a parallel sale path

**Decision**: `VendaService.CreateAsync` remains the primary creation path and
is extended to coordinate sale persistence, stock movement, receivable creation,
payment registration and operator expense records.

**Rationale**: The current code uses `VendaService` for sale creation and stock
movement. A parallel handler would duplicate critical validation unless the
architecture is refactored first.

**Alternatives considered**:
- Create `CriarVendaCommandHandler` now: rejected for this feature because it is
  a larger architectural migration and not required by the existing code path.
- Put routing in `VendasController`: rejected by the constitution because
  controllers must not contain business rules.

## Decision: Backend computes fees and net values

**Decision**: The frontend may display values returned by the backend, but final
fee, net amount, balance settlement and operator expense creation are backend
rules.

**Rationale**: The constitution requires the backend to be the source of
financial consistency. This also prevents discrepancies between sale feedback,
receivable payment and expense records.

**Alternatives considered**:
- Calculate estimated and final values in the frontend: rejected because it
  violates the backend-as-source-of-rules principle.
- Duplicate formulas in frontend and backend: rejected because drift would be
  likely.

## Decision: Credit card D+1 uses next business day

**Decision**: CartaoCredito receivables are created with due date on the next
business day.

**Rationale**: It matches the clarified spec and avoids automatic weekend due
dates for a payment method that depends on operator settlement.

**Alternatives considered**:
- Calendar D+1: rejected because weekend due dates are operationally misleading.
- Same-day pending: rejected because it ignores the roadmap D+1 rule.

## Decision: Card-credit settlement closes gross balance using received value plus operator fee

**Decision**: When a card-credit receivable is settled by a net amount, the
recognized operator fee plus the effective amount received may close the gross
receivable balance. The fee is recorded as `DespesaOperadora`.

**Rationale**: The company sold at gross value, received net value and incurred
a fee. Keeping the fee as open receivable would misstate the customer balance.

**Alternatives considered**:
- Leave the fee difference as receivable balance: rejected because it would
  create artificial customer debt.
- Force the user to use discount for card fee: rejected because commercial
  discount and operator expense are different financial events.

## Decision: Payment discount is distinct from operator fee

**Decision**: `Desconto` on receivable payment represents commercial discount or
manual forgiveness, while operator fee is represented by `DespesaOperadora`.

**Rationale**: This preserves reporting clarity and prevents card costs from
being mixed with customer discounts.

**Alternatives considered**:
- Use discount for every difference: rejected because it hides operator costs.
- Create a generic adjustment entity now: rejected as broader than the feature.

## Decision: Payment settings are editable by any authenticated user for now

**Decision**: Until granular authorization exists, any authenticated ERP user may
view and edit default payment method fees.

**Rationale**: The project currently has no granular roles. Adding roles here
would expand scope beyond F015 and conflict with the planned auth feature.

**Alternatives considered**:
- Add Admin/Gestor roles now: rejected as premature and cross-cutting.
- No restriction at all: rejected because the future auth model should still be
  explicit in the requirement.

## Decision: Operator expenses are modeled separately from general Despesa

**Decision**: Create `DespesaOperadora` as a dedicated entity and listing rather
than reusing `Despesa`.

**Rationale**: The roadmap explicitly requires a separate entity linked to sale,
payment method, gross/net values and fee percentage. General expenses currently
depend on categories and do not capture card-settlement fields.

**Alternatives considered**:
- Reuse `Despesa` with a category: rejected because it loses structured card
  fee details and sale linkage.
- Add card fields to `Despesa`: rejected because it pollutes general expense
  semantics.

## Decision: No new frontend dependency

**Decision**: Use existing form, dialog, list, route, service and hook patterns.

**Rationale**: Existing frontend modules already cover modal flows, list states,
services and TanStack Query mutations. A new dependency would not remove real
complexity.

**Alternatives considered**:
- Add a form library: rejected because current forms are local and scoped.
- Add a table library: rejected because the operator expense view is simple.
