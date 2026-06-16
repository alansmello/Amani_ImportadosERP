# Data Model: Compras e Recebimentos

## Compra

Representa a aquisicao comercial de produtos junto a um fornecedor. A compra
registrada nao representa entrada fisica de estoque; ela permanece como
mercadoria em transito ate recebimentos oficiais.

### Fields

- `id`: identificador da compra.
- `fornecedorId`: fornecedor vinculado.
- `dataCompra`: data da compra.
- `status`: situacao operacional retornada pela fonte oficial.
- `desconto`: ajuste comercial geral de desconto.
- `acrescimo`: ajuste comercial geral de acrescimo.
- `total`: valor total retornado pela fonte oficial.
- `items`: colecao de itens de compra.

### Relationships

- Pertence a um `Fornecedor`.
- Contem um ou mais `ItemCompra`.
- Possui historico de `RecebimentoCompraItem`.
- Possui historico de `PerdaCompraItem`.

### Validation Rules

- Deve possuir fornecedor.
- Deve possuir data.
- Deve possuir ao menos um item.
- Cada produto pode aparecer no maximo uma vez na mesma compra.
- Desconto e acrescimo, quando informados, nao podem ser negativos.
- Criacao de compra nao pode ser exibida como entrada de estoque.

### State Transitions

```text
Criada/EmTransito -> ParcialmenteRecebida -> Recebida/Finalizada
Criada/EmTransito -> ComPerda -> ParcialmenteRecebida/Finalizada
```

Os nomes exatos de status sao retornados pela fonte oficial; o frontend apenas os
exibe e os usa para comunicacao operacional.

## ItemCompra

Representa um produto dentro da compra.

### Fields

- `id`: identificador do item.
- `produtoId`: produto comprado.
- `quantidade`: quantidade comprada.
- `quantidadeComprada`: quantidade original retornada em detalhes/pendencias.
- `quantidadeRecebida`: quantidade ja recebida.
- `quantidadePerdida`: quantidade registrada como perda, extravio ou avaria.
- `quantidadePendente`: quantidade restante retornada pela fonte oficial.
- `custoUnitario`: custo do item.
- `desconto`: desconto especifico do item.
- `acrescimo`: acrescimo especifico do item.
- `valorTotal`: valor total do item retornado pela fonte oficial.

### Relationships

- Pertence a uma `Compra`.
- Referencia um `Produto`.
- Pode ter varios `RecebimentoCompraItem`.
- Pode ter varios `PerdaCompraItem`.

### Validation Rules

- Produto obrigatorio.
- Produto nao pode repetir na mesma compra.
- Quantidade deve ser maior que zero.
- Custo unitario deve ser maior ou igual a zero.
- Desconto e acrescimo, quando informados, nao podem ser negativos.
- Recebimento/perda nao podem exceder a quantidade pendente oficial.

## ProdutoPendenteRecebimento

Visao operacional de item ainda pendente de recebimento.

### Fields

- `compraId`: compra de origem.
- `itemId`: item de origem.
- `produtoId`: produto pendente.
- `fornecedorId`: fornecedor da compra.
- `dataCompra`: data da compra.
- `statusCompra`: situacao da compra.
- `quantidadeComprada`: quantidade original.
- `quantidadeRecebida`: quantidade ja recebida.
- `quantidadePerdida`: quantidade perdida.
- `quantidadePendente`: quantidade pendente oficial.

### Validation Rules

- Deve ser exibido somente quando `quantidadePendente` for maior que zero.
- Deve preservar compra e item de origem para acionar recebimento/perda.

## RecebimentoCompraItem

Registro de recebimento fisico de um item de compra.

### Fields

- `id`: identificador do recebimento.
- `compraId`: compra relacionada.
- `itemId`: item recebido.
- `produtoId`: produto recebido.
- `quantidade`: quantidade recebida.
- `valorUnitario`: valor unitario aplicado pela fonte oficial.
- `origem`: origem da movimentacao.
- `dataRecebimento`: data do recebimento.
- `estoqueMovimentacaoId`: movimentacao de estoque criada, quando retornada.
- `observacao`: texto opcional.

### Validation Rules

- Quantidade deve ser maior que zero.
- Quantidade deve ser menor ou igual a pendencia oficial.
- Deve passar por revisao e confirmacao antes do envio.
- Sucesso deve atualizar caches/leituras de compra, pendencias e estoque futuro.
- Falha nao pode ser exibida como recebimento concluido.

## PerdaCompraItem

Registro de perda operacional de um item comprado.

### Fields

- `id`: identificador da perda.
- `compraId`: compra relacionada.
- `itemId`: item afetado.
- `produtoId`: produto afetado.
- `quantidade`: quantidade perdida.
- `motivo`: `Perda` | `Extravio` | `Avaria`.
- `dataPerda`: data da perda.
- `observacao`: texto opcional.

### Validation Rules

- Quantidade deve ser maior que zero.
- Quantidade deve ser menor ou igual a pendencia oficial.
- Motivo deve ser exatamente Perda, Extravio ou Avaria.
- Deve passar por revisao e confirmacao antes do envio.
- Nao gera entrada de estoque.
- Falha nao pode ser exibida como perda concluida.

## PurchaseDraft

Estado local temporario do formulario de nova compra.

### Fields

- `fornecedorId`: fornecedor selecionado.
- `dataCompra`: data informada.
- `desconto`: desconto geral textual antes de conversao.
- `acrescimo`: acrescimo geral textual antes de conversao.
- `items`: lista de `PurchaseItemDraft`.

### Validation Rules

- Mantido apenas em memoria da tela.
- Deve preservar dados preenchidos apos erro de validacao ou rejeicao oficial.
- Deve ser convertido em payload somente apos validacao local.

## PurchaseItemDraft

Estado local temporario de item no formulario de nova compra.

### Fields

- `id`: identificador local para renderizacao.
- `produtoId`: produto selecionado.
- `quantidade`: quantidade textual antes de conversao.
- `custoUnitario`: custo textual antes de conversao.
- `desconto`: desconto textual antes de conversao.
- `acrescimo`: acrescimo textual antes de conversao.

### Validation Rules

- Produto obrigatorio.
- Produto unico dentro de `PurchaseDraft`.
- Quantidade maior que zero.
- Custo unitario maior ou igual a zero.
- Ajustes comerciais nao negativos.
