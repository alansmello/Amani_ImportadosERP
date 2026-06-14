# Feature Specification: Consulta de Estoque

**Feature Branch**: `008-consulta-estoque`

**Created**: 2026-06-14

**Status**: Draft

**Input**: User description: "F008 - Consulta de Estoque (backend). Expor, via API agregada, o saldo atual por produto e o historico de movimentacoes, sem violar estoque por movimentacoes. Novo EstoqueController consumindo um read repository especializado que agrega EstoqueMovimentacao (entradas menos saidas) com filtros. Entra: GET /api/estoque (lista produtos com saldo calculado) e GET /api/estoque/{produtoId}/movimentacoes (historico com tipo, quantidade, origem compra/venda, custo, data) com filtros/limite e DTOs de resposta. Fica fora: ajuste manual de saldo, reserva, multi-deposito, transferencias, inventario ciclico. Saldo calculado por entradas menos saidas; nenhum campo fixo de saldo; consulta agregada; controller sem regra de negocio; sem nova migration."

## Governance Note

Esta feature expoe pela primeira vez a leitura de estoque por uma API publica.
Ela existe para preparar a base do modulo de Estoque do frontend (Feature 012) e
o enriquecimento do detalhe de Produto. A feature MUST preservar a regra
constitucional de estoque exclusivamente por movimentacoes: o saldo e sempre
derivado de `EstoqueMovimentacao` (entradas menos saidas), nunca lido de um campo
fixo. A feature e somente leitura e MUST NOT criar, alterar ou apagar
movimentacoes, nem alterar schema do banco.

## Clarifications

### Session 2026-06-14

- Q: Quais valores para o limite padrao e maximo do historico de movimentacoes? → A: Limite padrao 50; limite maximo 200.
- Q: Como desempatar a ordenacao do historico quando varias movimentacoes tem a mesma Data (normalizada por dia)? → A: Ordenar por Data decrescente e, no desempate, por CreatedAt decrescente.
- Q: O contrato deve sinalizar quando ha mais movimentacoes do que o limite retornado? → A: Sim, incluir a contagem total de movimentacoes do produto (`totalMovimentacoes`) junto com a lista limitada.

- Nota: Para `totalMovimentacoes`, a contagem total mencionada acima considera as movimentacoes que atendem aos filtros aplicados antes do limite.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar saldo atual por produto (Priority: P1)

Como gestor operacional da Amani, quero consultar a lista de produtos com o saldo
fisico atual calculado para saber o que esta disponivel sem precisar abrir cada
compra ou venda.

**Why this priority**: Sem leitura de saldo exposta, o frontend nao consegue
mostrar estoque e o operador nao tem visao do disponivel. E a base do modulo de
Estoque e do detalhe de Produto.

**Independent Test**: Pode ser totalmente testada criando movimentacoes conhecidas
(inventario inicial, recebimento e venda) para um produto e verificando que a lista
retorna o saldo igual a entradas menos saidas.

**Acceptance Scenarios**:

1. **Given** um produto sem nenhuma movimentacao, **When** o gestor consulta a lista de estoque, **Then** o produto aparece com saldo igual a zero.
2. **Given** um produto com inventario inicial de 10 e venda de 3, **When** o gestor consulta a lista de estoque, **Then** o produto aparece com saldo igual a 7.
3. **Given** um produto com recebimento de compra de 5 e venda de 2, **When** o gestor consulta a lista de estoque, **Then** o produto aparece com saldo igual a 3.
4. **Given** varios produtos cadastrados, **When** o gestor consulta a lista filtrando por categoria, **Then** apenas produtos daquela categoria sao retornados com seus saldos.

---

### User Story 2 - Consultar historico de movimentacoes de um produto (Priority: P1)

Como gestor operacional, quero consultar o historico de movimentacoes de um produto
especifico para auditar como o saldo atual foi formado, identificando entradas,
saidas, origem e data.

**Why this priority**: A rastreabilidade e o motivo de estoque ser por
movimentacoes. Sem o historico, o saldo seria um numero sem explicacao auditavel.

**Independent Test**: Pode ser testada registrando entradas e saidas de um produto e
verificando que o historico lista cada movimentacao com tipo, quantidade, origem,
data e valor unitario quando aplicavel.

**Acceptance Scenarios**:

