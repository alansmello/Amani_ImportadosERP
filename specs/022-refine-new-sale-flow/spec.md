# Feature Specification: Refinamento do Fluxo de Nova Venda

**Feature Branch**: `022-refine-new-sale-flow`

**Created**: 2026-06-28

**Status**: Draft

**Input**: User description: "Iniciar a Feature 022 seguindo as decisões aprovadas em docs/roadmap/RoadMap_AmaniERP.md: implementar o cadastro rápido de cliente em modal, substituir o formulário múltiplo de itens por um compositor único que limpa após inclusão, bloquear a adição de produto duplicado, exibir resumo detalhado e editável dos itens incluídos, e preservar o contrato e a lógica de persistência de venda existentes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cadastrar cliente rápido em modal (Priority: P1)

Como operador de caixa, quero cadastrar um novo cliente diretamente na tela de Nova Venda por meio de um modal, para que eu possa prosseguir com a venda sem perder o rascunho de itens ou o progresso do preenchimento.

**Why this priority**: A abertura do cadastro em outra aba interrompe o fluxo de vendas e exige recarregamento ou reinserção dos itens, gerando retrabalho e fricção no momento do atendimento.

**Independent Test**: Pode ser validado iniciando o preenchimento de uma nova venda com itens no resumo, clicando no botão para criar cliente rápido, preenchendo as informações mínimas e salvando. O cliente recém-criado deve aparecer selecionado e os itens devem permanecer intactos no resumo.

**Acceptance Scenarios**:

1. **Given** a tela de Nova Venda com campos preenchidos e itens no resumo, **When** o usuário aciona a ação "Cadastrar cliente", **Then** um modal de cadastro simplificado é exibido sobrepondo o formulário de venda.
2. **Given** o modal de cadastro rápido de cliente, **When** o usuário preenche o nome (obrigatório) e opcionalmente e-mail e telefone e clica em salvar, **Then** o cliente é cadastrado no backend, o modal é fechado, o cliente cadastrado é selecionado automaticamente no campo de cliente da venda, e os demais campos e itens no resumo são preservados sem recarregamento.
3. **Given** o modal de cadastro rápido de cliente, **When** o usuário tenta salvar sem preencher o nome ou com dados inválidos, **Then** o sistema exibe mensagens de erro da API dentro do modal e mantém as informações digitadas para correção.
4. **Given** o modal de cadastro rápido de cliente, **When** o usuário decide cancelar ou fechar o modal, **Then** o modal fecha e todo o rascunho da venda (itens, data e outros campos) permanece inalterado.

---

### User Story 2 - Compositor único e limpo de item de venda (Priority: P1)

Como operador de caixa, quero utilizar um único compositor de item para adicionar produtos à venda, que limpe seus campos após a inclusão, para que o fluxo de adição de múltiplos produtos seja rápido e livre de poluição visual.

**Why this priority**: Evita múltiplos cards abertos para cada item, reduzindo a rolagem de tela e mantendo a interface limpa, essencial para visualização em dispositivos móveis (Mobile First).

**Independent Test**: Pode ser validado selecionando um produto no compositor de item, inserindo uma quantidade e preço, clicando em "Incluir item", e verificando que o item foi para o resumo e o compositor foi redefinido para o estado inicial.

**Acceptance Scenarios**:

1. **Given** o compositor de item na tela de Nova Venda, **When** o usuário seleciona um produto, **Then** o campo de preço unitário é preenchido automaticamente com o preço padrão do produto, permitindo alteração manual pelo usuário.
2. **Given** um produto selecionado, **When** o usuário insere quantidade, desconto e acréscimo válidos e clica em "Incluir item", **Then** o item é adicionado ao resumo da venda com seu respectivo cálculo de subtotal líquido, e os campos do compositor voltam aos seus valores padrões (em branco/zerados).
3. **Given** o compositor de item, **When** o usuário tenta incluir um item sem selecionar um produto ou com quantidade menor ou igual a zero, **Then** a inclusão é bloqueada com uma indicação visual de erro no campo correspondente, sem poluir o resumo da venda.

---

### User Story 3 - Bloqueio de produto duplicado e edição no resumo (Priority: P2)

Como operador de caixa, quero que o sistema bloqueie a inserção de produtos duplicados no compositor e me oriente a editar o item existente diretamente no resumo, para evitar consolidações automáticas indesejadas e garantir precisão nos preços e descontos aplicados.

**Why this priority**: A consolidação automática de produtos duplicados pode ocultar ou sobrescrever descontos ou acréscimos diferenciados dados a um segundo lote do mesmo produto. O bloqueio com orientação garante que o operador decida explicitamente como tratar a duplicidade.

**Independent Test**: Adicione um produto ao resumo da venda, em seguida tente selecionar o mesmo produto novamente no compositor e clicar em "Incluir item". O sistema deve apresentar uma mensagem clara de que o produto já está na lista e instruir o usuário a editá-lo.

**Acceptance Scenarios**:

