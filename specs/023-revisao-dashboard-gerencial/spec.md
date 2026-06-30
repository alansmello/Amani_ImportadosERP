# Feature Specification: Revisão do Dashboard Gerencial

**Feature Branch**: `023-revisao-dashboard-gerencial`

**Created**: 2026-06-30

**Status**: Draft

**Input**: User description: "Revisar e expandir o Dashboard Gerencial com base em `docs/dashboard/relatorio-revisao-dashboard-gerencial.md`, mantendo a produção protegida em uma nova branch e registrando a feature no roadmap."

## Clarifications

### Session 2026-06-30

- Q: Quando o saldo inicial de implantação estiver dentro do período selecionado, como ele deve afetar o caixa? → A: Caixa inicial começa em zero; o saldo entra como ajuste de implantação no período e compõe o caixa final.
- Q: Se um novo indicador ainda não vier preenchido durante a transição compatível, como a interface deve apresentá-lo? → A: Exibir “Indisponível” no indicador afetado e manter as demais seções funcionando.
- Q: Qual volume deve definir o “volume operacional de referência” do critério de desempenho? → A: Até 100 mil registros em cada histórico principal.
- Q: Como tratar produtos com estoque positivo, preço de venda conhecido e custo médio ausente? → A: Incluir no valor ao preço de venda, excluir do lucro potencial calculável e informar separadamente quantidade e valor sem custo.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compreender o resultado financeiro do período (Priority: P1)

Como gestor, quero distinguir faturamento, entradas, saídas, lucro e caixa no período selecionado para tomar decisões sem confundir venda realizada com dinheiro recebido.

**Why this priority**: Essa é a finalidade central do Dashboard e corrige a principal ambiguidade da visão financeira atual.

**Independent Test**: Preparar um período com vendas à vista e a prazo, pagamentos recebidos, compras e despesas; consultar o Dashboard e conferir cada indicador contra os eventos correspondentes.

**Acceptance Scenarios**:

1. **Given** um período com vendas confirmadas e recebimentos, **When** o gestor consulta o Dashboard, **Then** faturamento considera as vendas pela data da venda e entradas consideram exclusivamente os pagamentos pela data do recebimento.
2. **Given** compras não canceladas e despesas registradas no período, **When** o Dashboard apresenta as saídas, **Then** o valor corresponde à soma desses registros e é identificado como estimativa.
3. **Given** um saldo inicial anterior ao período e movimentações financeiras antes e durante o período, **When** o Dashboard calcula o caixa, **Then** apresenta caixa inicial acumulado e caixa final igual a caixa inicial mais entradas menos saídas.
4. **Given** vendas com itens sem custo médio calculável, **When** o lucro é apresentado, **Then** esses itens são excluídos do lucro calculável e seu valor é informado como não calculável.
5. **Given** um saldo inicial de implantação datado dentro do período, **When** o Dashboard calcula o caixa, **Then** o caixa inicial do período permanece zero e o saldo compõe o caixa final como ajuste de implantação separado das entradas operacionais.

---

### User Story 2 - Avaliar recebíveis e patrimônio operacional (Priority: P2)

Como gestor, quero saber quanto tenho a receber, quanto vale o estoque disponível e qual é o valor realista e potencial da operação para avaliar a posição atual do negócio.

**Why this priority**: Esses indicadores complementam o fluxo do período com uma visão patrimonial necessária para planejamento.

**Independent Test**: Preparar recebíveis vencidos e a vencer, estoque recebido, mercadoria em trânsito e produtos com e sem custo médio; conferir os totais na data de referência.

**Acceptance Scenarios**:

1. **Given** contas com saldo em aberto vencidas e a vencer, **When** o gestor consulta a data de referência, **Then** visualiza os dois grupos e sua soma coincide com o total de recebíveis em aberto, respeitado o arredondamento monetário.
2. **Given** produtos com saldo disponível e custo médio, **When** o Dashboard valoriza o estoque, **Then** apresenta valor ao custo, valor ao preço de venda atual e lucro potencial.
3. **Given** mercadorias ainda em trânsito, **When** o estoque é valorizado, **Then** essas mercadorias não compõem o saldo disponível nem os valores patrimoniais.
4. **Given** caixa final, recebíveis e estoque valorizado, **When** a visão geral é exibida, **Then** o valor realista usa estoque ao custo e o valor potencial usa estoque ao preço de venda atual.
5. **Given** produto com estoque positivo, preço de venda conhecido e custo médio ausente, **When** o estoque é valorizado, **Then** seu valor de venda integra o potencial da operação, seu lucro potencial não é calculado e a quantidade e o valor afetados são informados separadamente.

---

### User Story 3 - Interpretar indicadores sem ambiguidade (Priority: P3)

Como gestor, quero rótulos e mensagens que expliquem a natureza dos valores para diferenciar competência, caixa, estimativa, posição atual e potencial de venda.

**Why this priority**: Um número correto com semântica ambígua ainda pode induzir decisões erradas.

**Independent Test**: Consultar períodos com e sem dados e verificar se cada indicador e estado vazio comunica sua fonte, referência temporal e limitação relevante.

**Acceptance Scenarios**:

1. **Given** qualquer período válido, **When** os indicadores são exibidos, **Then** faturamento, entradas, saídas estimadas, recebíveis, estoque ao custo e valor potencial têm rótulos distintos e inequívocos.
2. **Given** uma série sem pontos, **When** a seção de gráfico é exibida, **Then** o gestor recebe uma mensagem simples de ausência de dados ou de movimentações suficientes.
3. **Given** falha ou ausência de dados em uma seção, **When** as demais fontes possuem dados válidos, **Then** as demais seções continuam utilizáveis.
4. **Given** que um indicador novo não foi preenchido durante a transição compatível, **When** o Dashboard é exibido, **Then** somente esse indicador mostra “Indisponível” e nenhum valor zero é presumido.

---

### User Story 4 - Consultar uma visão gerencial objetiva em qualquer tela (Priority: P4)

Como gestor, quero um Dashboard enxuto e responsivo para localizar os indicadores principais rapidamente em smartphone, tablet ou desktop.

**Why this priority**: A consulta gerencial ocorre em mobilidade e não deve ser prejudicada por rankings e alertas operacionais excessivos.

**Independent Test**: Abrir o Dashboard nos três portes de tela, aplicar cada modalidade de filtro e validar leitura, ordem e interação sem rolagem horizontal da página.

**Acceptance Scenarios**:

1. **Given** smartphone, tablet ou desktop, **When** o Dashboard é aberto, **Then** filtros, indicadores, resumos e gráficos permanecem legíveis e operáveis.
2. **Given** alertas existentes, **When** a página principal é exibida, **Then** mostra somente um resumo por total, criticidade e tipo.
3. **Given** rankings existentes, **When** a página principal é exibida, **Then** os rankings de maior e menor estoque não ocupam a visão principal.

### Edge Cases

