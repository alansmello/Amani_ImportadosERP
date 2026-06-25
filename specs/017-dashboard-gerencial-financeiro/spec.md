# Feature Specification: Dashboard Gerencial e Financeiro

**Feature Branch**: `017-dashboard-gerencial-financeiro`

**Created**: 2026-06-25

**Status**: Draft

**Input**: User description: "F017 - Dashboard Gerencial e Financeiro. Substituir o placeholder da home por um painel real com KPIs, rankings, alertas, graficos e filtros de periodo consumindo dados gerenciais e financeiros existentes. Todos os numeros devem vir da fonte oficial; sem calculos de metricas na interface; responsivo; Dark Only."

## Clarifications

### Session 2026-06-25

- Q: Quando houver sobreposicao entre dados financeiros e gerenciais, qual fonte oficial deve prevalecer na home? -> A: KPIs financeiros usam a fonte financeira filtravel oficial; rankings, alertas, dados operacionais e graficos usam a fonte gerencial oficial.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ver resumo executivo na home (Priority: P1)

Como gestor da Amani, quero abrir a home e ver um resumo executivo com faturamento, lucro, despesas e recebiveis do periodo selecionado, para entender rapidamente a situacao financeira do negocio.

**Why this priority**: A home atual e apenas um placeholder. O maior valor da feature e transformar a primeira tela em uma visao gerencial util para tomada de decisao diaria.

**Independent Test**: Pode ser testada acessando a home com dados financeiros existentes e verificando se os principais indicadores do periodo aparecem com valores, rotulos e estados claros.

**Acceptance Scenarios**:

1. **Given** que existem dados financeiros no periodo padrao, **When** o gestor acessa a home, **Then** visualiza faturamento, lucro, despesas e recebiveis do periodo com valores vindos da fonte oficial.
2. **Given** que nao existem dados financeiros no periodo selecionado, **When** o gestor acessa a home, **Then** visualiza estados vazios claros sem valores inventados ou calculados localmente.
3. **Given** que algum indicador nao pode ser carregado, **When** a home e exibida, **Then** o gestor ve uma mensagem de erro ou indisponibilidade para aquele bloco sem perder o restante do painel que carregou corretamente.

---

### User Story 2 - Filtrar o painel por periodo (Priority: P1)

Como gestor da Amani, quero alternar entre mes, ano e intervalo personalizado, para comparar a operacao em periodos relevantes ao fechamento financeiro.

**Why this priority**: Um painel sem filtro de periodo limita o uso gerencial. O periodo escolhido define todos os indicadores, rankings, alertas e graficos exibidos.

**Independent Test**: Pode ser testada selecionando diferentes periodos e verificando que todos os blocos do painel passam a refletir o periodo escolhido.

**Acceptance Scenarios**:

1. **Given** que o painel esta aberto no periodo padrao, **When** o gestor seleciona outro mes, **Then** os indicadores, rankings, alertas e graficos sao atualizados para esse mes.
2. **Given** que o gestor seleciona um ano, **When** confirma o filtro, **Then** o painel apresenta dados consolidados desse ano.
3. **Given** que o gestor informa um intervalo personalizado valido, **When** aplica o filtro, **Then** o painel atualiza todos os blocos usando esse intervalo.
4. **Given** que o intervalo personalizado tem data inicial posterior a data final, **When** o gestor tenta aplicar o filtro, **Then** o sistema rejeita o filtro e orienta a corrigir as datas.

---

### User Story 3 - Consultar rankings e alertas operacionais (Priority: P2)

Como gestor da Amani, quero ver rankings de produtos e clientes junto com alertas relevantes, para identificar prioridades comerciais, financeiras e operacionais sem navegar por varias telas.

**Why this priority**: Rankings e alertas transformam os dados do ERP em sinais de acao. Eles complementam os KPIs principais e ajudam a priorizar vendas, cobrancas e acompanhamento operacional.

