# Feature Specification: Cadastros Base

**Feature Branch**: `001-cadastros-base`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "Completar os cadastros fundamentais necessarios para operacao do ERP: Clientes, Fornecedores, Produtos e Categorias, com criacao, listagem, consulta por ID e atualizacao; clientes tambem devem permitir inativacao. Nao alterar estoque, compras, vendas, custo medio, lucro, frontend ou bibliotecas externas. Seguir a Constituicao do projeto."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Manter clientes operacionais (Priority: P1)

Como operador do ERP, quero cadastrar, consultar, atualizar e inativar clientes para que vendas possam ser registradas com dados confiaveis de cliente e sem reutilizar cadastros indevidos.

**Why this priority**: Vendas dependem de clientes validos; sem cadastro publico de clientes, o ciclo comercial fica incompleto.

**Independent Test**: Criar um cliente, lista-lo, consulta-lo por identificador, atualizar seus dados e inativa-lo sem afetar vendas, estoque ou historico existente.

**Acceptance Scenarios**:

1. **Given** um cliente ainda nao cadastrado, **When** o operador informa os dados obrigatorios, **Then** o cliente fica disponivel para consulta e uso em vendas.
2. **Given** um cliente cadastrado, **When** o operador altera dados de contato, **Then** as consultas retornam os dados atualizados.
3. **Given** um cliente que nao deve mais ser usado, **When** o operador solicita inativacao, **Then** o cliente deixa de estar disponivel como ativo sem remover seu historico.

---

### User Story 2 - Manter fornecedores e categorias (Priority: P2)

Como operador do ERP, quero cadastrar, consultar e atualizar fornecedores e categorias para organizar produtos e permitir que compras sejam registradas com dados consistentes.

**Why this priority**: Produtos e compras dependem de fornecedores e categorias para organizacao, rastreabilidade e filtros operacionais.

**Independent Test**: Criar fornecedor e categoria, listar ambos, consultar por identificador e atualizar nomes ou descricoes sem alterar compras existentes.

**Acceptance Scenarios**:

1. **Given** um fornecedor ainda nao cadastrado, **When** o operador informa os dados obrigatorios, **Then** o fornecedor fica disponivel para associacao a produtos e compras.
2. **Given** uma categoria ainda nao cadastrada, **When** o operador informa os dados obrigatorios, **Then** a categoria fica disponivel para classificacao de produtos.
3. **Given** fornecedor ou categoria existentes, **When** o operador atualiza seus dados, **Then** os cadastros relacionados preservam suas associacoes historicas.

---

### User Story 3 - Manter produtos para compras e vendas (Priority: P3)

Como operador do ERP, quero cadastrar, consultar e atualizar produtos com categoria, fornecedor e preco de venda para que compras e vendas utilizem os cadastros normalmente.

**Why this priority**: Produtos conectam fornecedores, categorias, compras, estoque, custo medio e vendas.

**Independent Test**: Criar um produto associado a categoria e opcionalmente fornecedor, lista-lo, consulta-lo por identificador e atualizar seus dados comerciais sem criar saldo fixo de estoque.

**Acceptance Scenarios**:

1. **Given** uma categoria valida e, quando informado, um fornecedor valido, **When** o operador cadastra um produto, **Then** o produto fica disponivel para compras e vendas.
2. **Given** um produto cadastrado, **When** o operador atualiza nome, categoria, fornecedor ou preco de venda, **Then** as consultas refletem os novos dados sem alterar movimentacoes de estoque.
3. **Given** um produto cadastrado, **When** o operador consulta a lista de produtos, **Then** consegue identificar os dados necessarios para selecionar o produto em compras e vendas.

---

### Edge Cases

