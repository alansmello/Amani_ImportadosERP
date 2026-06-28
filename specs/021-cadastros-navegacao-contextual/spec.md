# Feature Specification: Cadastros Auxiliares, Fornecedores e Navegação Contextual

**Feature Branch**: `021-cadastros-navegacao-contextual`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Seguir para a Feature 021 de docs/roadmap/RoadMap_AmaniERP.md: aprimorar Fornecedores, permitir cadastros auxiliares sem perder rascunhos, remover identificadores técnicos das telas operacionais e padronizar a navegação contextual."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar referências sem perder o rascunho (Priority: P1)

Como operador, quero cadastrar um Fornecedor durante uma nova Compra e cadastrar Categoria ou Fornecedor durante um novo Produto, para continuar o trabalho sem abandonar nem refazer os dados já preenchidos.

**Why this priority**: As interrupções nos dois fluxos operacionais impedem a conclusão do cadastro quando uma referência ainda não existe e geram retrabalho no rascunho.

**Independent Test**: Pode ser validado preenchendo parcialmente uma Compra e um Produto, criando cada referência ausente pelo respectivo modal e confirmando que o novo registro fica selecionado enquanto todos os demais dados permanecem intactos.

**Acceptance Scenarios**:

1. **Given** uma nova Compra com dados e itens já preenchidos, **When** o usuário cria um Fornecedor pelo modal, **Then** o Fornecedor criado aparece selecionado e nenhum dado do rascunho é perdido.
2. **Given** um novo Produto parcialmente preenchido, **When** o usuário cria uma Categoria pelo modal, **Then** a Categoria criada aparece selecionada e os demais campos permanecem inalterados.
3. **Given** um novo Produto parcialmente preenchido, **When** o usuário cria um Fornecedor pelo modal, **Then** o Fornecedor criado aparece selecionado e os demais campos permanecem inalterados.
4. **Given** um modal rápido aberto sobre um formulário preenchido, **When** o usuário cancela ou encontra erro de validação, **Then** o modal fecha ou permanece disponível conforme a ação e o formulário hospedeiro preserva integralmente o rascunho.
5. **Given** que não existe nenhum Fornecedor cadastrado, **When** o usuário acessa Nova Compra, **Then** o formulário e a ação de cadastrar Fornecedor permanecem acessíveis, embora a Compra só possa ser concluída após selecionar um Fornecedor e possuir Produto disponível.
6. **Given** que não existe nenhuma Categoria cadastrada, **When** o usuário acessa Novo Produto, **Then** a ação de cadastrar Categoria permanece visível e utilizável.

---

### User Story 2 - Consultar Fornecedor por informação útil (Priority: P2)

Como operador, quero registrar e consultar o telefone opcional do Fornecedor e não visualizar códigos técnicos de Fornecedor, Cliente ou Produto, para reconhecer os registros por informações operacionais.

**Why this priority**: A informação de contato apoia a operação diária, enquanto identificadores técnicos ocupam espaço sem ajudar a decisão do usuário.

**Independent Test**: Pode ser validado criando e editando Fornecedores com e sem telefone, consultando listagem e detalhe e percorrendo os cabeçalhos e estados de referência de Fornecedor, Cliente e Produto para confirmar que nenhum GUID é apresentado.

**Acceptance Scenarios**:

1. **Given** um Fornecedor novo ou existente, **When** o usuário salva um telefone válido, **Then** o valor sem espaços excedentes é preservado e exibido nos pontos de consulta do Fornecedor.
2. **Given** um Fornecedor sem telefone, **When** o usuário consulta a listagem, **Then** a coluna Telefone exibe “Não informado” e o registro continua válido.
3. **Given** os formulários oficial e rápido de Fornecedor, **When** o usuário deixa o telefone vazio, **Then** o cadastro pode ser concluído sem exigir esse dado.
4. **Given** uma tela operacional de Fornecedor, Cliente ou Produto incluída no escopo, **When** o registro é apresentado, **Then** nenhum GUID completo ou abreviado é exibido ao usuário.
5. **Given** uma referência ausente ou não encontrada, **When** a tela precisa representar esse estado, **Then** apresenta uma mensagem operacional em vez de usar um GUID como fallback.

---

