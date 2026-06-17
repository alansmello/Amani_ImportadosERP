# Contract: Vendas Frontend

## API consumida

Base path: `/api/vendas`

### Listar vendas

```text
GET /api/vendas?dataInicio=YYYY-MM-DD&dataFim=YYYY-MM-DD&clienteId={guid}
```

Todos os filtros sao opcionais.

**Response**:

```ts
type SaleListItem = {
  id: string;
  clienteId: string;
  dataVenda: string;
  totalVenda: number;
  lucro: number;
};
```

### Obter venda

```text
GET /api/vendas/{id}
```

**Response**:

```ts
type Sale = {
  id: string;
  clienteId: string;
  dataVenda: string;
  desconto: number;
  acrescimo: number;
  total: number;
  lucro: number;
  items: SaleItem[];
};

type SaleItem = {
  id: string;
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  acrescimo: number;
  valorTotal: number;
};
```

### Criar venda

```text
POST /api/vendas
```

**Request**:

```ts
type CreateSalePayload = {
  clienteId: string;
  dataVenda?: string | null;
  desconto: number;
  acrescimo: number;
  items: CreateSaleItemPayload[];
};

type CreateSaleItemPayload = {
  produtoId: string;
  quantidade: number;
  precoUnitario: number;
  desconto: number;
  acrescimo: number;
};
```

**Response**:

```ts
type CreateSaleResponse = {
  id: string;
  lucro: number;
};
```

**Operational errors**:

```ts
type ApiErrorResponse = {
  error: string;
};
```

Estoque insuficiente e outras rejeicoes operacionais devem ser exibidas com a
mensagem oficial sempre que a resposta trouxer `error`.

### Cancelar venda

```text
POST /api/vendas/{id}/cancelar
```

**Response**: sucesso sem payload obrigatorio.

Falhas devem preservar o estado anterior da interface e permitir nova tentativa.

## Frontend service

```ts
type SaleFilters = {
  dataInicio?: string;
  dataFim?: string;
  clienteId?: string;
};

salesService.list(filters?: SaleFilters): Promise<SaleListItem[]>;
salesService.getById(id: string): Promise<Sale>;
salesService.create(payload: CreateSalePayload): Promise<CreateSaleResponse>;
salesService.cancel(id: string): Promise<void>;
```

## Query hooks

```ts
saleQueryKeys.all = queryKeys.vendas;
saleQueryKeys.list(filters);
saleQueryKeys.detail(id);

useSales(filters);
useSale(id);
useCreateSale();
useCancelSale();
```

**Cache behavior**:

- Criacao com sucesso invalida `queryKeys.vendas` e `queryKeys.estoque`.
- Cancelamento com sucesso invalida `queryKeys.vendas`, detalhe da venda e
  `queryKeys.estoque`.
- Erros de criacao/cancelamento nao devem atualizar a interface como sucesso.

## UI contract

- `/vendas`: lista vendas, aplica filtros de data/cliente, abre detalhe e oferece
  acao para nova venda.
- `/vendas/nova`: seleciona cliente, data opcional, desconto/acrescimo geral e
  itens com produto, quantidade, preco, desconto e acrescimo.
- `/vendas/[vendaId]`: mostra detalhe oficial, lucro retornado pelo backend e
  cancelamento quando aplicavel.

## Explicit exclusions

- Sem forma de pagamento.
- Sem geracao de recebiveis.
- Sem edicao de venda.
- Sem devolucao parcial.
- Sem emissao fiscal.
- Sem recalculo local de saldo, custo medio ou lucro.
