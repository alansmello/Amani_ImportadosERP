# Feature Specification: Financeiro Contas a Receber Frontend

**Feature Branch**: `014-financeiro-contas-receber`

**Created**: 2026-06-22

**Status**: Draft

**Input**: User description: "F014 — Financeiro: Contas a Receber (frontend). Gerir recebíveis: criar, listar, registrar pagamentos, ver por cliente, editar e excluir. Frontend sobre ContasReceberController (completo). Entra: /financeiro/contas-receber (lista + visão por cliente), criar, registrar pagamento, editar, excluir, detalhe por cliente. Fica fora: Contas a pagar, conciliação bancária, juros/multa automáticos. Dependências: Clientes (pronto). Vendas a prazo idealmente geram recebíveis (verificar acoplamento — atualmente conta a receber é criada manualmente). Critérios de aceite: CRUD + pagamento funcionais; saldo/valores vêm do backend; histórico preservado (exclusão segue regra do backend); responsivo."

## Clarifications

### Session 2026-06-22

- Q: O status da conta é campo retornado explicitamente pela fonte oficial ou derivado no frontend? → A: Campo explícito retornado pela fonte oficial. Confirmado no contrato real: `ContaReceberListDto.Status` retorna `"Pago"` ou `"Pendente"` (dois estados, não três). `"Parcialmente paga"` não existe no contrato do backend e foi removida da spec.
- Q: Como tratar o detalhe por cliente, dado que o endpoint atual não retorna Status nem registros individuais de pagamento? → A: Ampliar o backend no escopo F014 — estender `ContaReceberDetalheDto` para incluir `Status` e lista de registros de pagamento (`List<PagamentoDto>`), mantendo o endpoint `GET /api/contas-receber/cliente/{clienteId}` como fonte oficial do detalhe por cliente.
- Q: Como a ação de registrar pagamento deve ser apresentada ao usuário? → A: Modal ou bottom-sheet com campo de valor, abrindo diretamente da lista ou do detalhe por cliente, sem navegação para página separada.
- Q: A lista principal de contas a receber deve ter filtros? → A: Sim — filtro por status ("Pendente" / "Pago") e busca por nome de cliente, ambos aplicados localmente sobre o resultado já carregado.
- Q: O campo `Origem` e o vínculo com venda (`VendaId`) devem ser exibidos no frontend? → A: Sim — exibir `Origem` na lista e no detalhe; quando `VendaId` não for nulo, oferecer link navegável para `/vendas/[vendaId]`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Criar conta a receber (Priority: P1)

Como operador da Amani, quero criar uma conta a receber informando cliente,
valor e data de vencimento, para registrar um recebível pendente e acompanhá-lo
pelo módulo financeiro.

**Why this priority**: Criar é o ponto de entrada de todo o fluxo de recebíveis;
sem ele o módulo não tem dados para gerenciar e o controle financeiro permanece
inoperante.

**Independent Test**: Pode ser testada criando uma conta a receber com cliente
existente, valor e data de vencimento, confirmando que o registro aparece na
lista como pendente conforme a fonte oficial.

**Acceptance Scenarios**:

1. **Given** que existe um cliente cadastrado, **When** o operador informa valor
   e data de vencimento e confirma a criação, **Then** a conta a receber é
   registrada pela fonte oficial e aparece na lista como pendente.
2. **Given** que o operador não informou cliente, valor ou data de vencimento,
   **When** tenta confirmar a criação, **Then** o sistema impede o envio e
   destaca os campos obrigatórios ausentes.
3. **Given** que a fonte oficial rejeitou a criação por dados inválidos,
   **When** a resposta chega, **Then** a interface exibe a mensagem de erro e
   mantém o formulário preenchido para correção.

---

### User Story 2 - Registrar pagamento de uma conta a receber (Priority: P2)

Como operador da Amani, quero registrar o pagamento total ou parcial de uma
conta a receber, para atualizar o saldo devedor conforme os valores oficiais e
acompanhar o progresso de liquidação.

