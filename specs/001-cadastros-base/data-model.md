# Data Model: Cadastros Base

## Cliente

**Purpose**: Customer master record used by sales and accounts receivable.

**Existing status**: Entity, repository interface, repository implementation,
service and create DTO already exist. Missing public controller, list/update
operations and active/inactive state.

**Fields**:
- `Id`: unique identifier inherited from base entity.
- `Nome`: required customer name, trimmed, max length aligned with existing
  mapping.
- `Email`: optional contact email.
- `Telefone`: optional contact phone.
- `Ativo`: boolean active state for operational use; default `true`.

**Relationships**:
- Referenced by `Venda.ClienteId`.
- Indirectly relevant to `ContaReceber` through sales.

**Validation rules**:
- Nome is required and cannot be blank.
- Email and Telefone are optional and should be normalized by trimming blanks.
- Inactivation must not remove or alter sales, receivables or payments.

**State transitions**:
- New Cliente starts as active.
- Active Cliente can be updated.
- Active Cliente can transition to inactive.
- Inactive Cliente remains consultable.

## Fornecedor

**Purpose**: Supplier master record used by purchases and products.

**Existing status**: Entity, repository interface, repository implementation,
service and create DTO already exist. Missing public controller and list/update
operations.

**Fields**:
- `Id`: unique identifier inherited from base entity.
- `Nome`: required supplier name.

**Relationships**:
- Referenced by `Compra.FornecedorId`.
- Optionally referenced by `Produto.FornecedorId`.

**Validation rules**:
- Nome is required and cannot be blank.
- Updates preserve purchase and product relationships.

## Categoria

**Purpose**: Product classification used to organize the catalog.

**Existing status**: Entity and Fluent API mapping exist. Missing repository
interface, repository implementation, service, DTOs and controller.

**Fields**:
- `Id`: unique identifier inherited from base entity.
- `Nome`: required category name.

**Relationships**:
- Referenced by `Produto.CategoriaId`.

**Validation rules**:
- Nome is required and cannot be blank.
- Updates preserve product relationships.

## Produto

**Purpose**: Product catalog item used by purchases and sales.

**Existing status**: Entity, repository interface, repository implementation,
service, create DTO, response DTO and mapping exist. Missing public controller,
list/update operations and reference validation against category/supplier.

**Fields**:
- `Id`: unique identifier inherited from base entity.
- `Nome`: required product name.
- `PrecoVenda`: non-negative sale price.
- `Custo`: existing catalog cost field. This feature must not use it as stock
  balance and must not change cost-average rules.
- `CategoriaId`: required existing category identifier.
- `FornecedorId`: optional existing supplier identifier.

**Relationships**:
- Required relationship with Categoria.
- Optional relationship with Fornecedor.
- Referenced by `CompraItem.ProdutoId`, `VendaItem.ProdutoId` and
  `EstoqueMovimentacao.ProdutoId`.

**Validation rules**:
- Nome is required and cannot be blank.
- PrecoVenda cannot be negative.
- CategoriaId must exist before create/update.
- FornecedorId must exist before create/update when provided.
- No fixed stock quantity may be added to Produto.
- Updating Produto must not create, delete or recalculate stock movements.

## DTO Families

Each cadastro requires explicit DTOs:

- Create DTO: input for creation.
- Update DTO: input for update.
- Detail/List DTO: output for list and get-by-id.
- Cliente status output must expose active/inactive distinction.

No endpoint should expose domain entities as response contracts.
