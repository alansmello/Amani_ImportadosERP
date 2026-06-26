# Contracts: Configurações e Categorias — Frontend

**Branch**: `019-configuracoes-categorias-frontend` | **Date**: 2026-06-25

Este documento descreve os endpoints de API consumidos pelo frontend de F019, incluindo os dois
endpoints novos que devem ser adicionados ao backend antes da implementação do frontend.

---

## 1. Categorias de Produto — `/api/categorias`

### `GET /api/categorias`

Retorna lista de todas as categorias de produto ordenadas por nome.

**Response `200 OK`**:
```json
[
  { "id": "uuid", "nome": "Bolsa" },
  { "id": "uuid", "nome": "Calçado" }
]
```

### `POST /api/categorias`

Cria nova categoria de produto.

**Request body**:
```json
{ "nome": "Acessório" }
```

**Response `201 Created`**:
```json
{ "id": "uuid", "nome": "Acessório" }
```

**Response `400 Bad Request`** (nome vazio ou duplicado):
```json
{ "error": "Nome é obrigatório" }
```

### `PUT /api/categorias/{id}`

Atualiza o nome de uma categoria de produto.

**Request body**:
```json
{ "nome": "Acessório de moda" }
```

**Response `204 No Content`**: sucesso sem body.

**Response `404 Not Found`**: categoria não encontrada.

**Response `400 Bad Request`**: nome inválido ou duplicado.

### `DELETE /api/categorias/{id}` *(novo — F019)*

Remove uma categoria de produto. Bloqueado pelo banco se a categoria tiver produtos vinculados
(FK constraint).

**Response `204 No Content`**: removida com sucesso.

**Response `404 Not Found`**: categoria não encontrada.

**Response `409 Conflict`** ou **`400 Bad Request`**: categoria com produtos vinculados; mensagem
retornada pelo banco/service exibida pelo frontend sem interpretação.

---

## 2. Categorias de Despesa — `/api/categorias-despesa`

### `GET /api/categorias-despesa?incluirInativas={bool}`

Retorna categorias de despesa. Sem parâmetro ou `incluirInativas=false`: apenas ativas.
Com `incluirInativas=true`: ativas e inativas.

**Response `200 OK`**:
```json
[
  { "id": "uuid", "nome": "Aluguel", "descricao": null, "ativa": true },
  { "id": "uuid", "nome": "Frete", "descricao": "Custos de envio", "ativa": false }
]
```

*Nota*: Em Configurações, a lista é carregada com `incluirInativas=true` para exibir o toggle.
No formulário de nova despesa, `incluirInativas=false` para mostrar apenas ativas.

### `POST /api/categorias-despesa`

Cria nova categoria de despesa (ativa por padrão).

**Request body**:
```json
{ "nome": "Fornecedor", "descricao": null }
```

**Response `201 Created`**:
```json
{ "id": "uuid" }
```

### `PUT /api/categorias-despesa/{id}`

Atualiza nome e descrição da categoria (não altera status).

**Request body**:
```json
{ "nome": "Fornecedor principal", "descricao": "Custos com fornecedores" }
```

**Response `204 No Content`**: sucesso.

### `POST /api/categorias-despesa/{id}/inativar`

Marca categoria como inativa. Idempotente (se já inativa, retorna `204` sem erro).

**Response `204 No Content`**: sucesso.

### `POST /api/categorias-despesa/{id}/reativar` *(novo — F019)*

Marca categoria como ativa novamente. Simétrico a `inativar`.

**Response `204 No Content`**: sucesso.

**Response `404 Not Found`**: categoria não encontrada.

---

## 3. Taxas de Operadora — `/api/configuracoes/formas-pagamento`

### `GET /api/configuracoes/formas-pagamento`

Retorna as configurações de taxa para todas as formas de pagamento.

**Response `200 OK`**:
```json
[
  { "formaPagamento": "Dinheiro",     "percentualTaxa": 0.0, "atualizadoEm": "2026-06-22T..." },
  { "formaPagamento": "PIX",          "percentualTaxa": 0.0, "atualizadoEm": "2026-06-22T..." },
  { "formaPagamento": "CartaoDebito", "percentualTaxa": 1.5, "atualizadoEm": "2026-06-22T..." },
  { "formaPagamento": "CartaoCredito","percentualTaxa": 2.5, "atualizadoEm": "2026-06-22T..." },
  { "formaPagamento": "Fiado",        "percentualTaxa": 0.0, "atualizadoEm": "2026-06-22T..." }
]
```

### `PUT /api/configuracoes/formas-pagamento/{formaPagamento}`

Atualiza a taxa de uma forma de pagamento específica.

**Request body**:
```json
{ "percentualTaxa": 1.8 }
```

**Response `200 OK`**: retorna o registro atualizado.

**Response `400 Bad Request`**: taxa inválida (ex.: negativa ou > 100).

---

## 4. Rotas de Implantação (atalhos — apenas navegação)

Os atalhos de implantação na aba "Implantação" são cards de navegação que redirecionam para as
páginas F010 já implementadas. Não há chamada de API a partir desta aba — o operador é direcionado
para a tela correta.

| Card | Destino |
|------|---------|
| Inventário Inicial | `/configuracoes/implantacao` (aba Inventário em F010) |
| Saldo Inicial de Caixa | `/configuracoes/implantacao` (aba Caixa em F010) |
| Contas a Receber Iniciais | `/configuracoes/implantacao` (aba Contas em F010) |

*Nota*: F010 implementa o fluxo como abas ou wizard dentro de `/configuracoes/implantacao`. Os
três cards em Configurações apontam para a mesma rota, que internamente gerencia o estado de aba.
Se F010 suportar âncoras de aba via query param (`?tab=inventario`), os cards podem linkar diretamente
para a aba correta.

---

## 5. Resumo de Novos Endpoints (F019)

| Método | Endpoint | Responsável | Status |
|--------|----------|-------------|--------|
| `DELETE` | `/api/categorias/{id}` | Backend — CategoriasController | Novo em F019 |
| `POST` | `/api/categorias-despesa/{id}/reativar` | Backend — CategoriasDespesaController | Novo em F019 |
