# Contract: Quick Creates

This UI contract defines interaction between host forms, shared quick-create dialogs, existing mutations and shared query caches.

## Supplier quick-create dialog

Reusable hosts:

- Nova Compra
- Novo Produto

Inputs:

- `open`: controlled visibility
- `onOpenChange(open)`: closes or opens without changing the host draft
- `onCreated(supplier)`: receives the complete Supplier returned by the API

Fields:

- Name: required, same rules and component used by official Supplier form
- Phone: optional, same trim and 50-character rules as official Supplier form

Behavior:

1. Opening does not unmount or reset the host form.
2. Cancel closes the dialog and leaves the host draft unchanged.
3. Validation/API errors remain visible inside the dialog; host draft stays unchanged.
4. Submit is disabled while pending to prevent duplicate creation.
5. Success inserts/replaces the returned Supplier in list/detail caches, emits `onCreated`, resets dialog state and closes.
6. Host sets only its `fornecedorId` to the emitted `id` and clears any stale field error.
7. Query invalidation runs after the immediate cache update for server reconciliation.

## Category quick-create dialog

Reusable host:

- Novo Produto

Inputs:

- `open`
- `onOpenChange(open)`
- `onCreated(category)`

Field:

- Name: required and normalized under the same contract used by the official Product Category manager

Behavior follows Supplier quick creation, using the Category list cache and selecting only `categoriaId` in the Product draft.

## Host-state guarantees

### Nova Compra

- Supplier absence alone never replaces the form with a blocking empty state.
- Product absence remains blocking because quick Product creation is outside scope.
- Supplier creation changes only `fornecedorId`.
- Date, discount, increase, item count and every item field remain unchanged on open, cancel, error and success.

### Novo Produto

- The form remains rendered when Category or Supplier lists are empty.
- Category and Supplier actions remain visible next to their selectors.
- Product submit remains disabled until a valid Category exists and is selected.
- Category creation changes only `categoriaId`.
- Supplier creation changes only `fornecedorId`.
- Name, price and cost remain unchanged on open, cancel, error and success.

## Cache merge rule

For each created reference:

1. Read current list cache or an empty list.
2. Replace a matching `id` or append the returned record.
3. Avoid duplicate IDs.
4. For Supplier, set the detail cache for the returned ID.
5. Select the created ID in the host.
6. Invalidate the relevant query family without awaiting it before selection becomes visible.

## Accessibility and responsiveness

- Dialog has title, description and associated field errors.
- Focus enters the dialog on open and returns to the trigger on close.
- Escape/cancel is blocked only during a pending submit when closing would make the result ambiguous.
- Content scrolls within the viewport and save/cancel actions remain reachable with the mobile keyboard open.
- Trigger and action layout uses the existing smartphone, tablet and desktop breakpoints.
