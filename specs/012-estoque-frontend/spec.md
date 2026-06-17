# Feature Specification: Estoque Frontend

**Feature Branch**: `012-estoque-frontend`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "F012 - Estoque (frontend). Visualizar saldo atual e historico de movimentacoes por produto, alem de itens pendentes de recebimento. Frontend sobre F008 (/api/estoque) e produtos-pendentes. Entra: /estoque com lista de produtos com saldo, busca e filtro; detalhe de movimentacoes por produto com entradas, saidas e origem; aba/visao de pendentes de recebimento. Fica fora: ajuste manual de saldo, transferencia, alerta de estoque minimo, edicao de movimentacoes. Dependencias: F008 obrigatoria e F011 gera movimentacoes reais. Criterios: saldo exibido vem do backend sem calculo no cliente; historico mostra origem; loading, erro e vazio; responsivo."

## Clarifications

### Session 2026-06-16

- Q: Qual deve ser a visao padrao da lista de estoque quanto a produtos com saldo zero? -> A: Lista padrao mostra todos os produtos, inclusive saldo zero, com filtro opcional para "com saldo".
- Q: Que acao deve estar disponivel para cada produto pendente de recebimento na area de estoque? -> A: Cada pendencia deve permitir abrir o detalhe da compra de origem.
- Q: Quais filtros devem estar disponiveis no historico de movimentacoes do produto? -> A: Historico do produto deve ter filtros de periodo e tipo de movimentacao.
- Q: Como a interface deve tratar produtos com saldo negativo retornado pela fonte oficial? -> A: Exibir saldo negativo com destaque de inconsistencia, sem corrigir localmente.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consultar saldos atuais (Priority: P1)

Como operador ou gestor da Amani, quero abrir a area de estoque e ver os produtos
com seus saldos atuais, para entender rapidamente o que esta disponivel sem abrir
compras, vendas ou relatorios separados.

**Why this priority**: A leitura de saldo e o valor central da feature; sem ela,
o usuario continua sem visao operacional do estoque disponivel.

**Independent Test**: Pode ser testada abrindo a area de estoque com produtos
cadastrados e verificando que cada produto aparece com saldo atual fornecido pela
fonte oficial, inclusive quando o saldo e zero.

**Acceptance Scenarios**:

1. **Given** que existem produtos cadastrados com saldos conhecidos, **When** o
   usuario acessa a area de estoque sem filtros, **Then** a lista mostra todos
   os produtos retornados pela fonte oficial, inclusive saldo zero, com saldo
   atual e informacoes suficientes para identifica-los.
2. **Given** que existem produtos com saldo zero, **When** o usuario consulta a
   lista de estoque, **Then** esses produtos continuam visiveis quando os filtros
   aplicados permitirem saldo zero.
3. **Given** que a consulta de estoque esta carregando, **When** o usuario abre a
   tela, **Then** a interface apresenta estado de carregamento sem mostrar dados
   antigos como atuais.

---

### User Story 2 - Buscar e filtrar estoque (Priority: P2)

Como gestor operacional, quero buscar produtos e filtrar a lista de estoque, para
localizar rapidamente itens especificos ou focar somente em produtos com saldo.

**Why this priority**: A lista de estoque cresce com o cadastro de produtos; busca
e filtros tornam a rotina operacional rapida e reduzem erro de leitura.

**Independent Test**: Pode ser testada informando termo de busca e alternando
filtros de saldo, confirmando que a lista reflete somente produtos
correspondentes e que os filtros podem ser removidos.

**Acceptance Scenarios**:

1. **Given** que existem produtos de nomes ou codigos diferentes, **When** o
   usuario busca por um termo, **Then** a lista mostra somente produtos
   correspondentes ao termo pesquisado.
2. **Given** que existem produtos com saldo positivo e saldo zero, **When** o
   usuario aplica filtro para ver somente produtos com saldo, **Then** produtos
   sem saldo deixam de aparecer enquanto o filtro estiver ativo.
3. **Given** que filtros foram aplicados, **When** o usuario limpa os filtros,
   **Then** a lista volta ao estado padrao da area de estoque.

