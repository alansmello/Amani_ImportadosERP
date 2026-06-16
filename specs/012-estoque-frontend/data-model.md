# Data Model: Estoque Frontend

## Produto em Estoque

Representa um produto exibido na lista de estoque com saldo oficial.

### Fields

- `produtoId`: identificador unico do produto.
- `nome`: nome exibido ao usuario.
- `codigo`: identificacao textual opcional quando disponivel.
- `categoriaId`: categoria opcional quando disponivel pela fonte oficial.
- `categoriaNome`: nome da categoria opcional quando disponivel.
- `saldoAtual`: saldo fisico atual retornado pela fonte oficial.
- `ultimaMovimentacaoEm`: data opcional da movimentacao mais recente.

### Relationships

- Relaciona-se a zero ou mais `Movimentacao de Estoque`.
- Pode aparecer em zero ou mais `Produto Pendente de Recebimento`.

### Validation Rules

- `saldoAtual` deve ser exibido exatamente como retornado, sem recalculo.
- Saldo zero deve aparecer na lista padrao.
- Saldo negativo deve aparecer com destaque de inconsistencia operacional, sem
  correcao local.
- Busca textual pode comparar nome, codigo ou identificacao equivalente
  disponivel.

## Filtros de Estoque

Representa os controles de exibicao da lista principal.

### Fields

- `busca`: termo textual opcional.
- `somenteComSaldo`: booleano opcional para ocultar saldo zero quando ativo.

### Validation Rules

- Limpar filtros deve retornar a lista ao estado padrao com todos os produtos
  oficiais.
- Filtros de exibicao nao podem alterar nem recomputar saldos oficiais.

## Movimentacao de Estoque

Representa um evento historico usado para explicar o saldo de um produto.

### Fields

- `id`: identificador da movimentacao.
- `produtoId`: produto associado.
- `tipo`: tipo oficial da movimentacao, como entrada, saida ou inventario
  inicial.
- `quantidade`: quantidade movimentada.
- `data`: data oficial da movimentacao.
- `origem`: origem oficial, como compra, recebimento, venda ou inventario
  inicial.
- `referenciaId`: identificador opcional da origem quando informado.
- `valorUnitario`: valor unitario opcional quando informado.

### Relationships

- Pertence a um `Produto em Estoque`.
- Pode referenciar compra, item de compra, venda ou inventario inicial conforme a
  origem oficial.

### Validation Rules

- Tipo, quantidade, data e origem devem preservar o significado recebido.
- Movimentacoes nao podem ser criadas, editadas ou excluidas nesta feature.
- Historico vazio nao e erro.

## Filtros de Historico

Representa os filtros aplicados ao historico de um produto.

### Fields

- `dataInicio`: inicio opcional do periodo.
- `dataFim`: fim opcional do periodo.
- `tipo`: tipo opcional de movimentacao.

### Validation Rules

- Filtros devem ser enviados ou aplicados conforme a fonte oficial suportar.
- Periodo e tipo devem poder ser removidos sem sair do detalhe do produto.
- A interface deve respeitar limites e sinalizacao de lista limitada retornados
  pela fonte oficial.

## Historico de Produto

Representa a resposta do detalhe de estoque de um produto.

### Fields

- `produtoId`: identificador do produto.
- `saldoAtual`: saldo oficial atual.
- `totalMovimentacoes`: total opcional de movimentacoes que atendem aos filtros.
- `movimentacoes`: lista limitada de `Movimentacao de Estoque`.

### Validation Rules

- `saldoAtual` deve ser exibido como valor oficial.
- Quando `totalMovimentacoes` indicar mais registros do que os exibidos, a
  interface deve sinalizar que a lista esta limitada.
- Produto inexistente ou inacessivel deve apresentar estado recuperavel ou nao
  encontrado.

## Produto Pendente de Recebimento

Representa item comprado ainda nao totalmente recebido nem baixado por perda.

### Fields

- `compraId`: compra de origem.
- `itemId`: item da compra.
- `produtoId`: produto pendente.
- `fornecedorId`: fornecedor associado.
- `dataCompra`: data da compra.
- `statusCompra`: situacao da compra.
- `quantidadeComprada`: quantidade comprada.
- `quantidadeRecebida`: quantidade ja recebida.
- `quantidadePerdida`: quantidade perdida, extraviada ou avariada.
- `quantidadePendente`: quantidade ainda pendente.

### Relationships

- Relaciona-se a um produto cadastrado.
- Relaciona-se a um fornecedor cadastrado.
- Deve abrir o detalhe da compra de origem quando `compraId` estiver disponivel.

### Validation Rules

- `quantidadePendente` nunca deve ser somada ao saldo atual.
- A pendencia deve ser apresentada como aguardando recebimento, nao como
  disponibilidade fisica.
- Registro de recebimento ou perda permanece no modulo de Compras.

## State Transitions

- `Produto em Estoque`: somente leitura; sem transicao de estado no frontend.
- `Movimentacao de Estoque`: somente leitura; sem criacao, edicao ou exclusao.
- `Produto Pendente de Recebimento`: somente leitura em Estoque; a continuidade
  operacional acontece ao abrir a compra de origem.
