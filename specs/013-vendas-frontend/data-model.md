# Data Model: Vendas Frontend

## Venda

Representa uma venda registrada pela fonte oficial.

**Fields**:

- `id`: identificador unico da venda.
- `clienteId`: cliente associado.
- `dataVenda`: data oficial da venda.
- `desconto`: desconto geral da venda.
- `acrescimo`: acrescimo geral da venda.
- `total`: total oficial da venda quando retornado no detalhe.
- `totalVenda`: total oficial da venda quando retornado na lista.
- `lucro`: lucro oficial retornado pelo backend.
- `items`: itens oficiais da venda no detalhe.

**Relationships**:

- Pertence a um Cliente.
- Possui um ou mais Itens de Venda.
- Pode gerar saida de estoque quando confirmada pela fonte oficial.

**Validation rules**:

- Nao pode ser exibida como concluida antes de confirmacao oficial.
- Lucro e total devem ser exibidos conforme retornados, sem recomputacao local.
- Forma de pagamento e recebiveis nao fazem parte da F013.

## Item de Venda

Representa um produto vendido dentro de uma venda.

**Fields**:

- `id`: identificador do item quando retornado pela fonte oficial.
- `produtoId`: produto vendido.
- `quantidade`: quantidade vendida.
- `precoUnitario`: preco unitario informado.
- `desconto`: desconto do item.
- `acrescimo`: acrescimo do item.
- `valorTotal`: valor oficial do item quando retornado.

**Relationships**:

- Pertence a uma Venda.
- Refere-se a um Produto.

**Validation rules**:

- `produtoId` e obrigatorio.
- `quantidade` deve ser maior que zero.
- `precoUnitario` nao pode ser negativo.
- `desconto` e `acrescimo` nao podem ser negativos.
- Itens duplicados do mesmo produto devem ser consolidados em uma unica linha no
  rascunho antes da confirmacao.

## Rascunho de Venda

Representa o estado temporario do formulario antes da confirmacao.

**Fields**:

- `clienteId`: cliente selecionado ou vazio.
- `dataVenda`: data selecionada, opcional conforme contrato oficial.
- `desconto`: desconto geral como texto editavel.
- `acrescimo`: acrescimo geral como texto editavel.
- `items`: lista de itens de rascunho consolidados por produto.

**Relationships**:

- Usa Clientes e Produtos existentes para selecao.
- Pode usar Estoque como apoio visual de disponibilidade.

**Validation rules**:

- Deve possuir cliente.
- Deve possuir ao menos um item.
- Deve consolidar produto duplicado em uma unica linha.
- Deve bloquear campos invalidos antes de chamar a fonte oficial.
- Nao deve calcular autorizacao final de estoque, lucro ou custo medio.

## Filtros de Venda

Representa os criterios de consulta da lista.

**Fields**:

- `dataInicio`: data inicial opcional.
- `dataFim`: data final opcional.
- `clienteId`: cliente opcional.

**Validation rules**:

- Filtros devem poder ser limpos.
- Datas devem manter significado de periodo completo conforme contrato oficial.

## Cancelamento de Venda

Representa a acao de cancelar uma venda existente.

**Fields**:

- `vendaId`: venda alvo.
- `confirmadoPeloUsuario`: confirmacao explicita antes da chamada.

**State transitions**:

```text
Detalhe carregado -> Confirmacao solicitada -> Cancelamento em andamento
Cancelamento em andamento -> Sucesso oficial confirmado
Cancelamento em andamento -> Falha preservando estado anterior
```

**Validation rules**:

- Deve exigir confirmacao explicita.
- Deve depender de aceite da fonte oficial.
- Deve invalidar leituras de vendas e estoque apos sucesso.
- Nao deve inventar status local de cancelamento quando o contrato oficial nao
  retornar esse dado.

## Erro Operacional de Venda

Representa uma falha retornada ou detectada no fluxo.

**Fields**:

- `field`: campo ou area afetada quando aplicavel.
- `itemId`: item afetado quando aplicavel.
- `message`: mensagem compreensivel para o usuario.

**Validation rules**:

- Estoque insuficiente deve ficar claro e manter a venda como nao concluida.
- Falhas de consulta, criacao e cancelamento devem permitir nova tentativa.
- Erros nao devem gerar dados simulados ou estados falsamente concluido.
