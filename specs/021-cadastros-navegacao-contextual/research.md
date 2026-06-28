# Research: Cadastros Auxiliares, Fornecedores e Navegação Contextual

## 1. Telefone opcional de Fornecedor

**Decision**: adicionar `Telefone` nullable ao agregado Fornecedor, com trim no domínio, limite de 50 caracteres validado antes da persistência e mapeamento nullable. Estender DTOs de criação, atualização e consulta e manter o endpoint de atualização com resposta vazia.

**Rationale**: Cliente já adota telefone opcional com coluna de 50 caracteres, oferecendo uma convenção interna. A coluna nullable preserva fornecedores existentes e a ausência de índice único atende à decisão de permitir telefones repetidos. A resposta de criação já devolve o Fornecedor completo e serve ao cadastro rápido.

**Alternatives considered**:

- Campo obrigatório: rejeitado porque invalidaria dados existentes e contraria a decisão aprovada.
- Normalização para apenas dígitos ou máscara brasileira: rejeitada por excluir números internacionais, ramais e formatos livres previstos no escopo.
- Unicidade por telefone: rejeitada porque telefone não é identificador do Fornecedor.
- Novo endpoint específico para cadastro rápido: rejeitado porque o `POST /api/fornecedores` existente já possui o contrato necessário.

## 2. Reutilização dos formulários de cadastro rápido

**Decision**: extrair/reutilizar campos e validação do Fornecedor no formulário oficial e no modal; para Categoria, compartilhar o contrato de nome e sua validação entre o gerenciador oficial e o modal simples. Os modais permanecem montados como irmãos do conteúdo do formulário hospedeiro, controlados por estado local independente.

**Rationale**: o formulário de Compra e o formulário de Produto já mantêm seus rascunhos em estado local. Abrir um Dialog sem desmontar esses componentes preserva campos, itens e ajustes naturalmente. Compartilhar campos/validação evita divergência sem introduzir uma camada genérica de formulários.

**Alternatives considered**:

- Navegar para a tela oficial em nova aba: rejeitado porque interrompe o fluxo e não seleciona o registro criado.
- Duplicar campos e validações nos modais: rejeitado pelo risco de contratos divergentes.
- Criar um construtor genérico de modais CRUD: rejeitado por antecipar complexidade para apenas dois cadastros com contratos diferentes.
- Persistir rascunhos em armazenamento do navegador: rejeitado porque manter o formulário montado já resolve o requisito sem estado durável adicional.

## 3. Atualização imediata de listas e seleção

**Decision**: após a mutation, inserir ou substituir o registro retornado no cache da lista por `id`, preencher também o cache de detalhe quando aplicável, selecionar o `id` criado no formulário hospedeiro e então invalidar a família de consultas para reconciliação.

**Rationale**: `POST /api/fornecedores` e `POST /api/categorias` já retornam a entidade criada. Usar essa resposta elimina a janela em que o select ainda não contém o valor e evita depender da latência de uma nova listagem. A invalidação posterior mantém consistência com o servidor.

**Alternatives considered**:

- Apenas invalidar e aguardar novo fetch: rejeitado porque a seleção pode ocorrer antes de a opção existir.
- Manter uma lista paralela somente no formulário: rejeitado porque duplica a fonte de dados e pode divergir do cache compartilhado.
- Atualização otimista antes da resposta: rejeitada porque não há necessidade de inventar um identificador e tratar rollback para uma operação curta.

## 4. Estados vazios de Compra e Produto

**Decision**: Nova Compra continuará bloqueada quando não houver Produto, mas não quando faltar apenas Fornecedor; nesse caso o formulário será exibido com o atalho de criação. Novo Produto continuará visível mesmo sem Categoria e oferecerá os atalhos de Categoria e Fornecedor; apenas a confirmação permanecerá bloqueada enquanto não houver Categoria selecionada.

**Rationale**: o estado vazio atual substitui integralmente os formulários e esconde a própria ação corretiva. Produto é requisito estrutural de Compra e permanece fora do cadastro rápido desta feature. Categoria pode ser criada no próprio fluxo de Produto.

