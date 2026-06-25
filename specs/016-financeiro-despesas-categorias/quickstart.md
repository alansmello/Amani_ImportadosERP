# Quickstart: Validation Guide

## Prerequisites

- Database available with migrations applied.
- Backend API running.
- Frontend app running.
- F015 operator expenses remain available if validating financial totals that
  include both operational and operator expenses.

## Commands

Backend:

```powershell
dotnet build Amani_ImportadosERP.sln
```

Frontend:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
```

## Scenario 1: Create and list expense category

1. Open `/financeiro` and choose "Despesas", or open
   `/financeiro/despesas/categorias` directly.
2. From the expenses flow, open "Categorias" when needed.
3. Create category "Frete" with optional description.
4. Refresh or reopen category management.

Expected:

- Category appears as active.
- Category is available in the new expense form.
- Total time to create category and use it in an expense entry path remains <= 2 minutes.

## Scenario 2: Reject invalid category input

1. Try to create a category without name.
2. Try to create another category with a duplicate equivalent name.

Expected:

- Both attempts are rejected.
- User sees clear validation messages.
- No duplicate active category is created.

## Scenario 3: Inactivate category and preserve history

1. Create an active category.
2. Create an expense using it.
3. Inactivate the category.
4. Open expense list and new expense form.

Expected:

- Historical expense still shows the category.
- Inactive category is not selectable for new expenses.
- Creating a new expense with the inactive category is rejected by backend.

## Scenario 4: Create operational expense

1. Open `/financeiro` and choose "Despesas", then "Nova despesa".
2. Select an active category.
3. Enter competence/occurrence date, value, description and payment method.
4. Save.

Expected:

- Expense is created.
- Expense appears in `/financeiro/despesas` with matching date, category,
  payment method, description and amount.

## Scenario 5: Reject invalid expense input

1. Try to create an expense without category.
2. Try to create an expense without payment method.
3. Try to create an expense with value zero or negative.
4. Try to create an expense with payment method `Fiado`.

Expected:

- 100% of invalid attempts are rejected without creating a record.
- Messages identify the invalid field.

## Scenario 6: Filter expenses by period and category

1. Create expenses in different dates and categories.
2. Open `/financeiro/despesas` directly or through the "Despesas" card in
   `/financeiro`.
3. Filter by a selected month and category.

Expected:

- Only expenses whose competence/occurrence date and category match filters are
  shown.
- User can find target records in <= 30 seconds.
- Empty result shows empty state, not an error.

## Scenario 7: Financial view reflects operational expenses

1. Create an operational expense in a known period.
2. Open the financial view/dashboard for that period.

Expected:

- Expense is included in expense totals for that period.
- Operator expenses remain separate records but may contribute to totals where
  the financial view includes both types.

## Scenario 8: Responsive UI

Validate `/financeiro/despesas`, `/financeiro/despesas/nova` and
`/financeiro/despesas/categorias` at:

- Smartphone width around 390px.
- Tablet width around 768px.
- Desktop width 1280px or wider.

Expected:

- No horizontal scrolling for primary content.
- No overlapping controls or clipped button text.
- Forms and filters remain usable.
- Dark Theme remains consistent with the existing ERP.

## Regression checks

- `/financeiro/contas-receber` still works.
- `/financeiro/despesas-operadora` still works and remains separate.
- Existing dashboard financial totals still load.
- Existing sales, receivables and stock flows remain unchanged.

## Implementation validation notes

Validated on 2026-06-23:

- EF migration `20260623233055_AddDespesasCategorias` was applied to the local
  PostgreSQL database `amani_db` on `localhost:5433`.
- Backend build: `dotnet build Amani_ImportadosERP.sln` completed successfully.
- Frontend lint: `npm run lint` completed successfully.
- Frontend typecheck: `npm run typecheck` completed successfully.
- Frontend production build: `npm run build` completed successfully and emitted
  the routes `/financeiro`, `/financeiro/despesas`,
  `/financeiro/despesas/nova`, and `/financeiro/despesas/categorias`.
- Access to the feature was exposed through the desktop sidebar item
  "Despesas" and the `/financeiro` hub card.
- Responsive layout review was performed against the implemented components for
  smartphone, tablet, and desktop breakpoints using mobile-first grids, wrapped
  actions, overflow-safe tables, and constrained form fields.
- Manual end-to-end scenarios require backend API, frontend app, and database
  with migrations applied.
