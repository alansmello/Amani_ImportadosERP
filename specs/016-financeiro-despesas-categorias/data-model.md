# Data Model: Financeiro: Despesas + Categorias de Despesa

## FormaPagamentoDespesa

Canonical values:

- `Dinheiro`
- `PIX`
- `CartaoDebito`
- `CartaoCredito`

Validation:

- Required for every new operational expense.
- `Fiado` is not allowed for operational expenses in this feature.
- Unknown values are rejected.

## CategoriaDespesa

Represents a classification for operational expenses.

Fields:

- `Id`: category identifier.
- `Nome`: required display name.
- `Descricao`: optional supporting description.
- `Ativa`: whether the category is available for new expenses.
- `CriadoEm` / `AtualizadoEm`: inherited audit fields when available.

Relationships:

- Has many `Despesa`.
- Inactive categories remain linked to historical expenses.

Validation:

- `Nome` is required and trimmed.
- Operational duplicate names are rejected using normalized comparison.
- Category deletion is outside scope.

State transitions:

- Created active.
- Active -> inactive.
- Inactive categories remain readable and can appear in historical expense
  listings.
- New expenses can only use active categories.

## DespesaOperacional

Represents a manually registered operational expense.

Fields:

- `Id`: expense identifier.
- `CategoriaDespesaId`: required active category at creation time.
- `DataCompetencia`: required date used for filters and financial totals.
- `Valor`: required amount.
- `Descricao`: required description.
- `FormaPagamento`: required payment method.
- `CriadoEm` / `AtualizadoEm`: inherited audit fields when available.

Relationships:

- Belongs to `CategoriaDespesa`.
- Contributes to financial views for the period of `DataCompetencia`.
- Remains separate from `DespesaOperadora`.

Validation:

- `CategoriaDespesaId` must reference an existing active category.
- `Valor` must be greater than 0.
- `Descricao` is required and trimmed.
- `FormaPagamento` must be Dinheiro, PIX, CartaoDebito or CartaoCredito.
- Editing and deletion are outside scope.

State transitions:

- Created as historical financial record.
- No update/delete transition in this feature.

## DespesaOperadora

Existing separate record for card operator costs from payment flows.

Relationship to this feature:

- Must not be merged with operational expenses.
- May contribute to financial totals alongside operational expenses when the
  financial view includes both expense types.

## Financial View Inputs

Financial views that include expenses should consume:

- Operational expenses filtered by `DataCompetencia`.
- Operator expenses filtered by their registration/business date according to
  existing F015 behavior.

Rules:

- Totals are provided by backend queries or dashboard endpoints.
- Frontend does not recalculate authoritative financial totals.
