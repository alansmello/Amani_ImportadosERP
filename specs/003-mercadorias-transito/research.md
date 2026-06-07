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

## Decision: Compras existentes serao migradas com recebimentos legados

**Rationale**: Antes da Feature 003, compras ja geravam entrada automatica.
Marcar compras existentes como `Recebida` preserva o historico antigo e impede
que elas aparecam incorretamente como mercadorias em transito. Criar um
recebimento `Legado/Migrado` por item, sem nova movimentacao de estoque, mantem
`QuantidadeRecebida` e `QuantidadePendente` consistentes com o status.

**Alternatives considered**:

- Criar recebimentos retroativos operacionais para todas as compras antigas:
  rejeitado por risco de duplicar efeitos historicos. A alternativa aceita e
  recebimento `Legado/Migrado`, sem nova movimentacao.
- Apenas tratar compras migradas como recebidas por regra de consulta: rejeitado
  porque deixaria status e quantidades calculadas divergentes.
- Marcar todas como `EmTransito`: rejeitado porque conflita com entradas de
  estoque ja existentes.

## Decision: Movimentacoes antigas mantem rastreio por compra e produto

**Rationale**: Movimentacoes antigas nao possuem `CompraItemId`, mas possuem
`CompraId` e `ProdutoId`. `CompraItemId` deve ser nullable para preservar esse
historico. Novas entradas por recebimento devem preencher `CompraItemId`.

**Alternatives considered**:

- Preencher `CompraItemId` retroativamente por inferencia: rejeitado porque pode
  ser ambiguo em bases com dados inconsistentes ou compras antigas alteradas.
- Tornar `CompraItemId` obrigatorio: rejeitado porque quebraria movimentacoes de
  inventario inicial, venda e historico antigo.

## Decision: Custo medio deve considerar entradas reais

**Rationale**: Depois da mudanca, entradas de compra so ocorrem em recebimentos
confirmados. O custo medio deve usar `EstoqueMovimentacao` de `Entrada` gerada
por recebimento e `InventarioInicial` com valor unitario, conforme Constituicao
2.0.0. Compra criada sem recebimento, perda, extravio e avaria nao entram no
custo medio.

**Alternatives considered**:

- Calcular custo medio por compras registradas: rejeitado porque incluiria
  mercadorias nao recebidas e perdas.
- Calcular custo medio por valor manual no produto: rejeitado por violar
  historico operacional.

## Decision: Dashboard financeiro permanece por compra registrada

**Rationale**: A Feature 003 altera o regime fisico/operacional de estoque, nao
o regime financeiro. O dashboard financeiro existente deve continuar
considerando compras registradas como impacto financeiro imediato. Recebimentos
e perdas nao criam novo contrato financeiro nesta feature.

**Alternatives considered**:

- Mudar dashboard para considerar apenas recebimentos: rejeitado por alterar o
  regime financeiro fora do escopo.
- Remover compras em transito do financeiro: rejeitado porque compra registrada
  continua representando compromisso/aquisicao financeira.

## Decision: Recebimento e perda exigem transacao

**Rationale**: Recebimento operacional cria evento historico, movimentacao de
estoque e atualizacao de status. Perda cria evento historico, rastreabilidade de
prejuizo e atualizacao de status. Cada caso de uso deve ser atomico para evitar
historico parcial.

**Alternatives considered**:

- Persistir cada parte em chamadas separadas de repository sem transacao:
  rejeitado porque pode criar recebimento sem estoque, estoque sem recebimento
  ou status divergente.

## Decision: Sem novas dependencias

**Rationale**: O projeto ja usa ASP.NET Core, EF Core, PostgreSQL e repositories.
A feature pode ser entregue com entidades, DTOs manuais, services, repositories e
Fluent API existentes.

**Alternatives considered**:

- Adicionar workflow engine ou AutoMapper: rejeitado por complexidade
  desnecessaria e por restricao explicita da Constituicao.