1. **Given** um produto com inventario inicial, recebimento e venda, **When** o gestor consulta o historico do produto, **Then** as tres movimentacoes aparecem com tipo, quantidade e data.
2. **Given** uma movimentacao gerada por recebimento de compra, **When** o historico e consultado, **Then** a movimentacao indica origem de compra e referencia a compra correspondente.
3. **Given** uma movimentacao gerada por venda, **When** o historico e consultado, **Then** a movimentacao indica origem de venda e referencia a venda correspondente.
4. **Given** um produto inexistente, **When** o gestor consulta o historico desse identificador, **Then** o sistema responde que o produto nao foi encontrado.

---

### User Story 3 - Filtrar e limitar consultas para escala (Priority: P2)

Como gestor operacional, quero filtrar o historico por periodo e tipo e limitar a
quantidade de registros retornados para que a consulta continue rapida conforme o
volume de movimentacoes cresce.

**Why this priority**: A operacao acumula movimentacoes continuamente; consultas sem
filtros e limites degradam com o tempo. Filtros e limites garantem escalabilidade.

**Independent Test**: Pode ser testada criando movimentacoes em datas diferentes e
verificando que os filtros de periodo e tipo retornam apenas o subconjunto esperado e
que o limite restringe o numero de registros.

**Acceptance Scenarios**:

1. **Given** um produto com movimentacoes em meses diferentes, **When** o gestor consulta o historico com periodo de um mes, **Then** apenas movimentacoes daquele periodo aparecem.
2. **Given** um produto com entradas e saidas, **When** o gestor consulta o historico filtrando por tipo de saida, **Then** apenas as saidas aparecem.
3. **Given** um produto com muitas movimentacoes, **When** o gestor consulta o historico sem informar limite, **Then** o sistema aplica um limite padrao e nao retorna o historico integral em uma unica resposta.
4. **Given** um pedido com limite acima do maximo permitido, **When** a consulta e executada, **Then** o sistema aplica o limite maximo permitido.

---

### Edge Cases

- Produto sem nenhuma movimentacao deve aparecer na lista de estoque com saldo zero, e seu historico deve retornar lista vazia com saldo atual zero.
- Inventario inicial deve ser contado como entrada no calculo de saldo.
- Movimentacoes antigas de entrada por compra que possuem `CompraId` mas nao `CompraItemId` devem continuar rastreaveis com origem de compra.
- Consulta de historico para identificador de produto vazio ou invalido deve ser rejeitada.
- Consulta de historico para produto inexistente deve responder nao encontrado.
- Periodo com data inicial maior que a final deve ser rejeitado como filtro invalido.
- O saldo retornado reflete apenas o historico; a consulta nao valida nem corrige saldos negativos eventuais, apenas os expoe como resultado do historico.
- Quando varias movimentacoes possuem a mesma data (data e normalizada por dia), a ordenacao deve ser deterministica usando a data de criacao do registro como desempate, mais recente primeiro.
- Quando o produto tem mais movimentacoes do que o limite aplicado, a lista e truncada, mas a contagem total informada permite identificar que existem registros adicionais.
- A consulta MUST NOT alterar, criar ou apagar nenhuma movimentacao de estoque.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST expor uma consulta que liste produtos com o saldo fisico atual calculado.
- **FR-002**: O sistema MUST calcular o saldo de cada produto como a soma das entradas mais inventario inicial menos a soma das saidas, a partir do historico de movimentacoes.
- **FR-003**: O sistema MUST incluir na lista de saldo produtos sem movimentacoes, apresentando saldo zero.
- **FR-004**: O sistema MUST permitir filtrar a lista de saldo por categoria de produto.
- **FR-005**: O sistema MUST permitir restringir a lista de saldo apenas a produtos com saldo maior que zero, quando solicitado.
- **FR-006**: O sistema MUST expor uma consulta de historico de movimentacoes por produto.
- **FR-007**: O sistema MUST retornar, para cada movimentacao, tipo, quantidade, data, origem e valor unitario quando existir.
- **FR-008**: O sistema MUST indicar a origem de cada movimentacao como entrada por compra, saida por venda ou inventario inicial, com a referencia correspondente quando houver.
- **FR-009**: O sistema MUST retornar o saldo atual do produto junto com o historico consultado.
- **FR-010**: O sistema MUST permitir filtrar o historico por intervalo de datas.
- **FR-011**: O sistema MUST permitir filtrar o historico por tipo de movimentacao.
- **FR-012**: O sistema MUST aplicar um limite padrao de 50 registros no historico quando o solicitante nao informar limite.
- **FR-013**: O sistema MUST aplicar um limite maximo de 200 registros no historico, mesmo quando o solicitante pedir um limite maior.
- **FR-014**: O sistema MUST rejeitar consulta de historico com identificador de produto ausente ou invalido.
- **FR-015**: O sistema MUST responder nao encontrado quando o historico for solicitado para um produto inexistente.
- **FR-016**: O sistema MUST rejeitar filtro de periodo com data inicial maior que a data final.
- **FR-017**: O sistema MUST calcular saldos e listas por consultas agregadas na persistencia, sem carregar o historico integral em memoria.
- **FR-018**: O sistema MUST manter o saldo de estoque derivado exclusivamente de movimentacoes historicas.
- **FR-019**: O sistema MUST NOT introduzir campo fixo de saldo de estoque em produto, movimentacao ou qualquer cadastro.
- **FR-020**: O sistema MUST NOT criar, alterar ou apagar movimentacoes de estoque ao atender consultas.
- **FR-021**: O sistema MUST NOT alterar o schema do banco de dados nesta feature, dispensando nova migration.
- **FR-022**: O sistema MUST expor as consultas por contratos dedicados de saida, sem expor entidades de dominio diretamente.
- **FR-023**: O sistema MUST usar mapeamento explicito de dados, sem mapeamento automatico de objetos.
- **FR-024**: O sistema MUST manter validacoes e regras no backend, com controllers apenas recebendo requisicoes, validando contratos basicos e delegando.
- **FR-025**: O sistema MUST ordenar o historico por data decrescente e, em caso de mesma data, por data de criacao do registro (CreatedAt) decrescente, garantindo ordenacao deterministica.
- **FR-026**: O sistema MUST retornar, junto com o historico, a contagem total de movimentacoes do produto que atendem aos filtros aplicados antes do limite, para sinalizar a existencia de registros adicionais na consulta filtrada.

