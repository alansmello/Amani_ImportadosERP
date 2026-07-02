# Feature Specification: Consistência de Compras em Trânsito e Limpeza do Dashboard Gerencial

**Feature Branch**: `026-consistencia-compras-transito`

**Created**: 2026-07-02

**Status**: Draft

**Input**: User description: "Padronizar os totais oficiais de compra, representar separadamente as mercadorias em trânsito no dashboard, corrigir valores ausentes na consulta de compras e retirar da home blocos de alertas e incompletudes que ainda não oferecem ação operacional."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar um total oficial consistente da compra (Priority: P1)

Como responsável por compras e gestão, quero encontrar o mesmo total comercial para uma compra em todas as consultas, para tomar decisões sem precisar reconciliar valores divergentes.

**Why this priority**: A divergência afeta diretamente a confiança nos registros de compra e alimenta valores gerenciais incorretos.

**Independent Test**: Pode ser testada registrando uma compra com dois itens, ajustes por item e ajustes gerais e comparando seu total na listagem, no detalhe e na visão de compras em trânsito.

**Acceptance Scenarios**:

1. **Given** uma compra com itens e ajustes comerciais, **When** o usuário a consulta na listagem, no detalhe e na visão em trânsito, **Then** todas as visões apresentam o mesmo total oficial.
2. **Given** uma compra sem recebimento, **When** seu valor em trânsito é consultado, **Then** o valor ao custo corresponde integralmente ao total oficial da compra.
3. **Given** uma compra parcialmente recebida ou encerrada parcialmente por perda, **When** seu valor em trânsito é consultado, **Then** somente a parcela comercial correspondente às quantidades ainda pendentes é considerada.
4. **Given** uma compra cujos valores não podem ser determinados por dados inválidos ou ausentes, **When** o usuário a consulta, **Then** o sistema apresenta o motivo real da indisponibilidade e não substitui o valor por zero.

---

### User Story 2 - Visualizar mercadorias em trânsito no patrimônio operacional (Priority: P2)

Como responsável pela gestão, quero visualizar separadamente o valor de custo e o valor de venda atual das mercadorias em trânsito, para compreender o capital comprometido sem confundi-lo com estoque fisicamente disponível.

**Why this priority**: Mercadorias compradas e ainda não recebidas têm relevância patrimonial, mas não podem inflar saldo disponível nem custo médio.

**Independent Test**: Pode ser testada com uma compra totalmente pendente e outra parcialmente recebida, conferindo os dois indicadores de trânsito e os valores realista e potencial da operação.

**Acceptance Scenarios**:

1. **Given** mercadorias com quantidades pendentes, **When** o dashboard é consultado, **Then** ele apresenta cards distintos para trânsito ao custo e trânsito ao preço de venda atual.
2. **Given** mercadorias parcialmente recebidas, **When** o dashboard é consultado, **Then** o estoque disponível considera somente o recebido e os cards de trânsito consideram somente o pendente.
3. **Given** caixa final, recebíveis, estoque disponível e trânsito, **When** o valor realista é exibido, **Then** ele corresponde à soma do caixa final, recebíveis em aberto, estoque disponível ao custo e trânsito ao custo.
4. **Given** os mesmos componentes patrimoniais, **When** o valor potencial é exibido, **Then** ele corresponde à soma do caixa final, recebíveis em aberto, estoque disponível ao preço de venda atual e trânsito ao preço de venda atual.

---

### User Story 3 - Consultar compras sem valores artificiais (Priority: P3)

Como responsável pela operação, quero que a tela de compras mostre os valores reais disponíveis em qualquer visão, para não interpretar ausência de contrato como compra sem valor.

**Why this priority**: A mensagem “Valor não informado” é causada por inconsistência entre consultas e prejudica o acompanhamento cotidiano das compras em trânsito.

**Independent Test**: Pode ser testada alternando entre a visão padrão, uma visão filtrada e a visão em trânsito para as mesmas compras e verificando que seus valores permanecem disponíveis e coerentes.