### User Story 3 - Voltar para a origem do trabalho (Priority: P2)

Como usuário que navega entre módulos, quero que a ação Voltar retorne à origem interna real e use uma rota pai segura quando essa origem não estiver disponível, para manter o contexto sem sair do ERP.

**Why this priority**: Links fixos interrompem jornadas entre módulos e podem devolver o usuário a uma tela diferente daquela em que iniciou a ação.

**Independent Test**: Pode ser validado acessando as páginas mapeadas por navegação interna, acesso direto e atualização do navegador, verificando a origem quando válida e o fallback interno em todos os demais casos.

**Acceptance Scenarios**:

1. **Given** que o usuário abriu uma página de criação, edição ou detalhe a partir de outra página interna do ERP, **When** aciona Voltar, **Then** retorna à origem interna registrada.
2. **Given** uma página aberta diretamente, atualizada ou sem origem interna conhecida, **When** o usuário aciona Voltar, **Then** é levado à rota pai segura definida para essa página.
3. **Given** um link controlado entre módulos com origem explícita válida, **When** o usuário conclui a navegação e aciona Voltar, **Then** retorna ao caminho interno informado.
4. **Given** uma origem explícita externa, malformada ou não permitida, **When** o usuário aciona Voltar, **Then** a origem é ignorada e o fallback interno é utilizado.
5. **Given** um modal aberto, **When** o usuário aciona Cancelar, **Then** somente o modal é fechado e a navegação da página não é alterada.

### Edge Cases

