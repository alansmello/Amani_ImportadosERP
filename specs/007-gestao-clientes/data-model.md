# Data Model: Gestao de Clientes no Frontend

## Cliente

Representa uma pessoa ou empresa atendida pela operacao do Amani ERP.

### Fields

| Field | Type | Required | Source | Notes |
|-------|------|----------|--------|-------|
| `id` | string | Yes | API response | Identificador unico do cliente. |
| `nome` | string | Yes | API response and form payload | Campo obrigatorio para cadastro e edicao. |
| `email` | string or null | No | API response and form payload | Campo opcional de contato. |
| `telefone` | string or null | No | API response and form payload | Campo opcional de contato. |
| `ativo` | boolean | Yes | API response | Define se o cliente aparece na visao padrao de ativos. |

### Payload: CustomerPayload

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| `nome` | string | Yes | Trim; nao pode ficar vazio. |
| `email` | string or null | No | Trim; se informado, validar formato basico de email. |
| `telefone` | string or null | No | Trim; pode ficar vazio. |

### Status Filter

| Value | API Query | Meaning |
|-------|-----------|---------|
| `active` | `ativo=true` | Clientes ativos; filtro padrao da tela. |
| `inactive` | `ativo=false` | Clientes inativos. |
| `all` | no `ativo` query | Todos os clientes retornados pela fonte oficial. |

### State Transitions

```text
Ativo --inativar confirmado--> Inativo
```

- Cadastro cria cliente ativo conforme regra da fonte oficial.
- Edicao nao altera diretamente o status.
- Inativacao nao apaga cliente, nao remove historico e nao representa delete definitivo.
- Reativacao nao faz parte do contrato atual e fica fora do escopo.

### Relationships

- Vendas, contas a receber e relatorios podem referenciar cliente por `id`, mas esses dados nao entram nesta feature.
- O frontend de Clientes nao carrega historico comercial, financeiro ou metricas relacionadas.

### Validation Rules

- `nome` deve ser informado antes de salvar.
- `email` pode ficar vazio; quando preenchido, deve ter formato basico de email antes do envio ou ser rejeitado pela fonte oficial.
- `telefone` pode ficar vazio.
- Cliente inativo nao deve exibir acao duplicada de inativacao.
- A interface deve tratar `404` como cliente nao encontrado.

### Derived Display Data

- Status visual: `Ativo` quando `ativo = true`; `Inativo` quando `ativo = false`.
- Ausencia de email ou telefone deve aparecer como texto neutro, sem sugerir erro.
- Nenhum campo financeiro, indicador ou historico deve ser derivado no frontend.
