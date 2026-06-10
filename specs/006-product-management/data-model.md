# Data Model: Gestao de Produtos no Frontend

## Produto

Representa item do catalogo operacional consumido da fonte oficial.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Identificador GUID retornado pela API. |
| `nome` | string | Yes | Nome exibido, buscado e enviado em cadastro/edicao. |
| `precoVenda` | number | Yes | Valor de venda informado pelo usuario e validado pelo backend. |
| `custo` | number | Yes | Valor coletado/apresentado; nao deve gerar calculos no frontend. |
| `categoriaId` | string | Yes | Referencia obrigatoria para Categoria. |
| `fornecedorId` | string \| null | No | Referencia opcional para Fornecedor. |

### Validation Rules

- `nome` nao pode ser vazio apos trim.
- `precoVenda` deve ser numerico e nao negativo.
- `custo` deve ser numerico e nao negativo.
- `categoriaId` deve existir e vir da lista de categorias carregada.
- `fornecedorId` pode ser `null`; quando preenchido, deve vir da lista de fornecedores carregada.
- Validacoes operacionais e mensagens finais pertencem ao backend.

### State Transitions

- `new form` -> `creating` -> `created` ou `create error`.
- `detail loading` -> `detail ready` ou `not found` ou `load error`.
- `edit loading` -> `editing ready` -> `updating` -> `updated` ou `update error`.
- Nao ha estado `deleted`, `inactive` ou `status` nesta feature.

## ProdutoPayload

Formato enviado para cadastro e edicao.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `nome` | string | Yes | Enviar valor limpo. |
| `precoVenda` | number | Yes | Enviar numero decimal. |
| `custo` | number | Yes | Enviar numero decimal sem calculos derivados. |
| `categoriaId` | string | Yes | GUID da categoria. |
| `fornecedorId` | string \| null | No | GUID do fornecedor ou `null`. |

## Categoria

Referencia de classificacao usada em formularios e exibicao.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Identificador GUID retornado pela API. |
| `nome` | string | Yes | Nome mostrado nos seletores e detalhes. |

### Rules

- Categorias sao somente leitura nesta feature.
- Sem categoria valida, o formulario de produto nao deve salvar.

## Fornecedor

Referencia opcional usada em formularios e exibicao.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | Yes | Identificador GUID retornado pela API. |
| `nome` | string | Yes | Nome mostrado nos seletores e detalhes. |

### Rules

- Fornecedores sao somente leitura nesta feature.
- Lista vazia de fornecedores nao bloqueia cadastro ou edicao de produto.

## Derived Display Data

| Field | Source | Notes |
|-------|--------|-------|
| `categoriaNome` | `Produto.categoriaId` + lista de categorias | Apenas resolucao visual; nao persistir no frontend. |
| `fornecedorNome` | `Produto.fornecedorId` + lista de fornecedores | Exibir texto neutro quando ausente ou nao encontrado. |

## Explicitly Excluded Data

- Saldo de estoque.
- Custo medio.
- Lucro.
- Indicadores, rankings ou dashboards.
- Status de produto.
- Descricao, imagem ou upload.
- Historico de alteracoes.
