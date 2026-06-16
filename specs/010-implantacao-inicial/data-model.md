# Data Model: Implantacao Inicial

## Implantacao Inicial

Representa o fluxo de preparacao do ERP com tres etapas independentes:
inventario inicial, saldo inicial de caixa e contas a receber iniciais.

### Fields

- `steps`: colecao local de estados das etapas.
- `completedSteps`: quantidade derivada localmente para progresso visual.
- `currentStep`: etapa atualmente em preenchimento.

### State Transitions

```text
pending -> editing -> reviewing -> submitting -> completed
pending -> editing -> reviewing -> submitting -> error -> editing
completed -> completed
```

### Validation Rules

- Etapa `completed` nao pode ser enviada novamente no escopo da feature.
- Cada etapa pode ser concluida sem exigir conclusao das demais.
- Progresso geral usa estados `completed`, `pending` e `error`.

## ImplantationStepState

Estado local de uma etapa do fluxo.

### Fields

- `id`: `initialInventory` | `initialCash` | `initialReceivables`.
- `status`: `pending` | `editing` | `reviewing` | `submitting` | `completed` | `error`.
- `completedAt`: data/hora local opcional apos sucesso.
- `resultSummary`: resumo opcional retornado pela fonte oficial.
- `errorMessage`: mensagem opcional exibida quando houver falha.

### Validation Rules

- `completedAt` so existe quando `status` e `completed`.
- `errorMessage` so deve aparecer em `error` ou apos rejeicao em tela.

## InitialInventoryPayload

Payload enviado para registrar inventario inicial.

### Fields

- `data`: data do inventario.
- `origem`: valor constante `ImplantacaoInicial`.
- `itens`: lista de `InitialInventoryItemPayload`.

### Relationships

- Cada item referencia um `Produto` existente.

### Validation Rules

- `data` obrigatoria.
- `origem` deve ser `ImplantacaoInicial`.
- `itens` deve conter ao menos um item.
- Nao permitir produtos duplicados no mesmo lote.
- Todos os itens devem estar validos antes do envio.

## InitialInventoryItemPayload

Item local do inventario inicial.

### Fields

- `produtoId`: identificador do produto existente.
- `quantidade`: quantidade inicial.
- `valorUnitario`: valor/custo unitario opcional.

### Validation Rules

- `produtoId` obrigatorio.
- `quantidade` maior que zero.
- `valorUnitario`, quando informado, nao pode ser negativo.

## InitialInventoryResult

Resposta da fonte oficial apos inventario inicial.

### Fields

- `data`: data registrada.
- `origem`: origem registrada.
- `quantidadeItens`: total de itens registrados.
- `movimentacoesIds`: identificadores das movimentacoes geradas.

### State Impact

- Sucesso marca a etapa de inventario como `completed`.
- Falha mantem a etapa como `error` ou `editing`, sem conclusao parcial.

## InitialCashBalancePayload

Payload enviado para registrar saldo inicial de caixa.

### Fields

- `valor`: saldo inicial informado.
- `data`: data do saldo inicial.
- `origem`: valor constante planejado `SaldoInicial`.
- `descricao`: descricao opcional.

### Validation Rules

- `valor` obrigatorio e deve respeitar rejeicoes da fonte oficial.
- `data` obrigatoria.
- `origem` obrigatoria.

## InitialCashBalanceResult

Resposta da fonte oficial apos saldo inicial de caixa.

### Fields

- `eventoFinanceiroId`: identificador do evento financeiro gerado.
- `valor`: valor registrado.
- `data`: data registrada.
- `origem`: origem registrada.

### State Impact

- Sucesso marca a etapa de caixa como `completed`.
- Falha mantem a etapa disponivel para correcao.

## InitialReceivablePayload

Payload enviado para registrar uma conta a receber inicial.

### Fields

- `clienteId`: identificador do cliente existente.
- `valor`: valor do recebivel.
- `dataVencimento`: vencimento do recebivel.
- `origem`: valor constante `ImplantacaoInicial` ou `SaldoInicial`; o frontend deve
  padronizar `ImplantacaoInicial` para esta feature.
- `descricao`: descricao opcional.

### Relationships

- Cada recebivel referencia um `Cliente` existente.

### Validation Rules

- `clienteId` obrigatorio.
- `valor` maior que zero.
- `dataVencimento` obrigatoria.
- Todos os itens do lote local devem estar validos antes de iniciar envios.

## InitialReceivableResult

Resposta da fonte oficial apos uma conta a receber inicial.

### Fields

- `contaReceberId`: identificador da conta registrada.
- `clienteId`: cliente vinculado.
- `valor`: valor registrado.
- `dataVencimento`: vencimento registrado.
- `origem`: origem registrada.

### State Impact

- A etapa de recebiveis so e `completed` na interface se todas as contas do lote
  local forem registradas com sucesso.
- Se qualquer envio falhar, a etapa permanece `error`/pendente na interface e
  nenhum item do lote e apresentado visualmente como concluido.

## Produto

Cadastro existente usado para preencher inventario inicial.

### Fields Used

- `id`
- `nome`
- `precoVenda`
- `custo`
- `categoriaId`
- `fornecedorId`

## Cliente

Cadastro existente usado para contas a receber iniciais.

### Fields Used

- `id`
- `nome`
- `email`
- `telefone`
- `ativo`