**Why this priority**: Registrar pagamento é a operação mais frequente sobre
recebíveis existentes e é indispensável para manter o controle financeiro
atualizado.

**Independent Test**: Pode ser testada selecionando uma conta a receber
pendente, informando o valor pago e confirmando; o saldo atualizado deve ser
refletido na leitura oficial sem recálculo no cliente.

**Acceptance Scenarios**:

1. **Given** que existe uma conta a receber pendente, **When** o operador
   informa um valor de pagamento e confirma, **Then** o pagamento é registrado
   pela fonte oficial e o saldo atualizado é exibido.
2. **Given** que o valor informado é inválido (zero ou negativo), **When** o
   operador tenta confirmar, **Then** o sistema impede o envio com mensagem
   clara.
3. **Given** que a fonte oficial aceita o pagamento, **When** a confirmação
   chega, **Then** a interface atualiza a exibição do saldo e histórico de
   pagamentos sem recalcular valores localmente.

---

### User Story 3 - Listar e consultar contas a receber (Priority: P3)

Como gestor da Amani, quero consultar a lista de contas a receber com
informações de cliente, valor, vencimento e status, para ter visão rápida dos
recebíveis pendentes e quitados.

**Why this priority**: A listagem é a porta de entrada para todas as operações
e oferece visão gerencial do fluxo de recebíveis.

**Independent Test**: Pode ser testada abrindo a área de contas a receber com
registros existentes e verificando que a lista exibe cliente, valor, vencimento
e status conforme retornado pela fonte oficial.

**Acceptance Scenarios**:

1. **Given** que existem contas a receber registradas, **When** o usuário abre
   a lista, **Then** as contas são exibidas com cliente, valor, vencimento e
   status oficial.
2. **Given** que não existem contas a receber, **When** o usuário abre a lista,
   **Then** um estado vazio informativo é apresentado com opção de criar.
3. **Given** que a lista está carregada, **When** o usuário seleciona uma conta,
   **Then** consegue acessar as ações disponíveis para aquela conta.

---

### User Story 4 - Ver recebíveis por cliente (Priority: P4)

Como gestor da Amani, quero visualizar as contas a receber agrupadas por
cliente, e ao selecionar um cliente ver o detalhe de suas contas, saldo total e
histórico de pagamentos, para acompanhar a situação financeira de cada cliente.

**Why this priority**: A visão por cliente agrega informação gerencial relevante
e é um endpoint distinto do backend que precisa ser exposto de forma útil na
interface.

**Independent Test**: Pode ser testada navegando para a visão por cliente,
selecionando um cliente com contas existentes e verificando que o detalhe exibe
contas, saldo total e histórico de pagamentos conforme a fonte oficial.

**Acceptance Scenarios**:

1. **Given** que existem clientes com contas a receber, **When** o usuário acessa
   a visão por cliente, **Then** os clientes aparecem com totais de recebíveis
   conforme retornado pela fonte oficial.
2. **Given** que o usuário seleciona um cliente, **When** abre o detalhe,
   **Then** vê as contas desse cliente com valores, vencimentos, status e
   histórico de pagamentos.
3. **Given** que um cliente não possui contas a receber, **When** o usuário
   acessa seu detalhe, **Then** um estado vazio informativo é exibido.

---

### User Story 5 - Editar conta a receber (Priority: P5)

Como operador da Amani, quero editar o valor ou a data de vencimento de uma
conta a receber existente, para corrigir informações sem precisar excluir e
recriar o registro.

**Why this priority**: Edição preserva o histórico de pagamentos já vinculados
à conta e permite correção de dados sem perda de rastreabilidade.

**Independent Test**: Pode ser testada selecionando uma conta a receber,
alterando valor ou data de vencimento e confirmando; o registro atualizado deve
ser refletido pela fonte oficial.

**Acceptance Scenarios**:

