# Quickstart: Gestao de Produtos no Frontend

## Prerequisites

- Backend running with product, category and supplier endpoints available.
- Frontend environment configured with `NEXT_PUBLIC_API_BASE_URL` when the backend is not served from the same origin.
- At least one category registered in the backend to validate product creation.
- Suppliers are optional; the feature must work even with an empty supplier list.

## Install and Validate

From the repository root:

```powershell
cd frontend
npm install
npm run lint
npm run typecheck
npm run build
```

All three validation commands must pass before the feature is considered complete.

## Run Locally

```powershell
cd frontend
npm run dev
```

Open the local frontend URL and validate the routes below.

## Validation Scenarios

### 1. Product List

1. Navigate to `/produtos`.
2. Confirm products are loaded from the backend.
3. Confirm the page shows title, short description, "Novo Produto", search, and actions for details/edit.
4. Search by product name and confirm the displayed list is filtered locally.
5. Confirm no delete or inactivation action is visible.

Expected result: real products appear with loading, empty and error states handled.

### 2. Empty Product List

1. Use an environment with no products.
2. Navigate to `/produtos`.

Expected result: empty state is shown with a clear path to create a product.

### 3. Create Product

1. Navigate to `/produtos/novo`.
2. Confirm categories are loaded into the category selector.
3. Fill name, sale price, cost and category.
4. Leave supplier blank and submit.
5. Repeat with supplier selected if suppliers exist.

Expected result: product is created through the backend and the UI navigates or refreshes so the saved product is visible.

### 4. Create Product Validation

1. Navigate to `/produtos/novo`.
2. Try submitting with missing name, missing category, negative sale price or negative cost.

Expected result: the form shows visual validation and preserves entered values. Backend rejection messages are shown when returned.

### 5. Product Details

1. From `/produtos`, open a product details action.
2. Confirm the details show name, sale price, cost, category and supplier when present.
3. Confirm no stock, profit, average cost or indicators are displayed.

Expected result: details are loaded by product ID and offer navigation to edit.

### 6. Edit Product

1. Open `/produtos/[id]/editar` for an existing product.
2. Confirm the form is prefilled.
3. Change name, sale price, cost, category or supplier.
4. Submit.

Expected result: the backend accepts the update, the UI shows success feedback, and list/details reflect updated data.

### 7. Not Found and API Failures

1. Open a nonexistent product ID in details and edit routes.
2. Temporarily stop the backend or point `NEXT_PUBLIC_API_BASE_URL` to an invalid URL.

Expected result: not found and error states are clear and do not break navigation.

### 8. Responsive Review

Validate `/produtos`, `/produtos/novo`, `/produtos/[id]` and `/produtos/[id]/editar` in:

- Smartphone viewport.
- Tablet viewport.
- Desktop viewport.

Expected result: content does not overlap, actions remain accessible, forms are usable by touch, and the Dark Only visual identity remains consistent.

## Final Acceptance Checks

- No mocked product, category or supplier data exists in the UI.
- No delete/inactivation UI exists.
- No category/supplier CRUD exists.
- No stock, profit, average cost or indicator calculation exists in frontend code.
- Product lookup plus opening details completes within 30 seconds.
- Valid product creation completes within 2 minutes.
- Valid product editing completes within 2 minutes.
- `npm run lint`, `npm run typecheck` and `npm run build` pass inside `frontend/`.
