# Data Model: Consulta de Estoque

Esta feature e somente leitura. Nenhuma entidade nova e criada, nenhum campo e
adicionado e nenhuma migration e gerada. As estruturas abaixo descrevem a entidade
existente que e lida e as projecoes de consulta (DTOs de resposta) derivadas dela.

## EstoqueMovimentacao (entidade existente - somente leitura)

**Purpose**: Registro historico que altera o saldo fisico de um produto. Fonte unica
do saldo. Esta feature apenas le este historico.

**Fields (existentes)**:

- `Id`: identificador da movimentacao.
- `ProdutoId`: produto movimentado.
- `Quantidade`: quantidade movimentada (inteiro, sempre diferente de zero).
- `Tipo`: `Entrada`, `Saida` ou `InventarioInicial`.
- `CompraId`: compra de origem, quando a entrada veio de recebimento de compra.
- `CompraItemId`: item de compra de origem, presente em entradas novas por
  recebimento; nulo em movimentacoes antigas e em saidas/inventario inicial.
- `VendaId`: venda de origem, quando a saida veio de venda.
- `Data`: data da movimentacao (UTC, normalizada por dia).
- `ValorUnitario`: custo unitario da entrada quando conhecido; pode ser nulo,
  especialmente em saidas.

**Rules (preservadas, nao alteradas por esta feature)**:

- Saldo de um produto = soma de `Quantidade` de `Entrada` e `InventarioInicial`
  menos soma de `Quantidade` de `Saida`.
- Nenhum campo fixo de saldo existe ou sera criado.
- A consulta nao cria, altera nem apaga movimentacoes.

## Saldo de Produto (projecao de consulta)

**Purpose**: Resultado calculado por produto para a lista de estoque. Nao persistido.

**Fields**:

- `ProdutoId`: identificador do produto.
- `NomeProduto`: nome do produto, vindo do cadastro.
- `CategoriaId`: categoria do produto, vinda do cadastro.
- `Saldo`: saldo atual calculado por entradas mais inventario inicial menos saidas.

**Rules**:

- Produto sem movimentacoes aparece com `Saldo` igual a zero.
- O calculo e feito por agregacao no banco, nunca por campo fixo.
- O filtro de categoria restringe a lista por `CategoriaId`.
- O filtro de apenas com saldo positivo retorna somente produtos com `Saldo` maior
  que zero.

## Item de Historico de Movimentacao (projecao de consulta)

**Purpose**: Projecao de leitura de uma movimentacao para auditoria do saldo.

**Fields**:

- `Id`: identificador da movimentacao.
- `Data`: data da movimentacao.
- `Tipo`: `Entrada`, `Saida` ou `InventarioInicial`.
- `Quantidade`: quantidade movimentada.
- `Origem`: classificacao de leitura derivada do tipo e das referencias
  (`Compra`, `Venda` ou `InventarioInicial`).
- `CompraId`: presente quando a origem e compra.
- `CompraItemId`: item de compra de origem, quando a movimentacao de entrada foi
  gerada por recebimento de item de compra e a referencia existir.
- `VendaId`: presente quando a origem e venda.
- `ValorUnitario`: custo unitario quando existir.

**Origem values (derivados, nao persistidos)**:

- `Compra`: `Tipo` igual a `Entrada` com `CompraId` preenchido.
- `Venda`: `Tipo` igual a `Saida` com `VendaId` preenchido.
- `InventarioInicial`: `Tipo` igual a `InventarioInicial`.

**Rules**:

- A origem e derivada do estado atual da movimentacao; nenhum campo de origem e
  adicionado a entidade.
- Movimentacoes antigas de entrada por compra com `CompraId` e sem `CompraItemId`
  continuam classificadas como origem `Compra`; movimentacoes novas retornam
  `CompraItemId` quando a referencia existir.

## Historico de Movimentacoes do Produto (projecao de consulta)

**Purpose**: Resposta da consulta de historico de um produto.

**Fields**:

- `ProdutoId`: identificador do produto consultado.
- `NomeProduto`: nome do produto.
- `SaldoAtual`: saldo atual calculado do produto.
- `TotalMovimentacoes`: contagem total de movimentacoes do produto que atendem aos
  filtros aplicados antes do limite.
- `Movimentacoes`: lista de Itens de Historico de Movimentacao, ordenada por data
  decrescente e, em caso de mesma data, por `CreatedAt` decrescente, limitada pelo
  limite aplicado.

**Rules**:

- `SaldoAtual` reflete o historico completo do produto, independente dos filtros de
  periodo, tipo ou limite aplicados a lista de movimentacoes.
- `TotalMovimentacoes` reflete a contagem total de movimentacoes do produto que
  atendem aos filtros aplicados antes do limite, e sinaliza a existencia de
  registros adicionais quando maior que o numero de itens retornados.
- A lista de movimentacoes respeita filtros de periodo e tipo e o limite aplicado.
- A ordenacao da lista e deterministica: `Data` decrescente e, no desempate,
  `CreatedAt` decrescente (mais recente primeiro).
- Produto sem movimentacoes retorna `Movimentacoes` vazio, `SaldoAtual` igual a zero
  e `TotalMovimentacoes` igual a zero.
- Produto inexistente nao retorna projecao; a consulta responde nao encontrado.

## Filtros de Consulta

### Lista de saldo

- `categoriaId` (opcional): restringe por categoria.
- `apenasComSaldo` (opcional): quando verdadeiro, retorna apenas produtos com saldo
  maior que zero.

### Historico de movimentacoes

- `produtoId` (obrigatorio, na rota): identificador do produto; vazio ou invalido e
  rejeitado.
- `dataInicio` (opcional): inicio do periodo, normalizado para UTC 00:00:00.
- `dataFim` (opcional): fim do periodo, normalizado para UTC 23:59:59.
- `tipo` (opcional): `Entrada`, `Saida` ou `InventarioInicial`.
- `limite` (opcional): numero de registros; quando ausente, aplica limite padrao de
  50; quando acima do maximo, aplica limite maximo de 200.

**Rules**:

- `dataInicio` maior que `dataFim` e rejeitado como filtro invalido.
- Filtros e limites sao aplicados na consulta, nao apos carregar o historico
  integral. A contagem total e obtida por agregacao no banco.

## Persistence Impact

- Nenhuma. Sem nova tabela, campo, indice obrigatorio ou migration.
- A leitura usa as tabelas existentes `estoque_movimentacoes` e o cadastro de
  produtos via EF Core e Repository Pattern.
