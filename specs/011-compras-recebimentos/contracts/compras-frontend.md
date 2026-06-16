# Frontend/API Contract: Compras e Recebimentos

## Scope

Este contrato descreve como o frontend da F011 deve consumir os endpoints
existentes de compras. O backend e fonte oficial das validacoes, registros,
movimentacoes, pendencias e rejeicoes.

## Supporting Data

### Fornecedores

Use a listagem oficial de fornecedores existente para registrar e filtrar
compras.

```http
GET /api/fornecedores
```

Campos usados:

- `id`
- `nome`

### Produtos

Use a listagem oficial de produtos existente para preencher itens da compra.

```http
GET /api/produtos
```

Campos usados:

- `id`
- `nome`
- `custo`

## List Purchases

```http
GET /api/compras?dataInicio=2026-06-01&dataFim=2026-06-30&fornecedorId=00000000-0000-0000-0000-000000000000
```

Todos os query params sao opcionais.

### Response 200

```json
[
  {
    "id": "00000000-0000-0000-0000-000000000000",
    "fornecedorId": "00000000-0000-0000-0000-000000000000",
    "dataCompra": "2026-06-16T00:00:00Z",
    "status": "EmTransito",
    "totalCompra": 1500.0
  }
]
```

### Frontend Behavior

- Usar para filtros oficiais de periodo e fornecedor.
- Status pode ser filtrado localmente quando necessario, pois o endpoint atual
  nao possui query param de status.
- Exibir erro oficial quando a requisicao falhar.

## List In-Transit Purchases

```http
GET /api/compras/em-transito
```

### Response 200

```json
[
  {
    "compraId": "00000000-0000-0000-0000-000000000000",
    "fornecedorId": "00000000-0000-0000-0000-000000000000",
    "dataCompra": "2026-06-16T00:00:00Z",
    "status": "EmTransito",
    "itens": [
      {
        "itemId": "00000000-0000-0000-0000-000000000000",
        "produtoId": "00000000-0000-0000-0000-000000000000",
        "quantidadeComprada": 10,
        "quantidadeRecebida": 4,
        "quantidadePerdida": 1,
        "quantidadePendente": 5
      }
    ]
  }
]
```

### Frontend Behavior

- Usar como fonte da lista padrao de compras em transito/pendentes.
- Aplicar recorte visual de ultimos 30 dias na tela inicial.
- Nao calcular saldo de estoque a partir desses dados.

## List Pending Products

```http
GET /api/compras/produtos-pendentes
```

### Response 200

```json
[
  {
    "compraId": "00000000-0000-0000-0000-000000000000",
    "itemId": "00000000-0000-0000-0000-000000000000",
    "produtoId": "00000000-0000-0000-0000-000000000000",
    "fornecedorId": "00000000-0000-0000-0000-000000000000",
    "dataCompra": "2026-06-16T00:00:00Z",
    "statusCompra": "EmTransito",
    "quantidadeComprada": 10,
    "quantidadeRecebida": 4,
    "quantidadePerdida": 1,
    "quantidadePendente": 5
  }
]
```

### Frontend Behavior

- Usar para painel/visao de produtos pendentes.
- Acoes de recebimento/perda devem carregar `compraId` e `itemId`.

## Get Purchase Detail

```http
GET /api/compras/{id}
```

