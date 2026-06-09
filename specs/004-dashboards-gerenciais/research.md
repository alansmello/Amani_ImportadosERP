# Research: Dashboards Gerenciais

## Decision: Use read-only dashboard queries instead of new persisted dashboard tables

**Rationale**: A specification exige informacao gerencial derivada do historico operacional e financeiro. A Constituicao exige preservacao de historico e estoque por movimentacoes. Consultas de leitura evitam duplicacao de saldo, reduzem risco de divergencia e mantem os dashboards como visoes calculadas.

**Alternatives considered**:

- Criar tabelas materializadas de indicadores: rejeitado para o primeiro plano porque aumenta complexidade, exige sincronizacao e pode divergir do historico.
- Calcular tudo em controllers: rejeitado por violar separacao de responsabilidades.
- Calcular tudo no frontend: rejeitado porque backend e fonte das regras.

## Decision: Add dashboard-specific repositories for aggregate reads

**Rationale**: Repositories existentes atendem fluxos CRUD e algumas consultas especificas, mas dashboards precisam de agregacoes por periodo, rankings e series. Consultas dedicadas reduzem carregamento de listas completas em memoria e preservam Repository Pattern.

**Alternatives considered**:

- Expandir todos os repositories existentes com muitos metodos gerenciais: possivel, mas espalha regras de dashboard por varias interfaces.
- Usar consultas diretas no handler: rejeitado porque acopla Application a persistencia.

## Decision: Normalize filters once per request in Application

**Rationale**: A specification exige filtros por periodo, mes e ano com precedencia clara. Um normalizador comum evita interpretacoes diferentes entre financeiro, operacional, rankings, alertas e graficos.

**Alternatives considered**:

- Cada handler interpretar filtros separadamente: rejeitado por risco de divergencia.
- Controller calcular periodo efetivo: rejeitado porque regras de negocio ficariam na API.

## Decision: Keep financial purchase impact based on purchase registration

**Rationale**: A Feature 003 estabeleceu que compra registrada nao entra no estoque, mas continua sendo impacto financeiro imediato. O dashboard financeiro deve somar compras registradas e nao canceladas no periodo financeiro, independentemente de recebimento fisico.

**Alternatives considered**:

- Considerar compras apenas no recebimento: rejeitado porque contradiz decisao financeira da Feature 003.
- Considerar compras apenas quando pagas: fora do escopo atual; a specification separa compras, despesas, recebimentos e saldo operacional.

## Decision: Compute stock and stock rankings exclusively from stock movements

**Rationale**: A Constituicao proibe saldo fixo em cadastro. Estoque disponivel, maior estoque, menor estoque, estoque baixo e evolucao de estoque devem usar entradas menos saidas historicas.

**Alternatives considered**:

- Adicionar saldo atual no produto para acelerar consulta: rejeitado por violacao constitucional.
- Usar quantidade comprada como estoque esperado: rejeitado porque mercadoria em transito nao e estoque disponivel.

## Decision: Represent missing average cost as incomplete data warning

**Rationale**: A specification proibe inventar custo. Quando um item vendido nao tem custo medio derivado de entradas reais, lucro deve sinalizar parte nao calculavel.

**Alternatives considered**:

- Tratar custo ausente como zero: rejeitado por inflar lucro.
- Usar preco de venda como custo: rejeitado por mascarar margem.
- Bloquear dashboard inteiro: rejeitado porque demais indicadores continuam uteis.

## Decision: Use business-level default alert thresholds until persisted configuration is planned

**Rationale**: A specification define regras de alerta, mas nao exige implementacao de configuracao persistida. O plano deve permitir valores padrao ou parametros futuros sem criar uma feature de configuracao.

**Alternatives considered**:

- Criar cadastro de parametros de alerta agora: rejeitado por ampliar escopo.
- Nao gerar alertas sem configuracao: rejeitado porque a feature exige alertas.

## Decision: Provide both consolidated and section-specific endpoints

**Rationale**: Um endpoint consolidado atende telas de dashboard; endpoints por secao facilitam validacao, reuso e carregamento parcial. A specification permite endpoint consolidado desde que as secoes sejam independentes e testaveis.

**Alternatives considered**:

- Apenas endpoint consolidado: simples para a tela, mas pior para testes e evolucao.
- Apenas endpoints separados: testavel, mas exige multiplas chamadas para a visao completa.