- Fornecedores existentes sem telefone permanecem válidos após a disponibilização do novo campo.
- Telefone vazio ou composto apenas por espaços é tratado como não informado; espaços no início e no fim são removidos.
- Telefones iguais podem pertencer a Fornecedores diferentes; o telefone não identifica unicamente o registro.
- Telefone acima de 50 caracteres é recusado com mensagem operacional e não altera o cadastro existente.
- Falha ao criar uma referência no modal mantém os dados digitados no modal e o rascunho do formulário hospedeiro.
- Duplo acionamento da confirmação do modal enquanto o primeiro envio está em andamento não cria registros duplicados.
- Se o registro criado não puder ser refletido imediatamente no seletor, o formulário hospedeiro permanece intacto e informa que a referência deve ser recarregada, sem selecionar silenciosamente outro registro.
- A Compra não pode ser concluída sem Produto, mesmo quando o Fornecedor foi criado com sucesso.
- A ausência simultânea de Categoria e Fornecedor em Novo Produto não pode ocultar nenhuma das duas ações de cadastro rápido.
- Uma origem cujo caminho não pertença ao conjunto reconhecido de rotas operacionais do ERP usa o fallback da página.
- Origem externa, caminho protocol-relative, esquema de URL ou valor malformado nunca é usado na ação Voltar.
- Atualizar a página não pode fazer a ação Voltar sair do ERP nem depender de histórico externo do navegador.
- Em smartphone, o teclado e o conteúdo do modal não podem ocultar a ação de salvar ou cancelar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir que o telefone do Fornecedor seja omitido tanto na criação quanto na atualização.
- **FR-002**: Quando informado, o telefone do Fornecedor MUST aceitar no máximo 50 caracteres após a remoção de espaços no início e no fim.
- **FR-003**: O sistema MUST tratar telefone vazio ou composto apenas por espaços como não informado.
- **FR-004**: O sistema MUST rejeitar telefone acima do limite com mensagem operacional e sem alterar o estado persistido do Fornecedor.
- **FR-005**: O sistema MUST NOT exigir unicidade do telefone entre Fornecedores.
- **FR-006**: Fornecedores existentes sem telefone MUST permanecer válidos e consultáveis sem preenchimento retroativo obrigatório.
- **FR-007**: Os formulários oficial e rápido de Fornecedor MUST disponibilizar os mesmos campos, obrigatoriedades e regras de normalização, incluindo o telefone opcional.
- **FR-008**: A listagem de Fornecedores MUST substituir a apresentação do identificador técnico pela coluna Telefone e exibir “Não informado” quando o valor estiver ausente.
- **FR-009**: As telas operacionais mapeadas de Fornecedor, Cliente e Produto MUST NOT exibir GUID completo ou abreviado em cabeçalhos, detalhes, listagens ou fallbacks visíveis.
- **FR-010**: Referências ausentes ou não encontradas MUST ser representadas por mensagens operacionais que descrevam o estado sem expor o identificador técnico.
- **FR-011**: A remoção visual dos GUIDs MUST preservar a capacidade de abrir, editar, relacionar e salvar os mesmos registros.
- **FR-012**: Nova Compra MUST oferecer cadastro rápido de Fornecedor sem exigir que o usuário abandone a página.
- **FR-013**: Novo Produto MUST oferecer cadastros rápidos de Categoria e de Fornecedor sem exigir que o usuário abandone a página.
- **FR-014**: O cadastro rápido de Fornecedor MUST apresentar o mesmo comportamento em Nova Compra e Novo Produto.
- **FR-015**: O cadastro rápido de Categoria MUST aplicar o mesmo contrato de nome do cadastro oficial de Categoria.
- **FR-016**: Após criar uma referência com sucesso, o sistema MUST disponibilizá-la no seletor correspondente e selecioná-la automaticamente.
- **FR-017**: Abertura, erro, cancelamento e sucesso de qualquer cadastro rápido MUST preservar todos os valores e itens já preenchidos no formulário hospedeiro.
- **FR-018**: Erros retornados ao criar uma referência MUST ser apresentados dentro do modal em linguagem operacional, sem substituir o rascunho do formulário hospedeiro.
- **FR-019**: Enquanto um cadastro rápido estiver sendo confirmado, o sistema MUST impedir confirmações simultâneas da mesma solicitação na interação do usuário.
- **FR-020**: Nova Compra MUST continuar acessível quando não houver Fornecedor cadastrado e MUST manter visível a ação que permite corrigir essa ausência.
- **FR-021**: Nova Compra MUST continuar impedindo sua conclusão quando não houver Produto disponível ou selecionado conforme as regras vigentes.
- **FR-022**: Novo Produto MUST manter a ação de criar Categoria acessível mesmo quando a lista de Categorias estiver vazia.
- **FR-023**: Os cadastros rápidos MUST complementar, e não substituir, as telas oficiais de Fornecedor e Categoria disponíveis pela navegação normal.
- **FR-024**: As páginas operacionais mapeadas de criação, edição e detalhe MUST oferecer uma ação Voltar com fallback interno obrigatório e específico para a página.
- **FR-025**: Quando existir uma origem interna válida registrada para a jornada atual, a ação Voltar MUST priorizá-la sobre o fallback.
- **FR-026**: Em acesso direto, atualização, origem ausente, inválida ou não permitida pelo conjunto de rotas operacionais reconhecidas, a ação Voltar MUST usar o fallback interno da página.
- **FR-027**: O sistema MUST aceitar uma origem explícita somente quando ela tiver sido registrada por uma navegação controlada do ERP e representar um caminho interno permitido.
- **FR-028**: O sistema MUST rejeitar como origem de retorno qualquer URL externa, esquema de URL, caminho protocol-relative ou valor malformado.
- **FR-029**: A ação Voltar MUST NOT retirar o usuário do ERP em nenhum cenário previsto nesta feature.
- **FR-030**: A ação Cancelar dentro de modais MUST continuar fechando o modal sem acionar a navegação contextual da página.
- **FR-031**: Modais, formulários, seletores, mensagens, tabelas e ações alterados MUST permanecer utilizáveis e legíveis em smartphone, tablet e desktop.
- **FR-032**: As interfaces alteradas MUST preservar o tema visual oficial e os padrões de interação já adotados no ERP.

### Scope Boundaries

- A feature inclui telefone opcional de Fornecedor, cadastros rápidos de Fornecedor e Categoria nos fluxos aprovados e retorno contextual nas páginas operacionais mapeadas de criação, edição e detalhe.
- A remoção visual de GUIDs abrange: listagem e detalhe de Fornecedor; cabeçalhos de detalhe de Cliente e Produto; fallbacks de Cliente em Contas a Receber; e linguagem de identificador técnico no filtro de Estoque. Esse conjunto fechado é detalhado em `contracts/apresentacao-identificadores.md`.
- A feature não inclui novos campos de Fornecedor além de telefone, inativação ou exclusão, máscara por país, integração com WhatsApp, cadastro rápido de Produto na Compra ou cadastro rápido de Cliente na Venda.
- A feature não inclui breadcrumbs completos, redesign da navegação principal nem alteração das regras de estoque, custo médio, lucro ou movimentações.
- Identificadores internos continuam sendo usados para localizar e relacionar registros; apenas sua apresentação ao usuário é removida.

