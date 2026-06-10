# Implementation Plan: Gestao de Produtos no Frontend

**Branch**: `006-product-management` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-product-management/spec.md`

## Summary

Transformar a rota de Produtos do frontend Amani ERP em um modulo operacional real para listar, buscar, consultar, cadastrar e editar produtos usando as APIs existentes do backend. A implementacao permanece no projeto `frontend/`, segue o padrao Mobile First e Dark Only criado na Feature 005, usa os componentes e estados base ja existentes e adiciona apenas a camada especifica de produtos, categorias e fornecedores necessaria para consumir contratos reais.

O escopo nao inclui delete/inativacao de produto, CRUD de categorias, CRUD de fornecedores, estoque, dashboard, upload, autenticacao, calculo de lucro, calculo de custo medio ou indicadores no frontend.

## Technical Context

**Language/Version**: TypeScript com React e Next.js App Router no projeto `frontend/`; versoes atuais do projeto: Next.js 15, React 19 e TypeScript 5.7.

**Primary Dependencies**: Next.js App Router, TypeScript, Tailwind CSS, componentes Shadcn/UI locais, TanStack Query, Lucide React e `fetch` encapsulado por `frontend/src/services/api-client.ts`. Nenhuma nova dependencia e planejada.

**Storage**: N/A no frontend. Produtos, categorias e fornecedores permanecem persistidos pelo backend. O frontend mantem apenas estado de tela, formulario e cache de consulta em memoria.

**Testing**: Validacao obrigatoria por `npm run lint`, `npm run typecheck` e `npm run build` dentro de `frontend/`; validacao manual responsiva em smartphone, tablet e desktop; validacao manual contra API real ou ambiente local equivalente.

**Target Platform**: Web responsiva em navegadores modernos para smartphone, tablet e desktop.

**Project Type**: Frontend web application separado do backend .NET existente.

**Performance Goals**: A lista deve renderizar estado inicial imediatamente, exibir loading durante chamadas de rede e permitir busca local sobre os produtos carregados sem nova chamada enquanto a API nao oferecer paginacao/busca oficial. Formularios devem carregar produto, categorias e fornecedores com estados independentes e evitar bloqueio visual desnecessario.

**Constraints**: Dark Only; Mobile First; sem dados mockados; sem regra critica de negocio no frontend; sem calculos de estoque, lucro, custo medio, indicadores, rankings ou dashboards; sem delete/inativacao enquanto o backend nao oferecer endpoint seguro; categorias e fornecedores apenas como referencias selecionaveis.

**Scale/Scope**: Um modulo operacional com quatro rotas principais (`/produtos`, `/produtos/novo`, `/produtos/[id]`, `/produtos/[id]/editar`), services/hooks por entidade de apoio e componentes reutilizaveis de produto.

## API Contract Findings

### Produtos

- `GET /api/produtos`: retorna lista de produtos.
- `GET /api/produtos/{id}`: retorna produto por identificador ou `404`.
- `POST /api/produtos`: cria produto e retorna o produto criado.
- `PUT /api/produtos/{id}`: atualiza produto e retorna `204`.
- Nao existe endpoint `DELETE`, inativacao ou status de produto no contrato atual.
- Campos reais de produto: `id`, `nome`, `precoVenda`, `custo`, `categoriaId`, `fornecedorId`.

### Categorias

- `GET /api/categorias`: retorna lista de categorias.
- Campos reais usados pela feature: `id`, `nome`.
- CRUD de categorias permanece fora do escopo.

### Fornecedores

- `GET /api/fornecedores`: retorna lista de fornecedores.
- Campos reais usados pela feature: `id`, `nome`.
- CRUD de fornecedores permanece fora do escopo.
- `fornecedorId` e opcional em produto.

## Routes

```text
frontend/src/app/produtos/page.tsx
frontend/src/app/produtos/novo/page.tsx
frontend/src/app/produtos/[id]/page.tsx
frontend/src/app/produtos/[id]/editar/page.tsx
```

- `/produtos`: pagina principal com titulo, descricao, botao "Novo Produto", busca simples, tabela/lista responsiva, estados de loading/erro/vazio e acoes "Ver detalhes" e "Editar".
- `/produtos/novo`: formulario de cadastro com nome, preco de venda, custo, categoria obrigatoria e fornecedor opcional.
- `/produtos/[id]`: consulta de produto por ID, exibindo apenas dados do contrato real e link para edicao.
- `/produtos/[id]/editar`: formulario de edicao com dados atuais carregados por ID e opcoes reais de categoria/fornecedor.

## Component Plan

```text
frontend/src/components/produtos/
|-- product-form.tsx
|-- product-table.tsx
|-- product-details.tsx
|-- product-actions.tsx
`-- product-form-fields.tsx
```

