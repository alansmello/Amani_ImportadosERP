# Feature Specification: Implantacao Inicial

**Feature Branch**: `002-implantacao-inicial`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Permitir iniciar o Amani ERP em uma operacao ja existente, registrando saldos iniciais sem quebrar as regras de historico do sistema. O escopo inclui inventario inicial por movimentacoes de estoque, saldo inicial de caixa como evento financeiro e contas a receber iniciais com origem rastreavel. Fora do escopo: dashboard financeiro, frontend, mobile, autenticacao, multiusuario, importacao por planilha, relatorios avancados e alterar regra de venda para cliente inativo."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Registrar inventario inicial de produtos (Priority: P1)

Como operador responsavel pela implantacao, quero registrar o estoque inicial dos produtos ja existentes para que o sistema comece a operar com saldo disponivel rastreavel desde o primeiro dia.

**Why this priority**: Sem estoque inicial, a empresa nao consegue vender produtos ja existentes nem validar saldo corretamente no inicio da operacao.

**Independent Test**: Informar uma data de implantacao e itens de inventario com produto, quantidade e valor unitario quando aplicavel; depois consultar o saldo do produto e confirmar que ele foi formado por movimentacoes de inventario inicial.

**Acceptance Scenarios**:

1. **Given** produtos ja cadastrados e sem saldo inicial registrado, **When** o operador registra inventario inicial com quantidades positivas, **Then** cada item gera uma movimentacao rastreavel de estoque do tipo InventarioInicial.
2. **Given** um produto incluido no inventario inicial, **When** o saldo de estoque e consultado, **Then** o saldo considera a movimentacao de inventario inicial sem existir campo fixo de estoque no produto.
3. **Given** um item com produto inexistente, quantidade invalida ou data ausente, **When** o operador tenta registrar o inventario, **Then** o registro e rejeitado com informacao clara sobre o problema.

---

### User Story 2 - Registrar saldo inicial de caixa (Priority: P2)

Como operador responsavel pela implantacao, quero registrar o valor de caixa existente na data de inicio para que o financeiro tenha uma origem historica do saldo inicial.

**Why this priority**: A operacao existente pode ja ter dinheiro em caixa; registrar esse valor como evento evita saldo manual sem historico.

**Independent Test**: Informar valor, data de implantacao e descricao de origem; depois confirmar que o valor ficou registrado como evento financeiro de saldo inicial, com origem rastreavel.

**Acceptance Scenarios**:

1. **Given** uma operacao com caixa preexistente, **When** o operador registra o saldo inicial de caixa, **Then** o sistema cria um evento financeiro identificado como saldo inicial.
2. **Given** um valor negativo ou data ausente, **When** o operador tenta registrar saldo inicial de caixa, **Then** o sistema rejeita a solicitacao.
3. **Given** um saldo inicial de caixa registrado, **When** o historico financeiro e consultado, **Then** a origem do valor permanece identificavel como implantacao inicial.

---

### User Story 3 - Cadastrar contas a receber iniciais (Priority: P3)

Como operador responsavel pela implantacao, quero cadastrar valores pendentes de clientes antigos para que a empresa acompanhe recebimentos anteriores ao uso do ERP sem perder a origem desses debitos.

**Why this priority**: Empresas em operacao podem iniciar o ERP com valores em aberto; esses recebiveis precisam entrar no controle financeiro sem serem confundidos com vendas novas.

**Independent Test**: Informar cliente, valor pendente, vencimento, data de origem e identificacao de saldo inicial; depois consultar contas a receber e confirmar que a origem esta marcada como SaldoInicial ou ImplantacaoInicial.

**Acceptance Scenarios**:

1. **Given** um cliente cadastrado e um valor pendente antigo, **When** o operador registra uma conta a receber inicial, **Then** a conta fica disponivel para acompanhamento com origem rastreavel.
2. **Given** uma conta a receber inicial, **When** pagamentos forem registrados no fluxo existente de recebimento, **Then** a conta pode ser baixada mantendo sua origem inicial.
3. **Given** cliente inexistente, valor invalido ou vencimento ausente, **When** o operador tenta registrar a conta inicial, **Then** o sistema rejeita o cadastro.

---

### Edge Cases

