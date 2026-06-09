# Feature Specification: Dashboards Gerenciais

**Feature Branch**: `004-dashboards-gerenciais`

**Created**: 2026-06-08

**Status**: Draft

**Input**: User description: "Transformar os dados operacionais e financeiros em informacoes gerenciais para apoio a tomada de decisao. Definir dashboards financeiro e operacional com indicadores, filtros por periodo, mes e ano, metricas, formulas de calculo, rankings, alertas, graficos, contratos de API, regras de negocio e criterios de aceitacao completos, sem definir implementacao."

## Governance Note

Esta feature especifica indicadores gerenciais sobre dados financeiros, compras, recebimentos, perdas, vendas e estoque. As regras devem respeitar a Constituicao 2.0.0: estoque disponivel e calculado exclusivamente por movimentacoes historicas; compras registradas representam impacto financeiro e mercadorias em transito ate recebimento fisico; perdas nao geram estoque; lucro usa custo medio derivado apenas de entradas reais em estoque.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Acompanhar resultado financeiro (Priority: P1)

Como gestor financeiro, quero visualizar indicadores consolidados de receita, lucro, compras, despesas, saldo operacional, contas a receber abertas e valores recebidos para entender a saude financeira do ERP no periodo selecionado.

**Why this priority**: O dashboard financeiro entrega o principal objetivo da feature: transformar registros financeiros e comerciais em informacao gerencial para decisao.

**Independent Test**: Informar um periodo com vendas, compras, despesas, contas a receber e recebimentos conhecidos e verificar que cada indicador exibe os valores calculados conforme as formulas da specification.

**Acceptance Scenarios**:

1. **Given** existem vendas, compras, despesas e recebimentos registrados no periodo, **When** o gestor consulta o dashboard financeiro, **Then** o sistema apresenta receita total, lucro total, total de compras, total de despesas, saldo operacional, contas a receber abertas e valores recebidos.
2. **Given** o gestor seleciona mes e ano especificos, **When** os indicadores financeiros sao recalculados, **Then** todos os totais consideram somente registros pertencentes ao filtro selecionado.
3. **Given** nao ha registros financeiros no periodo selecionado, **When** o dashboard financeiro e consultado, **Then** todos os indicadores monetarios retornam zero e o dashboard permanece compreensivel.

---

### User Story 2 - Acompanhar operacao e estoque (Priority: P1)

Como gestor operacional, quero visualizar produtos cadastrados, estoque disponivel, mercadorias em transito, compras em aberto, produtos pendentes de recebimento, perdas, vendas e compras para identificar gargalos operacionais e disponibilidade real.

**Why this priority**: Indicadores operacionais sustentam decisoes de compra, recebimento, reposicao e controle de estoque, mantendo alinhamento com as regras de mercadorias em transito.

**Independent Test**: Consultar o dashboard operacional com cadastros, movimentacoes de estoque, compras abertas, recebimentos parciais, perdas e vendas conhecidos e conferir os totais esperados.

**Acceptance Scenarios**:

1. **Given** existem produtos ativos e movimentacoes historicas de estoque, **When** o dashboard operacional e consultado, **Then** produtos cadastrados e estoque disponivel refletem os cadastros e o saldo por movimentacoes.
2. **Given** existem compras ainda nao totalmente resolvidas, **When** o gestor consulta os indicadores operacionais, **Then** mercadorias em transito, compras em aberto e produtos pendentes de recebimento refletem as quantidades pendentes.
3. **Given** existem perdas, vendas e compras no periodo, **When** filtros de periodo, mes ou ano sao aplicados, **Then** perdas registradas, quantidade de vendas e quantidade de compras sao filtradas pelo periodo selecionado.

---

### User Story 3 - Comparar rankings gerenciais (Priority: P2)

Como gestor comercial e operacional, quero rankings de produtos mais vendidos, mais lucrativos, com maior estoque e com menor estoque para priorizar compras, vendas, promocao e reposicao.

**Why this priority**: Rankings transformam dados detalhados em comparacoes acionaveis, mas dependem de indicadores basicos corretos.

**Independent Test**: Usar um conjunto conhecido de produtos com vendas, custos medios e saldos diferentes e verificar a ordenacao e os valores de cada ranking.

**Acceptance Scenarios**:

1. **Given** produtos tiveram vendas no periodo, **When** o ranking de produtos mais vendidos e consultado, **Then** os produtos aparecem em ordem decrescente de quantidade vendida.
2. **Given** produtos tiveram lucro calculavel no periodo, **When** o ranking de produtos mais lucrativos e consultado, **Then** os produtos aparecem em ordem decrescente de lucro total.
3. **Given** produtos possuem saldos de estoque diferentes, **When** rankings de maior e menor estoque sao consultados, **Then** a ordenacao usa estoque disponivel calculado por movimentacoes.

---

### User Story 4 - Monitorar alertas operacionais (Priority: P2)

Como gestor operacional, quero alertas de estoque baixo, produtos sem movimentacao, compras em transito ha muito tempo e perdas recorrentes para agir antes que a operacao seja prejudicada.

**Why this priority**: Alertas reduzem a necessidade de analise manual e destacam situacoes que exigem decisao imediata.

**Independent Test**: Criar cenarios com produtos abaixo do minimo, sem movimentacao, compras antigas em transito e perdas repetidas, e verificar que cada alerta aparece com motivo e dados de suporte.

**Acceptance Scenarios**:

1. **Given** um produto possui estoque disponivel abaixo do limite definido para alerta, **When** alertas operacionais sao consultados, **Then** o produto aparece em estoque baixo.
2. **Given** um produto nao possui movimentacoes dentro da janela de inatividade definida, **When** alertas sao consultados, **Then** o produto aparece como sem movimentacao.
3. **Given** uma compra esta em transito por mais dias que o limite definido, **When** alertas sao consultados, **Then** a compra aparece como em transito ha muito tempo.
4. **Given** um produto teve perdas recorrentes dentro da janela definida, **When** alertas sao consultados, **Then** o produto aparece com alerta de perdas recorrentes.

---

### User Story 5 - Analisar graficos gerenciais (Priority: P3)

Como gestor, quero graficos de receita, lucro, compras, despesas por categoria e evolucao do estoque para entender tendencias ao longo do tempo.

**Why this priority**: Graficos melhoram analise temporal e comparativa, mas dependem dos indicadores, formulas e filtros ja definidos.

**Independent Test**: Consultar graficos com dados distribuidos em diferentes datas e categorias e verificar que series, periodos e totais correspondem aos registros filtrados.

**Acceptance Scenarios**:

1. **Given** existem vendas em diferentes datas, **When** o grafico de receita por periodo e consultado, **Then** a serie apresenta a receita agrupada conforme o intervalo selecionado.
2. **Given** existem vendas com custo medio calculavel, **When** o grafico de lucro por periodo e consultado, **Then** a serie apresenta lucro por intervalo de tempo.
3. **Given** existem compras e despesas categorizadas, **When** graficos de compras por periodo e despesas por categoria sao consultados, **Then** os valores sao agrupados corretamente.
4. **Given** existem movimentacoes de estoque em diferentes datas, **When** o grafico de evolucao do estoque e consultado, **Then** a serie representa a variacao do estoque disponivel ao longo do tempo.

---

### Edge Cases

