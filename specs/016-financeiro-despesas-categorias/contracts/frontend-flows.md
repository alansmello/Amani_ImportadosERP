# Frontend Flow Contract: Despesas + Categorias

## Routes

- `/financeiro`: finance hub with cards for receivables, operational expenses,
  and operator fees.
- `/financeiro/despesas`: list operational expenses with filters.
- `/financeiro/despesas/nova`: create operational expense.
- `/financeiro/despesas/categorias`: manage expense categories.

## Navigation

- Finance module must expose an entry for "Despesas" in desktop navigation.
- Finance hub must expose a card for "Despesas".
- Mobile navigation must keep "Despesas" reachable from the "Mais" menu.
- Category management should be reachable from the expenses flow without forcing
  the user to leave the finance context.

## Expense List

Controls:

- Period filter using competence/occurrence date.
- Category filter.
- Clear filters action.
- New expense action.
- Manage categories action.

States:

- Loading while fetching.
- Error with retry.
- Empty when no expenses match filters.
- Populated list with date, category, payment method, description and amount.

Rules:

- Filtering triggers backend queries.
- The UI does not calculate authoritative financial totals.

## Create Expense

Fields:

- Competence/occurrence date.
- Active category.
- Payment method: Dinheiro, PIX, CartaoDebito, CartaoCredito.
- Amount.
- Description.

Validation:

- Category required.
- Payment method required.
- Amount greater than 0.
- Description required.
- Backend validation messages must be surfaced clearly.

Success:

- User receives confirmation.
- Expense list cache is refreshed.
- User can return to list and find the new record.

## Manage Categories

Capabilities:

- List active and inactive categories.
- Create category.
- Edit name/description.
- Inactivate category.

Rules:

- Inactive categories are visible in management/history context.
- Inactive categories are not selectable for new expenses.
- Deletion is not exposed.

## Responsive Requirements

Validate at approximately:

- Smartphone: 390px width.
- Tablet: 768px width.
- Desktop: 1280px or wider.

Expected:

- No horizontal scrolling for primary content.
- No overlapping controls or clipped button text.
- Filters and forms remain usable with touch input.
- Dark Theme and existing Design System are preserved.
