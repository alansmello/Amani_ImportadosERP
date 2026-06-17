# Feature Specification: Vendas Frontend

**Feature Branch**: `013-vendas-frontend`

**Created**: 2026-06-17

**Status**: Draft

**Input**: User description: "F013 - Vendas (frontend). Registrar vendas com validacao de estoque e visualizacao de lucro (custo medio), listar e cancelar. Frontend sobre VendasController (criar, obter, listar, cancelar). Entra: /vendas lista com filtros data/cliente, /vendas/nova com cliente e itens com preco/quantidade/desconto/acrescimo, /vendas/[id] detalhe com lucro retornado pelo backend, acao cancelar venda. Fica fora: recalculo de custo medio/lucro no frontend, edicao de venda, devolucao parcial, emissao fiscal. Dependencias: Produtos, Clientes e estoque com saldo via F010/F011/F012. Lucro/custo medio vem do backend. Criterios: venda gera saida de estoque; bloqueio quando saldo insuficiente com mensagem clara; lucro exibido vem do backend; cancelamento funciona; responsivo."

## Clarifications

### Session 2026-06-17

- Q: Como tratar o mesmo produto adicionado mais de uma vez na nova venda? -> A: Consolidar itens duplicados do mesmo produto em uma unica linha.
- Q: A venda deve registrar forma de pagamento na F013? -> A: Nao registrar forma de pagamento na F013; financeiro fica para F014.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar venda com itens (Priority: P1)

Como operador da Amani, quero registrar uma venda informando cliente, produtos,
quantidades, precos, descontos e acrescimos, para concluir a saida comercial dos
produtos vendidos e manter o estoque atualizado pela fonte oficial.

**Why this priority**: Registrar venda e o fluxo central da feature; sem ele o
MVP operacional nao fecha o ciclo de estoque ate a saida.

**Independent Test**: Pode ser testada criando uma venda com cliente existente e
produtos com saldo disponivel, confirmando que a venda e registrada, os totais
sao apresentados ao usuario e a saida de estoque fica reconhecida pela fonte
oficial.

**Acceptance Scenarios**:

1. **Given** que existem cliente ativo, produtos cadastrados e saldo suficiente,
   **When** o usuario informa os itens da venda e confirma, **Then** a venda e
   registrada e o usuario recebe confirmacao clara do sucesso.
2. **Given** que o usuario esta preenchendo uma venda, **When** informa
   quantidade, preco, desconto ou acrescimo invalido, **Then** o sistema impede
   a confirmacao ate que os dados obrigatorios estejam validos.
3. **Given** que a venda foi registrada com sucesso, **When** o usuario acessa o
   estoque ou o detalhe da venda, **Then** a saida de estoque e o registro da
   venda estao refletidos conforme a fonte oficial.

---

### User Story 2 - Bloquear venda sem saldo suficiente (Priority: P2)

Como operador da Amani, quero receber uma mensagem clara quando tentar vender
mais do que o saldo disponivel, para corrigir a quantidade ou providenciar
entrada de estoque antes de concluir a venda.

**Why this priority**: A validacao de estoque preserva a regra constitucional de
venda com saldo fisico previo e evita inconsistencias operacionais.

**Independent Test**: Pode ser testada tentando registrar uma venda com item sem
saldo suficiente e verificando que a venda nao e confirmada, que nenhuma saida
indevida e criada e que a mensagem orienta o usuario.

**Acceptance Scenarios**:

1. **Given** que um produto nao possui saldo suficiente, **When** o usuario tenta
   confirmar uma venda com quantidade acima do disponivel, **Then** a venda e
   bloqueada e uma mensagem compreensivel de estoque insuficiente e exibida.
2. **Given** que uma venda possui varios itens e ao menos um item sem saldo,
   **When** o usuario confirma a venda, **Then** a venda inteira nao e concluida
   e o usuario consegue identificar o problema a corrigir.
3. **Given** que a fonte oficial rejeitou a venda por saldo insuficiente,
   **When** a mensagem e exibida, **Then** a interface nao apresenta a venda
   como concluida nem atualiza saldos localmente como se a operacao tivesse
   ocorrido.

---

### User Story 3 - Listar e filtrar vendas (Priority: P3)

Como gestor da Amani, quero consultar vendas por data e cliente, para acompanhar
operacoes recentes, localizar vendas especificas e abrir detalhes rapidamente.

**Why this priority**: A listagem permite acompanhamento diario e serve como
porta de entrada para consulta, auditoria e cancelamento.