1. **Given** um produto que já consta na listagem de itens do resumo de venda, **When** o usuário tenta adicionar o mesmo produto pelo compositor de item, **Then** o sistema bloqueia a ação "Incluir item" e exibe uma mensagem orientando o usuário a ajustar o item já existente.
2. **Given** a lista de itens no resumo de venda, **When** o usuário aciona a ação de editar em um item da lista, **Then** os dados desse item (Produto, quantidade, preço unitário, desconto e acréscimo) são carregados de volta nos campos do compositor de item, e o item é temporariamente removido da lista do resumo para edição.
3. **Given** um item carregado para edição no compositor, **When** o usuário cancela a edição, **Then** o compositor é limpo e o item retorna ao seu estado original na lista de itens do resumo de venda.
4. **Given** um item carregado para edição no compositor, **When** o usuário confirma as alterações clicando em "Incluir item", **Then** o item modificado é adicionado de volta à lista do resumo e o compositor é limpo.
5. **Given** a lista de itens no resumo de venda, **When** o usuário aciona a ação de remover em um item da lista, **Then** o item é excluído do resumo de venda com atualização imediata dos totais.

---

### User Story 4 - Resumo de venda e visualização de totais (Priority: P2)

Como operador de caixa, quero visualizar um resumo claro com todos os itens adicionados à venda e os totais gerais estimados, para conferência antes de finalizar a operação.

**Why this priority**: O resumo atua como a única fonte de verdade visual dos itens confirmados na venda, permitindo a validação de quantidade, descontos e valores antes de disparar o comando para a API.

**Independent Test**: Valide adicionando itens com diferentes quantidades, descontos e acréscimos e verifique se o resumo exibe o nome de cada produto, quantidade, preço unitário, valor líquido do item e os totais gerais (subtotal, desconto geral, acréscimo geral e total líquido da venda).

**Acceptance Scenarios**:

1. **Given** itens adicionados ao resumo de venda, **When** visualizados no resumo, **Then** cada linha exibe o nome do produto, a quantidade, o preço unitário e o valor líquido final calculado do item.
2. **Given** o resumo de venda, **When** itens são adicionados, alterados ou removidos, **Then** o subtotal da venda, o total de descontos, o total de acréscimos e o total líquido geral são atualizados em tempo real no rodapé do resumo.
3. **Given** a ação de finalizar venda, **When** o usuário tenta confirmar a venda com itens ou dados incompletos no compositor de item, **Then** o sistema ignora o conteúdo parcial do compositor e processa a venda contendo exclusivamente as linhas já confirmadas no resumo de venda.
4. **Given** uma venda finalizada com sucesso, **When** o sistema retorna feedback positivo e abre o modal de pagamento, **Then** todos os campos de rascunho de venda, cliente selecionado, compositor de item e resumo são limpos para a próxima transação.

### Edge Cases

- **Tentar fechar o modal de cadastro de cliente por clique fora:** O modal de cadastro rápido de cliente não deve fechar acidentalmente ao clicar fora de sua área. O fechamento deve ocorrer estritamente pelos botões "Salvar" ou "Cancelar/Fechar", preservando os dados da venda.
- **Cancelar edição de item após selecionar outro produto:** Se o usuário estiver editando um item (que removeu temporariamente o produto da lista) e selecionar um produto diferente no compositor, o item original permanece em estado de edição. Se ele cancelar ou limpar o formulário, o produto original deve ser restaurado na lista de itens confirmados com seus valores intactos.
- **Estoque consultivo desatualizado:** Caso a consulta consultiva de estoque no frontend mostre saldo que mude antes da gravação da venda, a validação no backend deve continuar sendo a barreira de segurança definitiva. O frontend deve exibir amigavelmente a falha retornada da API e manter o rascunho da venda aberto para que o usuário possa ajustar o item sem perder o trabalho.
- **Venda com valor líquido zerado:** Caso descontos aplicados nos itens ou no total geral reduzam o total líquido da venda a zero ou menos, o sistema deve bloquear o envio ou validar a regra financeira configurada no backend, sem falhar de forma catastrófica na interface do usuário.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir cadastrar um cliente através de modal rápido na tela de Nova Venda, reaproveitando as validações do formulário oficial (Nome obrigatório, E-mail e Telefone opcionais).
- **FR-002**: O sistema MUST manter todos os dados da venda (data, itens no resumo, descontos e acréscimos gerais) intocados durante a abertura, edição, sucesso ou fechamento do modal de cadastro rápido de cliente.
- **FR-003**: O sistema MUST selecionar automaticamente o cliente recém-cadastrado no campo de seleção de clientes da venda após a confirmação de sucesso do modal.
- **FR-004**: O sistema MUST apresentar um único formulário compositor para entrada de itens da venda contendo: seleção de Produto, Quantidade, Preço Unitário, Desconto do Item e Acréscimo do Item.
- **FR-005**: O sistema MUST carregar o preço de venda padrão cadastrado para o produto selecionado no campo de preço unitário do compositor de item, mantendo a edição do valor habilitada.
- **FR-006**: O sistema MUST validar o item isoladamente no compositor (ex.: produto selecionado, quantidade maior que zero) antes de permitir a sua inclusão no resumo.
- **FR-007**: O sistema MUST limpar os dados do compositor de item, redefinindo-o ao estado inicial de formulário vazio, logo após a inclusão com sucesso de um item na lista de itens confirmados.
- **FR-008**: O sistema MUST bloquear a inclusão de um produto que já esteja presente na lista de itens do resumo de venda, exibindo uma mensagem instrutiva orientando a edição do item existente.
- **FR-009**: O sistema MUST permitir a edição de um item do resumo, carregando seus dados de volta no compositor de item e removendo temporariamente o item da lista do resumo para evitar duplicidade ou inconsistência matemática durante o ajuste.
- **FR-010**: O sistema MUST exibir na lista de itens do resumo de venda os seguintes atributos de cada item confirmado: Nome do Produto, Quantidade, Preço Unitário e Valor Líquido do Item (calculado como `(Preço Unitário × Quantidade) − Desconto + Acréscimo`).
- **FR-011**: O sistema MUST manter em tempo real a exibição consolidada de Subtotal, Desconto Geral da Venda, Acréscimo Geral da Venda e Total Líquido Geral no resumo de venda.
- **FR-012**: O sistema MUST enviar à API do backend apenas as linhas que foram de fato incluídas e confirmadas no resumo de venda, ignorando rascunhos inacabados ou dados parciais contidos no compositor de item no momento da finalização.
- **FR-013**: O sistema MUST preservar o contrato do payload de envio `CriarVendaDto` e a integração com o modal de pagamento financeiro pós-venda (Dinheiro, PIX, Débito, Crédito e Fiado).
- **FR-014**: O sistema MUST manter as mensagens de alerta de estoque consultivas na tela de Nova Venda, enquanto preserva a validação impeditiva definitiva de saldo na API do backend.
- **FR-015**: O sistema MUST limpar cliente selecionado, compositor de item, resumo de itens e valores gerais de rascunho de venda após a finalização bem-sucedida da venda e fechamento do fluxo de pagamento.

