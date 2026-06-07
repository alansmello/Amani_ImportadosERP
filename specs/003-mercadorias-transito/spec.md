# Feature Specification: Mercadorias em Transito e Recebimento Parcial

**Feature Branch**: `003-mercadorias-transito`

**Created**: 2026-06-07

**Status**: Draft

**Input**: User description: "Criar a Feature 003 - Mercadorias em Transito e Recebimento Parcial de Compras para o Amani ERP. Compras nao devem mais gerar entrada automatica no estoque; itens comprados ficam em transito ate recebimento; recebimento e perdas devem ser registrados por item, com suporte a recebimentos parciais e multiplos eventos; somente quantidade recebida gera entrada de estoque; perdas nao geram estoque e devem ser rastreaveis como prejuizo operacional; saldo continua calculado exclusivamente por movimentacoes; preservar historico; backend centraliza regras; usar contratos dedicados, mapeamentos explicitos e sem AutoMapper."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar compra como mercadoria em transito (Priority: P1)

Como operador de compras, quero registrar uma compra sem aumentar o estoque fisico imediatamente para que o ERP represente o periodo real entre a compra e a chegada dos produtos.

**Why this priority**: Esta e a mudanca central da feature; sem ela, vendas e estoque continuam considerando produtos ainda nao recebidos como disponiveis.

**Independent Test**: Criar uma compra com itens e verificar que os itens ficam pendentes de recebimento, a compra aparece como mercadoria em transito e o saldo fisico dos produtos permanece inalterado.

**Acceptance Scenarios**:

1. **Given** um produto com saldo fisico conhecido, **When** uma compra desse produto e criada, **Then** o saldo fisico do produto nao aumenta.
2. **Given** uma compra criada com itens, **When** o operador consulta mercadorias em transito, **Then** a compra aparece com quantidades compradas e pendentes por item.
3. **Given** uma compra criada sem recebimentos ou perdas, **When** seu estado operacional e consultado, **Then** ela esta em transito ou em estado equivalente que indique pendencia logistica.

---

### User Story 2 - Receber itens parcialmente (Priority: P1)

Como operador de estoque, quero confirmar recebimentos por item e por quantidade para que apenas os produtos fisicamente recebidos entrem no estoque.

**Why this priority**: Recebimento parcial e por item garante que vendas, custo medio e saldo fisico reflitam somente o que chegou.

**Independent Test**: Receber parte da quantidade de um item de compra, verificar que apenas essa quantidade gera entrada de estoque e que o restante continua pendente.

**Acceptance Scenarios**:

1. **Given** um item de compra com quantidade pendente, **When** o operador registra recebimento menor que a pendencia, **Then** somente a quantidade recebida aumenta o estoque fisico.
2. **Given** um item parcialmente recebido, **When** novo recebimento e registrado dentro da pendencia restante, **Then** o historico mostra ambos os recebimentos e o saldo fisico inclui a soma recebida.
3. **Given** uma compra com pelo menos um item ainda pendente, **When** o operador consulta mercadorias em transito, **Then** a compra continua aparecendo como pendente.

---

### User Story 3 - Registrar perdas, extravios ou avarias (Priority: P2)

Como operador de compras ou estoque, quero registrar quantidades perdidas, extraviadas ou avariadas por item para que a operacao acompanhe prejuizos sem inflar o estoque.

**Why this priority**: Perdas resolvem pendencias logisticas e precisam ser auditaveis, mas nao podem gerar disponibilidade fisica nem custo medio de entrada.

**Independent Test**: Registrar perda para parte ou toda a pendencia de um item e verificar que nenhuma entrada de estoque e criada, que a perda aparece no historico e que a pendencia e recalculada.

**Acceptance Scenarios**:

1. **Given** um item com quantidade pendente, **When** o operador registra perda dentro da pendencia, **Then** a quantidade perdida reduz a pendencia e nao altera o estoque fisico.
2. **Given** uma perda registrada, **When** o historico de perdas da compra e consultado, **Then** a perda mostra item, quantidade, motivo e data do registro.
3. **Given** uma compra cujos itens foram totalmente resolvidos por recebimentos e perdas, **When** o operador consulta mercadorias em transito, **Then** essa compra nao aparece mais na lista.

---

### User Story 4 - Acompanhar pendencias e historicos (Priority: P3)

Como gestor operacional, quero consultar compras em transito, produtos pendentes, recebimentos e perdas para auditar a operacao e agir sobre atrasos ou prejuizos.