**Independent Test**: Pode ser testada com dados de vendas, clientes, recebiveis, despesas e estoque existentes, validando que o painel exibe listas e alertas coerentes com a fonte oficial.

**Acceptance Scenarios**:

1. **Given** que existem vendas no periodo, **When** o gestor visualiza os rankings, **Then** ve os principais produtos e clientes ordenados conforme os dados oficiais.
2. **Given** que existem alertas financeiros ou operacionais no periodo, **When** o gestor acessa o painel, **Then** esses alertas aparecem com prioridade e texto compreensivel.
3. **Given** que nao existem rankings ou alertas para o periodo, **When** o painel e carregado, **Then** os blocos exibem estado vazio apropriado sem sugerir problemas inexistentes.

---

### User Story 4 - Acompanhar graficos de evolucao (Priority: P3)

Como gestor da Amani, quero visualizar series graficas de indicadores financeiros e operacionais, para perceber tendencias de desempenho ao longo do periodo.

**Why this priority**: Graficos melhoram a leitura de tendencias, mas dependem dos KPIs e filtros principais. Sao importantes para gestao, porem nao bloqueiam o valor basico do painel.

**Independent Test**: Pode ser testada selecionando um periodo com historico suficiente e verificando que as series exibem pontos, rotulos e estados coerentes com os dados recebidos.

**Acceptance Scenarios**:

1. **Given** que existem series temporais para o periodo, **When** o gestor acessa o painel, **Then** visualiza graficos legiveis que representam a evolucao dos indicadores.
2. **Given** que uma serie tem poucos pontos, **When** o grafico e exibido, **Then** a tela permanece compreensivel e nao apresenta distorcoes visuais.
3. **Given** que nao ha dados suficientes para grafico no periodo, **When** o painel carrega, **Then** o bloco informa a ausencia de dados de forma clara.

### Edge Cases

- Se o periodo selecionado nao tiver movimentos, o painel deve exibir estados vazios por bloco sem apresentar zeros ambiguos como se fossem resultado calculado localmente.
- Se somente parte das informacoes estiver disponivel, o painel deve preservar os blocos carregados e indicar falha apenas nos blocos indisponiveis.
- Se dados de vendas, despesas, recebiveis, pagamentos, estoque ou categorias ainda nao existirem em volume significativo, o painel deve continuar utilizavel e comunicar que os dados dependem da operacao registrada.
- Se uma lista de ranking tiver menos itens que o limite visual, o painel deve exibir apenas os itens existentes sem preencher dados ficticios.
- Se o usuario trocar filtros rapidamente, a tela deve evitar exibir informacoes de periodos diferentes como se fossem do mesmo filtro ativo.
- Se houver valores negativos, nulos ou zerados retornados pela fonte oficial, o painel deve exibi-los de forma fiel e compreensivel, sem ajustar metricas por conta propria.
- Em smartphone, tablet e desktop, o painel deve permanecer legivel, sem sobreposicao de textos, sem rolagem horizontal indevida e sem perda de indicadores essenciais.
- A exportacao de relatorios, navegacao detalhada para lancamentos individuais e calculo alternativo de metricas permanecem fora do escopo desta feature.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home page MUST replace the placeholder with a real management and financial dashboard.
- **FR-002**: The dashboard MUST show financial KPIs for revenue, profit, expenses and receivables for the active period.
- **FR-003**: The dashboard MUST show rankings for top products and top customers when data exists for the active period.
- **FR-004**: The dashboard MUST show financial and operational alerts when the official source reports alert conditions.
- **FR-005**: The dashboard MUST show graphical series for relevant management and financial indicators when series data exists.
- **FR-006**: Users MUST be able to filter the dashboard by month, year and custom date interval.
- **FR-007**: Changing the active period MUST refresh all dashboard sections so KPIs, rankings, alerts and graphs refer to the same selected period.
- **FR-008**: The system MUST reject invalid custom periods where the start date is after the end date.
- **FR-009**: All displayed numbers, rankings, alerts and graph series MUST come from the authoritative dashboard data source.
- **FR-010**: The user interface MUST NOT calculate revenue, profit, expenses, receivables, rankings, alerts, graph series or other critical management metrics.
- **FR-011**: The user interface MAY format values, dates and labels for readability, as long as it does not change the underlying metric values.
- **FR-012**: The dashboard MUST provide clear loading, empty and error states for the complete page and for individual sections where applicable.
- **FR-013**: The dashboard MUST remain usable when one section fails to load while other sections succeed.
- **FR-014**: The dashboard MUST preserve the official Dark Theme identity.
- **FR-015**: The dashboard MUST support smartphone, tablet and desktop layouts without hiding essential KPIs, filters, rankings, alerts or graph summaries.
- **FR-016**: The dashboard MUST keep unsupported capabilities outside this feature scope: exports, advanced drill-down, client-side metric formulas and alternate business calculations.
- **FR-017**: The dashboard MUST communicate when data is insufficient because the relevant operational or financial records have not yet been registered.
- **FR-018**: The dashboard MUST preserve existing navigation behavior and make the home usable as the primary management entry point.
- **FR-019**: Financial KPIs MUST use the authoritative filterable financial source; rankings, alerts, operational information and graphical series MUST use the authoritative management dashboard source.
- **FR-020**: The dashboard MUST show top customer rankings only when provided by the authoritative backend dashboard contract; if the contract is missing, implementation MUST add official backend support rather than deriving customer rankings in the user interface.

