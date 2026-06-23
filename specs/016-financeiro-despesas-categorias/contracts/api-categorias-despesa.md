# API Contract: Categorias de Despesa

Base path: `/api/categorias-despesa`

All payloads use explicit DTOs. Domain entities are not exposed directly.

## List Categories

`GET /api/categorias-despesa?incluirInativas=true|false`

Response `200 OK`:

```json
[
  {
    "id": "guid",
    "nome": "Frete",
    "descricao": "Custos de transporte",
    "ativa": true
  }
]
```

Rules:

- Default list may return active categories for new expense forms.
- Management screens can request inactive categories for history/maintenance.

## Get Category

`GET /api/categorias-despesa/{id}`

Response `200 OK`:

```json
{
  "id": "guid",
  "nome": "Frete",
  "descricao": "Custos de transporte",
  "ativa": true
}
```

Errors:

- `404 Not Found` when category does not exist.

## Create Category

`POST /api/categorias-despesa`

Request:

```json
{
  "nome": "Frete",
  "descricao": "Custos de transporte"
}
```

Response `201 Created`:

```json
{
  "id": "guid"
}
```

Validation:

- `nome` is required.
- Duplicate operational names are rejected.
- New category starts active.

## Update Category

`PUT /api/categorias-despesa/{id}`

Request:

```json
{
  "nome": "Fretes e entregas",
  "descricao": "Transporte, frete e entrega"
}
```

Response:

- `204 No Content`

Validation:

- `nome` is required.
- Duplicate operational names are rejected.

## Inactivate Category

`POST /api/categorias-despesa/{id}/inativar`

Response:

- `204 No Content`

Rules:

- Existing expenses remain linked to the category.
- Inactive category is not valid for new expenses.

Errors:

- `404 Not Found` when category does not exist.