- Periodo sem dados deve retornar indicadores zerados, rankings vazios, graficos com series vazias e nenhum erro para o usuario.
- Filtro por periodo, mes e ano deve produzir resultados consistentes quando representar a mesma janela de datas.
- Vendas canceladas, estornadas ou nao confirmadas nao devem compor receita, lucro ou quantidade de vendas.
- Compras canceladas nao devem compor total de compras, compras em aberto, mercadorias em transito ou produtos pendentes.
- Compras registradas, mas ainda nao recebidas, devem compor total de compras financeiro e mercadorias em transito operacional, mas nao estoque disponivel.
- Recebimentos parciais devem aumentar estoque disponivel somente pela quantidade recebida e manter a quantidade restante em transito.
- Perdas devem reduzir pendencia operacional, nao aumentar estoque e compor indicadores e alertas de perdas.
- Produtos sem custo medio disponivel devem ter lucro calculado conforme regra de custo ausente definida nesta specification.
- Produtos inativos devem ser tratados conforme a regra do indicador: contam no total cadastrado se o indicador incluir cadastros historicos, mas devem ser separados de alertas de reposicao quando nao estao disponiveis para venda.
- Valores monetarios negativos por estorno, ajuste ou devolucao devem reduzir os totais correspondentes no periodo em que o evento foi registrado.
- Empates em rankings devem ter criterio de desempate estavel para evitar ordenacao inconsistente.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST disponibilizar um dashboard financeiro com indicadores de receita total, lucro total, total de compras, total de despesas, saldo operacional, contas a receber abertas e valores recebidos.
- **FR-002**: O sistema MUST permitir filtrar o dashboard financeiro por periodo customizado, mes e ano.
- **FR-003**: O sistema MUST calcular receita total como a soma dos valores de vendas confirmadas no periodo filtrado, descontando cancelamentos, estornos ou devolucoes registrados no mesmo criterio de apuracao.
- **FR-004**: O sistema MUST calcular lucro total como receita liquida de vendas menos custo dos produtos vendidos e perdas operacionais aplicaveis ao periodo.
- **FR-005**: O sistema MUST calcular custo dos produtos vendidos usando custo medio do produto derivado somente de entradas reais em estoque, incluindo inventario inicial valorizado e recebimentos fisicos confirmados.
- **FR-006**: O sistema MUST tratar venda de produto sem custo medio disponivel como lucro nao calculavel para esse item e indicar a pendencia de custo no resultado gerencial, sem inventar custo.
- **FR-007**: O sistema MUST calcular total de compras como a soma do valor comercial de compras registradas e nao canceladas no periodo financeiro filtrado.
- **FR-008**: O sistema MUST calcular total de despesas como a soma das despesas registradas e nao canceladas no periodo filtrado.
- **FR-009**: O sistema MUST calcular saldo operacional como receita recebida no periodo menos compras consideradas no periodo menos despesas consideradas no periodo.
- **FR-010**: O sistema MUST calcular contas a receber abertas como a soma dos valores pendentes de recebimento ate a data final do filtro.
- **FR-011**: O sistema MUST calcular valores recebidos como a soma dos pagamentos ou baixas de recebimento confirmados no periodo filtrado.
- **FR-012**: O sistema MUST disponibilizar um dashboard operacional com indicadores de produtos cadastrados, estoque disponivel, mercadorias em transito, compras em aberto, produtos pendentes de recebimento, perdas registradas, quantidade de vendas e quantidade de compras.
- **FR-013**: O sistema MUST permitir filtrar o dashboard operacional por periodo customizado, mes e ano para indicadores baseados em eventos.
- **FR-014**: O sistema MUST calcular produtos cadastrados como a contagem de produtos existentes no cadastro conforme o escopo de status definido para consulta gerencial.
- **FR-015**: O sistema MUST calcular estoque disponivel por produto e total geral exclusivamente por movimentacoes historicas de entrada menos saida, sem usar saldo fixo em cadastro.
- **FR-016**: O sistema MUST calcular mercadorias em transito como itens de compra nao cancelados cuja quantidade comprada ainda nao foi totalmente resolvida por recebimentos fisicos e perdas.
- **FR-017**: O sistema MUST calcular compras em aberto como compras nao canceladas que ainda possuem pendencia operacional ou financeira relevante para acompanhamento.
- **FR-018**: O sistema MUST calcular produtos pendentes de recebimento como produtos em itens de compra com quantidade pendente maior que zero.
- **FR-019**: O sistema MUST calcular quantidade pendente como quantidade comprada menos quantidade recebida fisicamente menos quantidade perdida, extraviada ou avariada.
- **FR-020**: O sistema MUST calcular perdas registradas como a soma das quantidades e valores estimados de perdas, extravios e avarias registrados no periodo filtrado.
- **FR-021**: O sistema MUST calcular quantidade de vendas como a contagem de vendas confirmadas no periodo filtrado e tambem permitir totalizar itens vendidos quando apresentado em detalhes.
- **FR-022**: O sistema MUST calcular quantidade de compras como a contagem de compras registradas e nao canceladas no periodo filtrado.
- **FR-023**: O sistema MUST disponibilizar ranking de produtos mais vendidos ordenado por quantidade vendida no periodo filtrado.
- **FR-024**: O sistema MUST disponibilizar ranking de produtos mais lucrativos ordenado por lucro total no periodo filtrado.
- **FR-025**: O sistema MUST disponibilizar ranking de produtos com maior estoque ordenado por estoque disponivel decrescente.
- **FR-026**: O sistema MUST disponibilizar ranking de produtos com menor estoque ordenado por estoque disponivel crescente, considerando apenas produtos elegiveis para venda ou reposicao.
- **FR-027**: O sistema MUST usar criterio de desempate estavel nos rankings, priorizando maior valor financeiro quando aplicavel e nome ou identificador do produto quando os valores forem iguais.
- **FR-028**: O sistema MUST gerar alerta de estoque baixo quando o estoque disponivel do produto for menor ou igual ao limite minimo definido para acompanhamento gerencial.
- **FR-029**: O sistema MUST gerar alerta de produto sem movimentacao quando o produto nao tiver entrada, saida, venda, compra, recebimento ou perda dentro da janela de inatividade definida.
- **FR-030**: O sistema MUST gerar alerta de compra em transito ha muito tempo quando a compra possuir pendencia e ultrapassar o limite de dias definido desde a data de compra ou previsao de recebimento.
- **FR-031**: O sistema MUST gerar alerta de perdas recorrentes quando o produto acumular ocorrencias de perda acima do limite definido dentro da janela de recorrencia.
- **FR-032**: O sistema MUST disponibilizar grafico de receita por periodo com valores agrupados pela granularidade adequada ao filtro.
- **FR-033**: O sistema MUST disponibilizar grafico de lucro por periodo com a mesma regra de lucro dos indicadores financeiros.
- **FR-034**: O sistema MUST disponibilizar grafico de compras por periodo com valores de compras registradas e nao canceladas.
- **FR-035**: O sistema MUST disponibilizar grafico de despesas por categoria com totais por categoria no periodo filtrado.
- **FR-036**: O sistema MUST disponibilizar grafico de evolucao do estoque calculado a partir de movimentacoes historicas ao longo do tempo.
- **FR-037**: O sistema MUST expor contrato gerencial para obter resumo financeiro, resumo operacional, rankings, alertas e series graficas com filtros equivalentes.
- **FR-038**: As respostas gerenciais MUST informar os filtros aplicados, data/hora de referencia, indicadores solicitados, valores calculados, unidade de medida quando aplicavel e avisos de dados incompletos.
- **FR-039**: A estrategia de filtros MUST aceitar periodo inicial e final, mes e ano, com precedencia clara quando mais de um tipo de filtro for informado.
- **FR-040**: O sistema MUST rejeitar filtros invalidos, como data inicial posterior a data final, mes fora do intervalo 1 a 12 ou ano fora do intervalo aceito para dados do ERP.
- **FR-041**: O sistema MUST preservar historico operacional e financeiro; dashboards nao podem depender de apagar, sobrescrever ou corrigir registros historicos para apresentar resultados.
- **FR-042**: O sistema MUST manter regras de calculo no backend como fonte da verdade para indicadores, rankings, alertas e graficos.