1. **Given** que existe uma conta a receber, **When** o operador altera valor
   ou data de vencimento e confirma, **Then** o registro é atualizado pela
   fonte oficial e os novos dados são exibidos.
2. **Given** que o operador fornece valor inválido ou data inválida, **When**
   tenta confirmar, **Then** a edição é bloqueada com mensagem de validação.
3. **Given** que a fonte oficial rejeita a atualização, **When** a resposta
   chega, **Then** a interface mantém os valores anteriores e exibe mensagem
   de erro.

---

### User Story 6 - Excluir conta a receber (Priority: P6)

Como operador da Amani, quero excluir uma conta a receber quando necessário,
para remover registros indevidos respeitando as regras da fonte oficial que
preserva o histórico operacional.

**Why this priority**: Exclusão é necessária para corrigir lançamentos
equivocados; a regra de quando é possível excluir pertence à fonte oficial.

**Independent Test**: Pode ser testada selecionando uma conta a receber,
solicitando exclusão com confirmação explícita e verificando que a interface
remove o registro somente após aceitação da fonte oficial.

**Acceptance Scenarios**:

1. **Given** que existe uma conta a receber, **When** o operador confirma a
   exclusão, **Then** a fonte oficial processa e a conta é removida da lista.
2. **Given** que o operador solicita exclusão, **When** a fonte oficial rejeita
   (ex: conta com pagamentos), **Then** a interface preserva o registro e exibe
   a razão da rejeição.
3. **Given** que o operador solicita exclusão, **When** antes de confirmar
   cancela a ação, **Then** nenhuma operação é enviada à fonte oficial.

---

### User Story 7 - Operar recebíveis em telas pequenas e grandes (Priority: P7)

Como usuário da Amani em rotina operacional, quero listar, criar, registrar
pagamentos, editar e excluir contas a receber em smartphone, tablet e desktop,
para gerenciar o financeiro dentro e fora do escritório.

**Why this priority**: Recebíveis são consultados e atualizados em contextos
móveis reais, tornando a responsividade um requisito operacional.

**Independent Test**: Pode ser testada executando os fluxos principais em
smartphone, tablet e desktop sem perda de informação ou bloqueio de ações.

**Acceptance Scenarios**:

1. **Given** que o usuário está em smartphone, **When** cria ou registra
   pagamento de uma conta a receber, **Then** campos, valores e ações
   permanecem legíveis e acionáveis.
2. **Given** que o usuário está em tablet ou desktop, **When** consulta lista
   ou visão por cliente, **Then** a tela aproveita melhor o espaço sem ocultar
   informações essenciais.

---

### Edge Cases

- Cliente inexistente ou inativo deve impedir a criação de conta a receber com
  mensagem clara.
- Valor zero ou negativo na criação ou no registro de pagamento deve ser
  rejeitado antes do envio à fonte oficial.
- Data de vencimento no passado deve exibir aviso informativo ao usuário; o
  envio é permitido e a validação final é responsabilidade da fonte oficial.
- Conta pendente deve diferenciar-se visualmente de conta paga; o status
  exibido corresponde ao campo `Status` retornado pela fonte oficial
  ("Pago" ou "Pendente"), sem estados intermediários derivados no cliente.
- Exclusão de conta com histórico de pagamentos deve ser bloqueada pela fonte
  oficial; a interface não deve silenciar o motivo da rejeição.
- Pagamento acima do saldo pendente deve ser rejeitado pela fonte oficial; a
  interface não deve validar limites de pagamento localmente.
- Falha da fonte oficial durante qualquer operação deve mostrar erro recuperável
  sem apresentar dados simulados como reais.
- A feature não deve calcular localmente saldo devedor, juros, multas ou
  qualquer métrica financeira; todos os valores vêm da fonte oficial.
- Contas a pagar, conciliação bancária e juros/multa automáticos permanecem
  fora desta entrega (ver FR-018).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir acessar uma área de contas a receber com
  lista de registros e informações suficientes para identificá-los (cliente,
  valor, vencimento, status).
