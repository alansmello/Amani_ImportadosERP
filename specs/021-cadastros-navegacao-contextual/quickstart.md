# Quickstart: Validate Cadastros Auxiliares, Fornecedores e Navegação Contextual

## Prerequisites

- Branch `021-cadastros-navegacao-contextual` checked out.
- PostgreSQL available and `DefaultConnection` configured for the API.
- .NET 8 SDK, Node.js/npm and EF Core CLI available.
- Existing authenticated ERP user able to access Suppliers, Products, Purchases and mapped operational pages.
- Test data with at least one Product; also prepare scenarios with empty Supplier and Category lists in an isolated database.

Review [data-model.md](data-model.md) and the contracts in [contracts/](contracts/) before validation.

## 1. Build and static validation

From the repository root:

```powershell
dotnet build Amani_ImportadosERP.sln
```

From `frontend/`:

```powershell
npm run lint
npm run typecheck
npm run build
```

Expected: all four commands complete successfully without new warnings treated as errors.

**Baseline 2026-06-28**: `dotnet build -c Release --no-restore`, lint, typecheck and frontend production build passed. The default Debug build could not replace API output DLLs because an existing `Amani.ImportadosERP.Api` process (PID 33988) was running; this is an environment lock, not a compilation error. Existing compiler/NuGet warnings were preserved as baseline.

## 2. Apply the schema change

From the repository root, against a disposable or backed-up development database:

```powershell
dotnet ef database update --project src/Amani.ImportadosERP.Infra.Data --startup-project src/Amani.ImportadosERP.Api
```

Expected:

- `fornecedores` has a nullable phone column limited to 50 characters.
- Existing Suppliers remain readable with null phone.
- No existing names, relations, Purchases or Products change.

## 3. Run the application

Start the API from the repository root:

```powershell
dotnet run --project src/Amani.ImportadosERP.Api
```

In another terminal, from `frontend/`:

```powershell
npm run dev
```

Use the local URLs emitted by the commands and authenticate normally.

## 4. Validate Supplier phone contract

1. Create a Supplier without phone through the official screen.
2. Confirm list and detail show “Não informado” and no GUID.
3. Create a Supplier with leading/trailing spaces around a phone; confirm the displayed value is trimmed.
4. Edit the phone, clear it, save and confirm it becomes absent.
5. Create two Suppliers with the same phone; both must succeed.
6. Try more than 50 characters; expect an operational validation error and no partial update.
7. Inspect Client and Product details; headers must not expose GUIDs.
8. Exercise missing-reference states in Products and receivables; expect operational text instead of abbreviated IDs.

Expected API shapes and status codes are defined in [contracts/fornecedores-api.md](contracts/fornecedores-api.md).

## 5. Validate quick Supplier creation in Nova Compra

1. Open Nova Compra with at least one Product available and no Supplier selected.
2. Fill date, adjustments and multiple item fields.
3. Open quick Supplier creation, then cancel; verify every Purchase field/item remains unchanged.
4. Reopen, submit invalid data and confirm the actual error stays inside the modal while Purchase data remains unchanged.
5. Create a valid Supplier with phone.
6. Confirm the modal closes, the Supplier appears in the selector and is selected immediately without manual refresh.
7. Confirm date, adjustments and all item values are unchanged.
8. Submit the Purchase and verify it remains merchandise in transit with no stock entry.
9. Repeat with no Suppliers in the database: the form and create action must remain available.
10. Repeat with no Products: Purchase must remain blocked as before.

Measure at least three complete Supplier quick-create runs in Nova Compra and three in Novo Produto. From opening the modal through the new option becoming selected, every run must finish in at most 60 seconds.

## 6. Validate quick references in Novo Produto

1. Open Novo Produto and fill name, price and cost.
2. Create a Category in the modal; verify immediate selection and preservation of all other fields.
3. Create a Supplier in the modal; verify immediate selection and preservation of all other fields.
4. Cancel each modal and trigger one API validation failure; the Product draft must remain unchanged.
5. With no Categories, verify the Product form and Category action remain visible but Product submission remains blocked until a Category is created/selected.
6. With no Suppliers, verify the Supplier action remains available and Product can still be saved without a Supplier.
7. Double-click save while a modal mutation is pending; only one record may be created through the UI.

Measure at least three complete Category quick-create runs. From opening the modal through the new option becoming selected, every run must finish in at most 30 seconds.

Across at least 10 representative Supplier/Category executions, record whether the flow was completed on the first attempt without guidance and without losing the host draft. At least 9 of 10 executions must pass.

| Run | Flow and host | Device width | Elapsed time | First attempt without guidance | Draft preserved | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 1–10 | Fill during validation | Fill during validation | Fill during validation | Yes/No | Yes/No | Pass/Fail |

Expected host/cache behavior is defined in [contracts/cadastros-rapidos.md](contracts/cadastros-rapidos.md).

## 7. Validate contextual navigation

For every row in the fallback matrix at [contracts/navegacao-contextual.md](contracts/navegacao-contextual.md):

1. Enter the destination from a controlled internal link and use Voltar; expect the actual source path, including relevant filters, when supplied.
2. Open the destination URL directly and use Voltar; expect the documented fallback.
3. Refresh the destination and use Voltar; expect the documented fallback.
4. Supply absent, malformed, external (`https://...`) and protocol-relative (`//...`) `returnTo` values; all must use fallback and remain inside the ERP.
5. Supply `/login`, `/api/test`, `/_next/test` and an unknown top-level prefix; all must use fallback.
6. Navigate through a controlled link after the document itself was initially loaded by refresh; the valid marker must still preserve the new client-side origin.
7. Refresh the destination after a successful controlled navigation; the consumed marker must not be reusable and Voltar must use fallback.
8. Open the same controlled destination in a new tab; without a marker registered for that tab, Voltar must use fallback.
9. Navigate detail → edit → Voltar; expect detail, without nested or looping `returnTo` values.
10. Open a modal and use Cancel; only the modal closes.

Expected: none of the scenarios can navigate outside the ERP or depend on browser back history.

## 8. Responsive and visual regression

Repeat the critical quick-create and return flows at representative widths:

- Smartphone: 360–430 px
- Tablet: 768–1024 px
- Desktop: 1280 px or wider

Verify:

- Dialog content scrolls inside the viewport.
- Mobile keyboard does not permanently hide save/cancel actions.
- Selectors, create actions, tables/cards and error messages remain legible.
- Focus returns to the trigger after closing a modal.
- Dark Theme, spacing, buttons, inputs and states use the existing Design System.

## 9. Final regression

- Official Supplier and Category screens still create/update records.
- Supplier, Category and Product lists reconcile after quick creation.
- Purchase cannot be submitted without a Product or valid Supplier selection.
- Product cannot be submitted without a Category; Supplier remains optional.
- IDs still work in routes, payloads, relationships and cache keys despite being hidden.
- The closed GUID/fallback inventory in [contracts/apresentacao-identificadores.md](contracts/apresentacao-identificadores.md) has no remaining technical identifier presentation.
- No stock, receiving, loss, sale, cost-average or financial rule changes.
