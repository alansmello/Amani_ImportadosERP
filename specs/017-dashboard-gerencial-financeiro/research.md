# Research: Dashboard Gerencial e Financeiro

## Decision: Implementar como feature frontend sobre dashboards existentes

**Rationale**: O roadmap define F017 como substituicao do placeholder da home
consumindo endpoints prontos. As agregacoes, rankings, alertas e series ja
pertencem ao backend por constituicao; portanto a camada frontend deve apenas
orquestrar consultas, estados e apresentacao.

**Alternatives considered**:
- Criar calculos locais a partir de listas de vendas/despesas: rejeitado porque
  viola backend como fonte das metricas e nao escala.
- Alterar backend junto com a feature: rejeitado como escopo padrao; so deve
  ocorrer se o contrato existente impedir um criterio de aceite essencial.

## Decision: Fonte financeira filtravel para KPIs de periodo

**Rationale**: A clarificacao da spec define que KPIs financeiros vem da fonte
financeira, enquanto rankings, alertas, operacao e graficos vem da fonte
gerencial. No codigo atual, a rota `dashboard-financeiro` e um snapshot sem
parametros de periodo, enquanto `dashboard-gerencial/financeiro` aceita filtros.
Para cumprir filtros sem calcular no cliente, a home deve usar a fonte
financeira filtravel oficial para KPIs de periodo. No contrato atual, essa
fonte e atendida por `/api/dashboard-gerencial/financeiro`; o endpoint
`/api/dashboard-financeiro` permanece como snapshot financeiro sem filtro e so
deve alimentar informacoes globais claramente rotuladas, se exibidas.

**Alternatives considered**:
- Usar `dashboard-financeiro` para KPIs filtrados: rejeitado porque o contrato
  atual nao aceita mes/ano/intervalo.
- Calcular KPIs filtrados a partir de outros dados: rejeitado por violar a
  constituicao.
- Bloquear filtros para KPIs financeiros: rejeitado porque contradiz a spec.

## Decision: Filtros normalizados em um unico objeto de periodo

**Rationale**: A UI precisa alternar entre mes, ano e intervalo customizado sem
misturar dados de periodos diferentes. Um modelo unico de filtro evita query
keys inconsistentes e facilita enviar os mesmos parametros para todas as fontes
filtraveis.

**Alternatives considered**:
- Estados separados por secao: rejeitado porque aumenta risco de blocos com
  periodos diferentes.
- Filtro global sem validacao local: rejeitado porque intervalo com inicio maior
  que fim pode ser bloqueado antes da consulta sem violar regra de negocio.

## Decision: Usar Recharts para renderizacao de graficos

**Rationale**: A feature exige series graficas responsivas. Recharts e uma
biblioteca declarativa para React, suficiente para linhas/barras simples,
integravel ao layout atual e evita implementar e manter SVG manual. A biblioteca
sera usada somente para renderizacao; os pontos, totais, granularidade e valores
continuam vindo do backend.

**Alternatives considered**:
- CSS/HTML sem biblioteca: rejeitado porque limita legibilidade de series e
  aumenta retrabalho visual.
- SVG manual: rejeitado porque cria manutencao propria para eixos, tooltips e
  responsividade.
- Bibliotecas mais completas de visualizacao: rejeitadas por complexidade
  maior que a necessidade do MVP.

## Decision: Estados independentes por bloco do dashboard

**Rationale**: A spec exige que falha parcial nao derrube o painel inteiro. As
consultas podem ser compostas por fonte e secao, permitindo que KPIs, rankings,
alertas e graficos tenham loading/error/empty proprios.

**Alternatives considered**:
- Uma consulta consolidada unica para tudo: rejeitada como unica estrategia
  porque uma falha derrubaria todos os blocos.
- Ignorar falhas parciais: rejeitado porque esconderia dados indisponiveis do
  gestor.

## Decision: Ranking de cliente deve ter suporte oficial no backend

**Rationale**: A spec pede top produtos/clientes, mas os DTOs de dashboard
encontrados hoje modelam `RankingProdutoDto`. Para cumprir o criterio de aceite
sem violar a constituicao, a implementacao deve adicionar suporte oficial de
backend para ranking de clientes quando o contrato existente nao o fornecer. O
frontend nunca deve derivar ranking a partir de vendas ou recebiveis.

**Alternatives considered**:
- Calcular top clientes no frontend: rejeitado por violar a constituicao.
- Remover ranking de clientes da feature: rejeitado porque o roadmap e a spec
  incluem top produtos/clientes.
- Exibir estado indisponivel permanente para clientes: rejeitado porque deixaria
  criterio de aceite sem cobertura real.