**Why this priority**: Depois que o novo fluxo impede entrada automatica, a operacao precisa de visibilidade clara sobre o que ainda deve chegar e o que foi perdido.

**Independent Test**: Consultar listas e historicos apos criar compras, recebimentos e perdas, conferindo que quantidades compradas, recebidas, perdidas e pendentes batem com os eventos registrados.

**Acceptance Scenarios**:

1. **Given** compras com itens pendentes, **When** o gestor consulta mercadorias em transito, **Then** recebe apenas compras ainda nao totalmente resolvidas.
2. **Given** itens pendentes em diferentes compras, **When** o gestor consulta produtos pendentes de recebimento, **Then** consegue identificar produto, compra e quantidade pendente.
3. **Given** uma compra com eventos de recebimento e perda, **When** seus historicos sao consultados, **Then** todos os eventos aparecem em ordem rastreavel e sem apagar registros anteriores.

---

### Edge Cases

- Criar compra com itens nao deve criar entrada de estoque, mesmo quando todos os produtos estao cadastrados corretamente.
- Recebimento com quantidade zero, negativa ou maior que a pendencia do item deve ser rejeitado.
- Perda com quantidade zero, negativa ou maior que a pendencia do item deve ser rejeitada.
- Recebimento ou perda de item que nao pertence a compra informada deve ser rejeitado.
- Compra cancelada ou finalizada nao deve aceitar novos recebimentos ou perdas.
- Compra parcialmente recebida deve continuar em transito enquanto houver quantidade pendente em qualquer item.
- Compra totalmente recebida deve sair da lista de mercadorias em transito.
- Compra totalmente resolvida por combinacao de recebimentos e perdas deve sair da lista de mercadorias em transito.
- Quantidade perdida deve permanecer rastreavel como prejuizo operacional, sem criar disponibilidade de venda.
- Vendas devem continuar validando somente estoque fisicamente disponivel.
- Custo medio deve considerar somente produtos efetivamente recebidos no estoque.
- Inventario inicial, saldo inicial de caixa, contas a receber iniciais e dashboard financeiro existente nao devem ser alterados por esta feature.
- Historicos de compra, recebimento, perda e movimentacao de estoque nao devem ser apagados para corrigir estado operacional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar compra com itens comprados sem aumentar automaticamente o estoque fisico dos produtos.
- **FR-002**: O sistema MUST tratar itens de compra ainda nao resolvidos como mercadorias em transito.
- **FR-003**: O sistema MUST controlar, para cada item de compra, quantidade comprada, quantidade recebida, quantidade perdida e quantidade pendente calculada.
- **FR-004**: O sistema MUST calcular quantidade pendente como quantidade comprada menos quantidades recebidas e perdidas registradas.
- **FR-005**: O sistema MUST permitir registrar recebimento por item de compra, informando a quantidade efetivamente recebida.
- **FR-006**: O sistema MUST permitir multiplos recebimentos para o mesmo item de compra enquanto houver quantidade pendente.
- **FR-007**: O sistema MUST permitir recebimento parcial de um item de compra.
- **FR-008**: O sistema MUST gerar entrada de estoque somente para a quantidade efetivamente recebida.
- **FR-009**: O sistema MUST rejeitar recebimento com quantidade maior que a quantidade pendente do item.
- **FR-010**: O sistema MUST rejeitar recebimento com quantidade nula, negativa ou sem item valido da compra.
- **FR-011**: O sistema MUST permitir registrar perda, extravio ou avaria por item de compra, informando quantidade e motivo operacional.
- **FR-012**: O sistema MUST permitir multiplas perdas para o mesmo item de compra enquanto houver quantidade pendente.
- **FR-013**: O sistema MUST rejeitar perda com quantidade maior que a quantidade pendente do item.
- **FR-014**: O sistema MUST rejeitar perda com quantidade nula, negativa ou sem item valido da compra.
- **FR-015**: O sistema MUST NOT gerar entrada de estoque para quantidade perdida, extraviada ou avariada.
- **FR-016**: O sistema MUST manter perdas rastreaveis como prejuizo operacional, associadas a compra e item correspondentes.
- **FR-017**: O sistema MUST preservar historico completo de compras, recebimentos, perdas e movimentacoes de estoque.
- **FR-018**: O sistema MUST disponibilizar consulta de compras com mercadorias em transito, incluindo compras criadas, em transito e parcialmente recebidas que ainda tenham pendencia.
- **FR-019**: O sistema MUST remover da consulta de mercadorias em transito compras sem quantidade pendente em seus itens.
- **FR-020**: O sistema MUST disponibilizar consulta de produtos pendentes de recebimento com quantidade pendente calculada por compra e item.
- **FR-021**: O sistema MUST disponibilizar historico de recebimentos por compra.
- **FR-022**: O sistema MUST disponibilizar historico de perdas por compra.
- **FR-023**: O sistema MUST refletir estados operacionais de compra compativeis com criada, em transito, parcialmente recebida, recebida, finalizada e cancelada.
- **FR-024**: O sistema MUST bloquear novos recebimentos e perdas para compras canceladas ou finalizadas.
- **FR-025**: O sistema MUST manter o saldo de estoque calculado exclusivamente por movimentacoes historicas.
- **FR-026**: O sistema MUST NOT criar campo fixo de estoque em produto, item de compra ou qualquer cadastro.
- **FR-027**: O sistema MUST manter vendas validando apenas estoque fisicamente disponivel.
- **FR-028**: O sistema MUST manter o calculo de custo medio considerando apenas entradas de produtos efetivamente recebidos.
- **FR-029**: O sistema MUST NOT alterar inventario inicial, saldo inicial de caixa, contas a receber iniciais ou dashboard financeiro existente nesta feature.
- **FR-030**: O sistema MUST centralizar validacoes operacionais e regras de quantidade no backend.
- **FR-031**: O sistema MUST usar contratos dedicados de entrada e saida para compra, recebimento, perda e consultas relacionadas.
- **FR-032**: O sistema MUST usar mapeamentos explicitos e configuracao explicita de persistencia para novos dados operacionais.
- **FR-033**: O sistema MUST NOT usar mapeamento automatico de objetos nesta feature.