---

### User Story 3 - Auditar movimentacoes por produto (Priority: P3)

Como gestor operacional, quero abrir um produto e consultar seu historico de
movimentacoes, para entender como o saldo foi formado e identificar entradas,
saidas, origem e data.

**Why this priority**: Estoque por movimentacoes so e confiavel para o usuario se
o saldo puder ser explicado por um historico rastreavel.

**Independent Test**: Pode ser testada abrindo o detalhe de um produto com
movimentacoes de entrada e saida e verificando que o historico mostra tipo,
quantidade, origem e data sem permitir edicao.

**Acceptance Scenarios**:

1. **Given** que um produto possui entradas e saidas registradas, **When** o
   usuario abre seu detalhe de estoque, **Then** o historico mostra cada
   movimentacao com tipo, quantidade, data e origem.
2. **Given** que uma movimentacao veio de recebimento de compra, **When** o
   historico e exibido, **Then** a origem permite reconhecer que ela veio de uma
   compra ou recebimento.
3. **Given** que uma movimentacao veio de venda, **When** o historico e exibido,
   **Then** a origem permite reconhecer que ela veio de uma venda.
4. **Given** que um produto nao possui movimentacoes, **When** o usuario abre seu
   detalhe, **Then** a interface mostra estado vazio apropriado e saldo atual
   igual ao valor informado pela fonte oficial.
5. **Given** que um produto possui movimentacoes de periodos ou tipos diferentes,
   **When** o usuario filtra o historico por periodo ou tipo, **Then** a lista de
   movimentacoes mostra somente eventos correspondentes aos filtros aplicados.

---

### User Story 4 - Acompanhar pendencias de recebimento (Priority: P4)

Como operador da Amani, quero ver produtos pendentes de recebimento dentro da
area de estoque, para saber quais itens comprados ainda nao entraram fisicamente
no estoque.

**Why this priority**: Pendencias conectam compras em transito ao saldo atual e
ajudam a explicar por que produtos comprados ainda nao aparecem como disponiveis.

**Independent Test**: Pode ser testada abrindo a visao de pendencias e
confirmando que itens pendentes mostram produto, fornecedor, compra de origem e
quantidade pendente, sem tratar a pendencia como saldo disponivel.

**Acceptance Scenarios**:

1. **Given** que existem itens comprados ainda pendentes de recebimento, **When**
   o usuario acessa a visao de pendentes, **Then** cada item mostra produto,
   fornecedor, compra de origem e quantidade pendente.
2. **Given** que nao existem pendencias, **When** o usuario acessa a visao de
   pendentes, **Then** a interface mostra estado vazio claro.
3. **Given** que um item esta pendente de recebimento, **When** ele aparece na
   area de estoque, **Then** a interface deixa claro que essa quantidade nao e
   saldo disponivel.
4. **Given** que uma pendencia possui compra de origem identificavel, **When** o
   usuario aciona a pendencia, **Then** o sistema abre o detalhe da compra de
   origem para continuidade operacional no fluxo de compras.

---

### User Story 5 - Usar estoque em telas pequenas e grandes (Priority: P5)

Como usuario da Amani em operacao, quero consultar estoque, historico e
pendencias em smartphone, tablet e desktop, para acompanhar a operacao durante
viagens, recebimentos e rotinas de escritorio.

**Why this priority**: O modulo de estoque e operacional e precisa funcionar nos
contextos reais de uso definidos para o ERP.

**Independent Test**: Pode ser testada executando lista, busca, filtros, detalhe
de movimentacoes e pendencias em smartphone, tablet e desktop, sem sobreposicao
de conteudo ou perda de acoes principais.

**Acceptance Scenarios**:

1. **Given** que o usuario esta em smartphone, **When** consulta lista, detalhe e
   pendencias, **Then** textos, saldos, filtros e acoes permanecem legiveis e
   acionaveis.
2. **Given** que o usuario esta em tablet ou desktop, **When** alterna entre
   saldo, historico e pendencias, **Then** a tela aproveita melhor o espaco sem
   esconder informacoes essenciais.

