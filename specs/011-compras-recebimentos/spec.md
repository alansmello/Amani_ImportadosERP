# Feature Specification: Compras e Recebimentos

**Feature Branch**: `011-compras-recebimentos`

**Created**: 2026-06-16

**Status**: Draft

**Input**: User description: "F011 - Compras e Recebimentos, para operar o ciclo de compra: registrar compra como mercadoria em transito, acompanhar pendencias, registrar recebimento parcial e perdas, com filtros, detalhe, visao de produtos pendentes, erros claros, responsividade e sem gerar estoque automaticamente na criacao da compra."

## Clarifications

### Session 2026-06-16

- Q: Quais motivos de perda devem ser aceitos nesta feature? -> A: Somente Perda, Extravio e Avaria.
- Q: O mesmo produto pode aparecer mais de uma vez na mesma compra? -> A: Cada produto pode aparecer apenas uma vez na mesma compra.
- Q: Qual recorte deve aparecer por padrao na lista de compras? -> A: Compras em transito ou pendentes dos ultimos 30 dias.
- Q: Onde ajustes comerciais de compra podem ser informados? -> A: Por item e no total da compra.
- Q: Recebimentos e perdas exigem revisao antes do registro? -> A: Sim, ambos exigem revisao e confirmacao.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar compra em transito (Priority: P1)

Como operador da Amani, quero registrar uma nova compra com fornecedor, produtos,
quantidades, custos e ajustes comerciais por item e no total da compra, para
acompanhar mercadorias compradas que ainda nao foram recebidas fisicamente.

**Why this priority**: Sem o registro da compra, nao existe ponto de partida para
acompanhar transito, pendencias, recebimentos parciais ou perdas.

**Independent Test**: Pode ser testada criando uma compra com fornecedor e itens
validos e verificando que ela aparece como compra em transito, sem indicar entrada
fisica em estoque no momento da criacao.

**Acceptance Scenarios**:

1. **Given** que existem fornecedores e produtos cadastrados, **When** o usuario
   registra uma compra com ao menos um item valido e sem produtos repetidos,
   **Then** a compra fica disponivel para acompanhamento como mercadoria em
   transito.
2. **Given** que o usuario esta registrando uma compra, **When** algum fornecedor,
   produto, quantidade ou valor obrigatorio estiver ausente ou invalido, **Then**
   o sistema impede a conclusao e orienta a correcao sem perder os dados ja
   preenchidos.
3. **Given** que uma compra foi criada, **When** o usuario consulta a compra,
   **Then** a interface deixa claro que a criacao nao representa recebimento
   fisico nem entrada automatica de estoque.

---

### User Story 2 - Acompanhar compras e pendencias (Priority: P2)

Como operador da Amani, quero listar compras, filtrar por periodo e fornecedor e
ver produtos pendentes de recebimento, para decidir o que precisa ser conferido
ou cobrado.

**Why this priority**: O acompanhamento reduz perda de controle entre compra,
transporte e chegada fisica dos produtos.

**Independent Test**: Pode ser testada abrindo a area de compras, aplicando
filtros, acessando uma compra e confirmando que compras em transito e produtos
pendentes aparecem com informacoes suficientes para acao operacional.

**Acceptance Scenarios**:

1. **Given** que existem compras registradas, **When** o usuario acessa a lista de
   compras, **Then** ele visualiza por padrao compras em transito ou pendentes
   dos ultimos 30 dias com fornecedor, data, status operacional e valores
   principais.
2. **Given** que existem compras de diferentes fornecedores ou periodos, **When**
   o usuario aplica filtros, **Then** a lista mostra apenas os resultados
   correspondentes e permite limpar os filtros.
3. **Given** que existem itens ainda nao recebidos, **When** o usuario acessa a
   visao de pendencias, **Then** ele identifica produto, fornecedor, compra de
   origem e quantidade pendente.

---

### User Story 3 - Registrar recebimento parcial (Priority: P3)

Como operador da Amani, quero registrar recebimento fisico parcial ou total dos
itens comprados, para atualizar a operacao somente com produtos realmente
recebidos.

**Why this priority**: Recebimento fisico e o momento que alimenta a entrada real
de estoque; a interface precisa apoiar esse controle sem antecipar saldo.

**Independent Test**: Pode ser testada selecionando um item pendente, informando
uma quantidade recebida menor ou igual a pendente e confirmando que a compra
mantem apenas a quantidade restante como pendente.

**Acceptance Scenarios**:

1. **Given** que uma compra possui item pendente, **When** o usuario registra uma
   quantidade recebida valida, revisa e confirma a acao, **Then** o recebimento
   e confirmado e o item passa a refletir a nova pendencia restante.
2. **Given** que uma compra possui quantidade pendente, **When** o usuario tenta
   registrar quantidade maior que a pendente ou nao positiva, **Then** a
   operacao e rejeitada com mensagem clara.
3. **Given** que o recebimento foi confirmado, **When** o usuario retorna ao
   detalhe da compra, **Then** o historico da operacao mostra o recebimento de
   forma rastreavel.