- **FR-001a**: O sistema MUST permitir filtrar a lista por status ("Pendente"
  ou "Pago") e buscar por nome de cliente, ambos aplicados localmente sobre
  o conjunto já carregado da fonte oficial. A limpeza dos filtros restaura
  a lista completa.
- **FR-001b**: O sistema MUST exibir o campo `Origem` ("Manual" ou "Venda")
  na lista e no detalhe por cliente. Quando `VendaId` não for nulo, o sistema
  MUST oferecer link navegável para `/vendas/[vendaId]` permitindo rastrear
  a venda que originou o recebível.
- **FR-002**: O sistema MUST permitir alternar entre visão em lista e visão
  agrupada por cliente na mesma área.
- **FR-003**: O sistema MUST permitir iniciar a criação de uma nova conta a
  receber selecionando cliente existente, informando valor e data de vencimento.
- **FR-004**: O sistema MUST impedir a confirmação de criação quando cliente,
  valor ou data de vencimento estiverem ausentes ou inválidos.
- **FR-005**: O sistema MUST apresentar sucesso de criação somente após
  confirmação da fonte oficial.
- **FR-006**: O sistema MUST permitir registrar pagamento de uma conta a
  receber existente informando o valor pago via modal ou bottom-sheet,
  acessível diretamente da lista principal e do detalhe por cliente, sem
  navegar para uma página dedicada.
- **FR-007**: O sistema MUST impedir registro de pagamento com valor zero ou
  negativo.
- **FR-008**: O sistema MUST exibir `ValorTotal`, `TotalPago`, `Saldo` e
  `Status` ("Pago" ou "Pendente") conforme retornados pela fonte oficial,
  sem recálculo local. O status é campo explícito do contrato e não deve
  ser derivado de comparações entre valores no frontend.
- **FR-009**: O sistema MUST permitir editar valor e data de vencimento de uma
  conta a receber.
- **FR-010**: O sistema MUST bloquear edição com valores ou datas inválidos.
- **FR-011**: O sistema MUST atualizar a exibição após edição confirmada pela
  fonte oficial e preservar os valores anteriores quando a fonte oficial
  rejeitar.
- **FR-012**: O sistema MUST permitir excluir uma conta a receber com
  confirmação explícita do usuário antes do envio.
- **FR-013**: O sistema MUST remover o registro da lista somente após
  confirmação da fonte oficial e exibir a razão da rejeição quando a exclusão
  for bloqueada.
- **FR-014**: O sistema MUST permitir acessar o detalhe de contas a receber de
  um cliente específico a partir da visão por cliente, consumindo o endpoint
  `GET /api/contas-receber/cliente/{clienteId}`.
- **FR-014a**: O backend MUST estender `ContaReceberDetalheDto` para incluir
  o campo `Status` e uma lista de registros de pagamento
  (`List<PagamentoDetalheDto>` com `Id`, `Valor` e `DataPagamento`) antes que
  o frontend implemente essa tela. Essa extensão faz parte do escopo F014.
- **FR-015**: O sistema MUST exibir no detalhe por cliente as contas em aberto
  com Status, ValorTotal, TotalPago, Saldo, DataVencimento e, quando disponível,
  a lista de pagamentos individuais de cada conta, conforme retornado pela fonte
  oficial após a extensão do contrato.
- **FR-016**: O sistema MUST oferecer estados de carregamento, erro e vazio
  para lista, visão por cliente, detalhe e formulários.
- **FR-017**: O sistema MUST permitir nova tentativa após falha de consulta ou
  operação.
- **FR-018**: O sistema MUST manter contas a pagar, conciliação bancária,
  juros/multa automáticos e cálculo financeiro local fora desta entrega.
- **FR-019**: O sistema MUST evitar dados simulados para preencher saldos,
  histórico ou status de qualquer conta a receber.
