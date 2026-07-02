# Feature Specification: Refinamento do Fluxo de Nova Compra

**Feature Branch**: `025-refine-purchase-flow`

**Created**: 2026-07-01

**Status**: Draft

**Input**: User description: "Simplificar a inclusão de itens na nova compra com um único formulário, carrinho revisável e ações de editar ou remover antes do registro, preservando as regras atuais de compras, mercadorias em trânsito, recebimento, estoque e custo médio."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Compor um item por vez (Priority: P1)

Como responsável por registrar compras, quero preencher um único formulário de item e confirmá-lo no carrinho, para adicionar vários produtos sem acumular formulários extensos na tela.

**Why this priority**: Esta é a mudança central da feature e elimina diretamente a poluição visual que prejudica a operação diária.

**Independent Test**: Pode ser testada adicionando sucessivamente três produtos e verificando que somente um formulário de composição permanece visível enquanto os três itens confirmados aparecem no carrinho.

**Acceptance Scenarios**:

1. **Given** uma nova compra sem itens confirmados, **When** o usuário preenche um item válido e escolhe incluí-lo, **Then** o item aparece no carrinho e o formulário é limpo para a próxima inclusão.
2. **Given** uma compra com vários itens confirmados, **When** o usuário continua incluindo produtos, **Then** a quantidade de formulários de composição visíveis permanece igual a um.
3. **Given** um item incompleto ou inválido, **When** o usuário tenta incluí-lo, **Then** o item não entra no carrinho e os problemas são indicados junto aos campos correspondentes.
4. **Given** um produto já confirmado no carrinho, **When** o usuário tenta incluí-lo novamente, **Then** a duplicidade é bloqueada e o usuário é orientado a editar o item existente.

---

### User Story 2 - Revisar e corrigir o carrinho (Priority: P2)

Como responsável pela compra, quero revisar, editar ou remover cada item confirmado antes do registro, para corrigir quantidades, custos e ajustes sem reiniciar toda a operação.

**Why this priority**: A revisão reduz erros comerciais e substitui a edição direta dos vários formulários atuais por um fluxo intencional e rastreável na própria tela.

**Independent Test**: Pode ser testada incluindo dois itens, alterando todos os campos comerciais de um deles, cancelando uma segunda edição e removendo o outro, conferindo o resultado final no carrinho.

**Acceptance Scenarios**:

1. **Given** um item confirmado, **When** o usuário escolhe editá-lo, altera seus dados validamente e confirma, **Then** o carrinho passa a mostrar os novos valores sem criar um item duplicado.
2. **Given** um item em edição, **When** o usuário cancela a edição, **Then** o item original é restaurado integralmente e mantém sua posição no carrinho.
3. **Given** um item confirmado, **When** o usuário escolhe removê-lo, **Then** ele deixa de participar do carrinho e dos valores de revisão imediatamente.
4. **Given** que o último item é removido, **When** o carrinho fica vazio, **Then** a compra não pode ser registrada até que um novo item válido seja incluído.

---

### User Story 3 - Conferir e registrar a compra (Priority: P3)

Como responsável pela operação, quero conferir os itens e valores gerais antes de registrar a compra, para enviar somente a composição que revisei e manter a compra como mercadoria em trânsito.

**Why this priority**: O carrinho precisa concluir o fluxo sem alterar as regras comerciais e logísticas já vigentes.

**Independent Test**: Pode ser testada montando uma compra com itens e ajustes, registrando-a e conferindo que os dados comerciais foram preservados, sem entrada de estoque antes do recebimento.

**Acceptance Scenarios**:

1. **Given** fornecedor, data, ajustes gerais e ao menos um item confirmado válidos, **When** o usuário registra a compra, **Then** somente os itens do carrinho compõem a compra registrada.
2. **Given** dados parcialmente preenchidos no formulário de composição, **When** o usuário tenta registrar a compra, **Then** o sistema exige que ele inclua ou descarte explicitamente esse conteúdo antes de continuar.
3. **Given** uma compra registrada com sucesso, **When** o usuário consulta seu acompanhamento, **Then** ela permanece como mercadoria em trânsito e não aumenta o estoque disponível.
4. **Given** uma compra criada pelo novo fluxo, **When** um recebimento físico posterior é confirmado, **Then** o comportamento de recebimento, estoque e custo médio permanece equivalente ao fluxo anterior.