- `product-table.tsx`: tabela responsiva no desktop/tablet e apresentacao legivel em telas pequenas, usando componentes `ui/table`, `Button`, `Badge` quando fizer sentido e acoes por produto sem delete.
- `product-form.tsx`: composicao cliente para cadastro/edicao, recebe modo (`create` ou `edit`), dados iniciais quando houver, listas de categorias/fornecedores e callbacks de submit.
- `product-form-fields.tsx`: campos controlados, validacao visual basica, mensagens de erro e seletores simples para categoria/fornecedor.
- `product-details.tsx`: exibicao dos dados principais, sem calcular estoque, lucro, custo medio ou indicadores.
- `product-actions.tsx`: acoes compartilhadas de navegar para detalhes/edicao; nao renderiza remover/inativar nesta feature.

Reusar `PageHeader`, `LoadingState`, `ErrorState`, `EmptyState`, `Button`, `Input`, `Table`, `Card` apenas quando o card representar um bloco especifico de detalhe ou formulario, sem aninhar cards.

## API Services and Hooks

```text
frontend/src/services/products.ts
frontend/src/services/categories.ts
frontend/src/services/suppliers.ts
frontend/src/hooks/use-products.ts
frontend/src/hooks/use-categories.ts
frontend/src/hooks/use-suppliers.ts
frontend/src/types/product.ts
frontend/src/types/category.ts
frontend/src/types/supplier.ts
```

### Services

- `productsService.list()`: `GET /api/produtos`.
- `productsService.getById(id)`: `GET /api/produtos/{id}`.
- `productsService.create(payload)`: `POST /api/produtos`.
- `productsService.update(id, payload)`: `PUT /api/produtos/{id}`.
- `categoriesService.list()`: `GET /api/categorias`.
- `suppliersService.list()`: `GET /api/fornecedores`.

### Query Hooks

- `useProducts()`: lista produtos e alimenta `/produtos`.
- `useProduct(id)`: carrega detalhe/edicao.
- `useCreateProduct()`: mutation de cadastro; invalida lista de produtos ao concluir.
- `useUpdateProduct()`: mutation de edicao; invalida lista e detalhe do produto ao concluir.
- `useCategories()`: lista categorias para formularios.
- `useSuppliers()`: lista fornecedores para formularios.

Chaves devem estender `queryKeys.produtos`, por exemplo `["produtos", "list"]` e `["produtos", "detail", id]`. Categorias e fornecedores podem usar chaves dedicadas locais nos hooks ou expandir `queryKeys` se a implementacao preferir manter todos os prefixos centralizados.

## Form Strategy

- Formularios podem usar estado local controlado com TypeScript, sem adicionar biblioteca de formulario nesta feature.
- Validacao visual basica no cliente:
  - `nome`: obrigatorio, trim antes de enviar.
  - `precoVenda`: obrigatorio, numerico e nao negativo.
  - `custo`: obrigatorio, numerico e nao negativo.
  - `categoriaId`: obrigatorio e deve vir da lista carregada.
  - `fornecedorId`: opcional; quando ausente, enviar `null`.