### Key Entities *(include if feature involves data)*

- **Cliente (Customer)**: Entidade existente. No escopo da F022, é adicionado o fluxo de criação rápida via modal com campos `Nome` (obrigatório), `Email` (opcional) e `Telefone` (opcional).
- **Produto (Product)**: Entidade existente. Utilizada no compositor para preencher o `PrecoVenda` padrão e verificar a disponibilidade física consultiva em estoque.
- **ItemVendaDraft (Draft Sale Item)**: Entidade de interface temporária que separa o estado do formulário de composição de item do array de itens consolidados do resumo.
- **VendaDraft (Draft Sale)**: Estado local da tela que agrupa o cliente selecionado, a data, a lista de itens confirmados no resumo, descontos/acréscimos gerais e o subtotal calculado antes do envio definitivo para o backend.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O fluxo de cadastro de um novo cliente a partir da venda deve ser concluído com no máximo 3 interações (clicar no atalho, preencher dados/salvar, e confirmar a seleção automática).
- **SC-002**: 100% dos dados já digitados no rascunho de venda (outros campos e itens incluídos) devem ser preservados e mantidos sem alteração ao abrir e fechar o modal de cadastro rápido de cliente.
- **SC-003**: 100% das tentativas de incluir um produto duplicado na venda devem ser bloqueadas no frontend, exibindo um alerta imediato de orientação.
- **SC-004**: O rodapé do resumo de venda deve atualizar e exibir o valor líquido calculado em até 100 milissegundos após qualquer inclusão, edição ou remoção de item.
- **SC-005**: 100% do payload gerado para `CriarVendaDto` deve corresponder estritamente aos itens visíveis na tabela de resumo da venda, sem conter itens incompletos do compositor.

## Assumptions

- **A-001**: O sistema preserva a abordagem Mobile First obrigatória, de forma que o modal de cliente rápido, o compositor único de itens e a tabela de resumo com ações sejam perfeitamente utilizáveis em telas menores (smartphones) e maiores (desktops).
- **A-002**: Não há novas tabelas ou migrações de dados no banco de dados para esta feature, pois a criação rápida de cliente e de venda consome contratos e endpoints de API já existentes.
- **A-003**: O backend do ERP permanece como a única fonte confiável de validação de estoque, custo médio, cálculo de lucros e processamento financeiro. O cálculo feito no frontend destina-se apenas a dar feedback visual imediato ao operador.
- **A-004**: Nenhuma infraestrutura de testes automatizados (Vitest, Playwright, RTL) será introduzida nesta feature, conforme diretriz de conformidade da Fase 4. A validação será atestada por roteiros de teste manuais descritos na `quickstart.md` e verificação estática de tipos, lint e compilação do projeto.
- **A-005**: O componente compartilhado de retorno contextual (botão Voltar com histórico interno e fallbackHref) será preservado ou estendido para a página de vendas, direcionando o usuário para a sua origem real de navegação.