- Período sem vendas, pagamentos, compras ou despesas deve produzir valores zerados e estados vazios compreensíveis, nunca erro de cálculo.
- Saldo inicial com data dentro do período não compõe o caixa inicial, mas entra como ajuste de implantação no período e compõe o caixa final; saldo com data posterior ao fim do período é ignorado.
- Ausência de saldo inicial declarado deve usar zero como marco inicial, sem inventar entrada financeira.
- Compras canceladas não compõem saídas nem o acumulado de caixa.
- Pagamento de venda a prazo entra no período da data do pagamento, não da venda.
- Produto com saldo positivo e sem custo médio fica fora do valor de estoque ao custo e do lucro potencial calculável, mas integra o valor ao preço de venda; sua quantidade e seu valor de venda devem ser informados separadamente como itens sem custo calculável.
- Saldo negativo de estoque, se encontrado em dados legados, não é valorizado como ativo e deve ser sinalizado para correção operacional.
- Diferenças monetárias de arredondamento entre recebíveis abertos e seus dois grupos devem respeitar a precisão monetária oficial.
- Troca rápida de filtro não pode exibir resposta pertencente ao filtro anterior.
- Campo ausente ou sem valor em indicador novo durante a transição deve ser tratado como indisponibilidade, não como valor monetário zero.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST manter o filtro atual por mês, ano e intervalo personalizado, aplicando o mesmo período a todas as seções filtráveis.
- **FR-002**: O sistema MUST calcular o faturamento com vendas não canceladas pela data da venda e MUST distingui-lo visualmente de entradas de caixa.
- **FR-003**: O sistema MUST calcular entradas do período exclusivamente com valores efetivamente recebidos cuja data de pagamento pertença ao período.
- **FR-004**: O sistema MUST calcular saídas do período como compras não canceladas registradas mais despesas por competência no período, identificando o resultado como estimativa.
- **FR-005**: O sistema MUST excluir despesas de operadora do indicador de saídas nesta feature até que sua inclusão seja validada em decisão financeira específica.
- **FR-006**: O sistema MUST calcular o caixa inicial com saldo inicial e movimentações anteriores ao início do período, considerando entradas recebidas e subtraindo compras não canceladas e despesas anteriores.
- **FR-007**: O sistema MUST calcular o caixa final como caixa inicial mais ajuste de implantação ocorrido no período mais entradas do período menos saídas do período; o ajuste MUST NOT ser classificado como pagamento recebido.
- **FR-008**: O sistema MUST manter o cálculo conservador de lucro bruto, sem usar custo cadastral como substituto quando não houver custo médio derivado de entradas reais.
- **FR-009**: O sistema MUST informar separadamente o valor e a quantidade de itens cujo lucro não pode ser calculado.
- **FR-010**: O sistema MUST apresentar recebíveis em aberto como posição acumulada até a data de referência, independentemente do início do filtro.
- **FR-011**: O sistema MUST dividir os recebíveis em vencidos e a vencer usando a data de vencimento e MUST permitir verificar que ambos recompõem o total em aberto.
- **FR-012**: O sistema MUST calcular saldo de estoque exclusivamente a partir do histórico de entradas, inventário inicial e saídas até a data de referência.
- **FR-013**: O sistema MUST excluir mercadorias em trânsito da quantidade disponível e da valorização de estoque.
- **FR-014**: O sistema MUST apresentar estoque ao custo médio, estoque ao preço de venda atual e lucro potencial, distinguindo valores realizados de potenciais; produto sem custo médio MUST integrar o valor ao preço de venda, MUST ser excluído do lucro potencial calculável e MUST ter quantidade e valor de venda informados separadamente.
- **FR-015**: O sistema MUST calcular o valor realista da operação como caixa final mais recebíveis em aberto mais estoque ao custo.
- **FR-016**: O sistema MUST calcular o valor potencial da operação como caixa final mais recebíveis em aberto mais estoque ao preço de venda atual.
- **FR-017**: Todas as métricas gerenciais MUST ser produzidas pela fonte central de regras do sistema; a interface MUST apenas apresentar e formatar os resultados.
- **FR-018**: O sistema MUST preservar os indicadores e consumidores existentes por evolução aditiva, sem remover ou mudar silenciosamente o significado de dados já publicados.
- **FR-019**: Falha, carregamento ou ausência de dados em uma seção MUST NOT impedir a consulta das demais seções disponíveis; indicador novo sem valor durante a transição MUST exibir “Indisponível” e MUST NOT assumir zero.
- **FR-020**: O Dashboard MUST substituir mensagens técnicas de série vazia por mensagens operacionais compreensíveis.
- **FR-021**: O Dashboard principal MUST reduzir alertas a um resumo com total, criticidade e tipo.
- **FR-022**: O Dashboard principal MUST remover da sua composição os rankings de produtos com maior e menor estoque, preservando os demais rankings aprovados.
- **FR-023**: O Dashboard MUST funcionar em smartphone, tablet e desktop, mantendo leitura, filtros e ações sem rolagem horizontal da página.
- **FR-024**: Consultas gerenciais MUST usar agregações, filtros e limites adequados a até 100 mil registros em cada histórico principal, sem depender do carregamento integral do histórico operacional em memória.

### Scope Boundaries

