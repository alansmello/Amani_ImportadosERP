# Contract: Fornecedores API

Base path: `/api/fornecedores`

The feature extends existing contracts in a backward-compatible way. `telefone` is optional on input and nullable on output.

## Supplier representation

```json
{
  "id": "uuid",
  "nome": "Fornecedor Exemplo",
  "telefone": "+55 11 99999-9999"
}
```

When absent:

```json
{
  "id": "uuid",
  "nome": "Fornecedor sem telefone",
  "telefone": null
}
```

## POST `/api/fornecedores`

Creates a Supplier and is reused by official and quick forms.

Request:

```json
{
  "nome": "Fornecedor Exemplo",
  "telefone": "  +55 11 99999-9999  "
}
```

Success: `201 Created`, returning the complete normalized Supplier representation. The `Location` header continues to identify `GET /api/fornecedores/{id}`.

Validation failures: `400 Bad Request` with the existing operational error shape. Expected cases include blank name and phone longer than 50 characters after trim.

## PUT `/api/fornecedores/{id}`

Updates name and optional phone together.

Request:

```json
{
  "nome": "Fornecedor Atualizado",
  "telefone": null
}
```

Success: `204 No Content`.

Errors:

- `400 Bad Request` for invalid name or phone; persisted Supplier remains unchanged.
- `404 Not Found` when `id` does not identify an existing Supplier.

## GET `/api/fornecedores`

Success: `200 OK` with an array of Supplier representations including nullable `telefone`.

## GET `/api/fornecedores/{id}`

Success: `200 OK` with the Supplier representation.

Error: `404 Not Found` when the Supplier does not exist.

## Business rules

- Whitespace-only phone is normalized to null.
- Leading and trailing spaces are removed before length validation and persistence.
- Phone length is at most 50 characters.
- Phone is not unique.
- Existing records with null phone remain valid.
- IDs remain part of the API contract even though operational screens stop displaying them.
