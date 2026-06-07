# API Contracts: Mercadorias em Transito e Recebimento Parcial

Base path: `/api/compras`

Controllers devem apenas receber requests, validar `ModelState`, delegar para
Application e retornar responses. Regras de negocio ficam em services/domain.

## POST /api/compras

Cria compra sem entrada automatica de estoque.

**Request**: `CriarCompraDto` existente.

**Behavior**:

- Persiste compra e itens.
- Define status inicial compativel com pendencia logistica.
- Nao cria `EstoqueMovimentacao`.

**Response 201**:

```json
{
  "id": "00000000-0000-0000-0000-000000000000"
}
```

## POST /api/compras/{compraId}/itens/{itemId}/recebimentos

Registra recebimento fisico de quantidade de um item.

**Request**: `RegistrarRecebimentoCompraItemDto`

```json
{
  "quantidade": 3,
  "dataRecebimento": "2026-06-07",
  "observacao": "Recebimento parcial"
}
```

**Rules**:

- `quantidade` deve ser maior que zero.
- `quantidade` nao pode exceder pendencia do item.
- `itemId` deve pertencer a `compraId`.
- Compra cancelada ou finalizada deve rejeitar recebimento.
- Deve gerar `EstoqueMovimentacao` `Entrada` para a quantidade recebida.
- Deve executar recebimento, movimentacao de estoque e atualizacao de status na
  mesma transacao.
- Recebimentos operacionais retornados por este endpoint possuem origem
  `Operacional`.

**Response 201**: `RecebimentoCompraItemDto`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "compraId": "00000000-0000-0000-0000-000000000000",
  "itemId": "00000000-0000-0000-0000-000000000000",
  "produtoId": "00000000-0000-0000-0000-000000000000",
  "quantidade": 3,
  "valorUnitario": 25.5,
  "origem": "Operacional",
  "dataRecebimento": "2026-06-07T00:00:00Z",
  "estoqueMovimentacaoId": "00000000-0000-0000-0000-000000000000",
  "observacao": "Recebimento parcial"
}
```

**Error responses**:

- `400 Bad Request`: quantidade invalida ou acima da pendencia.
- `404 Not Found`: compra ou item inexistente.
- `409 Conflict`: compra cancelada/finalizada ou item sem pendencia.

## POST /api/compras/{compraId}/itens/{itemId}/perdas

Registra perda, extravio ou avaria de quantidade pendente.

**Request**: `RegistrarPerdaCompraItemDto`

```json
{
  "quantidade": 2,
  "motivo": "Avaria",
  "dataPerda": "2026-06-07",
  "observacao": "Produto danificado no transporte"
}
```

**Rules**:

- `quantidade` deve ser maior que zero.
- `quantidade` nao pode exceder pendencia do item.
- `motivo` deve ser `Perda`, `Extravio` ou `Avaria`.
- Nao gera `EstoqueMovimentacao`.
- Deve ser rastreavel como prejuizo operacional.
- Deve executar perda, rastreabilidade de prejuizo e atualizacao de status na
  mesma transacao.

**Response 201**: `PerdaCompraItemDto`

```json
{
  "id": "00000000-0000-0000-0000-000000000000",
  "compraId": "00000000-0000-0000-0000-000000000000",
  "itemId": "00000000-0000-0000-0000-000000000000",
  "produtoId": "00000000-0000-0000-0000-000000000000",
  "quantidade": 2,
  "motivo": "Avaria",
  "dataPerda": "2026-06-07T00:00:00Z",
  "observacao": "Produto danificado no transporte"
}
```

**Error responses**:

- `400 Bad Request`: quantidade invalida, motivo invalido ou acima da pendencia.
- `404 Not Found`: compra ou item inexistente.
- `409 Conflict`: compra cancelada/finalizada ou item sem pendencia.

## GET /api/compras/em-transito

Lista compras com qualquer item pendente, excluindo compras `Recebida`,
`Finalizada` e `Cancelada`.

**Response 200**: `CompraEmTransitoDto[]`

```json
[
  {
    "compraId": "00000000-0000-0000-0000-000000000000",
    "fornecedorId": "00000000-0000-0000-0000-000000000000",
    "dataCompra": "2026-06-07T00:00:00Z",
    "status": "ParcialmenteRecebida",
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

## GET /api/compras/produtos-pendentes

Lista itens pendentes agrupaveis por produto e compra.

**Response 200**: `ProdutoPendenteRecebimentoDto[]`

```json
[
  {
    "compraId": "00000000-0000-0000-0000-000000000000",
    "itemId": "00000000-0000-0000-0000-000000000000",
    "produtoId": "00000000-0000-0000-0000-000000000000",
    "fornecedorId": "00000000-0000-0000-0000-000000000000",
    "dataCompra": "2026-06-07T00:00:00Z",
    "statusCompra": "ParcialmenteRecebida",
    "quantidadeComprada": 10,
    "quantidadeRecebida": 4,
    "quantidadePerdida": 1,
    "quantidadePendente": 5
  }
]
```

## GET /api/compras/{compraId}/recebimentos

Retorna historico de recebimentos da compra.

**Response 200**: `RecebimentoCompraItemDto[]`

Recebimentos `LegadoMigrado` podem aparecer nesta consulta para compras
existentes antes da Feature 003. Eles nao possuem `estoqueMovimentacaoId` e nao
podem ser criados pelos endpoints operacionais.

No contrato JSON, a origem legada e retornada como `LegadoMigrado`, conforme enum
tecnico usado pelo backend.

## GET /api/compras/{compraId}/perdas

Retorna historico de perdas, extravios e avarias da compra.

**Response 200**: `PerdaCompraItemDto[]`

## GET /api/compras/{id}

Endpoint existente deve incluir, no response de compra, status e quantidades
calculadas por item:

- `quantidadeComprada`
- `quantidadeRecebida`
- `quantidadePerdida`
- `quantidadePendente`

## Compatibility Notes

- `POST /api/compras` mantem path e DTO principal existentes, mas muda o efeito
  colateral: nao gera entrada de estoque.
- Fluxos de venda nao ganham endpoints novos nesta feature.
- Dashboard financeiro nao ganha contrato novo nesta feature.
- Dashboard financeiro continua considerando compra registrada como impacto
  financeiro imediato; estoque fisico considera apenas recebimento confirmado.
- Movimentacoes antigas continuam rastreaveis por `CompraId + ProdutoId`; novas
  entradas por recebimento devem preencher `CompraItemId`.