- **FR-020**: O sistema MUST funcionar em smartphone, tablet e desktop sem
  sobreposição de conteúdo, controles inacessíveis ou perda de informações
  essenciais.
- **FR-021**: O sistema MUST manter consistência visual com a identidade oficial
  Dark Only e com os estados de interface já usados nas áreas operacionais do
  ERP.

### Key Entities *(include if feature involves data)*

- **Conta a Receber**: Recebível registrado para um cliente com valor, data de
  vencimento, status, origem e histórico de pagamentos; todos os valores e
  status vêm exclusivamente da fonte oficial. Pode estar vinculada a uma venda
  via `VendaId` (quando `Origem` = "Venda").
- **Cliente da Conta**: Cliente associado ao recebível, usado para identificar
  a conta, agrupar recebíveis e compor o detalhe por cliente.
- **Pagamento de Conta**: Registro de valor recebido vinculado a uma conta a
  receber; não pode ser recalculado ou simulado no cliente.
- **Detalhe por Cliente**: Visão das contas em aberto de um cliente específico,
  retornada por `GET /api/contas-receber/cliente/{clienteId}`. O contrato do
  backend será estendido no escopo F014 para incluir `Status` e lista de
  pagamentos individuais (`PagamentoDetalheDto`) em cada conta.
- **Pagamento Individual**: Registro de valor recebido com data, vinculado a
  uma conta a receber; exposto no detalhe por cliente após extensão do backend.
- **Status da Conta**: Campo `Status` retornado explicitamente pela fonte
  oficial na listagem (`ContaReceberListDto`), com valores `"Pago"` ou
  `"Pendente"`. Não existe estado "parcialmente paga" no contrato do backend;
  o frontend exibe exatamente o valor recebido, sem derivação local.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador consegue criar uma conta a receber com cliente, valor
  e vencimento em até 2 minutos quando os dados estão disponíveis.
- **SC-002**: 100% dos valores de saldo, pagamentos e status exibidos
  correspondem aos dados retornados pela fonte oficial, sem ajuste local.
- **SC-003**: Um operador consegue registrar um pagamento em uma conta a
  receber existente em até 1 minuto.
- **SC-004**: 100% das exclusões aceitas pela fonte oficial removem o registro
  da lista; 100% das exclusões rejeitadas preservam o registro com mensagem da
  fonte oficial.
- **SC-005**: Um gestor consegue localizar as contas de um cliente específico
  usando a visão por cliente e ver os pagamentos individuais de cada conta
  em até 30 segundos, após a extensão do contrato do backend.
- **SC-006**: 100% dos estados de carregamento, erro e vazio definidos para
  lista, visão por cliente, detalhe e formulários aparecem em validação manual
  dos fluxos.
- **SC-007**: Os fluxos principais de listar, criar, registrar pagamento, editar,
  excluir e consultar por cliente podem ser usados em smartphone, tablet e
  desktop sem bloqueio visual ou perda de ações principais.

## Assumptions

- Clientes cadastrados estão disponíveis antes desta feature ser implementada.
- O usuário principal é operador ou gestor da Amani responsável por gerenciar
  recebíveis da empresa.
- A fonte oficial valida criação, pagamentos, edição e exclusão; nenhuma regra
  financeira crítica é implementada no frontend.
- Contas a receber são criadas manualmente nesta feature; acoplamento automático
  com vendas a prazo é verificado mas não implementado no escopo F014.
- Datas são tratadas em UTC pela fonte oficial conforme já implementado no
  controller; o frontend envia datas sem componente de hora.
- A interface pode validar campos obrigatórios e formatos para melhorar a
  experiência, mas saldo devedor, status e validações financeiras permanecem
  na fonte oficial.
- A exclusão segue a regra da fonte oficial; a interface não implementa regra
  de negócio local sobre quando uma conta pode ser excluída.
- A experiência preserva Mobile First e deve ser validada em smartphone, tablet
  e desktop.
- A experiência visual segue a identidade oficial Dark Only do ERP.