### Key Entities

- **Fornecedor**: parceiro comercial associado a Compras e Produtos; possui nome e telefone opcional, sem unicidade por telefone.
- **Categoria de Produto**: classificação selecionável no cadastro de Produto e disponível para criação rápida pelo mesmo nome aceito no cadastro oficial.
- **Compra em rascunho**: conjunto de dados e itens preenchidos antes da confirmação; pode receber um Fornecedor recém-criado sem perder seu estado.
- **Produto em rascunho**: conjunto de dados preenchidos antes da criação; pode receber Categoria e Fornecedor recém-criados sem perder seu estado.
- **Origem de navegação**: caminho interno validado que representa a página anterior relevante da jornada atual.
- **Fallback de retorno**: rota pai interna e obrigatória usada quando não há origem de navegação segura e disponível.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Em 100% dos cenários de criação rápida bem-sucedida, a nova referência aparece selecionada sem perda de qualquer campo ou item previamente preenchido no formulário hospedeiro.
- **SC-002**: Um usuário consegue cadastrar e selecionar um novo Fornecedor a partir de Nova Compra ou Novo Produto em até 60 segundos, sem sair da página.
- **SC-003**: Um usuário consegue cadastrar e selecionar uma nova Categoria a partir de Novo Produto em até 30 segundos, sem sair da página.
- **SC-004**: 100% dos Fornecedores existentes sem telefone permanecem válidos e podem ser consultados e alterados após a entrega da feature.
- **SC-005**: Em 100% das telas operacionais mapeadas de Fornecedor, Cliente e Produto, nenhum GUID completo ou abreviado é exibido ao usuário.
- **SC-006**: Em 100% das jornadas internas validadas, a ação Voltar retorna à origem registrada; em 100% dos acessos diretos, atualizações ou origens inválidas, usa o fallback interno esperado.
- **SC-007**: Nenhum cenário de retorno testado conduz o usuário para fora do ERP.
- **SC-008**: Em pelo menos 10 execuções manuais representativas dos cadastros rápidos, no mínimo 9 são concluídas na primeira tentativa sem orientação adicional e sem perda do rascunho.
- **SC-009**: Todos os cenários críticos de cadastro rápido, consulta e navegação podem ser concluídos em smartphone, tablet e desktop sem conteúdo ou ações obrigatórias ocultas.

## Assumptions

- Os usuários já autenticados mantêm as permissões atualmente concedidas para Compras, Produtos, Fornecedores, Categorias e consultas; a feature não cria novos perfis ou permissões.
- O telefone do Fornecedor segue o limite de 50 caracteres já usado para telefone de Cliente, sem máscara dependente de país e sem validação de unicidade.
- A normalização de telefone remove apenas espaços no início e no fim; formatos variados permanecem aceitos dentro do limite para atender números nacionais, internacionais e extensões.
- A inclusão do telefone preserva todos os Fornecedores existentes por ser opcional e não exige preenchimento retroativo.
- As páginas operacionais mapeadas para navegação contextual são as páginas existentes de criação, edição e detalhe que atualmente apresentam retorno fixo e forem identificadas durante o planejamento; cada uma terá um fallback pai explícito.
- Uma origem explícita de retorno é aceita apenas em jornadas controladas pelo próprio ERP e nunca substitui a validação de caminho interno.
- Os cadastros oficiais de Fornecedor e Categoria continuam disponíveis e definem as mesmas regras de negócio usadas pelos respectivos modais rápidos.
- A validação seguirá os comandos de qualidade existentes e roteiros manuais completos, sem introduzir infraestrutura nova de testes automatizados, conforme decisão do roadmap para F020–F022.
- A experiência preserva Mobile First, Dark Theme, linguagem operacional, histórico existente e simplicidade, sem alterar regras de estoque, compras em trânsito, vendas, custo médio ou financeiro.