---

### User Story 4 - Registrar perda, extravio ou avaria (Priority: P4)

Como operador da Amani, quero registrar perda, extravio ou avaria de itens de
compra, para preservar o historico operacional sem transformar esses itens em
estoque disponivel.

**Why this priority**: Perdas precisam ser rastreadas para controle do prejuizo e
para reduzir a pendencia de recebimento quando a mercadoria nao chegara em boas
condicoes.

**Independent Test**: Pode ser testada selecionando um item pendente, informando
quantidade e motivo de perda e verificando que a pendencia e atualizada sem
indicar entrada de estoque.

**Acceptance Scenarios**:

1. **Given** que uma compra possui item pendente, **When** o usuario registra uma
   perda com motivo valido, revisa e confirma a acao, **Then** a perda fica
   registrada no historico e a quantidade pendente e atualizada.
2. **Given** que o usuario tenta registrar uma perda sem motivo, com quantidade
   invalida ou com motivo diferente de Perda, Extravio ou Avaria, **When**
   confirma a acao, **Then** o sistema rejeita a operacao e informa como
   corrigir.
3. **Given** que uma perda foi registrada, **When** o usuario consulta o detalhe
   da compra, **Then** a interface deixa claro que a perda nao representa entrada
   fisica em estoque.

---

### User Story 5 - Usar compras no celular, tablet e desktop (Priority: P5)

Como usuario da Amani em operacao, quero consultar, registrar e conferir compras
em telas pequenas e grandes, para operar durante viagens, recebimentos e rotinas
de escritorio.

**Why this priority**: Compras e recebimentos acontecem fora de uma mesa de
trabalho; a experiencia mobile e requisito operacional do ERP.

**Independent Test**: Pode ser testada executando os fluxos de lista, nova compra,
detalhe, recebimento e perda em smartphone, tablet e desktop, sem sobreposicao de
campos, botoes ou mensagens.

**Acceptance Scenarios**:

1. **Given** que o usuario esta em smartphone, **When** abre lista, detalhe e
   formulario de compra, **Then** todos os campos e acoes permanecem legiveis e
   acionaveis.
2. **Given** que o usuario esta em tablet ou desktop, **When** acompanha compras
   e pendencias, **Then** a tela aproveita melhor o espaco sem esconder
   informacoes essenciais.

### Edge Cases

- Compra sem itens deve ser rejeitada antes da confirmacao.
- Compra com o mesmo produto repetido em mais de um item deve ser rejeitada antes
  da confirmacao.
- Item com quantidade, custo ou ajuste comercial invalido deve orientar correcao
  sem descartar o restante do preenchimento.
- Lista de fornecedores ou produtos indisponivel deve exibir estado de erro e
  permitir nova tentativa.
- Compra inexistente, removida ou inacessivel deve exibir estado de nao
  encontrada ou erro recuperavel.
- Recebimento parcial deve aceitar apenas quantidade positiva e limitada ao saldo
  pendente do item conforme a fonte oficial.
- Perda deve aceitar apenas os motivos Perda, Extravio ou Avaria, com quantidade
  positiva limitada ao saldo pendente do item conforme a fonte oficial.
- Falha de validacao da fonte oficial deve aparecer ao usuario com mensagem clara
  e sem assumir que a operacao foi concluida.
- Criacao de compra nao pode ser apresentada como entrada de estoque.
- Perda, extravio ou avaria nao podem ser apresentados como entrada de estoque.
- A feature nao deve oferecer cancelamento, edicao de compra, ajuste manual de
  estoque ou importacao em massa.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o usuario registre uma nova compra com
  fornecedor, data, ao menos um produto, quantidade, custo unitario e ajustes
  comerciais por item e no total da compra quando informados.
- **FR-001a**: O sistema MUST impedir que o mesmo produto seja incluido mais de
  uma vez na mesma compra.
- **FR-002**: O sistema MUST tratar toda compra recem-criada como mercadoria em
  transito ate que exista confirmacao de recebimento fisico.
- **FR-003**: O sistema MUST NOT apresentar a criacao da compra como entrada de
  estoque ou saldo disponivel.
- **FR-004**: O sistema MUST permitir consultar uma lista de compras com
  informacoes suficientes para identificar fornecedor, data, situacao
  operacional e valor principal.
- **FR-005**: O sistema MUST abrir a lista de compras mostrando por padrao compras
  em transito ou pendentes dos ultimos 30 dias.
- **FR-006**: O sistema MUST permitir filtrar compras por periodo, fornecedor e
  situacao operacional, com opcao clara para remover filtros.
- **FR-007**: O sistema MUST permitir consultar o detalhe de uma compra, incluindo
  itens, quantidades compradas, quantidades recebidas, quantidades perdidas e
  pendencias restantes.
- **FR-008**: O sistema MUST apresentar uma visao de produtos pendentes de
  recebimento com produto, fornecedor, compra de origem e quantidade pendente.