**Acceptance Scenarios**:

1. **Given** uma compra válida com valor calculável, **When** ela aparece na visão padrão, filtrada ou em trânsito, **Then** o valor oficial correspondente é exibido.
2. **Given** que uma consulta não forneça valor calculável, **When** a compra é apresentada, **Then** a interface não inventa valor zero nem transforma a ausência em uma mensagem genérica sem causa.

---

### User Story 4 - Ler um dashboard mais objetivo (Priority: P4)

Como responsável pela gestão, quero que a home priorize indicadores confiáveis e acionáveis, para reduzir ruído visual enquanto regras de alertas e incompletudes ainda não estão maduras.

**Why this priority**: Os blocos atuais ocupam espaço sem permitir identificar ou corrigir diretamente os casos apresentados.

**Independent Test**: Pode ser testada abrindo o dashboard e verificando a ausência dos blocos removidos e a permanência dos demais indicadores gerenciais.

**Acceptance Scenarios**:

1. **Given** o dashboard gerencial, **When** a home é carregada, **Then** o resumo de alertas, seu contador e seus agrupamentos por severidade e tipo não são exibidos.
2. **Given** o dashboard gerencial, **When** a home é carregada, **Then** os blocos “Estoque com lacunas de custo” e “Dados financeiros incompletos” não são exibidos.
3. **Given** a remoção desses blocos, **When** o usuário consulta o dashboard em smartphone, tablet ou desktop, **Then** os indicadores restantes mantêm leitura clara e sem espaços vazios incoerentes.

### Edge Cases

