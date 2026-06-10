# Contract: Product Management Frontend

## Purpose

Documentar o contrato que o frontend da Feature 006 deve consumir e expor ao usuario. Este contrato reflete os endpoints reais existentes no backend no momento do planejamento.

## Backend Endpoints Consumed

### List Products

- **Request**: `GET /api/produtos`
- **Response 200**:

```json
[
  {
    "id": "guid",
    "nome": "Produto",
    "precoVenda": 100.0,
    "custo": 60.0,
    "categoriaId": "guid",
    "fornecedorId": "guid-or-null"
  }
]
```

### Get Product By ID

- **Request**: `GET /api/produtos/{id}`
- **Response 200**:

```json
{
  "id": "guid",
  "nome": "Produto",
  "precoVenda": 100.0,
  "custo": 60.0,
  "categoriaId": "guid",
  "fornecedorId": null
}
```

- **Response 404**: produto nao encontrado.

### Create Product

- **Request**: `POST /api/produtos`

```json
{
  "nome": "Produto",
  "precoVenda": 100.0,
  "custo": 60.0,
  "categoriaId": "guid",
  "fornecedorId": null
}
```

- **Response 201**: produto criado.
- **Response 400**: payload invalido ou referencia inexistente.

### Update Product

- **Request**: `PUT /api/produtos/{id}`

```json
{
  "nome": "Produto atualizado",
  "precoVenda": 120.0,
  "custo": 70.0,
  "categoriaId": "guid",
  "fornecedorId": "guid-or-null"
}
```

- **Response 204**: produto atualizado.
- **Response 400**: payload invalido ou referencia inexistente.
- **Response 404**: produto nao encontrado.

### List Categories

- **Request**: `GET /api/categorias`
- **Response 200**:

```json
[
  {
    "id": "guid",
    "nome": "Categoria"
  }
]
```

### List Suppliers

- **Request**: `GET /api/fornecedores`
- **Response 200**:

```json
[
  {
    "id": "guid",
    "nome": "Fornecedor"
  }
]
```

## Frontend Route Contract

| Route | Purpose | Required States |
|-------|---------|-----------------|
| `/produtos` | Listar e buscar produtos reais. | Loading, error, empty, populated. |
| `/produtos/novo` | Cadastrar produto. | Loading support lists, support-list error, validation error, submitting, success. |
| `/produtos/[id]` | Consultar detalhes. | Loading, error, not found, ready. |
| `/produtos/[id]/editar` | Editar produto. | Loading product/support lists, error, not found, validation error, submitting, success. |

## Frontend Actions

| Action | Supported | Notes |
|--------|-----------|-------|
| List products | Yes | Uses real API. |
| Search products | Yes | Local search by name over loaded data. |
| View product | Yes | Uses product ID. |
| Create product | Yes | Sends real payload. |
| Edit product | Yes | Sends real payload. |
| Delete product | No | No safe backend endpoint exists. |
| Inactivate product | No | No status/inactivation endpoint exists. |
| CRUD categories | No | Categories are read-only support data. |
| CRUD suppliers | No | Suppliers are read-only support data. |

## Business Rule Boundary

The frontend must not calculate or infer:

- Stock balance.
- Average cost.
- Profit.
- Product performance.
- Dashboard metrics.
- Operational validity beyond basic form feedback.

The backend remains the official source for validation and persistence.