### API Contract Requirements

- **API-001**: O sistema MUST oferecer consulta de resumo financeiro gerencial retornando filtros aplicados, indicadores financeiros, comparativos opcionais e avisos de pendencia de custo quando existirem.
- **API-002**: O sistema MUST oferecer consulta de resumo operacional retornando filtros aplicados, indicadores operacionais, totais por quantidade e valor quando aplicavel.
- **API-003**: O sistema MUST oferecer consulta de rankings retornando tipo do ranking, posicao, produto, quantidade, valor financeiro aplicavel e criterio de ordenacao.
- **API-004**: O sistema MUST oferecer consulta de alertas retornando tipo do alerta, severidade, entidade relacionada, motivo, valor atual, limite aplicado e data de referencia.
- **API-005**: O sistema MUST oferecer consulta de graficos retornando nome da serie, granularidade, pontos com periodo, valor, unidade e total consolidado.
- **API-006**: O sistema MAY oferecer um endpoint consolidado de dashboard que agrega resumo financeiro, resumo operacional, rankings, alertas e graficos, desde que as secoes da resposta sejam independentes e testaveis.
- **API-007**: Filtros de API MUST suportar dataInicial/dataFinal, mes/ano, limite de rankings, tipos de graficos e tipos de alertas.
- **API-008**: Quando periodo customizado e mes/ano forem informados juntos, o periodo customizado MUST prevalecer e a resposta MUST indicar essa precedencia nos filtros aplicados.

### Business Rules and Formulas

