# Data Model: Configurações e Categorias (Refinamento, Frontend)

**Branch**: `019-configuracoes-categorias-frontend` | **Date**: 2026-06-25

## Entidades de Domínio (Backend)

### Categoria (produto)

Entidade existente em `Domain/Entities/Categoria.cs`.

| Campo | Tipo | Regras |
|-------|------|--------|
| `Id` | `Guid` | PK, gerado na criação |
| `Nome` | `string` | Obrigatório, não vazio, trim aplicado |
| `CreatedAt` | `DateTime` | Gerenciado por `BaseEntity` |
| `UpdatedAt` | `DateTime` | Gerenciado por `BaseEntity` via `Touch()` |

**Comportamentos de domínio**:
- `Categoria(nome)` — construtor valida nome não vazio
- `AtualizarNome(nome)` — valida não vazio, chama `Touch()`
- *(novo F019)* Remoção gerenciada pelo repositório via EF Core `Remove` — sem método de domínio necessário (exclusão direta)

**Restrições de remoção**: Se outros registros referenciam a categoria (ex.: `Produto.CategoriaId`),
o banco retorna erro de FK. O service captura a exceção e retorna mensagem ao controller; o frontend
exibe o erro retornado.

---

### CategoriaDespesa (categoria de despesa)

Entidade existente em `Domain/Entities/CategoriaDespesa.cs`.

| Campo | Tipo | Regras |
|-------|------|--------|
| `Id` | `Guid` | PK, gerado na criação |
| `Nome` | `string` | Obrigatório, não vazio; normalizado (trim) |
| `NomeNormalizado` | `string` | Uppercase para comparação de unicidade |
| `Descricao` | `string?` | Opcional; null quando vazio |
| `Ativa` | `bool` | Padrão `true`; toggle via `Inativar()` / `Reativar()` (novo) |
| `CreatedAt` | `DateTime` | Gerenciado por `BaseEntity` |
| `UpdatedAt` | `DateTime` | Gerenciado por `BaseEntity` via `Touch()` |

**Comportamentos de domínio**:
- `CategoriaDespesa(nome, descricao?)` — cria ativa por padrão
- `Atualizar(nome, descricao?)` — atualiza nome e descrição, chama `Touch()`
- `AtualizarNome(nome)` — delega para `Atualizar`
- `Inativar()` — idempotente; se já inativa, não faz nada; chama `Touch()`
- *(novo F019)* `Reativar()` — simétrico a `Inativar()`; se já ativa, não faz nada; chama `Touch()`

**Unicidade**: `NomeNormalizado` é único por constraint de banco
(migration `AddDespesasCategorias`).

---

### ConfiguracaoFormaPagamento (taxas de operadora)

Entidade existente, gerenciada pelo módulo de formas de pagamento (F015).

| Campo | Tipo | Regras |
|-------|------|--------|
| `FormaPagamento` | `enum PaymentMethod` | Dinheiro, PIX, CartaoDebito, CartaoCredito, Fiado |
| `PercentualTaxa` | `decimal` | >= 0, <= 100 |
| `AtualizadoEm` | `DateTime` | Atualizado em cada `PUT` |

**Notas F019**: O frontend passa a exibir todas as formas de pagamento com taxa configurável
(não apenas CartaoDebito). A validação de range (>= 0) permanece no backend.

---

## Tipos de Frontend (TypeScript)

### category.ts — extensões F019

```typescript
// Existente
export type Category = {
  id: string;
  nome: string;
};

// Novos em F019
export type CreateCategoryPayload = {
  nome: string;
};

export type UpdateCategoryPayload = {
  nome: string;
};
```

### expense-category.ts — sem alteração de tipos

Tipos existentes já cobrem o toggle de status:
- `ExpenseCategory.ativa: boolean` — já presente
- `CreateExpenseCategoryPayload` — já presente
- `UpdateExpenseCategoryPayload` — já presente
- Nenhum tipo novo necessário para reativação (endpoint não tem body)

### payment-settings.ts — sem alteração de tipos

Todos os tipos já existem e são completos. `PaymentMethod` inclui todos os métodos.

---

## Transições de Estado

### Categoria de Despesa — ciclo de vida de status

```
[criada] → Ativa (padrão)
    Ativa  ──(inativar)──→  Inativa
    Inativa ──(reativar)──→  Ativa    ← novo em F019
```

- Apenas categorias Ativas aparecem no formulário de nova despesa
- Categorias Inativas aparecem na lista de Configurações com badge diferenciado
- O toggle exige confirmação do operador antes de chamar o endpoint

### Categoria de Produto — ciclo de vida

```
[criada] → Existe
    Existe ──(remover sem vínculos)──→  Removida (excluída do banco)
    Existe ──(remover com vínculos)──→  Erro do backend (FK constraint)
```

- Não há soft-delete; remoção é permanente
- Botão de remoção sempre visível; erro exibido reativamente

---

## Mapeamento de Query Keys (TanStack Query)

| Entidade | Query Key | Arquivo |
|----------|-----------|---------|
| Categorias de produto | `["categorias", "list"]` | `hooks/use-categories.ts` |
| Categorias de despesa | `["categorias-despesa", "list", incluirInativas]` | `hooks/use-expense-categories.ts` |
| Taxas de pagamento | `["formas-pagamento", "list"]` | `hooks/use-payment-settings.ts` |

Invalidação após mutação: cada `useMutation` de `onSuccess` invalida a query base correspondente
(padrão já estabelecido no projeto).