- Validacoes operacionais continuam no backend. Mensagens de rejeicao da API devem ser exibidas no formulario sem mascarar que o backend e a fonte de verdade.
- O formulario de edicao deve bloquear o submit enquanto produto, categorias ou fornecedores essenciais ainda carregam.
- Se categorias estiverem vazias, o formulario deve mostrar dependencia ausente e nao permitir salvar.
- Se fornecedores estiverem vazios, o formulario deve continuar funcional com fornecedor em branco.

## UI State Strategy

- **Loading**: usar `LoadingState` para lista/detalhe e estado de envio nos botoes de formulario.
- **Empty**: usar `EmptyState` quando nao houver produtos, categorias indisponiveis para salvar, ou produto nao encontrado.
- **Error**: usar `ErrorState` com acao de tentar novamente quando a query permitir `refetch`.
- **Success**: usar mensagem inline ou feedback equivalente apos cadastro/edicao, seguido de navegacao para lista ou detalhe.
- **Search**: busca simples local sobre os produtos carregados, inicialmente por `nome`. Categoria/fornecedor podem aparecer como texto resolvido por ID quando listas de apoio estiverem disponiveis.
- **Responsive**: manter botoes com alvo de toque adequado, evitar texto sobreposto e permitir scroll horizontal controlado na tabela se necessario.

## Implementation Strategy

1. Adicionar tipos frontend para produto, payloads de produto, categoria e fornecedor conforme DTOs atuais.
2. Criar services de produtos, categorias e fornecedores usando `apiClient`.
3. Criar hooks TanStack Query para listagem, detalhe, cadastro e edicao.
4. Criar componentes de produtos reutilizaveis.
5. Substituir o placeholder de `/produtos` por listagem real, busca e estados.
6. Criar `/produtos/novo` com formulario de cadastro e carregamento de categorias/fornecedores.
7. Criar `/produtos/[id]` com consulta por ID, estados de loading/erro/nao encontrado e link para edicao.
8. Criar `/produtos/[id]/editar` com carregamento do produto existente e formulario preenchido.
9. Garantir que nenhuma acao de delete/inativacao seja renderizada.
10. Validar responsividade e executar `npm run lint`, `npm run typecheck` e `npm run build` em `frontend/`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Arquitetura e responsabilidades**: PASS. O trabalho fica no frontend e consome controllers existentes; nenhuma regra e movida para controllers ou UI.
- **Estoque por movimentacoes**: PASS. A feature nao le, calcula ou exibe saldo de estoque.
- **Compras e mercadorias em transito**: PASS. A feature nao altera compras, recebimentos ou mercadorias em transito.
- **Recebimentos, perdas e rastreabilidade**: PASS. A feature nao cria eventos operacionais nem altera rastreabilidade.
- **Vendas, custo medio e inventario inicial**: PASS. A feature nao implementa vendas, custo medio, lucro ou inventario inicial.
- **Contratos de API e DTOs**: PASS. O frontend usa DTOs reais como contratos tipados e nao expoe entidades de dominio.
- **Persistencia e mapeamentos**: PASS. Sem persistencia frontend, migrations ou mapeamentos de banco.
- **Backend como fonte das regras**: PASS. O frontend apenas coleta dados, envia payloads e apresenta respostas; validacoes operacionais seguem no backend.
- **Analytics e escalabilidade**: PASS. Sem dashboards, rankings, indicadores ou leitura de historico operacional.
- **Mobile First**: PASS. Rotas e componentes serao planejados e validados em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos priorizam listagem, busca, detalhe e formulario direto com poucos passos.
- **Priorizacao do produto**: PASS. Entrega modulo operacional real antes de analytics, integracoes e recursos avancados.
- **Identidade visual**: PASS. Reusa Design System da Feature 005, Dark Only e componentes existentes.
- **Simplicidade antes de sofisticacao**: PASS. Sem novas dependencias e sem abstrair dominios futuros.

## Project Structure

### Documentation (this feature)

