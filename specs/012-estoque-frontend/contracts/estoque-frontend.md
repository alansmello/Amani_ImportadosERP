# Contract: Estoque Frontend

## Scope

Este contrato documenta como o frontend da F012 deve consumir leituras oficiais
de estoque e pendencias. Ele nao define novas regras de negocio e nao autoriza
calculos locais de saldo.

## Services

### `stockService.list(filters?)`

Lista produtos com saldo atual oficial.

#### Input

```ts
type StockListFilters = {
  categoriaId?: string;
  somenteComSaldo?: boolean;
  busca?: string;
};
```

#### Output

```ts
type StockProduct = {
  produtoId: string;
  nome: string;
  codigo?: string | null;
  categoriaId?: string | null;
  categoriaNome?: string | null;
  saldoAtual: number;
  ultimaMovimentacaoEm?: string | null;
};
```

#### Behavioral Contract

- A lista padrao deve mostrar todos os produtos retornados pela fonte oficial.
- `saldoAtual` deve ser exibido sem recomputacao.
- `somenteComSaldo` pode ser aplicado no frontend ou pela fonte oficial, mas nao
  pode alterar valores.
- `busca` pode ser local ou delegada a fonte oficial conforme o contrato real
  permitir.
- Saldo negativo deve ser preservado e destacado como inconsistencia.

### `stockService.getMovements(produtoId, filters?)`

Consulta historico de movimentacoes de um produto.

#### Input

```ts
type StockMovementFilters = {
  dataInicio?: string;
  dataFim?: string;
  tipo?: StockMovementType;
  limite?: number;
};
```

#### Output

```ts
type StockMovementHistory = {
  produtoId: string;
  saldoAtual: number;
  totalMovimentacoes?: number;
  movimentacoes: StockMovement[];
};

type StockMovement = {
  id: string;
  produtoId: string;
  tipo: StockMovementType;
  quantidade: number;
  data: string;
  origem: string;
  referenciaId?: string | null;
  valorUnitario?: number | null;
};
```

#### Behavioral Contract

- Historico deve preservar tipo, quantidade, data e origem oficiais.
- Periodo e tipo devem ser filtraveis quando a fonte oficial oferecer esses
  recortes.
- Historico vazio deve ser exibido como estado vazio, nao erro.
- Quando `totalMovimentacoes` indicar truncamento, a interface deve sinalizar que
  existem mais registros do que os exibidos.
- A feature nao oferece edicao, exclusao ou criacao de movimentacoes.

## Hooks

### Query Keys

```ts
stockQueryKeys = {
  all: queryKeys.estoque,
  list: (filters) => [...queryKeys.estoque, "list", filters],
  movements: (produtoId, filters) =>
    [...queryKeys.estoque, "movements", produtoId, filters]
};
```

### Hooks Planned

- `useStockProducts(filters?)`
- `useStockMovements(produtoId, filters?)`

Hooks devem apenas orquestrar cache, loading, erro e refetch. Eles nao devem
calcular saldo, custo medio, lucro, ranking ou metrica.

## Pending Receipts Integration

Pendencias devem reutilizar:

- `purchasesService.listPendingProducts()`
- `usePendingPurchaseProducts()`
- `PendingPurchaseProduct`
- `compraDetalhe(compraId)`

### Behavioral Contract

- Cada pendencia deve mostrar produto, fornecedor, compra de origem e quantidade
  pendente quando esses dados existirem.
- Cada pendencia com `compraId` deve abrir o detalhe da compra de origem.
- Pendencias nunca entram no saldo atual.
- Recebimento e perda nao sao registrados pela area de Estoque.

## Error, Loading and Empty States

- Lista de estoque, detalhe de historico e pendencias devem ter loading, erro e
  vazio.
- Falha em pendencias nao deve bloquear saldos ja carregados.
- Falha em historico nao deve alterar o saldo oficial ja exibido.
- Dados antigos nao devem ser apresentados como atuais durante carregamento
  inicial.