- Uma compra possui desconto e acréscimo em itens e também ajustes gerais.
- Uma compra está totalmente pendente, parcialmente recebida, parcialmente perdida ou sem qualquer quantidade pendente.
- Um item tem quantidade pendente fracionária por compatibilidade com evoluções já aprovadas, embora compras continuem registradas na unidade principal.
- Arredondamentos proporcionais produzem diferença de centavos entre parcelas; a soma das parcelas deve recompor exatamente o total oficial.
- A soma dos valores líquidos dos itens é inválida para rateio proporcional; o sistema deve recusar um valor enganoso e explicitar a inconsistência.
- A relação com o produto ou seu preço de venda atual está inconsistente; o indicador potencial deve ficar indisponível com motivo explícito, enquanto preço cadastrado igual a zero continua sendo um valor legítimo.
- Uma consulta do dashboard falha enquanto outras respondem; as seções independentes devem continuar disponíveis.
- Não existem mercadorias em trânsito no período ou na posição consultada; os cards devem apresentar estado zerado legítimo, sem confundi-lo com valor indisponível.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST adotar uma única regra oficial de total de compra em todas as consultas operacionais e gerenciais.
- **FR-002**: O valor bruto de cada item MUST corresponder à quantidade comprada multiplicada pelo custo unitário.
- **FR-003**: O valor líquido de cada item MUST corresponder ao valor bruto menos o desconto do item mais o acréscimo do item.
- **FR-004**: O total oficial da compra MUST corresponder à soma dos valores líquidos dos itens menos o desconto geral mais o acréscimo geral.
- **FR-005**: Desconto e acréscimo gerais MUST ser rateados entre os itens proporcionalmente ao valor líquido de cada item antes dos ajustes gerais.
- **FR-006**: O rateio MUST preservar o total oficial em moeda; eventual diferença de arredondamento MUST ser absorvida de forma determinística por uma parcela elegível.
- **FR-007**: O valor ao custo pendente de um item MUST considerar seu valor líquido, sua parcela dos ajustes gerais e a proporção entre quantidade pendente e quantidade comprada.
- **FR-008**: Quantidade pendente MUST excluir quantidades já recebidas e quantidades encerradas por perda, extravio ou avaria.
- **FR-009**: A soma dos valores pendentes dos itens MUST representar o valor ao custo das mercadorias em trânsito da compra.
- **FR-010**: A listagem de compras, o detalhe da compra, a visão de compras em trânsito e o dashboard MUST consumir resultados produzidos pela mesma regra oficial.
- **FR-011**: A fonte oficial do sistema MUST fornecer às interfaces os valores necessários; a apresentação MUST NOT criar total zero para compensar valor ausente.
- **FR-012**: Quando um valor não puder ser calculado, o sistema MUST distinguir indisponibilidade de um zero legítimo e MUST apresentar motivo operacional compreensível. Se o custo oficial do trânsito estiver incompleto, o card de custo e o valor realista MUST ficar indisponíveis, enquanto o subtotal legado calculável MUST ser marcado como incompleto; valor de venda e valor potencial MAY permanecer disponíveis quando seus próprios dados forem válidos.
- **FR-013**: O dashboard MUST apresentar “Mercadorias em trânsito ao valor de custo” como indicador separado do estoque disponível ao custo.
- **FR-014**: O dashboard MUST apresentar “Mercadorias em trânsito ao valor de venda” usando a quantidade pendente e o preço de venda atual do produto.
- **FR-015**: Mercadorias em trânsito MUST NOT compor estoque disponível, movimentações de entrada ou custo médio.
- **FR-016**: O valor realista da operação MUST corresponder a caixa final mais recebíveis em aberto mais estoque disponível ao custo mais mercadorias em trânsito ao custo.
- **FR-017**: O valor potencial da operação MUST corresponder a caixa final mais recebíveis em aberto mais estoque disponível ao preço de venda atual mais mercadorias em trânsito ao preço de venda atual.
- **FR-018**: O dashboard MUST manter estoque disponível ao custo e ao preço de venda restrito a quantidades fisicamente recebidas e ainda disponíveis.
- **FR-019**: A home do dashboard MUST remover o resumo de alertas, o contador agregado e os agrupamentos por severidade e tipo.
- **FR-020**: A home do dashboard MUST remover os blocos “Estoque com lacunas de custo” e “Dados financeiros incompletos”.
- **FR-021**: A remoção visual dos blocos MUST NOT ser interpretada como exclusão definitiva das necessidades correspondentes; elas MUST permanecer registradas como dívida técnica futura.
- **FR-022**: A dívida técnica MUST incluir limite mínimo configurável por produto, cálculo de estoque baixo baseado nesse limite e alertas acionáveis com acesso ao contexto de produto, estoque ou compra.
- **FR-023**: A dívida técnica MUST incluir o refinamento das regras, do contexto e das ações possíveis para lacunas de custo e dados financeiros incompletos.
- **FR-024**: A feature MUST NOT criar tela de alertas, configuração de estoque mínimo, contas a pagar ou novas funções operacionais de compra.
- **FR-025**: Registrar compra MUST continuar sem gerar estoque; somente recebimento físico confirmado MUST gerar entrada e influenciar custo médio.
- **FR-026**: Perdas, extravios e avarias MUST continuar sem gerar entrada de estoque.
- **FR-027**: A feature MUST preservar histórico existente e MUST NOT exigir recálculo destrutivo de compras passadas.
- **FR-028**: A feature MUST permanecer independente do refinamento visual da nova compra e das apresentações comerciais fracionadas.
- **FR-029**: O dashboard e a consulta de compras MUST manter a identidade visual oficial e ser utilizáveis em smartphone, tablet e desktop.
- **FR-030**: Antes de qualquer implementação, o estado atual dos cálculos, os contratos afetados, a regra de rateio e o roteiro manual MUST ser documentados e submetidos à aprovação explícita do responsável pelo produto.
- **FR-031**: O roadmap MUST ser atualizado ao final da fase Specify e novamente ao término da futura implementação para registrar o estado real da feature.

### Key Entities