```text
specs/006-product-management/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   `-- product-management-contract.md
|-- checklists/
|   `-- requirements.md
`-- spec.md
```

### Source Code (repository root)

```text
frontend/
|-- src/
|   |-- app/
|   |   |-- produtos/
|   |   |   |-- page.tsx
|   |   |   |-- novo/
|   |   |   |   `-- page.tsx
|   |   |   `-- [id]/
|   |   |       |-- page.tsx
|   |   |       `-- editar/
|   |   |           `-- page.tsx
|   |-- components/
|   |   `-- produtos/
|   |       |-- product-actions.tsx
|   |       |-- product-details.tsx
|   |       |-- product-form.tsx
|   |       |-- product-form-fields.tsx
|   |       `-- product-table.tsx
|   |-- hooks/
|   |   |-- use-categories.ts
|   |   |-- use-products.ts
|   |   `-- use-suppliers.ts
|   |-- services/
|   |   |-- categories.ts
|   |   |-- products.ts
|   |   `-- suppliers.ts
|   `-- types/
|       |-- category.ts
|       |-- product.ts
|       `-- supplier.ts
```

**Structure Decision**: Manter a estrutura do frontend criada na Feature 005. Rotas ficam em `frontend/src/app/produtos`, componentes especificos em `frontend/src/components/produtos`, chamadas HTTP em `frontend/src/services`, hooks de dados em `frontend/src/hooks` e contratos frontend em `frontend/src/types`.

## Risks and Dependencies

- **Ausencia de delete/inativacao segura**: o backend atual nao oferece endpoint de delete, status ou inativacao de produto. A UI nao deve exibir essa acao nesta feature.
- **Sem paginacao/busca oficial**: `GET /api/produtos` retorna lista completa. A busca sera local sobre dados carregados; paginacao fica como dependencia futura se o volume crescer.
- **Produto nao traz nomes de categoria/fornecedor**: `ProdutoDto` retorna apenas IDs. A UI deve resolver nomes usando listas de categorias/fornecedores carregadas, exibindo fallback neutro quando nao houver correspondencia.
- **Campo custo no contrato**: o frontend coleta e exibe `custo`, mas nao calcula lucro, custo medio ou qualquer indicador.
- **Mensagens de erro do api-client**: o client atual normaliza erro HTTP com mensagem generica. A implementacao pode melhorar a leitura de `{ error }` sem alterar regra de negocio.

## Phase 0: Research

See [research.md](./research.md).

## Phase 1: Design and Contracts

See [data-model.md](./data-model.md), [contracts/product-management-contract.md](./contracts/product-management-contract.md), and [quickstart.md](./quickstart.md).

## Post-Design Constitution Check

- **Arquitetura e responsabilidades**: PASS. Artefatos mantem apenas frontend, services tipados e consumo de contratos existentes.
- **Estoque por movimentacoes**: PASS. Data model e contratos nao incluem saldo de estoque.
- **Compras e mercadorias em transito**: PASS. Nenhum fluxo de compra/recebimento e planejado.
- **Recebimentos, perdas e rastreabilidade**: PASS. Sem eventos operacionais novos.
- **Vendas, custo medio e inventario inicial**: PASS. Nenhum calculo de vendas, custo medio, lucro ou inventario.
- **Contratos de API e DTOs**: PASS. Contrato documenta DTOs reais e ausencia de delete/inativacao.
- **Persistencia e mapeamentos**: PASS. Sem persistencia frontend ou alteracao de banco.
- **Backend como fonte das regras**: PASS. Quickstart valida ausencia de calculos e dependencia do backend para validacoes.
- **Analytics e escalabilidade**: PASS. Sem dashboard/analytics; risco de paginacao documentado como dependencia futura.
- **Mobile First**: PASS. Quickstart exige validacao em smartphone, tablet e desktop.
- **Experiencia operacional**: PASS. Fluxos diretos de lista, busca, detalhe, cadastro e edicao.
- **Priorizacao do produto**: PASS. Entrega modulo operacional real de produto.
- **Identidade visual**: PASS. Design preserva Dark Only e componentes da base.
- **Simplicidade antes de sofisticacao**: PASS. Sem novas dependencias; uso de estado local para formulario.

## Complexity Tracking

No constitution violations.
