# Research: Gestao de Produtos no Frontend

## API real de produtos

- **Decision**: Implementar somente listar, consultar por ID, criar e editar produtos.
- **Rationale**: O controller atual de produtos expoe `GET /api/produtos`, `GET /api/produtos/{id}`, `POST /api/produtos` e `PUT /api/produtos/{id}`. Nao ha endpoint de delete, status ou inativacao.
- **Alternatives considered**: Simular remocao no frontend ou ocultar item localmente. Rejeitado porque criaria comportamento falso, quebraria a fonte oficial e poderia induzir erro operacional.

## Campos de produto

- **Decision**: Usar apenas `id`, `nome`, `precoVenda`, `custo`, `categoriaId` e `fornecedorId`.
- **Rationale**: Estes sao os campos reais dos DTOs de produto. Descricao, status, imagem, estoque, lucro, custo medio e historico nao existem no contrato atual.
- **Alternatives considered**: Criar campos visuais futuros no formulario. Rejeitado para evitar payloads inexistentes e dados sem persistencia.

## Categorias e fornecedores

- **Decision**: Carregar categorias e fornecedores como listas de apoio para formularios e resolucao de nomes na UI.
- **Rationale**: Produto retorna apenas IDs de categoria/fornecedor. A feature precisa mostrar selecoes compreensiveis ao usuario e permitir associacoes validas.
- **Alternatives considered**: Mostrar apenas IDs ou criar CRUD embutido. Mostrar IDs prejudica operacao; CRUD expande escopo alem da feature.

## Busca e paginacao

- **Decision**: Fazer busca simples local por nome sobre a lista carregada, sem paginacao nesta feature.
- **Rationale**: A API atual nao oferece parametros de busca ou paginacao. A busca local entrega valor imediato sem alterar backend.
- **Alternatives considered**: Adicionar endpoint paginado ao backend agora. Rejeitado porque o objetivo e consumir APIs reais existentes e nao expandir escopo indevidamente.

## Formularios

- **Decision**: Usar estado local controlado e validacao visual basica, sem nova biblioteca de formulario.
- **Rationale**: O formulario tem poucos campos e a Feature 005 prioriza simplicidade. Validacoes criticas continuam no backend.
- **Alternatives considered**: Adicionar React Hook Form ou schema validator. Rejeitado por adicionar dependencia antes de haver complexidade real.

## TanStack Query

- **Decision**: Usar hooks por caso de uso com TanStack Query para queries e mutations.
- **Rationale**: A Feature 005 ja configurou QueryClient, retry conservador e convencoes para query hooks. Isso padroniza loading, erro, cache e invalidacao.
- **Alternatives considered**: Chamar services diretamente nos componentes. Rejeitado porque duplicaria estados de rede e fugiria do padrao definido.

## UI responsiva

- **Decision**: Implementar lista e formularios Mobile First, com tabela responsiva no desktop e apresentacao compacta em mobile.
- **Rationale**: A Constitution exige Mobile First e a Feature 005 definiu shell responsivo, PageHeader, estados e componentes de UI.
- **Alternatives considered**: Apenas tabela desktop com scroll horizontal em todos os viewports. Rejeitado porque prejudica operacao em smartphone.

## Mensagens e erros

- **Decision**: Exibir estados de erro por area e preservar dados digitados nos formularios quando a API rejeitar uma operacao.
- **Rationale**: Falhas de produto, categoria e fornecedor podem ocorrer separadamente. O usuario precisa corrigir sem perder trabalho.
- **Alternatives considered**: Bloquear a tela inteira em qualquer erro. Rejeitado por piorar a experiencia operacional.
