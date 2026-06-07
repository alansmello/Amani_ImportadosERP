# Research: Mercadorias em Transito e Recebimento Parcial

## Decision: Compra nao cria movimentacao de estoque

**Rationale**: A Constituicao 2.0.0 separa compra comercial de recebimento
fisico. O metodo atual `CompraService.CreateAsync` cria `EstoqueMovimentacao`
`Entrada` para todos os itens comprados; essa regra deve ser removida para que
vendas e saldo fisico nao considerem produtos em transporte.

**Alternatives considered**:

- Manter entrada automatica e marcar como "em transito": rejeitado porque
  inflaria saldo fisico e permitiria venda de produto nao recebido.
- Criar saldo separado por produto: rejeitado pela regra constitucional de
  estoque exclusivamente por movimentacoes.

## Decision: Recebimento sera evento historico por item de compra

**Rationale**: A feature exige recebimento por item, parcial e multiplo. Uma
entidade historica `CompraItemRecebimento` preserva cada evento, permite auditar
data/quantidade e cria exatamente uma entrada de estoque para a quantidade
confirmada.

**Alternatives considered**:

- Atualizar campos acumulados diretamente em `CompraItem`: rejeitado como unica
  fonte de verdade porque perderia historico de eventos.
- Receber a compra inteira: rejeitado porque nao atende recebimento por item nem
  parciais.

## Decision: Perda sera evento historico por item sem estoque

**Rationale**: Perdas, extravios e avarias resolvem pendencia logistica, mas nao
criam disponibilidade fisica. Uma entidade `CompraItemPerda` registra quantidade,
motivo e data como prejuizo operacional.

**Alternatives considered**:

- Criar movimentacao negativa de estoque: rejeitado porque o produto perdido
  nunca entrou fisicamente no estoque.
- Apenas reduzir pendencia sem evento: rejeitado por falta de rastreabilidade.

## Decision: Quantidade pendente sera calculada

**Rationale**: A quantidade pendente deve derivar de quantidade comprada menos
soma de recebimentos e perdas. Isso preserva trilha historica e evita campo de
saldo operacional como fonte isolada.

**Alternatives considered**:

- Persistir `QuantidadePendente`: rejeitado por risco de divergencia com
  historico.
- Persistir apenas recebida/perdida acumuladas: aceito apenas como projeção
  futura se necessario, nao como fonte principal nesta feature.

## Decision: Status da compra sera persistido e recalculado pelo backend

**Rationale**: Status operacional facilita consultas de transito e bloqueios,
mas sua atualizacao deve ser controlada por regras no backend apos criacao,
recebimento, perda, finalizacao ou cancelamento.

**Alternatives considered**:

- Calcular status sempre por consulta: rejeitado para status como `Cancelada` e
  `Finalizada`, que sao decisoes operacionais e nao apenas resultado numerico.

## Decision: Compras existentes serao migradas como resolvidas

**Rationale**: Antes da Feature 003, compras ja geravam entrada automatica.
Marcar compras existentes como `Recebida` preserva o historico antigo e impede
que elas aparecam incorretamente como mercadorias em transito.

**Alternatives considered**:

- Criar recebimentos retroativos para todas as compras antigas: rejeitado por
  risco de duplicar efeitos historicos e por exigir inferencia operacional que
  nao existia.
- Marcar todas como `EmTransito`: rejeitado porque conflita com entradas de
  estoque ja existentes.

## Decision: Custo medio deve considerar entradas reais

**Rationale**: Depois da mudanca, entradas de compra so ocorrem em recebimentos
confirmados. O custo medio deve usar `EstoqueMovimentacao` de `Entrada` gerada
por recebimento e `InventarioInicial` com valor unitario, conforme Constituicao
2.0.0.

**Alternatives considered**:

- Calcular custo medio por compras registradas: rejeitado porque incluiria
  mercadorias nao recebidas e perdas.
- Calcular custo medio por valor manual no produto: rejeitado por violar
  historico operacional.

## Decision: Sem novas dependencias

**Rationale**: O projeto ja usa ASP.NET Core, EF Core, PostgreSQL e repositories.
A feature pode ser entregue com entidades, DTOs manuais, services, repositories e
Fluent API existentes.

**Alternatives considered**:

- Adicionar workflow engine ou AutoMapper: rejeitado por complexidade
  desnecessaria e por restricao explicita da Constituicao.