- **BR-001**: Receita total = soma dos valores liquidos de vendas confirmadas no periodo filtrado.
- **BR-002**: Custo dos produtos vendidos = soma, por item vendido, da quantidade vendida multiplicada pelo custo medio vigente do produto conforme entradas reais em estoque.
- **BR-003**: Lucro por venda = valor liquido da venda menos custo dos produtos vendidos da venda.
- **BR-004**: Lucro total = soma dos lucros das vendas do periodo menos perdas operacionais aplicaveis ao periodo.
- **BR-005**: Estoque disponivel = soma de movimentacoes de entrada menos soma de movimentacoes de saida para cada produto ate a data de referencia.
- **BR-006**: Compra registrada nao aumenta estoque disponivel; somente recebimento fisico confirmado gera entrada.
- **BR-007**: Mercadoria em transito = quantidade comprada ainda nao resolvida por recebimento fisico confirmado ou perda registrada.
- **BR-008**: Compra parcialmente recebida permanece em transito enquanto qualquer item tiver quantidade pendente maior que zero.
- **BR-009**: Perda, extravio ou avaria reduz pendencia de recebimento e compoe perda operacional, mas nao gera entrada de estoque.
- **BR-010**: Valor estimado de perda = quantidade perdida multiplicada pelo custo medio disponivel do produto ou pelo valor unitario de compra quando o custo medio ainda nao existir; a resposta MUST indicar qual base foi usada.
- **BR-011**: Produto sem custo medio para venda deve ser sinalizado como pendencia de custo, e o lucro consolidado deve informar a parte nao calculavel.
- **BR-012**: Contas a receber abertas = soma dos valores vencidos e a vencer ainda nao liquidados ate a data final do filtro.
- **BR-013**: Valores recebidos = soma dos recebimentos confirmados no periodo, independentemente da data original da venda.
- **BR-014**: Saldo operacional = valores recebidos no periodo menos compras registradas no periodo menos despesas registradas no periodo.
- **BR-015**: Evolucao de estoque deve usar acumulado historico de movimentacoes ate cada ponto da serie.

### Acceptance Criteria Matrix

#### Financial Indicators

- **AC-FIN-001 - Receita total**: Dado um periodo com vendas confirmadas, quando o indicador for calculado, entao o valor deve igualar a soma liquida dessas vendas e excluir vendas canceladas, estornadas ou nao confirmadas.
- **AC-FIN-002 - Lucro total**: Dado um periodo com vendas e custos medios disponiveis, quando o indicador for calculado, entao o valor deve igualar receita liquida menos custo dos produtos vendidos e perdas aplicaveis; itens sem custo medio devem aparecer em aviso de dado incompleto.
- **AC-FIN-003 - Total de compras**: Dado um periodo com compras registradas, quando o indicador for calculado, entao o valor deve igualar a soma comercial das compras nao canceladas, mesmo que ainda estejam em transito.
- **AC-FIN-004 - Total de despesas**: Dado um periodo com despesas por categoria, quando o indicador for calculado, entao o valor deve igualar a soma das despesas nao canceladas no periodo.
- **AC-FIN-005 - Saldo operacional**: Dado um periodo com valores recebidos, compras e despesas, quando o indicador for calculado, entao o valor deve igualar valores recebidos menos compras menos despesas.
- **AC-FIN-006 - Contas a receber abertas**: Dado uma data final de filtro, quando o indicador for calculado, entao o valor deve igualar a soma de recebiveis ainda nao liquidados ate essa data.
- **AC-FIN-007 - Valores recebidos**: Dado um periodo com baixas ou pagamentos confirmados, quando o indicador for calculado, entao o valor deve igualar a soma dos recebimentos confirmados nesse periodo.

#### Operational Indicators