### Edge Cases

- Consulta de saldos indisponivel deve exibir estado de erro e permitir nova
  tentativa sem mostrar dados como atuais.
- Lista de estoque vazia deve exibir estado vazio orientado ao usuario.
- Produto sem movimentacoes deve mostrar historico vazio sem sugerir erro.
- Produto com saldo negativo retornado pela fonte oficial deve ser exibido com
  destaque de inconsistencia operacional, sem correcao local do valor.
- Produto removido, inexistente ou inacessivel ao abrir detalhe deve exibir
  estado de nao encontrado ou erro recuperavel.
- Busca sem resultados deve exibir estado vazio preservando o termo buscado e
  permitir limpar a busca.
- Filtros combinados que nao retornam produtos devem exibir estado vazio
  especifico para filtros.
- Historico com muitas movimentacoes deve respeitar os limites da fonte oficial
  e sinalizar que a lista pode estar limitada quando essa informacao existir.
- Pendencias indisponiveis devem exibir erro proprio sem bloquear a consulta de
  saldos ja carregada.
- Quantidade pendente de recebimento nao pode ser somada ou apresentada como
  saldo disponivel.
- A feature nao deve oferecer ajuste manual de saldo, transferencia, alerta de
  estoque minimo, edicao de movimentacoes, criacao de movimentacao ou exclusao
  de historico.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o usuario acesse uma area de estoque
  com lista de produtos e saldos atuais.
- **FR-002**: O sistema MUST exibir o saldo atual exatamente como informado pela
  fonte oficial de estoque, sem recalcular saldo no cliente.
- **FR-003**: O sistema MUST mostrar por padrao todos os produtos retornados pela
  fonte oficial, inclusive produtos com saldo zero.
- **FR-003a**: O sistema MUST exibir saldo negativo retornado pela fonte oficial
  com destaque de inconsistencia operacional, sem corrigir ou substituir o valor
  localmente.
- **FR-004**: O sistema MUST permitir busca por identificacao textual do produto,
  como nome, codigo ou outra informacao equivalente disponivel ao usuario.
- **FR-005**: O sistema MUST permitir filtrar a lista para destacar produtos com
  saldo disponivel, mantendo opcao clara para remover filtros.
- **FR-006**: O sistema MUST permitir abrir o detalhe de estoque de um produto a
  partir da lista.
- **FR-007**: O sistema MUST exibir no detalhe o saldo atual do produto conforme
  a fonte oficial.
- **FR-008**: O sistema MUST exibir o historico de movimentacoes do produto com
  tipo, quantidade, data e origem de cada movimentacao quando essas informacoes
  existirem.
- **FR-009**: O sistema MUST diferenciar entradas, saidas, inventario inicial e
  outras origens reconhecidas pela fonte oficial sem alterar o significado
  desses eventos.
- **FR-010**: O sistema MUST permitir ao usuario compreender quando o historico
  exibido esta vazio, limitado ou indisponivel.
- **FR-010a**: O sistema MUST permitir filtrar o historico de movimentacoes por
  periodo e por tipo de movimentacao quando a fonte oficial oferecer esses
  recortes.
- **FR-011**: O sistema MUST apresentar uma visao de produtos pendentes de
  recebimento com produto, fornecedor, compra de origem e quantidade pendente
  quando essas informacoes existirem.
- **FR-012**: O sistema MUST deixar claro que produtos pendentes de recebimento
  ainda nao representam saldo disponivel.
- **FR-012a**: O sistema MUST permitir abrir o detalhe da compra de origem a
  partir de cada pendencia que possua compra identificavel.
- **FR-013**: O sistema MUST oferecer estados de carregamento, erro e vazio para
  lista de estoque, detalhe de movimentacoes e pendencias.
- **FR-014**: O sistema MUST preservar a area de estoque como somente leitura,
  sem permitir criar, editar ou excluir movimentacoes.
- **FR-015**: O sistema MUST manter ajuste manual de saldo, transferencia de
  estoque, alerta de estoque minimo e edicao de movimentacoes fora desta
  entrega.
