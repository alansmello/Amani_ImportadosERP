# Quickstart: Gestao de Fornecedores no Frontend

## Prerequisites

- Backend API running with `/api/fornecedores` available.
- Frontend dependencies installed in `frontend/`.
- At least one supplier can be created through the API or UI for edit/detail
  validation.

## Commands

From repository root:

```powershell
cd frontend
npm run lint
npm run typecheck
npm run build
npm run dev
```

Open the frontend URL reported by Next.js and validate the scenarios below.

## Scenario 1: Navigation

1. Open the application in desktop viewport.
2. Confirm the main navigation exposes `Fornecedores` with the operational
   cadastro entries.
3. Open smartphone and tablet widths.
4. Confirm `Fornecedores` remains reachable without layout overlap.

Expected outcome:

- `/fornecedores` opens from navigation.
- No text or action overlaps in mobile, tablet or desktop.

## Scenario 2: Supplier List and Search

1. Open `/fornecedores`.
2. Wait for the supplier list to load.
3. Search by part of a supplier name.
4. Search by a term that matches no supplier.
5. Clear the search.

Expected outcome:

- Real suppliers from the API appear.
- Search filters by `nome` only.
- Empty search result state appears when no supplier matches.
- No mocked data, metrics, history or unsupported fields appear.

## Scenario 3: Empty and Error States

1. Validate empty state against an API/database state with no suppliers, or by
   using an isolated test environment.
2. Validate error state by temporarily stopping the backend or forcing the API URL
   to fail in a local test run.
3. Use the retry action after restoring the backend.

Expected outcome:

- Empty state guides the user to create the first supplier.
- Error state is understandable and offers retry.
- Navigation is not blocked by the error state.

## Scenario 4: Create Supplier

1. Open `/fornecedores/novo`.
2. Try to submit with empty `nome`.
3. Enter a valid supplier name and submit.
4. Confirm success feedback and navigation/update.
5. Return to `/fornecedores`.

Expected outcome:

- Empty `nome` is blocked with field feedback.
- Valid submit sends `{ nome }` only.
- Created supplier appears in list and can be opened.

## Scenario 5: Supplier Details

1. Open an existing supplier from the list.
2. Confirm detail page shows supplier `nome` and read-only `id`.
3. Use the edit action.
4. Use back navigation to return to list.

Expected outcome:

- Detail page contains only supported supplier data.
- No inactivate, delete, remove, history, total or metric action is shown.

## Scenario 6: Edit Supplier

1. Open `/fornecedores/[id]/editar` for an existing supplier.
2. Confirm the form is prefilled with current `nome`.
3. Submit with empty `nome` and confirm validation.
4. Change `nome` to a valid value and submit.
5. Confirm detail/list show the updated value without manual reload.

Expected outcome:

- Edit sends `{ nome }` only.
- API rejection is shown without losing typed value.
- React Query cache invalidation refreshes list/detail data.

## Scenario 7: Not Found

1. Open `/fornecedores/00000000-0000-0000-0000-000000000000`.
2. Open `/fornecedores/00000000-0000-0000-0000-000000000000/editar`.

Expected outcome:

- Both pages show a not-found state without breaking navigation.
- User can return to supplier list.

## Regression Checks

- Produtos still load supplier names through `useSuppliers`.
- Existing product create/edit flows still typecheck.
- No backend files, migrations or database schema changes are required.
- `npm run lint`, `npm run typecheck` and `npm run build` pass after implementation.