- **AC-OP-001 - Produtos cadastrados**: Dado o cadastro de produtos, quando o indicador for calculado, entao a contagem deve refletir os produtos dentro do escopo de status definido para consulta gerencial.
- **AC-OP-002 - Estoque disponivel**: Dado movimentacoes de estoque ate a data de referencia, quando o indicador for calculado, entao o saldo deve igualar entradas menos saidas e nao deve considerar compras sem recebimento.
- **AC-OP-003 - Mercadorias em transito**: Dado compras nao canceladas com pendencia de recebimento, quando o indicador for calculado, entao deve apresentar quantidade e valor das mercadorias ainda nao resolvidas por recebimento ou perda.
- **AC-OP-004 - Compras em aberto**: Dado compras com pendencia operacional ou financeira, quando o indicador for calculado, entao somente compras ainda abertas devem ser contadas.
- **AC-OP-005 - Produtos pendentes de recebimento**: Dado itens de compra com quantidade pendente maior que zero, quando o indicador for calculado, entao deve listar produto, compra e quantidade pendente.
- **AC-OP-006 - Perdas registradas**: Dado perdas, extravios ou avarias no periodo, quando o indicador for calculado, entao deve somar quantidade e valor estimado sem gerar estoque.
- **AC-OP-007 - Quantidade de vendas**: Dado vendas confirmadas no periodo, quando o indicador for calculado, entao deve contar vendas confirmadas e permitir detalhar total de itens vendidos.
- **AC-OP-008 - Quantidade de compras**: Dado compras registradas no periodo, quando o indicador for calculado, entao deve contar compras nao canceladas dentro do filtro.

#### Rankings

- **AC-RNK-001 - Produtos mais vendidos**: Dado produtos vendidos no periodo, quando o ranking for consultado, entao deve ordenar por quantidade vendida decrescente e mostrar quantidade e valor vendido.
- **AC-RNK-002 - Produtos mais lucrativos**: Dado produtos com lucro calculavel no periodo, quando o ranking for consultado, entao deve ordenar por lucro total decrescente e sinalizar produtos excluidos ou incompletos por falta de custo.
- **AC-RNK-003 - Produtos com maior estoque**: Dado produtos com estoque disponivel, quando o ranking for consultado, entao deve ordenar por saldo disponivel decrescente.
- **AC-RNK-004 - Produtos com menor estoque**: Dado produtos elegiveis para venda ou reposicao, quando o ranking for consultado, entao deve ordenar por saldo disponivel crescente.
- **AC-RNK-005 - Empates**: Dado dois produtos com mesmo valor no criterio principal, quando qualquer ranking for consultado, entao a ordem deve seguir criterio de desempate documentado e estavel.

#### Alerts

- **AC-ALT-001 - Estoque baixo**: Dado produto com estoque disponivel menor ou igual ao limite minimo, quando alertas forem consultados, entao o alerta deve informar produto, saldo atual, limite e severidade.
- **AC-ALT-002 - Produto sem movimentacao**: Dado produto sem eventos operacionais dentro da janela definida, quando alertas forem consultados, entao o alerta deve informar produto, ultima movimentacao conhecida e janela aplicada.
- **AC-ALT-003 - Compra em transito ha muito tempo**: Dado compra com pendencia acima do limite de dias, quando alertas forem consultados, entao o alerta deve informar compra, dias em transito, quantidade pendente e limite aplicado.
- **AC-ALT-004 - Perdas recorrentes**: Dado produto com perdas acima do limite de recorrencia, quando alertas forem consultados, entao o alerta deve informar produto, quantidade de ocorrencias, quantidade perdida e janela aplicada.
- **AC-ALT-005 - Resolucao de alerta**: Dado que uma condicao de alerta deixou de existir, quando alertas forem consultados novamente, entao o alerta nao deve mais aparecer como ativo.

#### Charts

- **AC-GRF-001 - Receita por periodo**: Dado vendas confirmadas distribuidas no tempo, quando o grafico for consultado, entao cada ponto deve refletir receita liquida do intervalo correspondente.
- **AC-GRF-002 - Lucro por periodo**: Dado vendas e custos medios disponiveis, quando o grafico for consultado, entao cada ponto deve refletir lucro conforme a mesma formula do lucro total.
- **AC-GRF-003 - Compras por periodo**: Dado compras registradas no tempo, quando o grafico for consultado, entao cada ponto deve refletir compras nao canceladas no intervalo correspondente.
- **AC-GRF-004 - Despesas por categoria**: Dado despesas categorizadas no periodo, quando o grafico for consultado, entao cada categoria deve apresentar total correto e a soma das categorias deve igualar o total de despesas.
- **AC-GRF-005 - Evolucao do estoque**: Dado movimentacoes historicas, quando o grafico for consultado, entao cada ponto deve refletir o saldo acumulado ate a data do ponto.

#### Filters and Responses

