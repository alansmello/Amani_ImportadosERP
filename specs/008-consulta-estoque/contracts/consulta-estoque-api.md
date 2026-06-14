# API Contracts: Consulta de Estoque

Base path: `/api/estoque`

Endpoints somente leitura. Controllers devem apenas receber requests, validar
contrato basico (rota e query), delegar para a Application via MediatR e retornar
responses. Calculo de saldo e agregacoes ficam no backend. Nenhum endpoint cria,
altera ou apaga movimentacoes.

## GET /api/estoque

Lista produtos com saldo fisico atual calculado por entradas mais inventario inicial
menos saidas.

**Query parameters**:

- `categoriaId` (opcional, Guid): restringe a lista por categoria de produto.
- `apenasComSaldo` (opcional, bool): quando `true`, retorna apenas produtos com saldo
  maior que zero. Padrao `false`.

**Behavior**:

- Calcula o saldo de cada produto por agregacao no banco.
- Inclui produtos sem movimentacoes com saldo zero, salvo quando `apenasComSaldo`
  for `true`.

**Response 200**: `EstoqueProdutoSaldoDto[]`

```json
[
  {
    "produtoId": "00000000-0000-0000-0000-000000000000",
    "nomeProduto": "Produto Exemplo",
    "categoriaId": "00000000-0000-0000-0000-000000000000",
    "saldo": 7
  }
]
```

**Error responses**:

- `400 Bad Request`: `categoriaId` em formato invalido.

## GET /api/estoque/{produtoId}/movimentacoes

Retorna o saldo atual do produto e o historico de movimentacoes, com filtros e
limite.

**Route parameters**:

- `produtoId` (obrigatorio, Guid): identificador do produto.

**Query parameters**:

- `dataInicio` (opcional, date): inicio do periodo; normalizado para UTC 00:00:00.
- `dataFim` (opcional, date): fim do periodo; normalizado para UTC 23:59:59.
- `tipo` (opcional, string): `Entrada`, `Saida` ou `InventarioInicial`.
- `limite` (opcional, int): numero de registros. Quando ausente, aplica o limite
  padrao de 50. Quando acima do maximo permitido, aplica o limite maximo de 200.

**Rules**:

- `produtoId` vazio ou invalido e rejeitado com `400`.
- Produto inexistente responde `404`.
- `dataInicio` maior que `dataFim` e rejeitado com `400`.
- `tipo` invalido e rejeitado com `400`.
- `saldoAtual` reflete o historico completo do produto, independente dos filtros
  aplicados a lista de movimentacoes.
- `totalMovimentacoes` reflete a contagem total de movimentacoes do produto que
  atendem aos filtros aplicados antes do limite, e sinaliza a existencia de
  registros adicionais quando maior que o numero de itens retornados.
- A lista de movimentacoes e ordenada por `data` decrescente e, em caso de mesma
  data, por `CreatedAt` decrescente (mais recente primeiro), respeitando filtros e
  limite.

**Response 200**: `EstoqueProdutoMovimentacoesDto`

```json
{
  "produtoId": "00000000-0000-0000-0000-000000000000",
  "nomeProduto": "Produto Exemplo",
  "saldoAtual": 7,
  "totalMovimentacoes": 3,
  "movimentacoes": [
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "data": "2026-06-10T00:00:00Z",
      "tipo": "Saida",
      "quantidade": 3,
      "origem": "Venda",
      "compraId": null,
      "compraItemId": null,
      "vendaId": "00000000-0000-0000-0000-000000000000",
      "valorUnitario": null
    },
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "data": "2026-06-05T00:00:00Z",
      "tipo": "Entrada",
      "quantidade": 5,
      "origem": "Compra",
      "compraId": "00000000-0000-0000-0000-000000000000",
      "compraItemId": "00000000-0000-0000-0000-000000000000",
      "vendaId": null,
      "valorUnitario": 25.5
    },
    {
      "id": "00000000-0000-0000-0000-000000000000",
      "data": "2026-06-01T00:00:00Z",
      "tipo": "InventarioInicial",
      "quantidade": 5,
      "origem": "InventarioInicial",
      "compraId": null,
      "compraItemId": null,
      "vendaId": null,
      "valorUnitario": 20.0
    }
  ]
}
```

**Error responses**:

- `400 Bad Request`: `produtoId` invalido, `tipo` invalido ou periodo invalido
  (`dataInicio` maior que `dataFim`).
- `404 Not Found`: produto inexistente.

## DTOs

### EstoqueProdutoSaldoDto (response)

- `produtoId`: Guid.
- `nomeProduto`: string.
- `categoriaId`: Guid.
- `saldo`: int.

### EstoqueProdutoMovimentacoesDto (response)

- `produtoId`: Guid.
- `nomeProduto`: string.
- `saldoAtual`: int.
- `totalMovimentacoes`: int.
- `movimentacoes`: `EstoqueMovimentacaoItemDto[]`.

### EstoqueMovimentacaoItemDto (response)

- `id`: Guid.
- `data`: DateTime (UTC).
- `tipo`: string (`Entrada`, `Saida`, `InventarioInicial`).
- `quantidade`: int.
- `origem`: string (`Compra`, `Venda`, `InventarioInicial`).
- `compraId`: Guid nullable.
- `compraItemId`: Guid nullable.
- `vendaId`: Guid nullable.
- `valorUnitario`: decimal nullable.

## Compatibility Notes

- Estes sao endpoints novos; nenhum contrato existente e alterado.
- `IEstoqueConsultaRepository.ObterSaldoAsync` continua sendo usado por
  `VendaService`; esta feature apenas adiciona metodos de leitura agregada.
- Nenhuma entidade de dominio e exposta diretamente; todos os retornos sao DTOs de
  resposta com mapeamento manual.
- Nenhuma migration e gerada; o schema permanece inalterado.
- Movimentacoes antigas de entrada por compra com `CompraId` e sem `CompraItemId`
  sao retornadas com origem `Compra`; `compraItemId` deve ser retornado quando
  existir.