### Key Entities *(include if feature involves data)*

- **Movimentacao de Estoque**: Registro historico existente que altera o saldo fisico de um produto, com tipo (entrada, saida ou inventario inicial), quantidade, data, valor unitario opcional e referencias opcionais a compra, item de compra e venda. Fonte unica do saldo. Esta feature apenas le este historico.
- **Saldo de Produto (visao de consulta)**: Resultado calculado por produto, derivado das movimentacoes, contendo identificacao do produto e saldo atual. Nao e persistido como campo fixo.
- **Item de Historico de Movimentacao (visao de consulta)**: Projecao de leitura de uma movimentacao para auditoria, com tipo, quantidade, data, origem, referencias e valor unitario quando aplicavel.
- **Historico de Movimentacoes do Produto (visao de consulta)**: Resultado da consulta de historico, contendo identificacao e saldo atual do produto, a contagem total de movimentacoes do produto que atendem aos filtros antes do limite e a lista limitada e ordenada de Itens de Historico de Movimentacao.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos saldos retornados na lista de estoque sao iguais a entradas mais inventario inicial menos saidas para o mesmo produto no historico.
- **SC-002**: 100% dos produtos cadastrados aparecem na lista de estoque, inclusive os sem movimentacoes, com saldo zero nesse caso.
- **SC-003**: 100% das movimentacoes de um produto aparecem no historico quando consultadas sem filtros restritivos dentro do limite aplicado.
- **SC-004**: 100% das consultas de historico de produto inexistente respondem nao encontrado, sem retornar dados de outro produto.
- **SC-005**: Nenhuma consulta desta feature cria, altera ou apaga movimentacoes de estoque.
- **SC-006**: Nenhuma migration de banco e gerada por esta feature.
- **SC-007**: O gestor consegue identificar o saldo atual de um produto e como ele foi formado em menos de 1 minuto durante uma rotina operacional.
- **SC-008**: Para um volume de referencia de ate 1.000 produtos e 50.000 movimentacoes, as consultas de saldo e historico respondem em ate 2 segundos em ambiente local/desenvolvimento, usando agregacao na persistencia, filtros e limites de retorno.

## Assumptions

- As movimentacoes de estoque ja existem e sao geradas pelos fluxos atuais de inventario inicial, recebimento de compra e venda; esta feature nao gera novas movimentacoes.
- O calculo de saldo segue a mesma regra ja usada internamente pelo backend para validar vendas: entradas mais inventario inicial menos saidas.
- O valor unitario so existe em movimentacoes de entrada com custo conhecido (inventario inicial valorizado e recebimento confirmado); saidas de venda podem nao ter valor unitario de entrada.
- O nome do produto e a categoria vem do cadastro de produto existente.
- Esta feature e backend; a apresentacao em telas e responsividade ficam para a feature de frontend de Estoque que consumira estes contratos.
- O custo medio e o lucro permanecem como responsabilidade dos fluxos existentes e nao sao recalculados por esta consulta.