- Inventario inicial com lista vazia deve ser rejeitado.
- Inventario inicial com produto duplicado na mesma solicitacao deve ser rejeitado.
- Quantidade zero ou negativa no inventario inicial deve ser rejeitada.
- Valor unitario/custo negativo deve ser rejeitado quando informado.
- Produto inexistente deve impedir a criacao da movimentacao correspondente.
- Saldo inicial de caixa sem valor, data ou origem deve ser rejeitado.
- Conta a receber inicial sem cliente, valor, vencimento ou origem deve ser rejeitada.
- Conta a receber inicial com cliente inexistente deve ser rejeitada.
- Registros iniciais nao devem apagar, sobrescrever ou recalcular historico operacional existente.
- A feature nao deve alterar regra de venda para cliente inativo.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir registrar inventario inicial para produtos ja cadastrados.
- **FR-002**: O sistema MUST registrar estoque inicial exclusivamente por movimentacoes de estoque.
- **FR-003**: O sistema MUST identificar cada movimentacao de estoque inicial com o tipo InventarioInicial.
- **FR-004**: O sistema MUST gerar uma movimentacao de estoque para cada item valido informado no inventario inicial.
- **FR-005**: Cada item de inventario inicial MUST registrar produto, quantidade, data e valor unitario/custo quando aplicavel.
- **FR-006**: O sistema MUST rejeitar inventario inicial sem itens.
- **FR-007**: O sistema MUST rejeitar item de inventario inicial com produto inexistente.
- **FR-008**: O sistema MUST rejeitar quantidade menor ou igual a zero em item de inventario inicial.
- **FR-009**: O sistema MUST rejeitar valor unitario/custo negativo quando esse valor for informado.
- **FR-010**: O sistema MUST NOT criar ou usar campo fixo de estoque em produto ou em qualquer cadastro.
- **FR-011**: O sistema MUST permitir registrar saldo inicial de caixa existente na data de implantacao.
- **FR-012**: O saldo inicial de caixa MUST ser registrado como evento financeiro rastreavel.
- **FR-013**: O sistema MUST NOT criar saldo financeiro manual fixo sem historico.
- **FR-014**: O evento de saldo inicial de caixa MUST registrar valor, data e origem da implantacao.
- **FR-015**: O sistema MUST rejeitar saldo inicial de caixa com valor negativo.
- **FR-016**: O sistema MUST permitir cadastrar contas a receber iniciais de clientes antigos.
- **FR-017**: Contas a receber iniciais MUST identificar a origem como SaldoInicial ou ImplantacaoInicial.
- **FR-018**: O sistema MUST reaproveitar o modelo de contas a receber existente sempre que isso preservar valor, cliente, vencimento, status e rastreabilidade.
- **FR-019**: Conta a receber inicial MUST registrar cliente, valor, vencimento e origem.
- **FR-020**: O sistema MUST rejeitar conta a receber inicial para cliente inexistente.
- **FR-021**: O sistema MUST rejeitar conta a receber inicial com valor menor ou igual a zero.
- **FR-022**: O sistema MUST preservar historico existente e MUST NOT apagar compras, vendas, movimentacoes, despesas, pagamentos ou contas a receber.
- **FR-023**: Todo dado criado por esta feature MUST possuir origem rastreavel de implantacao inicial.
- **FR-024**: O backend MUST continuar sendo a fonte unica das regras de validacao e consistencia.
- **FR-025**: Contratos de entrada e saida MUST ser dedicados para as operacoes de implantacao inicial.
- **FR-026**: O sistema MUST NOT expor entidades internas como contrato externo quando houver risco de acoplamento.
- **FR-027**: O sistema MUST NOT usar mapeamento automatico entre contratos e regras de negocio.
- **FR-028**: O sistema MUST manter mapeamentos persistentes explicitos para novos campos ou tipos persistidos.
- **FR-029**: A feature MUST NOT alterar dashboard financeiro, frontend, mobile, autenticacao, multiusuario, importacao por planilha, relatorios avancados ou regra de venda para cliente inativo.

### Key Entities *(include if feature involves data)*