---

### User Story 4 - Operar em diferentes dispositivos (Priority: P4)

Como usuário que registra compras em diferentes contextos, quero que compositor e carrinho sejam claros em smartphone, tablet e desktop, para concluir a operação sem perda de informação ou ações inacessíveis.

**Why this priority**: Compras fazem parte da operação móvel do negócio e devem respeitar a experiência Mobile First oficial do produto.

**Independent Test**: Pode ser testada completando o mesmo roteiro de inclusão, edição, remoção e registro em smartphone, tablet e desktop.

**Acceptance Scenarios**:

1. **Given** uma tela de smartphone, **When** o usuário monta uma compra, **Then** compositor, carrinho, valores e ações permanecem legíveis e utilizáveis sem rolagem horizontal da página.
2. **Given** uma tela de tablet ou desktop, **When** o usuário revisa a compra, **Then** compositor e resumo aproveitam o espaço disponível sem acumular formulários de itens.

### Edge Cases

- O usuário inicia a edição de um item e tenta editar outro antes de confirmar ou cancelar a edição atual.
- O usuário altera o produto durante a edição para outro que já existe no carrinho.
- O usuário deixa somente quantidade preenchida, ou outro campo isolado, no formulário de composição e tenta registrar a compra.
- O usuário remove todos os itens depois de preencher fornecedor, data e ajustes gerais.
- O produto ou fornecedor selecionado deixa de estar disponível entre o carregamento da tela e o registro.
- O registro da compra falha; os dados gerais, o carrinho e o item em composição devem permanecer disponíveis para correção ou nova tentativa.
- Valores de desconto ou acréscimo são maiores que os valores comerciais que ajustam; a feature mantém as regras de validação oficiais vigentes e não cria nova fórmula financeira.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A tela de nova compra MUST apresentar exatamente um formulário de composição de item por vez, independentemente da quantidade de itens confirmados.
- **FR-002**: O sistema MUST manter separados o item em composição e os itens confirmados no carrinho.
- **FR-003**: O formulário de composição MUST permitir informar produto, quantidade, custo unitário, desconto e acréscimo do item conforme as regras atuais da compra.
- **FR-004**: O sistema MUST validar o item em composição antes de permitir sua inclusão no carrinho.
- **FR-005**: Ao incluir um item válido, o sistema MUST adicioná-lo ao carrinho e reiniciar o formulário de composição para o próximo item.
- **FR-006**: O sistema MUST impedir que o mesmo produto apareça mais de uma vez no carrinho e MUST orientar o usuário a editar o item já confirmado.
- **FR-007**: O carrinho MUST exibir, para cada item confirmado, produto, quantidade, custo unitário, descontos, acréscimos e valor líquido de revisão.
- **FR-008**: O carrinho MUST disponibilizar ações para editar e remover cada item antes do registro da compra.
- **FR-009**: A edição confirmada MUST substituir integralmente o item original, sem duplicá-lo e sem perder seus campos comerciais.
- **FR-010**: O cancelamento de uma edição MUST restaurar integralmente o item original na mesma posição do carrinho.
- **FR-011**: A remoção MUST excluir imediatamente o item dos valores de revisão e da composição que será registrada.
- **FR-012**: O sistema MUST preservar fornecedor, data da compra, desconto geral e acréscimo geral durante inclusões, edições e remoções de itens.
- **FR-013**: O resumo MUST apresentar a quantidade de itens e uma prévia comercial dos valores preenchidos, deixando claro que o registro confirmado é o resultado oficial.
- **FR-014**: A compra MUST ser registrada somente quando possuir fornecedor válido, data válida, ajustes válidos e ao menos um item confirmado válido.
- **FR-015**: Conteúdo parcialmente preenchido no formulário de composição MUST NOT ser ignorado silenciosamente no registro; o usuário MUST incluí-lo ou descartá-lo de forma explícita.
- **FR-016**: O registro MUST considerar exclusivamente os itens confirmados no carrinho e MUST preservar os dados comerciais aceitos pelo fluxo atual.
- **FR-017**: Quantidades de compra MUST permanecer inteiras, positivas e expressas na unidade principal do produto.
- **FR-018**: A tela de compra MUST NOT oferecer apresentações comerciais fracionadas para compra, recebimento ou perda nesta versão.
- **FR-019**: Registrar uma compra MUST NOT gerar entrada automática de estoque; a compra MUST permanecer como mercadoria em trânsito até os eventos logísticos já existentes.
- **FR-020**: Somente o recebimento físico confirmado MUST continuar gerando entrada de estoque e participação na formação do custo médio; perdas, extravios e avarias MUST continuar sem gerar entrada.
- **FR-021**: A feature MUST preservar os comportamentos atuais de recebimentos parciais, perdas, pendências, status da compra, estoque e custo médio.
- **FR-022**: O fluxo de vendas MUST permanecer funcionalmente inalterado.
- **FR-023**: A experiência MUST preservar a identidade visual oficial e ser utilizável em smartphone, tablet e desktop.
- **FR-024**: Em caso de falha no registro, o sistema MUST informar o problema e preservar o trabalho ainda não confirmado pelo serviço oficial para permitir correção ou nova tentativa.
- **FR-025**: A feature MUST NOT exigir alteração de dados históricos, migração de registros existentes ou mudança das regras oficiais de estoque, recebimento e custo médio.

