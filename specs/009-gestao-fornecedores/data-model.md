# Data Model: Gestao de Fornecedores no Frontend

## Entity: Fornecedor

Fornecedor representa uma pessoa ou empresa que fornece mercadorias para a
operacao e pode ser referenciada por fluxos futuros de Compras.

### Fields

| Field | Type | Editable | Required | Source | Notes |
|-------|------|----------|----------|--------|-------|
| `id` | `string` | No | Yes after creation | Backend | Identificador gerado pela fonte oficial. Exibido em detalhes como somente leitura. |
| `nome` | `string` | Yes | Yes | User/API | Unico campo editavel no escopo da feature. |

### Payloads

#### Supplier

```ts
type Supplier = {
  id: string;
  nome: string;
};
```

#### SupplierPayload

```ts
type SupplierPayload = {
  nome: string;
};
```

### Validation Rules

- `nome` MUST ser informado antes do envio.
- `nome` MUST ser trimado antes de compor o payload.
- `id` MUST NOT ser enviado como campo editavel em criacao ou edicao.
- Rejeicoes da API MUST ser exibidas sem descartar o preenchimento atual.
- Campos que nao existem no contrato atual, como contato, documento, status,
  historico, totais ou metricas, MUST NOT ser exibidos como dados de fornecedor.

### Relationships

- Fornecedor e cadastro preparatorio para Compras futuras.
- Produtos existentes podem referenciar fornecedores por `fornecedorId`, mas esta
  feature nao altera produtos.
- Compras permanecem fora do escopo desta feature.

### State Transitions

```text
Nao cadastrado -> Cadastrado
Cadastrado -> Editado
```

- Criacao ocorre por `POST /api/fornecedores` com `{ nome }`.
- Edicao ocorre por `PUT /api/fornecedores/{id}` com `{ nome }`.
- Nao ha estado de inativacao, exclusao ou remocao no escopo.

## UI State Model

### Lista de Fornecedores

- `loading`: primeira carga em andamento.
- `loaded-empty`: API retornou lista vazia.
- `loaded-with-results`: API retornou fornecedores e busca local exibe resultados.
- `loaded-search-empty`: API retornou fornecedores, mas busca local nao encontrou
  correspondencias.
- `error`: falha ao carregar lista, com acao de tentar novamente.

### Detalhe de Fornecedor

- `loading`: consulta por ID em andamento.
- `loaded`: fornecedor encontrado.
- `not-found`: API retornou ausencia para o ID.
- `error`: falha inesperada, com opcao de tentar novamente ou voltar.

### Formulario de Fornecedor

- `idle`: formulario pronto.
- `invalid`: nome ausente/invalido em validacao local.
- `submitting`: envio em andamento.
- `success`: criacao/edicao concluida com feedback e navegacao/atualizacao.
- `api-error`: API rejeitou ou falhou; manter preenchimento.

## Out of Scope Data

- Historico de compras por fornecedor.
- Total comprado, ranking, indicadores ou metricas.
- Status de inativacao.
- Exclusao ou remocao.
- Campos de contato, documento ou dados comerciais nao suportados pelo contrato
  atual.