- **Movimentacao de Estoque Inicial**: Registro historico que representa a entrada inicial de quantidade para um produto ja cadastrado; possui produto, quantidade, data, tipo InventarioInicial e valor unitario/custo quando aplicavel.
- **Evento Financeiro de Saldo Inicial**: Registro historico que representa o valor de caixa existente na data de implantacao; possui valor, data, descricao e origem de implantacao.
- **Conta a Receber Inicial**: Valor pendente anterior ao uso do ERP associado a um cliente; possui cliente, valor, vencimento, status e origem SaldoInicial ou ImplantacaoInicial.
- **Produto**: Cadastro existente usado como referencia para inventario inicial; nao armazena saldo fixo.
- **Cliente**: Cadastro existente usado como referencia para contas a receber iniciais.

### Affected Contracts and Expected Operations

- **InventarioInicialRequest/Response**: Contratos para registrar inventario inicial com data, origem e lista de itens.
- **InventarioInicialItemRequest/Response**: Contratos para cada produto, quantidade e valor unitario/custo informado.
- **SaldoInicialCaixaRequest/Response**: Contratos para registrar o evento financeiro de saldo inicial de caixa.
- **ContaReceberInicialRequest/Response**: Contratos para registrar contas a receber iniciais com origem rastreavel.
- **Expected operation - POST /api/implantacao/inventario-inicial**: Registra inventario inicial por movimentacoes de estoque.
- **Expected operation - POST /api/implantacao/saldo-inicial-caixa**: Registra saldo inicial de caixa como evento financeiro.
- **Expected operation - POST /api/implantacao/contas-receber-iniciais**: Registra contas a receber antigas com origem de implantacao.

### Technical Decisions and Risks

- **TD-001**: Inventario inicial deve entrar no mesmo historico de movimentacoes de estoque para preservar a regra central de saldo por movimentacao.
- **TD-002**: Contas a receber iniciais devem reaproveitar o modelo existente sempre que possivel, adicionando apenas a informacao de origem quando necessaria para rastreabilidade.
- **TD-003**: Saldo inicial de caixa deve ser modelado como evento historico financeiro, nao como valor editavel isolado.
- **RISK-001**: Se o operador registrar inventario inicial incorreto, o saldo inicial ficara historicamente rastreado, mas exigira evento de correcao futuro em vez de edicao silenciosa.
- **RISK-002**: Se houver duplicidade de produto em um mesmo inventario inicial, a leitura operacional pode ficar ambigua; por isso a solicitacao deve rejeitar duplicidade antes do registro.
- **RISK-003**: Se contas a receber iniciais forem confundidas com vendas novas, indicadores futuros podem ficar distorcidos; por isso a origem deve ser obrigatoria e consultavel.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador consegue registrar inventario inicial de ate 50 itens em uma unica operacao guiada, sem alterar manualmente saldo de produto.
- **SC-002**: 100% dos itens validos de inventario inicial geram movimentacoes rastreaveis com tipo InventarioInicial.
- **SC-003**: 100% das tentativas de inventario com produto inexistente, quantidade invalida ou valor negativo sao rejeitadas com resultado claro.
- **SC-004**: Um operador consegue registrar o saldo inicial de caixa em menos de 2 minutos com valor, data e origem identificaveis.
- **SC-005**: 100% dos saldos iniciais de caixa ficam visiveis como eventos historicos, nao como saldo manual sem origem.
- **SC-006**: Um operador consegue cadastrar uma conta a receber inicial em menos de 2 minutos por cliente/debito.
- **SC-007**: 100% das contas a receber iniciais registradas possuem origem SaldoInicial ou ImplantacaoInicial.
- **SC-008**: Apos a feature, consultas de estoque e financeiro conseguem distinguir registros de implantacao inicial de operacoes normais.
- **SC-009**: Compras, vendas, custo medio, lucro, dashboard financeiro, frontend e regra de cliente inativo permanecem sem mudanca funcional nesta feature.

## Assumptions

- Produtos, clientes e cadastros base necessarios ja foram criados pela Feature 001 ou por fluxos existentes.
- O operador responsavel pela implantacao tem permissao operacional para registrar saldos iniciais.
- Inventario inicial representa entrada historica de estoque na data de inicio do ERP, nao compra nova.
- Saldo inicial de caixa representa valor financeiro preexistente na data de implantacao, nao receita nova.
- Contas a receber iniciais representam debitos anteriores ao uso do ERP, nao vendas novas.
- Registros incorretos devem ser corrigidos por eventos rastreaveis futuros, nao por apagamento de historico.
- Importacao em massa por planilha fica fora do escopo; os registros sao feitos por contrato operacional direto.