### Key Entities *(include if feature involves data)*

- **Compra**: Registro comercial de aquisicao de produtos, com estado operacional que indica criacao, transito, recebimento parcial, recebimento total, finalizacao ou cancelamento.
- **Item de Compra**: Produto e quantidade adquirida em uma compra; acompanha quantidades comprada, recebida, perdida e pendente calculada.
- **Recebimento de Item**: Evento historico que confirma entrada fisica de uma quantidade de um item de compra e gera movimentacao de entrada de estoque.
- **Perda de Item**: Evento historico que registra quantidade perdida, extraviada ou avariada de um item de compra, com motivo operacional, sem gerar estoque.
- **Movimentacao de Estoque**: Registro historico que altera saldo fisico; nesta feature, somente recebimentos confirmados criam movimentacoes de entrada.
- **Produto Pendente de Recebimento**: Visao operacional que combina produto, compra, item e quantidade pendente para acompanhamento logistico.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% das compras criadas nesta feature deixam o saldo fisico dos produtos inalterado ate que recebimentos sejam confirmados.
- **SC-002**: Em recebimentos parciais, 100% das entradas de estoque correspondem exatamente as quantidades recebidas e nunca as quantidades compradas totais.
- **SC-003**: 100% das perdas registradas reduzem pendencias sem criar entrada de estoque.
- **SC-004**: 100% das tentativas de receber ou perder quantidade acima da pendencia sao rejeitadas antes de alterar historicos ou estoque.
- **SC-005**: Operadores conseguem identificar compras em transito e produtos pendentes em menos de 2 minutos durante uma rotina operacional.
- **SC-006**: Compras totalmente resolvidas por recebimentos, perdas ou combinacao de ambos deixam de aparecer em consultas de mercadorias em transito.
- **SC-007**: Vendas, inventario inicial e dashboard financeiro existente continuam funcionando com os mesmos resultados esperados em cenarios sem mercadorias em transito.
- **SC-008**: Historicos de recebimentos e perdas permitem auditar 100% dos eventos registrados por compra e item.

## Assumptions

- O operador de compras registra a compra antes da chegada fisica dos produtos.
- O operador de estoque ou compras tem permissao para registrar recebimentos e perdas.
- Quantidades compradas, recebidas e perdidas usam a mesma unidade operacional ja usada nos itens de compra.
- Uma compra com qualquer item pendente deve ser tratada como mercadoria em transito para fins de acompanhamento.
- Uma compra sem pendencias pode estar recebida ou finalizada conforme regra operacional existente, mas nao deve mais aparecer em transito.
- Perdas, extravios e avarias fazem parte do mesmo conceito operacional de perda para esta feature, diferenciadas por motivo.
- Esta feature altera o comportamento operacional de compras e estoque, mas nao altera regras de venda, inventario inicial, saldos financeiros iniciais ou dashboard financeiro.
