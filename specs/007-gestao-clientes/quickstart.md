# Quickstart: Gestao de Clientes no Frontend

## Prerequisites

- Backend API running with `/api/clientes` available.
- Frontend dependencies installed in `frontend/`.
- `NEXT_PUBLIC_API_BASE_URL` configured if the API is not served from the same origin.

## Setup

```powershell
cd frontend
npm install
```

Use the existing environment convention for the frontend API base URL when needed.

## Static Validation

Run from `frontend/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Expected outcome:

- Lint completes without errors.
- TypeScript completes without errors.
- Production build completes without errors.

### Latest Static Validation

Executed on 2026-06-11 from `frontend/`:

- `npm run lint`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.

The build confirmed the customer routes `/clientes`, `/clientes/novo`,
`/clientes/[id]`, and `/clientes/[id]/editar` are included in the Next.js app.

## Manual Validation Scenarios

### 1. List active customers

1. Start the backend API.
2. Start the frontend.
3. Open `/clientes`.
4. Confirm the default view lists active customers only.
5. Confirm loading, error retry and empty states are visible under the appropriate API conditions.

Expected outcome: users can see real customers, no mock data appears, and active/inactive status is clear.

### 2. Search customers

1. Open `/clientes`.
2. Search by part of the customer name.
3. Search by email or phone when those fields exist.
4. Search for a term with no matches.

Expected outcome: search filters only the loaded list for the selected status and shows a no-results empty state when needed.

### 3. Create customer

1. Open `/clientes/novo`.
2. Try saving with empty name.
3. Fill a valid name, optional email and optional phone.
4. Save.

Expected outcome: required validation appears before invalid submit, successful save creates a real customer and navigates to a place where the new customer is visible.

### 4. View customer details

1. Open details from `/clientes`.
2. Confirm name, email, phone, status and ID are displayed.
3. Open a non-existing customer ID.

Expected outcome: valid customer details render without financial/history data; invalid ID shows not-found state.

### 5. Edit customer

1. Open `/clientes/{id}/editar` for an existing customer.
2. Confirm current values are prefilled.
3. Change name, email or phone.
4. Save.

Expected outcome: updated data is persisted by the API and visible in details/list without redigiting every field.

### 6. Inactivate customer

1. Open an active customer.
2. Trigger inactivation.
3. Confirm the dialog.
4. Return to `/clientes` active view.
5. Switch to inactive or all customers.

Expected outcome: inactivation requires explicit confirmation, the customer disappears from active view, remains visible in inactive/all views, and no delete action exists.

### 7. Responsive validation

Validate `/clientes`, `/clientes/novo`, `/clientes/{id}` and `/clientes/{id}/editar` in:

- Smartphone viewport.
- Tablet viewport.
- Desktop viewport.

Expected outcome: actions remain reachable, text does not overlap, cards/tables are legible, and touch targets are usable.

## Scope Guardrails

- Do not add CPF/CNPJ/document fields in this feature.
- Do not show sales history, accounts receivable, balances, rankings or dashboards.
- Do not calculate financial or operational metrics in the frontend.
- Do not implement definitive customer deletion.

## Implementation Status

Feature 007 is implemented and ready for environment validation with a running
backend API. Manual scenarios above require `/api/clientes` to be available with
real data so list, create, edit and inactivate flows can be confirmed end to end.
