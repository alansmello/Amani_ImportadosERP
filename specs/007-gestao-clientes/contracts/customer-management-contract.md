# Contract: Gestao de Clientes no Frontend

## API Endpoints Consumed

Base path: `/api/clientes`

### List Customers

```http
GET /api/clientes?ativo=true
GET /api/clientes?ativo=false
GET /api/clientes
```

**Query**

| Name | Type | Required | Meaning |
|------|------|----------|---------|
| `ativo` | boolean | No | `true` for active customers, `false` for inactive customers. Omit to request all customers. |

**Response 200**

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000000",
    "nome": "Cliente exemplo",
    "email": "cliente@example.com",
    "telefone": "11999999999",
    "ativo": true
  }
]
```

### Get Customer By ID

```http
GET /api/clientes/{id}
```

**Response 200**

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "nome": "Cliente exemplo",
  "email": "cliente@example.com",
  "telefone": "11999999999",
  "ativo": true
}
```

**Response 404**

Cliente nao encontrado. A UI deve exibir estado de nao encontrado sem quebrar navegacao.

### Create Customer

```http
POST /api/clientes
Content-Type: application/json
```

**Request**

```json
{
  "nome": "Cliente exemplo",
  "email": "cliente@example.com",
  "telefone": "11999999999"
}
```

**Response 201**

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "nome": "Cliente exemplo",
  "email": "cliente@example.com",
  "telefone": "11999999999",
  "ativo": true
}
```

**Response 400**

Dados rejeitados pela fonte oficial. A UI deve apresentar a mensagem disponivel ou fallback claro.

### Update Customer

```http
PUT /api/clientes/{id}
Content-Type: application/json
```

**Request**

```json
{
  "nome": "Cliente atualizado",
  "email": "cliente.atualizado@example.com",
  "telefone": "11888888888"
}
```

**Response 204**

Atualizacao concluida.

**Response 400**

Dados rejeitados pela fonte oficial.

**Response 404**

Cliente nao encontrado.

### Inactivate Customer

```http
POST /api/clientes/{id}/inativar
```

**Response 204**

Cliente inativado sem remocao definitiva.

**Response 404**

Cliente nao encontrado.

## Frontend Service Contract

```text
customersService.list(statusFilter)
customersService.getById(id)
customersService.create(payload)
customersService.update(id, payload)
customersService.inactivate(id)
```

## UI Contract

### `/clientes`

- Defaults to active customers.
- Provides status filter: active, inactive, all.
- Provides local search over loaded customers by name, email and phone.
- Shows loading, error, empty, no-search-results and data states.
- Shows inactivation action only when `ativo` is true.

### `/clientes/novo`

- Shows form with name, email and phone.
- Requires name before submit.
- Shows API rejection without clearing the form.
- Navigates to a context where the created customer can be seen after success.

### `/clientes/[id]`

- Loads customer by ID.
- Shows name, email, phone, status and ID.
- Shows edit action.
- Shows inactivate action only for active customer.
- Shows not-found state for `404`.

### `/clientes/[id]/editar`

- Loads customer by ID before rendering editable form.
- Submits only name, email and phone.
- Shows API rejection without clearing the form.
- Navigates to a context where the updated customer can be seen after success.

## Explicit Exclusions

- No definitive customer deletion.
- No customer reactivation.
- No CPF/CNPJ/document fields.
- No sales history, accounts receivable, balance, credit limit, rankings, dashboards or frontend financial calculations.