- **Compra**: operação comercial composta por itens, desconto geral e acréscimo geral, com um único total oficial.
- **Item de compra**: produto, quantidade comprada, custo unitário e ajustes próprios usados para formar o valor líquido do item.
- **Quantidade pendente**: parcela da quantidade comprada ainda não encerrada por recebimento físico ou perda.
- **Parcela pendente ao custo**: participação comercial do item que continua em trânsito após rateio dos ajustes gerais.
- **Mercadoria em trânsito**: conjunto de quantidades pendentes, valorizado separadamente ao custo da compra e ao preço de venda atual.
- **Valor realista da operação**: posição composta por caixa final, recebíveis em aberto, estoque disponível ao custo e trânsito ao custo.
- **Valor potencial da operação**: posição composta por caixa final, recebíveis em aberto, estoque disponível e trânsito valorizados ao preço de venda atual.
- **Dívida técnica de alertas**: necessidades adiadas de limite mínimo por produto, alertas acionáveis e refinamento de incompletudes gerenciais.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para 100% das compras válidas verificadas, listagem, detalhe e visão em trânsito apresentam o mesmo total oficial.
- **SC-002**: Para uma compra totalmente pendente, o valor em trânsito ao custo recompõe exatamente 100% do total oficial.
- **SC-003**: Para compras parcialmente recebidas ou parcialmente encerradas por perda, o valor em trânsito inclui 100% e somente das parcelas ainda pendentes, com diferença máxima de zero centavo após o fechamento do rateio.
- **SC-004**: Nenhuma visão de compra apresenta zero ou “Valor não informado” apenas porque sua consulta original omitiu o total calculável.
- **SC-005**: Os quatro indicadores patrimoniais — trânsito ao custo, trânsito ao preço de venda, valor realista e valor potencial — conferem com suas fórmulas oficiais em 100% dos cenários manuais definidos.
- **SC-006**: Em 100% dos cenários de regressão, mercadoria em trânsito permanece fora do estoque disponível e do custo médio até o recebimento físico.
- **SC-007**: A home não apresenta nenhum dos seis elementos retirados: resumo de alertas, contador, agrupamento por severidade, agrupamento por tipo e os dois blocos de incompletude.
- **SC-008**: O dashboard continua utilizável sem rolagem horizontal da página e com leitura completa dos indicadores em smartphone, tablet e desktop.
- **SC-009**: Zero registro histórico de compra, recebimento, perda ou movimentação é alterado destrutivamente pela entrega.
- **SC-010**: Antes da implementação, 100% dos cálculos atuais e contratos afetados estão inventariados e o roteiro manual cobre compra sem recebimento, recebimento parcial, perda parcial, ausência de trânsito e indisponibilidade real de valor.
- **SC-011**: Em uma massa representativa do volume atual do ERP, ao menos 9 de 10 carregamentos repetidos de cada seção de compras e patrimônio apresentam o resultado em até 2 segundos, sem carregar o histórico integral em memória.

## Assumptions

- Os usuários-alvo são os mesmos responsáveis autenticados que hoje consultam compras e o dashboard gerencial.
- O valor líquido do item antes dos ajustes gerais é a base proporcional do rateio; compras cuja base não permita rateio válido devem ser tratadas como inconsistentes, sem valor inventado.
- O fechamento monetário do rateio preserva exatamente o total da compra e usa uma regra determinística para eventual centavo residual, a ser documentada na fase de planejamento.
- O valor de venda das mercadorias em trânsito usa o preço de venda vigente no momento da consulta, não um snapshot histórico da compra.
- O cadastro normal sempre fornece preço de venda não negativo; preço zero é legítimo. Ausência da relação com o produto ou do preço esperado caracteriza inconsistência de dados e torna o valor potencial indisponível com motivo explícito, sem recriar na home o bloco removido.
- As consultas de posição patrimonial usam a mesma data de referência já adotada pelo dashboard gerencial.
- Não será criada infraestrutura nova de testes automatizados sem autorização específica; a validação obrigatória será detalhada em roteiro manual nas fases posteriores.
- Esta especificação autoriza somente análise, documentação e planejamento. A implementação permanece condicionada à aprovação explícita após a análise técnica.
