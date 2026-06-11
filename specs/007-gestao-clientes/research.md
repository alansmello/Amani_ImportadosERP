# Research: Gestao de Clientes no Frontend

## Decision: Reusar o padrao da Feature 006 de Produtos

**Rationale**: Produtos ja estabeleceu o formato operacional do frontend: rotas por modulo no App Router, service module isolado, hooks TanStack Query por caso de uso, componentes especificos por dominio, estados de loading/erro/vazio e UI responsiva com cards mobile e tabela desktop. Clientes tem comportamento equivalente e ganha apenas a acao adicional de inativacao segura.

**Alternatives considered**:
- Criar uma abstracao generica para CRUDs: rejeitada porque ainda ha poucos modulos reais e a inativacao de Clientes ja diverge de Produtos.
- Implementar Clientes com componentes ad hoc em uma unica pagina: rejeitada porque quebraria a consistencia operacional e dificultaria testes por fluxo.

## Decision: Modelar cliente somente com campos reais atuais

**Rationale**: O contrato atual de cliente contem `id`, `nome`, `email`, `telefone` e `ativo`; criacao/edicao aceitam `nome`, `email` e `telefone`. A UI nao deve antecipar documento, limite de credito, historico, financeiro ou outros campos sem contrato oficial.

**Alternatives considered**:
- Adicionar CPF/CNPJ/documento no frontend: rejeitada porque nao existe no contrato atual e criaria dado sem persistencia oficial.
- Criar campos financeiros auxiliares: rejeitada porque financeiro e metricas pertencem ao backend e a features futuras.

## Decision: Listar clientes ativos por padrao com filtro de status

**Rationale**: O backend aceita filtro `ativo` e cliente possui status. Mostrar ativos por padrao reduz risco operacional de selecionar cadastros obsoletos, enquanto as opcoes "inativos" e "todos" preservam consulta e auditoria visual.

**Alternatives considered**:
- Listar todos sem filtro: rejeitada porque aumenta ruido operacional e pode expor inativos como se estivessem disponiveis.
- Esconder inativos completamente: rejeitada porque a spec exige que inativacao preserve consulta futura.

## Decision: Inativacao segura com confirmacao explicita

**Rationale**: O contrato atual oferece `POST /api/clientes/{id}/inativar` e a constituicao exige preservar historico operacional. A UI deve expor inativacao, nao delete, somente para clientes ativos e com confirmacao para evitar acao acidental.

**Alternatives considered**:
- Manter sem inativacao como Produtos: rejeitada porque Clientes ja possui suporte oficial e a clarificacao decidiu inclui-la.
- Implementar delete definitivo: rejeitada porque nao existe endpoint e apagaria historico operacional.

## Decision: Busca local sobre dados carregados

**Rationale**: O contrato atual nao oferece busca/paginacao oficial. Assim como Produtos, a tela pode buscar localmente por `nome`, `email` e `telefone` sobre a lista retornada pelo filtro de status.

**Alternatives considered**:
- Criar parametros de busca nao suportados: rejeitada por incompatibilidade contratual.
- Buscar novamente a cada tecla: rejeitada porque nao ha endpoint de busca e aumentaria complexidade sem ganho.

## Decision: Estado local controlado para formularios

**Rationale**: Produtos ja usa formularios controlados sem biblioteca adicional. Clientes tem poucos campos e validacoes simples, entao manter o mesmo padrao reduz dependencias e retrabalho.

**Alternatives considered**:
- Adicionar biblioteca de formularios: rejeitada porque nao resolve complexidade real nesta feature.
- Enviar sem validacao visual: rejeitada porque piora a experiencia operacional para erros simples de nome/email.

## Decision: Sem historico comercial ou financeiro nesta feature

**Rationale**: Existem endpoints de vendas e contas a receber por cliente, mas a spec limita Clientes a cadastro/manutencao. Incluir historico financeiro mudaria escopo, traria regras gerenciais e exigiria novos criterios de analytics.

**Alternatives considered**:
- Mostrar contas a receber no detalhe do cliente: rejeitada para manter foco operacional e evitar mistura com modulo financeiro.
- Mostrar vendas por cliente: rejeitada porque vendas e dashboards devem ser planejados em features proprias.