**Independent Test**: Pode ser testada abrindo a area de vendas com vendas
existentes, aplicando filtros de periodo e cliente, e confirmando que os
resultados exibidos correspondem aos filtros aplicados.

**Acceptance Scenarios**:

1. **Given** que existem vendas registradas em datas diferentes, **When** o
   usuario filtra por periodo, **Then** a lista mostra somente vendas
   correspondentes ao periodo escolhido.
2. **Given** que existem vendas para clientes diferentes, **When** o usuario
   filtra por cliente, **Then** a lista mostra somente vendas desse cliente.
3. **Given** que filtros foram aplicados, **When** o usuario limpa os filtros,
   **Then** a lista volta a mostrar o conjunto padrao de vendas disponiveis.

---

### User Story 4 - Ver detalhe com lucro oficial (Priority: P4)

Como gestor da Amani, quero abrir o detalhe de uma venda e ver itens, totais e
lucro retornado pela fonte oficial, para avaliar o resultado da venda sem
recalcular informacoes criticas no cliente.

**Why this priority**: Lucro e uma informacao sensivel de negocio e deve ser
exibido como resultado oficial, preservando consistencia gerencial. O custo medio
permanece como base de calculo interna da fonte oficial.

**Independent Test**: Pode ser testada abrindo uma venda registrada e verificando
que o detalhe mostra itens, valores e lucro quando retornado pela fonte oficial,
sem oferecer recalculo ou edicao.

**Acceptance Scenarios**:

1. **Given** que uma venda possui lucro calculado pela fonte oficial, **When** o
   usuario abre o detalhe, **Then** o lucro e exibido como informacao oficial da
   venda.
2. **Given** que o detalhe da venda contem itens com descontos ou acrescimos,
   **When** o usuario consulta a venda, **Then** os valores exibidos permitem
   compreender a composicao comercial da venda.
3. **Given** que a fonte oficial nao retorna alguma informacao de lucro, **When**
   o usuario abre o detalhe, **Then** a interface informa a ausencia do dado sem
   calcular um valor substituto.

---

### User Story 5 - Cancelar venda (Priority: P5)

Como operador autorizado da Amani, quero cancelar uma venda registrada, para
corrigir uma operacao indevida preservando rastreabilidade e refletindo a
reversao conforme a fonte oficial.

**Why this priority**: Cancelamento e necessario para operar com seguranca apos
erro de lancamento, sem introduzir edicao ou devolucao parcial no escopo do MVP.

**Independent Test**: Pode ser testada abrindo uma venda registrada, executando
cancelamento com confirmacao explicita e verificando que a interface mostra
sucesso somente apos aceite da fonte oficial, atualiza as leituras oficiais e
preserva o estado anterior quando a tentativa falha.

**Acceptance Scenarios**:

1. **Given** que uma venda esta registrada, **When** o usuario confirma o
   cancelamento e a fonte oficial aceita a acao, **Then** a interface exibe
   confirmacao e atualiza as leituras oficiais de venda, lista e estoque.
2. **Given** que o usuario solicitou cancelamento, **When** a fonte oficial ainda
   nao confirmou sucesso, **Then** a interface nao apresenta o cancelamento como
   concluido.
3. **Given** que a fonte oficial rejeita o cancelamento, **When** a tentativa
   falha, **Then** a interface preserva a leitura anterior e o usuario ve
   mensagem compreensivel sobre a falha.

---

### User Story 6 - Operar vendas em telas pequenas e grandes (Priority: P6)

Como usuario da Amani em rotina operacional, quero listar, criar, consultar e
cancelar vendas em smartphone, tablet e desktop, para conseguir vender e
acompanhar operacoes dentro e fora do escritorio.

**Why this priority**: Vendas e fluxo operacional essencial e precisa funcionar
nos contextos reais de uso definidos para o ERP.

**Independent Test**: Pode ser testada executando os fluxos principais de
listagem, nova venda, detalhe e cancelamento em smartphone, tablet e desktop sem
perda de informacao ou acoes principais.

**Acceptance Scenarios**:

1. **Given** que o usuario esta em smartphone, **When** cria uma venda com mais
   de um item, **Then** campos, totais, mensagens e acoes permanecem legiveis e
   acionaveis.
2. **Given** que o usuario esta em tablet ou desktop, **When** consulta lista e
   detalhe, **Then** a tela aproveita melhor o espaco sem esconder informacoes
   essenciais.