### Key Entities *(include if feature involves data)*

- **Periodo do Dashboard**: The active time selection used to request and display all dashboard information. It can represent a month, a year or a custom interval.
- **Indicador Gerencial**: A summarized business metric such as revenue, profit, expenses or receivables. The value is authoritative and not recalculated by the user interface.
- **Ranking Gerencial**: Ordered list of business entities, such as products or customers, returned for the selected period.
- **Alerta Gerencial**: A financial or operational signal that requires attention, including its message, severity or priority when available.
- **Serie Grafica**: A sequence of labeled points used to visualize evolution of a metric over time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A gestor can open the home and identify revenue, profit, expenses and receivables for the default period in under 10 seconds after data is available.
- **SC-002**: 100% of period changes during acceptance testing refresh KPIs, rankings, alerts and graphs to the selected period without mixing data from a previous filter.
- **SC-003**: 100% of dashboard numeric values shown during acceptance testing match the authoritative values returned for the same period.
- **SC-004**: 0 critical management metrics are calculated by the user interface during implementation review and acceptance testing.
- **SC-005**: A gestor can switch between month, year and custom interval filters in under 30 seconds without leaving the home.
- **SC-006**: The primary dashboard view is usable without horizontal scrolling or overlapping content on smartphone, tablet and desktop.
- **SC-007**: At least 90% of guided users can identify the top product, top customer and highest-priority alert for a populated period on first attempt.
- **SC-008**: When data is absent or partially unavailable, 100% of affected dashboard sections show clear empty or error states without fabricated values.

## Assumptions

- The feature follows the roadmap scope for F017 and focuses on the official home dashboard experience.
- Existing operational and financial records from purchases, sales, receivables, payment methods and expenses are the source of meaningful dashboard content.
- The official data source already provides consolidated management and financial dashboard data for the required sections.
- When financial and management dashboard data overlap, financial KPIs use the official filterable financial source while rankings, alerts, operational information and graphical series use the official management source.
- The user interface is responsible for presentation, filtering interactions and formatting only, not for business formulas or metric derivation.
- The default period is the current month unless the active source or existing product behavior defines another default in planning.
- Rankings display a limited, management-friendly number of items so the home remains scannable.
- Alerts are displayed according to the priority, severity or ordering provided by the official source.
- Dark Theme and Mobile First remain mandatory for the dashboard.
- Export, advanced drill-down, custom report builder and detailed transaction investigation are deferred to future features.
