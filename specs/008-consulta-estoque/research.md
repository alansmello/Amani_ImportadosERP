# Research: Consulta de Estoque

## Decision: Reaproveitar e estender o repository de consulta existente

**Rationale**: `IEstoqueConsultaRepository` e `EstoqueConsultaRepository` ja
calculam o saldo de um produto por entradas mais inventario inicial menos saidas e
ja estao registrados no container DI. Estender essa interface com leitura agregada de
saldos e historico filtrado preserva a regra de calculo, evita duplicacao e nao
adiciona nova abstracao. O metodo existente `ObterSaldoAsync` permanece intacto para
nao afetar `VendaService`.

**Alternatives considered**:

- Criar um repository de leitura totalmente novo (por exemplo `IEstoqueRelatorioRepository`):
  rejeitado por adicionar abstracao sem necessidade, ja que a consulta de estoque e
  conceitualmente a mesma responsabilidade do repository existente.
- Consultar `AmaniDbContext` diretamente no handler: rejeitado por violar Repository
  Pattern e por acoplar a Application ao EF Core.

## Decision: Saldo calculado por agregacao no banco

**Rationale**: O numero de movimentacoes cresce continuamente. Calcular saldo
somando movimentacoes em memoria degradaria com o tempo e violaria o principio de
analytics e escalabilidade. A soma por produto, separando entradas e inventario
inicial de saidas, MUST ocorrer no banco via agregacao. Para a lista de saldo, o
cadastro de produto e combinado com a soma das movimentacoes por LEFT JOIN para que
produtos sem movimentacao apareçam com saldo zero.

**Alternatives considered**:

- Reusar `ObterSaldoAsync` em laco para cada produto: rejeitado por gerar N
  consultas e nao escalar.
- Persistir um saldo materializado por produto: rejeitado por violar a regra
  constitucional de estoque exclusivamente por movimentacoes e por introduzir campo
  fixo de saldo.

## Decision: Lista de estoque inclui produtos sem movimentacao com saldo zero

**Rationale**: Para o operador, a visao de estoque deve refletir o catalogo de
produtos, inclusive os que ainda nao tiveram movimentacao. Um LEFT JOIN do produto
com a agregacao de movimentacoes garante saldo zero nesses casos sem precisar criar
movimentacao artificial.

**Alternatives considered**:

- Listar apenas produtos que ja tiveram movimentacao: rejeitado por esconder
  produtos novos do catalogo. Mantido apenas como filtro opcional de apenas com
  saldo positivo.

## Decision: Historico com limite padrao e limite maximo

**Rationale**: O historico de um produto pode crescer indefinidamente. Para
preservar escala e tempo de resposta, a consulta aplica um limite padrao quando o
solicitante nao informa limite e um limite maximo quando o solicitante pede mais que
o permitido. Os filtros de periodo e tipo sao aplicados na consulta, nao apos
carregar o historico inteiro.

**Alternatives considered**:

- Retornar o historico integral sempre: rejeitado por nao escalar.
- Paginacao por cursor/offset: aceito como evolucao futura se o volume exigir, mas
  fora do escopo desta feature para preservar simplicidade.

## Decision: Origem da movimentacao derivada do tipo e das referencias existentes

**Rationale**: `EstoqueMovimentacao` ja distingue `Entrada`, `Saida` e
`InventarioInicial` e guarda `CompraId`, `CompraItemId` e `VendaId`. A origem
apresentada no historico (entrada por compra, saida por venda, inventario inicial) e
derivada do tipo e dessas referencias, sem novo campo. Movimentacoes antigas de
entrada por compra que possuem `CompraId` mas nao `CompraItemId` continuam sendo
tratadas como origem de compra.

**Alternatives considered**:

- Adicionar um campo de origem na entidade: rejeitado por exigir migration e por ser
  derivavel do estado atual.

## Decision: Somente leitura, sem migration

**Rationale**: A feature expoe dados ja persistidos. Nao ha novo campo, tabela ou
relacionamento. Manter a feature estritamente de leitura preserva o historico,
evita risco de schema e respeita a priorizacao de entregar a fundacao do modulo de
Estoque rapidamente.

**Alternatives considered**:

- Adicionar indices novos para acelerar agregacao: avaliado e adiado. Caso a
  agregacao mostre lentidao no volume real, um indice por `ProdutoId` e `Tipo` pode
  ser proposto em feature futura com migration dedicada. Esta feature nao introduz
  migration.

## Decision: Filtros de data normalizados em UTC

**Rationale**: Os controllers existentes (`VendasController`, `ComprasController`,
`DespesasController`) normalizam intervalos de data para UTC, com inicio em 00:00:00
e fim em 23:59:59. O filtro de periodo do historico deve seguir o mesmo padrao para
consistencia de comportamento entre modulos.

**Alternatives considered**:

- Aceitar datas sem normalizacao: rejeitado por inconsistencia com o restante da API
  e risco de bordas de fuso.

## Decision: Sem novas dependencias

**Rationale**: O projeto ja usa ASP.NET Core, EF Core, PostgreSQL, MediatR e
Repository Pattern. A feature pode ser entregue com Queries/Handlers, DTOs manuais e
extensao do repository de consulta existentes.

**Alternatives considered**:

- Introduzir biblioteca de relatorios ou AutoMapper: rejeitado por complexidade
  desnecessaria e por restricao explicita da Constituicao.