### Edge Cases

- Cliente inexistente, inativo ou indisponivel deve impedir confirmacao da venda
  com mensagem clara.
- Produto inexistente, indisponivel ou sem saldo deve impedir confirmacao da
  venda quando afetar a operacao.
- Quantidade zero, negativa ou acima do permitido deve ser bloqueada antes da
  confirmacao.
- Preco negativo, desconto invalido ou acrescimo invalido deve ser rejeitado ou
  destacado antes da confirmacao.
- Venda com lista de itens vazia nao pode ser confirmada.
- Itens duplicados do mesmo produto devem ser consolidados em uma unica linha
  para o usuario, somando quantidade e preservando preco, desconto e acrescimo
  de forma clara antes da confirmacao.
- Falha da fonte oficial durante criacao, listagem, detalhe ou cancelamento deve
  mostrar erro recuperavel sem apresentar dados simulados como reais.
- Bloqueio por estoque insuficiente deve expor mensagem compreensivel e manter a
  venda como nao concluida.
- Lucro e saldo nao podem ser recalculados no cliente quando a fonte oficial nao
  retornar esses valores; custo medio permanece como base interna de calculo da
  fonte oficial.
- Cancelamento aceito pela fonte oficial deve atualizar as leituras oficiais; a
  interface nao deve inventar status local de cancelamento quando o contrato nao
  retornar esse dado.
- A feature nao deve oferecer edicao de venda, devolucao parcial, emissao fiscal
  ou calculo local de custo medio/lucro.
- Forma de pagamento, recebiveis e controle financeiro da venda devem permanecer
  fora da F013 e ser tratados no fluxo financeiro apropriado.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir acessar uma area de vendas com lista de
  vendas registradas e informacoes suficientes para identifica-las.
- **FR-002**: O sistema MUST permitir filtrar vendas por periodo e por cliente,
  mantendo opcao clara para limpar filtros.
- **FR-003**: O sistema MUST permitir abrir o detalhe de uma venda a partir da
  lista.
- **FR-004**: O sistema MUST permitir iniciar uma nova venda selecionando um
  cliente existente e ao menos um item de produto.
- **FR-005**: O sistema MUST permitir informar, para cada item da venda,
  quantidade, preco, desconto e acrescimo quando esses campos forem aplicaveis.
- **FR-005a**: O sistema MUST consolidar itens duplicados do mesmo produto em uma
  unica linha da venda, somando quantidade e mantendo preco, desconto e acrescimo
  compreensiveis para o usuario antes da confirmacao.
- **FR-006**: O sistema MUST impedir confirmacao de venda sem cliente, sem itens
  ou com campos obrigatorios invalidos.
- **FR-007**: O sistema MUST enviar a venda para confirmacao somente quando o
  usuario executar uma acao explicita de concluir venda.
- **FR-008**: O sistema MUST apresentar sucesso de venda somente depois que a
  fonte oficial confirmar o registro.
- **FR-009**: O sistema MUST exibir mensagens compreensiveis quando a fonte
  oficial bloquear a venda por estoque insuficiente.
- **FR-010**: O sistema MUST preservar a venda como nao concluida quando houver
  erro de validacao, falha operacional ou bloqueio por saldo insuficiente.
- **FR-011**: O sistema MUST exibir no detalhe da venda cliente, itens,
  quantidades, valores comerciais, totais e datas quando essas informacoes
  existirem.
- **FR-012**: O sistema MUST exibir lucro somente como dado retornado pela fonte
  oficial, sem recalculo local de custo medio ou lucro.
- **FR-013**: O sistema MUST informar claramente quando lucro nao estiver
  disponivel na resposta oficial.
- **FR-014**: O sistema MUST permitir solicitar cancelamento de uma venda a
  partir do detalhe, dependendo da aceitacao da fonte oficial.
- **FR-015**: O sistema MUST exigir confirmacao explicita antes de cancelar uma
  venda.
- **FR-016**: O sistema MUST atualizar a leitura da venda e da lista apos
  cancelamento confirmado pela fonte oficial.
- **FR-017**: O sistema MUST preservar o estado anterior e exibir mensagem
  compreensivel quando a fonte oficial rejeitar ou falhar ao cancelar.
- **FR-018**: O sistema MUST oferecer estados de carregamento, erro e vazio para
  lista, formulario de nova venda, detalhe e cancelamento.
- **FR-019**: O sistema MUST permitir nova tentativa apos falha de consulta,
  criacao ou cancelamento.
