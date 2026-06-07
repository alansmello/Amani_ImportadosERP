# Data Model: Mercadorias em Transito e Recebimento Parcial

## Compra

**Purpose**: Representa a aquisicao comercial de produtos. A compra nao e mais
entrada fisica automatica de estoque.

**Fields**:

- `Id`: identificador da compra.
- `FornecedorId`: fornecedor da compra.
- `DataCompra`: data de registro da compra.
- `Desconto`: desconto total da compra.
- `Acrescimo`: acrescimo total da compra.
- `Status`: estado operacional da compra.
- `Items`: itens comprados.

**Status values**:

- `Criada`: compra registrada, ainda sem evento logistico.
- `EmTransito`: compra com itens pendentes de recebimento ou perda.
- `ParcialmenteRecebida`: compra com algum recebimento e ainda alguma pendencia.
- `Recebida`: todos os itens foram recebidos.
- `Finalizada`: compra encerrada operacionalmente sem aceitar novos eventos.
- `Cancelada`: compra cancelada sem aceitar novos eventos.

**Rules**:

- Criacao de compra nao gera `EstoqueMovimentacao`.
- Compra com qualquer item pendente aparece em mercadorias em transito, exceto se
  estiver cancelada ou finalizada.
- Compra cancelada ou finalizada nao aceita recebimentos nem perdas.
- Status e atualizado pelo backend apos criacao, recebimento, perda,
  finalizacao ou cancelamento.

## CompraItem

**Purpose**: Representa produto e quantidade adquiridos dentro de uma compra.

**Fields**:

- `Id`: identificador do item.
- `CompraId`: compra proprietaria.
- `ProdutoId`: produto comprado.
- `Quantidade`: quantidade comprada.
- `CustoUnitario`: custo unitario usado em recebimentos e custo medio.
- `Desconto`: desconto do item.
- `Acrescimo`: acrescimo do item.

**Calculated values**:

- `QuantidadeRecebida`: soma de `CompraItemRecebimento.Quantidade`.
- `QuantidadePerdida`: soma de `CompraItemPerda.Quantidade`.
- `QuantidadePendente`: `Quantidade - QuantidadeRecebida - QuantidadePerdida`.

**Rules**:

- Quantidade comprada deve ser maior que zero.
- Custo unitario, desconto e acrescimo nao podem ser negativos.
- Recebimento ou perda nao podem exceder `QuantidadePendente`.
- Produto nao pode ser duplicado dentro da mesma compra, preservando regra atual.

## CompraItemRecebimento

**Purpose**: Evento historico que confirma entrada fisica de quantidade de um
item de compra.

**Fields**:

- `Id`: identificador do recebimento.
- `CompraId`: compra relacionada.
- `CompraItemId`: item recebido.
- `ProdutoId`: produto recebido, redundante para consultas e auditoria.
- `Quantidade`: quantidade fisicamente recebida.
- `ValorUnitario`: custo unitario aplicado na entrada.
- `DataRecebimento`: data do recebimento.
- `EstoqueMovimentacaoId`: movimentacao de entrada criada pelo recebimento.
- `Observacao`: texto opcional.

**Relationships**:

- Pertence a uma `Compra`.
- Pertence a um `CompraItem`.
- Cria uma `EstoqueMovimentacao` do tipo `Entrada`.

**Rules**:

- Quantidade deve ser maior que zero.
- Quantidade nao pode exceder a pendencia do item.
- Nao pode ser criado para compra cancelada ou finalizada.
- Deve criar entrada de estoque com mesma quantidade e produto.

## CompraItemPerda

**Purpose**: Evento historico que registra perda, extravio ou avaria de item de
compra sem gerar estoque.

**Fields**:

- `Id`: identificador da perda.
- `CompraId`: compra relacionada.
- `CompraItemId`: item afetado.
- `ProdutoId`: produto perdido, redundante para consultas e auditoria.
- `Quantidade`: quantidade perdida, extraviada ou avariada.
- `Motivo`: classificacao operacional da perda.
- `DataPerda`: data do registro.
- `Observacao`: texto opcional.

**Motivo values**:

- `Perda`
- `Extravio`
- `Avaria`

**Rules**:

- Quantidade deve ser maior que zero.
- Quantidade nao pode exceder a pendencia do item.
- Nao pode ser criada para compra cancelada ou finalizada.
- Nao cria `EstoqueMovimentacao`.
- Deve ser consultavel como prejuizo operacional.

## EstoqueMovimentacao

**Purpose**: Fonte historica de saldo fisico.

**Fields affected by this feature**:

- `CompraId`: continua apontando para compra em entradas geradas por
  recebimento.
- `CompraItemId`: campo opcional recomendado para rastrear entrada ate o item de
  compra.
- `Tipo`: `Entrada`, `Saida` ou `InventarioInicial`.
- `ValorUnitario`: usado no custo medio quando a movimentacao for entrada real.

**Rules**:

- Criacao de compra nao cria movimentacao.
- Recebimento confirmado cria `Entrada`.
- Perda nao cria movimentacao.
- Venda continua criando `Saida`.
- Inventario inicial continua criando `InventarioInicial`.

## Produto Pendente de Recebimento

**Purpose**: Visao de consulta para acompanhamento logistico.

**Fields**:

- `CompraId`
- `CompraItemId`
- `ProdutoId`
- `FornecedorId`
- `DataCompra`
- `QuantidadeComprada`
- `QuantidadeRecebida`
- `QuantidadePerdida`
- `QuantidadePendente`
- `StatusCompra`

**Rules**:

- Listar apenas itens com `QuantidadePendente > 0` em compras nao canceladas e
  nao finalizadas.

## State Transitions

```text
Criada -> EmTransito
Criada -> ParcialmenteRecebida
Criada -> Recebida
EmTransito -> ParcialmenteRecebida
EmTransito -> Recebida
EmTransito -> Finalizada
ParcialmenteRecebida -> Recebida
ParcialmenteRecebida -> Finalizada
Criada/EmTransito/ParcialmenteRecebida -> Cancelada
```

**Resolution rule**:

- Se todos os itens possuem `QuantidadePendente == 0` e nenhuma quantidade foi
  perdida, status pode ser `Recebida`.
- Se todos os itens possuem `QuantidadePendente == 0` por combinacao de
  recebimentos e perdas, a compra sai de transito e pode ser `Finalizada` ou
  estado resolvido equivalente definido no service.
- Se qualquer item possui pendencia, a compra permanece em transito ou
  parcialmente recebida.