### Key Entities

- **Compra em elaboração**: conjunto temporário formado por fornecedor, data, ajustes gerais e itens confirmados antes do registro oficial.
- **Item em composição**: produto e valores comerciais atualmente preenchidos no único formulário; ainda não participa da compra até ser confirmado.
- **Item confirmado**: item revisável que pertence ao carrinho e participará do registro da compra, contendo produto, quantidade, custo unitário, desconto e acréscimo.
- **Carrinho da compra**: coleção ordenada dos itens confirmados e sua prévia comercial antes do registro.
- **Compra registrada**: operação comercial oficial que mantém seus itens como mercadorias em trânsito até recebimento físico ou perda.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Para uma compra com 10 itens confirmados, a tela mantém exatamente um formulário de composição de item visível.
- **SC-002**: Em 100% dos cenários de inclusão válida, o item aparece no carrinho e o formulário fica pronto para a próxima inclusão sem alterar fornecedor, data ou ajustes gerais.
- **SC-003**: Em 100% dos cenários de editar, cancelar edição e remover, o carrinho final corresponde às ações do usuário sem duplicação, perda de valores ou mudança indevida de ordem.
- **SC-004**: Nenhuma compra é registrada com zero itens ou com conteúdo parcialmente preenchido no compositor sendo descartado silenciosamente.
- **SC-005**: Usuários conseguem montar e revisar uma compra de cinco itens em até três minutos, desconsiderando o tempo de resposta de serviços externos.
- **SC-006**: O roteiro completo de inclusão, edição, remoção e registro pode ser concluído sem bloqueios em smartphone, tablet e desktop.
- **SC-007**: Em 100% dos cenários de regressão definidos, criar a compra não altera estoque; recebimento parcial altera somente a quantidade recebida; perda não gera entrada; e custo médio continua derivado exclusivamente de entradas reais.
- **SC-008**: O conteúdo comercial registrado pelo novo fluxo é equivalente ao conteúdo que seria aceito pelo fluxo anterior para os mesmos dados de fornecedor, data, itens e ajustes.
- **SC-009**: O fluxo existente de vendas apresenta zero mudança funcional causada pela entrega desta feature.

## Assumptions

- O fluxo é destinado aos mesmos usuários autenticados que atualmente podem registrar compras.
- A feature trata somente a montagem de uma nova compra; edição ou exclusão de itens após o registro oficial permanece fora do escopo.
- Produto repetido continua proibido na mesma compra; o usuário altera quantidade e valores editando o item existente.
- A prévia de valores auxilia a revisão, mas não cria novas fórmulas comerciais nem substitui o resultado oficial da compra registrada.
- Cadastros rápidos, referências de produtos e fornecedores e mensagens de erro existentes continuam sendo utilizados sem ampliação de escopo.
- Não será introduzida nova infraestrutura de testes nesta feature; a estratégia de qualidade existente e os roteiros de regressão serão detalhados nas fases posteriores.
- A inconsistência preexistente entre totais exibidos em diferentes consultas de compra será tratada separadamente caso sua correção exija redefinição do total oficial; ela não autoriza mudança silenciosa de regra nesta feature.

