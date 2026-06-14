# Contract: Fornecedores Frontend

Este contrato descreve como o frontend deve consumir a API existente de
fornecedores e quais comportamentos de UI devem ser expostos.

## Routes

| Route | Purpose |
|-------|---------|
| `/fornecedores` | Lista fornecedores, busca por nome e abre acoes. |
| `/fornecedores/novo` | Cadastra novo fornecedor. |
| `/fornecedores/[id]` | Consulta detalhe de fornecedor. |
| `/fornecedores/[id]/editar` | Edita nome de fornecedor existente. |

## API Consumption

### List suppliers

```http
GET /api/fornecedores
```

Expected response:

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000001",
    "nome": "Fornecedor Exemplo"
  }
]
```

Frontend behavior:

- Show loading while pending.
- Show empty state when response is `[]`.
- Show error state with retry on request failure.
- Apply local search by `nome` only.

### Get supplier by ID

```http
GET /api/fornecedores/{id}
```

Expected success response:

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "nome": "Fornecedor Exemplo"
}
```

Frontend behavior:

- Show loading while pending.
- Show supplier name and read-only ID on success.
- Show not-found state for missing supplier.
- Offer navigation to edit and back to list.

### Create supplier

```http
POST /api/fornecedores
Content-Type: application/json

{
  "nome": "Fornecedor Exemplo"
}
```

Expected success response:

```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "nome": "Fornecedor Exemplo"
}
```

Frontend behavior:

- Trim and validate `nome` before submit.
- Disable duplicate submit while pending.
- Show success feedback and route to saved supplier or refreshed list.
- Show API rejection without losing typed value.
- Invalidate supplier list cache after success.

### Update supplier

```http
PUT /api/fornecedores/{id}
Content-Type: application/json

{
  "nome": "Fornecedor Atualizado"
}
```

Expected success response:

```http
204 No Content
```

Frontend behavior:

- Load current supplier before edit.
- Populate form with current `nome`.
- Trim and validate `nome` before submit.
- Show success feedback and route to detail or refreshed list.
- Show API rejection without losing typed value.
- Invalidate supplier list and detail cache after success.

## Frontend Types

```ts
export type Supplier = {
  id: string;
  nome: string;
};

export type SupplierPayload = {
  nome: string;
};
```

## Service API

```ts
const SUPPLIERS_PATH = "/api/fornecedores";

suppliersService.list(): Promise<Supplier[]>
suppliersService.getById(id: string): Promise<Supplier>
suppliersService.create(payload: SupplierPayload): Promise<Supplier>
suppliersService.update(id: string, payload: SupplierPayload): Promise<void>
```

## Hook API

```ts
useSuppliers()
useSupplier(id: string | undefined)
useCreateSupplier()
useUpdateSupplier()
```

Cache behavior:

- Query keys must have a shared supplier root key.
- Create success invalidates supplier list/root.
- Update success invalidates supplier root and the edited detail key.

## Navigation Contract

- Add `routes.fornecedores = "/fornecedores"`.
- Add navigation item `fornecedores` near other operational cadastro entries.
- Mobile navigation must keep main actions accessible and expose Fornecedores via
  the existing "Mais" group if not promoted to the primary mobile bar.

## Prohibited UI/API Behavior

- MUST NOT show inactivate, delete or remove actions.
- MUST NOT show purchase history.
- MUST NOT show totals, rankings, indicators or calculated metrics.
- MUST NOT send or display contact/commercial fields not present in the official
  supplier contract.
- MUST NOT use mocked suppliers in production UI states.
