# API Contracts: Cadastros Base

All endpoints are public backend API contracts for cadastro maintenance. Request
and response bodies must use explicit DTOs. Controllers must not contain
business rules.

## Clientes

### POST /api/clientes

Creates an active cliente.

Request:

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "telefone": "11999990000"
}
```

Success:
- `201 Created`
- Body contains the created cliente identifier and cadastro data.

Validation:
- Reject blank `nome`.

### GET /api/clientes

Lists clientes, including active state.

Query:
- `ativo` optional boolean filter. When omitted, return all clientes.

Success:
- `200 OK`
- Body is an array of cliente list DTOs.

### GET /api/clientes/{id}

Gets one cliente by identifier.

Success:
- `200 OK` when found.
- `404 Not Found` when not found.

### PUT /api/clientes/{id}

Updates cliente cadastro data.

Request:

```json
{
  "nome": "Maria Silva",
  "email": "maria.novo@example.com",
  "telefone": "11888880000"
}
```

Success:
- `200 OK` or `204 No Content` when updated.
- `404 Not Found` when not found.

### POST /api/clientes/{id}/inativar

Inactivates a cliente without deleting history.

Success:
- `200 OK` or `204 No Content` when inactivated.
- `404 Not Found` when not found.

## Fornecedores

### POST /api/fornecedores

Creates a fornecedor.

Request:

```json
{
  "nome": "Fornecedor ABC"
}
```

Success:
- `201 Created`

### GET /api/fornecedores

Lists fornecedores.

Success:
- `200 OK`

### GET /api/fornecedores/{id}

Gets one fornecedor by identifier.

Success:
- `200 OK` when found.
- `404 Not Found` when not found.

### PUT /api/fornecedores/{id}

Updates fornecedor cadastro data.

Request:

```json
{
  "nome": "Fornecedor ABC Atualizado"
}
```

Success:
- `200 OK` or `204 No Content` when updated.
- `404 Not Found` when not found.

## Categorias

### POST /api/categorias

Creates a categoria.

Request:

```json
{
  "nome": "Eletronicos"
}
```

Success:
- `201 Created`

### GET /api/categorias

Lists categorias.

Success:
- `200 OK`

### GET /api/categorias/{id}

Gets one categoria by identifier.

Success:
- `200 OK` when found.
- `404 Not Found` when not found.

### PUT /api/categorias/{id}

Updates categoria data.

Request:

```json
{
  "nome": "Acessorios"
}
```

Success:
- `200 OK` or `204 No Content` when updated.
- `404 Not Found` when not found.

## Produtos

### POST /api/produtos

Creates a produto without creating stock balance or movements.

Request:

```json
{
  "nome": "Fone Bluetooth",
  "precoVenda": 149.90,
  "custo": 0,
  "categoriaId": "00000000-0000-0000-0000-000000000000",
  "fornecedorId": "00000000-0000-0000-0000-000000000000"
}
```

Success:
- `201 Created`

Validation:
- Reject blank `nome`.
- Reject negative `precoVenda`.
- Reject nonexistent `categoriaId`.
- Reject nonexistent `fornecedorId` when provided.
- Do not create stock movements.

### GET /api/produtos

Lists produtos with category and supplier identifiers.

Success:
- `200 OK`

### GET /api/produtos/{id}

Gets one produto by identifier.

Success:
- `200 OK` when found.
- `404 Not Found` when not found.

### PUT /api/produtos/{id}

Updates produto cadastro/commercial data without touching stock.

Request:

```json
{
  "nome": "Fone Bluetooth Pro",
  "precoVenda": 179.90,
  "custo": 0,
  "categoriaId": "00000000-0000-0000-0000-000000000000",
  "fornecedorId": null
}
```

Success:
- `200 OK` or `204 No Content` when updated.
- `404 Not Found` when product is not found.
- Validation error when references are invalid.

## Cross-Cutting Contract Rules

- All create endpoints return enough data for the caller to use the new record.
- List endpoints return empty arrays when no records exist.
- Invalid identifiers return not found or validation result consistently.
- No endpoint in this feature changes purchases, sales, stock movements,
  cost-average calculation or profit calculation.