- Cadastro com nome vazio, identificador invalido ou dados obrigatorios ausentes deve ser rejeitado com mensagem clara.
- Consulta por identificador inexistente deve informar que o cadastro nao foi encontrado.
- Atualizacao de produto com categoria inexistente deve ser rejeitada.
- Atualizacao de produto com fornecedor inexistente deve ser rejeitada quando fornecedor for informado.
- Inativacao de cliente inexistente deve informar que o cliente nao foi encontrado.
- Inativar cliente nao deve apagar vendas, contas a receber ou historico associado.
- Listagens vazias devem retornar resultado vazio, nao erro.
- Esta feature nao deve criar, recalcular ou remover movimentacoes de estoque.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: O sistema MUST permitir criar clientes com dados minimos necessarios para identificacao comercial.
- **FR-002**: O sistema MUST permitir listar clientes cadastrados, distinguindo clientes ativos e inativos.
- **FR-003**: O sistema MUST permitir obter um cliente por identificador.
- **FR-004**: O sistema MUST permitir atualizar dados cadastrais de cliente.
- **FR-005**: O sistema MUST permitir inativar cliente sem remover seu historico operacional.
- **FR-006**: O sistema MUST permitir criar fornecedores com dados minimos necessarios para compras e associacao a produtos.
- **FR-007**: O sistema MUST permitir listar fornecedores cadastrados.
- **FR-008**: O sistema MUST permitir obter um fornecedor por identificador.
- **FR-009**: O sistema MUST permitir atualizar dados cadastrais de fornecedor.
- **FR-010**: O sistema MUST permitir criar categorias para organizacao de produtos.
- **FR-011**: O sistema MUST permitir listar categorias cadastradas.
- **FR-012**: O sistema MUST permitir obter uma categoria por identificador.
- **FR-013**: O sistema MUST permitir atualizar dados cadastrais de categoria.
- **FR-014**: O sistema MUST permitir criar produtos com nome, categoria, preco de venda e fornecedor quando aplicavel.
- **FR-015**: O sistema MUST permitir listar produtos cadastrados com dados suficientes para selecao em compras e vendas.
- **FR-016**: O sistema MUST permitir obter um produto por identificador.
- **FR-017**: O sistema MUST permitir atualizar dados cadastrais e comerciais de produto.
- **FR-018**: O sistema MUST rejeitar produto associado a categoria inexistente.
- **FR-019**: O sistema MUST rejeitar produto associado a fornecedor inexistente quando fornecedor for informado.
- **FR-020**: O sistema MUST disponibilizar operacoes publicas para todos os cadastros do escopo.
- **FR-021**: O sistema MUST usar contratos de entrada e saida dedicados para os dados cadastrais.
- **FR-022**: O sistema MUST manter regras de negocio fora da camada de recebimento de requisicoes.
- **FR-023**: O sistema MUST manter o acesso a dados mediado por repositorios.
- **FR-024**: O sistema MUST manter mapeamentos persistentes definidos por configuracao explicita.
- **FR-025**: O sistema MUST NOT alterar regras de estoque, compras, vendas, custo medio ou lucro.
- **FR-026**: O sistema MUST NOT criar saldo fixo de estoque em produto ou em qualquer cadastro base.
- **FR-027**: O sistema MUST NOT criar frontend ou introduzir novas bibliotecas externas nesta feature.

### Key Entities *(include if feature involves data)*

- **Cliente**: Pessoa ou organizacao que compra produtos da Amani Importados; possui dados de identificacao, contato e status ativo/inativo.
- **Fornecedor**: Origem comercial de produtos comprados; possui dados de identificacao usados em compras e associacao a produtos.
- **Categoria**: Classificacao usada para organizar produtos.
- **Produto**: Item comercializado pela empresa; possui identificacao, categoria, fornecedor quando aplicavel e preco de venda, sem saldo fixo de estoque.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Um operador consegue cadastrar e consultar qualquer cadastro base do escopo em menos de 2 minutos por item.
- **SC-002**: 100% dos cadastros do escopo possuem criacao, listagem, consulta por identificador e atualizacao disponiveis; clientes tambem possuem inativacao.
- **SC-003**: 100% das tentativas com dados obrigatorios ausentes ou referencias inexistentes sao rejeitadas com resultado claro para o operador.
- **SC-004**: Compras e vendas continuam operando sem mudanca de comportamento em estoque, custo medio e lucro apos a entrega da feature.
- **SC-005**: Nenhuma inativacao de cliente remove historico operacional existente.

## Assumptions

- O operador do ERP tem permissao para manter cadastros base.
- Nome e identificador sao os dados minimos comuns para localizar cadastros nas rotinas operacionais.
- Cliente inativo permanece consultavel para historico, mas nao deve ser tratado como cadastro ativo para novos fluxos operacionais.
- Fornecedores, categorias e produtos nao exigem inativacao nesta feature porque o escopo solicitado inclui apenas criar, listar, obter por ID e atualizar.
- Produto pode ter fornecedor opcional quando a origem ainda nao estiver definida, mas deve sempre ter categoria valida.
- Esta feature cobre apenas backend e contratos publicos; interface web fica fora do escopo.