- **FR-016**: O sistema MUST funcionar em smartphone, tablet e desktop sem
  sobreposicao de conteudo, controles inacessiveis ou perda de informacoes
  essenciais.
- **FR-017**: O sistema MUST exibir mensagens compreensiveis quando a fonte
  oficial rejeitar, falhar ou nao retornar os dados esperados.
- **FR-018**: O sistema MUST evitar dados simulados ou calculos locais para
  preencher saldos, historicos ou pendencias.
- **FR-019**: O sistema MUST permitir atualizar novamente as leituras de saldo,
  historico e pendencias apos falha ou quando o usuario precisar de informacao
  atualizada.
- **FR-020**: O sistema MUST manter consistencia visual com a identidade oficial
  Dark Only e com os estados de interface ja usados nas areas operacionais do
  ERP.

### Key Entities *(include if feature involves data)*

- **Produto em Estoque**: Produto exibido na area de estoque com identificacao
  operacional e saldo atual informado pela fonte oficial.
- **Saldo Atual**: Valor de disponibilidade fisica exibido ao usuario, derivado
  pela fonte oficial a partir de movimentacoes historicas e nunca calculado no
  cliente.
- **Movimentacao de Estoque**: Evento historico de entrada, saida, inventario
  inicial ou outra origem reconhecida, usado para explicar como o saldo do
  produto foi formado.
- **Origem da Movimentacao**: Contexto rastreavel da movimentacao, como compra,
  recebimento, venda ou inventario inicial, conforme informado pela fonte
  oficial.
- **Produto Pendente de Recebimento**: Item comprado que ainda nao foi totalmente
  recebido fisicamente, contendo produto, fornecedor, compra de origem e
  quantidade pendente. Quando houver compra de origem identificavel, a pendencia
  deve permitir continuidade operacional no detalhe dessa compra.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario consegue identificar o saldo atual de um produto em ate
  30 segundos a partir da area de estoque quando o produto existe na lista.
- **SC-002**: Um usuario consegue localizar um produto usando busca ou filtro em
  ate 30 segundos em uma lista de pelo menos 100 produtos.
- **SC-003**: Um usuario consegue abrir o detalhe de um produto e entender as
  principais entradas, saidas e origens do historico em ate 1 minuto.
- **SC-004**: 100% dos saldos exibidos correspondem ao valor retornado pela
  fonte oficial, sem ajuste ou recomputacao no cliente.
- **SC-005**: 100% das movimentacoes exibidas preservam tipo, quantidade, data e
  origem recebidos da fonte oficial quando esses dados existem.
- **SC-006**: 100% dos itens pendentes de recebimento exibidos sao apresentados
  como pendencia, nunca como saldo disponivel.
- **SC-007**: 100% dos estados de carregamento, erro e vazio definidos para
  lista, detalhe e pendencias aparecem em validacao manual dos fluxos.
- **SC-008**: Os fluxos principais de lista, busca, filtro, detalhe e pendencias
  podem ser usados em smartphone, tablet e desktop sem bloqueio visual ou perda
  de acoes principais.

## Assumptions

- A consulta oficial de estoque da F008 esta disponivel antes desta feature ser
  implementada.
- A feature de compras e recebimentos ja gera movimentacoes reais e produtos
  pendentes que tornam a area de estoque operacionalmente util.
- O usuario principal e operador ou gestor da Amani que acompanha disponibilidade
  fisica, rastreabilidade de saldo e recebimentos pendentes.
- Busca textual pode ser local ou delegada a fonte oficial conforme o contrato
  existente permitir, desde que o saldo exibido continue vindo da fonte oficial.
- Filtros de saldo refletem apenas recortes de exibicao e nao alteram o saldo
  oficial.
- Pendencias de recebimento podem ser abertas a partir da area de estoque, mas o
  registro de recebimento ou perda permanece no fluxo de compras.
- A experiencia preserva Mobile First e deve ser validada em smartphone, tablet e
  desktop.
- A experiencia visual segue a identidade oficial Dark Only do ERP.