- **AC-FLT-001 - Periodo customizado**: Dado data inicial e final validas, quando qualquer consulta gerencial for executada, entao todos os indicadores baseados em eventos devem respeitar essa janela.
- **AC-FLT-002 - Mes e ano**: Dado mes e ano validos, quando qualquer consulta gerencial for executada, entao o periodo aplicado deve corresponder ao primeiro e ultimo dia desse mes.
- **AC-FLT-003 - Ano**: Dado apenas ano valido, quando qualquer consulta gerencial for executada, entao o periodo aplicado deve corresponder ao ano inteiro.
- **AC-FLT-004 - Precedencia de filtros**: Dado periodo customizado e mes/ano informados juntos, quando a consulta for executada, entao o periodo customizado deve prevalecer e a resposta deve indicar os filtros aplicados.
- **AC-RESP-001 - Estrutura de resposta**: Dado qualquer consulta gerencial valida, quando a resposta for retornada, entao ela deve conter filtros aplicados, data de referencia, secoes solicitadas, valores, unidades e avisos de dados incompletos quando existirem.

### Key Entities *(include if feature involves data)*

- **Indicador Financeiro**: Valor gerencial monetario calculado a partir de vendas, compras, despesas, contas a receber e recebimentos.
- **Indicador Operacional**: Valor gerencial quantitativo ou monetario calculado a partir de produtos, estoque, compras, recebimentos, perdas e vendas.
- **Filtro Gerencial**: Janela de analise definida por periodo customizado, mes ou ano, aplicada de forma consistente aos indicadores baseados em eventos.
- **Ranking de Produto**: Lista ordenada de produtos com posicao, criterio de ordenacao, quantidade e valor relacionado.
- **Alerta Gerencial**: Sinalizacao de situacao operacional que exige atencao, com tipo, severidade, limite aplicado e motivo.
- **Serie Grafica**: Conjunto de pontos temporais ou categoricos para representar receita, lucro, compras, despesas ou estoque.
- **Aviso de Dados Incompletos**: Indicacao de que uma metrica possui parte nao calculavel, como venda de produto sem custo medio disponivel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% dos indicadores financeiros listados na feature retornam valor correto para um conjunto de dados conhecido e filtrado por periodo, mes e ano.
- **SC-002**: 100% dos indicadores operacionais listados na feature respeitam estoque por movimentacoes, mercadorias em transito, recebimentos parciais e perdas.
- **SC-003**: Gestores conseguem obter uma visao financeira e operacional consolidada em menos de 2 minutos a partir dos dashboards.
- **SC-004**: 100% dos rankings solicitados retornam produtos na ordem correta, com criterio de desempate estavel e valores de suporte visiveis.
- **SC-005**: 100% dos alertas definidos aparecem quando seus limites sao atingidos e deixam de aparecer quando a condicao deixa de existir.
- **SC-006**: 100% dos graficos solicitados retornam series coerentes com os mesmos filtros e formulas dos indicadores equivalentes.
- **SC-007**: Periodos sem dados retornam resposta valida com totais zerados, listas vazias e sem falha de consulta.
- **SC-008**: 100% das respostas gerenciais informam os filtros aplicados e avisos de dados incompletos quando existirem.
- **SC-009**: Nenhuma regra gerencial contradiz as regras constitucionais de estoque por movimentacoes, compra em transito, recebimento fisico, perdas e custo medio por entradas reais.

## Assumptions

- Usuarios-alvo sao gestores financeiros, gestores operacionais e administradores do ERP.
- O dashboard considera somente dados que o usuario autenticado ja esta autorizado a visualizar no ERP.
- O periodo customizado usa datas inclusivas de inicio e fim.
- Quando nenhum filtro for informado, a consulta gerencial usa o mes corrente como periodo padrao.
- Limites de alerta sao parametros gerenciais configuraveis ou valores padrao definidos no planejamento; a specification define o comportamento, nao a forma de configuracao.
- Produtos inativos nao entram em alertas de estoque baixo e menor estoque quando nao forem elegiveis para venda ou reposicao.
- As regras de cancelamento, estorno e devolucao existentes no ERP determinam quais registros reduzem ou excluem valores gerenciais.
- Esta feature define contratos e regras esperadas, mas nao define implementacao, arquitetura interna, bibliotecas, telas ou estrutura de banco.