### Response 200

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "fornecedorId": "00000000-0000-0000-0000-000000000000",
  "dataCompra": "2026-06-16T00:00:00Z",
  "status": "EmTransito",
  "desconto": 10.0,
  "acrescimo": 25.0,
  "total": 1515.0,
  "items": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "produtoId": "00000000-0000-0000-0000-000000000000",
      "quantidade": 10,
      "quantidadeComprada": 10,
      "quantidadeRecebida": 4,
      "quantidadePerdida": 1,
      "quantidadePendente": 5,
      "custoUnitario": 150.0,
      "desconto": 0.0,
      "acrescimo": 0.0,
      "valorTotal": 1500.0
    }
  ]
}
```

### Error Responses

- `404` when purchase does not exist.
- `{ "error": "Mensagem oficial" }` when available.

## Create Purchase

```http
POST /api/compras
Content-Type: application/json
```

### Request

```json
{
  "fornecedorId": "00000000-0000-0000-0000-000000000000",
  "dataCompra": "2026-06-16T00:00:00.000Z",
  "desconto": 10.0,
  "acrescimo": 25.0,
  "items": [
    {
      "produtoId": "00000000-0000-0000-0000-000000000000",
      "quantidade": 10,
      "custoUnitario": 150.0,
      "desconto": 0.0,
      "acrescimo": 0.0
    }
  ]
}
```

### Response 201

```json
{
  "id": "00000000-0000-0000-0000-000000000000"
}
```

### Frontend Validation

- Fornecedor obrigatorio.
- Data obrigatoria.
- Ao menos um item.
- Produto obrigatorio por item.
- Produto unico na mesma compra.
- Quantidade maior que zero.
- Custo unitario maior ou igual a zero.
- Desconto/acrescimo por item e total nao negativos.

### Frontend Behavior

- Nao exibir compra criada como estoque disponivel.
- Apos sucesso, navegar para o detalhe da compra ou mostrar link claro para ele.
- Em erro, manter dados preenchidos.

## Register Receipt

```http
POST /api/compras/{compraId}/itens/{itemId}/recebimentos
Content-Type: application/json
```

### Request

```json
{
  "quantidade": 5,
  "dataRecebimento": "2026-06-16T00:00:00.000Z",
  "observacao": "Recebimento parcial conferido"
}
```

### Response 201

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "compraId": "00000000-0000-0000-0000-000000000000",
  "itemId": "00000000-0000-0000-0000-000000000000",
  "produtoId": "00000000-0000-0000-0000-000000000000",
  "quantidade": 5,
  "valorUnitario": 150.0,
  "origem": "Compra",
  "dataRecebimento": "2026-06-16T00:00:00Z",
  "estoqueMovimentacaoId": "00000000-0000-0000-0000-000000000000",
  "observacao": "Recebimento parcial conferido"
}
```

### Frontend Behavior

- Exigir revisao e confirmacao antes do envio.
- Validar quantidade positiva localmente.
- Usar mensagem oficial para quantidade acima da pendencia ou item inexistente.
- Apos sucesso, invalidar/recarregar detalhe, recebimentos, em transito,
  produtos pendentes e estoque futuro.
- Nunca mostrar sucesso se a requisicao falhar.

## Register Loss

```http
POST /api/compras/{compraId}/itens/{itemId}/perdas
Content-Type: application/json
```

### Request

```json
{
  "quantidade": 1,
  "motivo": "Avaria",
  "dataPerda": "2026-06-16T00:00:00.000Z",
  "observacao": "Produto chegou danificado"
}
```

### Allowed Motives

- `Perda`
- `Extravio`
- `Avaria`

### Response 201

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "compraId": "00000000-0000-0000-0000-000000000000",
  "itemId": "00000000-0000-0000-0000-000000000000",
  "produtoId": "00000000-0000-0000-0000-000000000000",
  "quantidade": 1,
  "motivo": "Avaria",
  "dataPerda": "2026-06-16T00:00:00Z",
  "observacao": "Produto chegou danificado"
}
```

### Frontend Behavior

- Exigir revisao e confirmacao antes do envio.
- Validar quantidade positiva e motivo fechado localmente.
- Usar mensagem oficial para quantidade acima da pendencia, motivo invalido ou
  item inexistente.
- Apos sucesso, invalidar/recarregar detalhe, perdas, em transito e produtos
  pendentes.
- Nao invalidar estoque como entrada; perda nao gera estoque.

## List Purchase Receipts

```http
GET /api/compras/{compraId}/recebimentos
```

Returns `RecebimentoCompraItemDto[]`.

## List Purchase Losses

```http
GET /api/compras/{compraId}/perdas
```

Returns `PerdaCompraItemDto[]`.

## Error Contract

Erros conhecidos podem retornar:

```json
{
  "error": "Mensagem de erro da fonte oficial"
}
```

O frontend deve exibir essa mensagem especifica. Quando a resposta nao trouxer
mensagem estruturada, usar fallback generico e permitir nova tentativa quando
aplicavel.