- **FR-020**: O sistema MUST manter edicao de venda, devolucao parcial, emissao
  fiscal e recalculo local de custo medio/lucro fora desta entrega.
- **FR-020a**: O sistema MUST manter forma de pagamento, geracao de recebiveis e
  controle financeiro da venda fora desta entrega.
- **FR-021**: O sistema MUST evitar dados simulados para preencher vendas,
  clientes, produtos, saldos, lucro ou custo medio.
- **FR-022**: O sistema MUST funcionar em smartphone, tablet e desktop sem
  sobreposicao de conteudo, controles inacessiveis ou perda de informacoes
  essenciais.
- **FR-023**: O sistema MUST manter consistencia visual com a identidade oficial
  Dark Only e com os estados de interface ja usados nas areas operacionais do
  ERP.

### Key Entities *(include if feature involves data)*

- **Venda**: Operacao comercial registrada para um cliente, composta por itens,
  valores, datas e resultado oficial quando disponivel.
- **Cliente da Venda**: Cliente associado a venda, usado para identificar a
  operacao, filtrar listagens e compor o detalhe.
- **Item de Venda**: Produto vendido com quantidade, preco, desconto, acrescimo
  e valores comerciais informados ou retornados pela fonte oficial.
- **Resultado da Venda**: Informacoes oficiais de total, lucro e saida de estoque
  associadas a venda quando retornadas pela fonte oficial; custo medio permanece
  como base interna de calculo da fonte oficial.
- **Cancelamento de Venda**: Acao de reversao operacional sobre uma venda
  registrada, executada apenas quando aceita pela fonte oficial e refletida nas
  leituras oficiais disponiveis.
- **Bloqueio por Estoque Insuficiente**: Rejeicao da confirmacao de venda quando
  a fonte oficial identifica falta de saldo fisico para um ou mais itens.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario consegue registrar uma venda simples com cliente e ate
  3 itens em ate 3 minutos quando todos os dados e saldos estao disponiveis.
- **SC-002**: 100% das tentativas de venda rejeitadas por estoque insuficiente
  exibem mensagem clara e deixam a venda como nao concluida.
- **SC-003**: 100% das vendas confirmadas exibidas na interface correspondem a
  registros aceitos pela fonte oficial.
- **SC-004**: 100% dos valores de lucro exibidos correspondem aos dados
  retornados pela fonte oficial, sem ajuste ou recomputacao no cliente.
- **SC-005**: Um usuario consegue localizar uma venda por periodo ou cliente em
  ate 30 segundos em uma lista de pelo menos 100 vendas.
- **SC-006**: Um usuario consegue abrir o detalhe de uma venda e entender cliente,
  itens, totais e lucro oficial em ate 1 minuto.
- **SC-007**: 100% dos cancelamentos aceitos pela fonte oficial atualizam as
  leituras de venda, lista e estoque e exibem confirmacao somente apos sucesso
  oficial.
- **SC-008**: 100% dos estados de carregamento, erro e vazio definidos para lista,
  nova venda, detalhe e cancelamento aparecem em validacao manual dos fluxos.
- **SC-009**: Os fluxos principais de listar, filtrar, criar, consultar detalhe e
  cancelar venda podem ser usados em smartphone, tablet e desktop sem bloqueio
  visual ou perda de acoes principais.

## Assumptions

- Produtos, clientes e saldo oficial de estoque estao disponiveis antes desta
  feature ser implementada.
- O usuario principal e operador ou gestor da Amani responsavel por registrar e
  acompanhar vendas.
- A fonte oficial valida saldo, registra a venda, gera saida de estoque, calcula
  lucro e custo medio, e processa cancelamento.
- A interface pode validar campos do formulario para melhorar a experiencia, mas
  regras criticas de estoque, lucro, custo medio e consistencia operacional
  permanecem na fonte oficial.
- Filtros de data e cliente podem usar os recortes disponiveis pela fonte oficial
  ou recortes de exibicao, desde que os registros e valores exibidos continuem
  vindos da fonte oficial.
- Cancelamento e tratado como reversao integral da venda; edicao, devolucao
  parcial e emissao fiscal permanecem fora do MVP desta feature.
- Forma de pagamento e contas a receber permanecem fora desta feature e serao
  tratados no fluxo financeiro apropriado.
- A experiencia preserva Mobile First e deve ser validada em smartphone, tablet e
  desktop.
- A experiencia visual segue a identidade oficial Dark Only do ERP.