**Alternatives considered**:

- Manter o EmptyState bloqueante com link externo: rejeitado porque não preserva o rascunho e contraria o cadastro rápido.
- Permitir Compra sem Produto ou Produto sem Categoria: rejeitado porque mudaria regras de negócio existentes.

## 5. Navegação contextual segura

**Decision**: adotar `ContextualLink` e `ContextualBackButton`, este com `fallbackHref` obrigatório. Em clique primário sem modificadores, o link anexa `returnTo` sem carregar uma origem anterior e grava em `sessionStorage` um marcador de uso único contendo destino normalizado, origem, instante e versão do contrato. O botão aceita a origem somente quando o marcador tiver no máximo 10 segundos, coincidir com a URL atual e com `returnTo`, e o caminho pertencer aos prefixos `/`, `/clientes`, `/fornecedores`, `/produtos`, `/compras`, `/vendas`, `/estoque`, `/financeiro` ou `/configuracoes`; `/login`, `/api`, `/_next`, esquemas, hosts e caminhos `//` são recusados. O marcador é consumido na primeira montagem. Sem marcador correspondente — inclusive acesso direto, reload, nova aba, origem forjada ou expirada — usa-se o fallback. A navegação escolhida é explícita e nunca usa `history.back()`.

**Rationale**: o histórico do navegador não expõe de forma confiável se a entrada anterior pertence ao ERP e pode levar a uma origem externa. O tipo de carregamento retornado por `PerformanceNavigationTiming` vale para o documento inteiro e pode continuar indicando reload depois de uma navegação cliente, portanto não serve para decidir sozinho. O marcador consumível comprova a transição controlada para a rota atual e desaparece antes de um reload subsequente, preservando jornadas SPA sem aceitar URLs digitadas ou forjadas.

**Alternatives considered**:

- `router.back()` ou `window.history.back()`: rejeitado porque pode sair do ERP e não fornece fallback confiável.
- `document.referrer`: rejeitado porque permanece estático durante navegação cliente e pode representar uma origem externa.
- Registro global completo de histórico em armazenamento de sessão: rejeitado por adicionar estado e casos de expiração desnecessários quando links controlados podem transportar a origem.
- Usar apenas `PerformanceNavigationTiming.type`: rejeitado porque descreve o carregamento do documento, não necessariamente a transição cliente que abriu a rota atual.
- Aceitar URLs same-origin completas: rejeitado porque o contrato deve operar apenas com caminhos internos, reduzindo superfície de validação.

## 6. Remoção visual de GUIDs

**Decision**: remover GUIDs de cabeçalhos e cards de detalhe de Fornecedor, Cliente e Produto, substituir a coluna Identificador do Fornecedor por Telefone e trocar fallbacks abreviados de Cliente por mensagens operacionais. IDs permanecem em rotas, keys, payloads e relações.

**Rationale**: identificadores continuam essenciais tecnicamente, mas não ajudam o operador. Nome, telefone, categoria e mensagens de ausência fornecem contexto melhor sem alterar contratos internos.

**Alternatives considered**:

- Exibir GUID abreviado: rejeitado porque continua expondo informação técnica sem significado operacional.
- Remover IDs de contratos frontend/API: rejeitado porque quebraria navegação, cache e relações.
- Criar novo código comercial nesta feature: rejeitado por ampliar o modelo além do escopo aprovado.

## 7. Validação e dependências

**Decision**: não adicionar pacote nem infraestrutura automatizada. Validar por builds existentes e roteiro manual cobrindo API, migration, caches, rascunhos, segurança de retorno e breakpoints.

**Rationale**: o repositório já contém todos os componentes necessários e o roadmap proíbe nova infraestrutura automatizada para F020–F022 sem autorização específica.

**Alternatives considered**:

- Adicionar biblioteca de formulários ou navegação: rejeitada porque estado React, React Query e utilitários locais cobrem o escopo.
- Introduzir projeto de testes nesta feature: rejeitado por decisão explícita do roadmap; permanece recomendado para backlog autorizado.