- **FR-009**: O sistema MUST permitir registrar recebimento parcial ou total de
  item pendente, com quantidade positiva e limitada pela pendencia reconhecida
  pela fonte oficial.
- **FR-010**: O sistema MUST atualizar a leitura operacional da compra apos
  recebimento confirmado, mantendo rastreabilidade do recebimento.
- **FR-011**: O sistema MUST permitir registrar perda, extravio ou avaria de item
  pendente, exigindo um dos motivos Perda, Extravio ou Avaria e quantidade
  valida.
- **FR-012**: O sistema MUST exigir revisao e confirmacao explicita antes de
  registrar recebimento ou perda.
- **FR-013**: O sistema MUST NOT apresentar perdas, extravios ou avarias como
  entrada de estoque.
- **FR-014**: O sistema MUST exibir mensagens de erro da fonte oficial quando uma
  compra, recebimento ou perda for rejeitada.
- **FR-015**: O sistema MUST preservar dados preenchidos em formularios quando a
  validacao local ou oficial rejeitar a operacao.
- **FR-016**: O sistema MUST oferecer estados de carregamento, vazio, erro,
  sucesso e confirmacao quando aplicavel aos fluxos de compras e recebimentos.
- **FR-017**: O sistema MUST funcionar em smartphone, tablet e desktop sem
  sobreposicao de conteudo, controles inacessiveis ou perda de acoes principais.
- **FR-018**: O sistema MUST manter cancelamento de compra, edicao de compra,
  ajuste manual de estoque, transferencia de estoque e importacao em massa fora
  desta entrega.
- **FR-019**: O sistema MUST evitar calculos criticos de estoque, custo medio,
  lucro, metricas gerenciais ou consistencia financeira no cliente; esses valores
  devem vir da fonte oficial quando forem exibidos.
- **FR-020**: O sistema MUST diferenciar visualmente compra em transito,
  recebimento confirmado, perda registrada e pendencia restante para reduzir erro
  operacional.

### Key Entities *(include if feature involves data)*

- **Compra**: Registro comercial de aquisicao de produtos de um fornecedor,
  contendo data, itens, ajustes comerciais gerais, valores principais e situacao
  operacional.
- **Item de Compra**: Produto comprado com quantidade, custo unitario, ajustes
  comerciais, quantidade recebida, quantidade perdida e quantidade pendente. Cada
  produto deve aparecer no maximo uma vez por compra.
- **Fornecedor**: Parceiro associado a compra e usado para filtros,
  identificacao e contexto operacional.
- **Produto Pendente de Recebimento**: Visao operacional de itens comprados ainda
  nao totalmente recebidos nem baixados por perda.
- **Recebimento**: Confirmacao fisica de quantidade recebida de um item de
  compra, responsavel por tornar a entrada rastreavel.
- **Perda de Compra**: Registro de quantidade perdida, extraviada ou avariada,
  com motivo restrito a Perda, Extravio ou Avaria, sem transformar a quantidade
  em estoque.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um usuario consegue registrar uma compra valida com ate 10 itens em
  ate 5 minutos, sem treinamento tecnico.
- **SC-002**: Um usuario consegue localizar compras em transito ou pendentes dos
  ultimos 30 dias em ate 30 segundos quando ha registros correspondentes.
- **SC-003**: Um usuario consegue registrar recebimento parcial de um item
  pendente em ate 1 minuto apos abrir o detalhe da compra.
- **SC-004**: Um usuario consegue registrar perda, extravio ou avaria de um item
  pendente em ate 1 minuto apos abrir o detalhe da compra.
- **SC-005**: 100% das operacoes rejeitadas pela fonte oficial exibem uma mensagem
  compreensivel ao usuario e nao mostram a acao como concluida.
- **SC-006**: 100% das compras criadas pela feature permanecem identificadas como
  em transito ate que recebimentos fisicos sejam confirmados.
- **SC-007**: 100% das perdas registradas pela feature sao exibidas como perda,
  extravio ou avaria, nunca como entrada de estoque.
- **SC-008**: Os fluxos principais de lista, nova compra, detalhe, recebimento e
  perda podem ser completados em smartphone, tablet e desktop sem bloqueio visual
  ou perda de acoes principais.

## Assumptions

- Fornecedores e produtos ja existem no sistema e podem ser usados como dados de
  apoio para registrar compras.
- A validacao definitiva de quantidades pendentes, recebimentos, perdas,
  historico e efeitos de estoque permanece na fonte oficial.
- O usuario principal e operador ou gestor da Amani que executa compras,
  conferencia de chegada e acompanhamento de pendencias.
- A feature preserva Mobile First e deve ser validada em smartphone, tablet e
  desktop.
- A experiencia visual segue a identidade oficial Dark Only do ERP.
- Compras podem ter recebimentos parciais em momentos diferentes.
- Perdas reduzem a pendencia operacional do item quando aceitas pela fonte
  oficial, mas nao geram entrada de estoque.
- Cancelamento, edicao de compra, ajuste manual de estoque, importacao em massa e
  relatorios avancados ficam fora do escopo desta feature.