Ficam fora desta feature: contas a pagar e fluxo de caixa por pagamentos reais de compras; inclusão de despesas de operadora nas saídas; alteração de desconto ou acréscimo de compras; congelamento de custo histórico em itens vendidos; remoção de contratos ou consultas legadas; novo gráfico de entradas versus saídas; tela dedicada de alertas; mudança dos limites dos alertas; exportação e drill-down avançado.

### Key Entities *(include if feature involves data)*

- **Período gerencial**: intervalo selecionado, com data inicial, data final e data de referência usadas de forma consistente pelos indicadores.
- **Resumo financeiro gerencial**: faturamento, entradas, saídas estimadas, ajuste de implantação no período, caixa inicial e final, lucro calculável e parcela não calculável.
- **Recebível**: obrigação de cliente com valor original, pagamentos, saldo, vencimento e classificação entre vencido e a vencer.
- **Posição de estoque**: quantidade disponível por produto derivada das movimentações até a data de referência, separada de mercadorias em trânsito.
- **Valorização de estoque**: valores consolidados ao custo médio e ao preço atual de venda, lucro potencial restrito aos produtos com custo calculável e quantidade e valor de venda separados para produtos sem custo médio.
- **Valor da operação**: composição realista e potencial formada por caixa, recebíveis e estoque.
- **Resumo de alertas**: contagem consolidada por severidade e tipo para a visão principal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários financeiros de referência, faturamento, entradas, saídas, caixa inicial e caixa final coincidem com as regras oficiais e não apresentam dupla contagem.
- **SC-002**: Em 100% dos cenários de recebíveis, a soma de vencidos e a vencer coincide com o total em aberto dentro da precisão monetária oficial.
- **SC-003**: Em 100% dos cenários de estoque, mercadorias em trânsito ficam fora do saldo valorizado e produtos sem custo calculável não recebem custo presumido, permanecendo identificados por quantidade e valor de venda fora do lucro potencial calculável.
- **SC-004**: Pelo menos 95% das consultas do Dashboard, com até 100 mil registros em cada histórico principal de vendas, pagamentos, compras, despesas, recebíveis e movimentações de estoque, exibem cada seção disponível em até 3 segundos.
- **SC-005**: Gestores conseguem identificar faturamento, entrada de caixa, saída estimada, caixa final, recebíveis, estoque e valor da operação em até 30 segundos em validação manual orientada.
- **SC-006**: 100% dos indicadores novos exibem rótulo que identifica corretamente competência, caixa, estimativa, data de referência ou potencial, conforme aplicável.
- **SC-007**: O Dashboard conclui o roteiro funcional em smartphone, tablet e desktop sem rolagem horizontal da página e sem perda de acesso aos filtros.
- **SC-008**: Todos os indicadores e fluxos atualmente consumidos continuam disponíveis e corretos após a expansão.

## Assumptions

- O relatório técnico de 29/06/2026 é a fonte aprovada para regras de cálculo e limites desta especificação.
- Compras e despesas registradas são uma aproximação declarada de saídas até existir um módulo de contas a pagar.
- Despesas de operadora permanecem fora das saídas desta feature; sua inclusão exige validação financeira posterior.
- O saldo inicial compõe o caixa inicial quando sua data é anterior ao período; quando ocorre dentro do período, compõe somente o caixa final como ajuste de implantação separado das entradas operacionais.
- A divergência conhecida entre o lucro exibido na venda e o lucro conservador do Dashboard permanece documentada e não será corrigida por fallback de custo.
- Os filtros, rankings gerenciais restantes, gráficos existentes e estados independentes por seção serão preservados.
- A F023 não criará projeto, framework, dependência ou infraestrutura de testes unitários ou de integração.
- A validação será feita por compilação, lint, verificação de tipos e roteiro manual dos cálculos, contratos, falhas parciais, desempenho e responsividade.
- A feature depende da qualidade e integridade dos registros existentes de vendas, pagamentos, compras, despesas, recebíveis, produtos, saldo inicial e movimentações de estoque.
- A identidade visual oficial Dark Theme e o Design System atual continuam obrigatórios.
