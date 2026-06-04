# Research: Cadastros Base

## Decision: Reuse existing Clean Architecture projects

**Rationale**: The solution already has the intended layers:
`Amani.ImportadosERP.Api`, `Application`, `Domain`, `Infra.Data` and `Infra.IoC`.
The feature is a natural extension of existing cadastro classes and does not
need a new project or architectural layer.

**Alternatives considered**:
- Create a separate cadastros module project: rejected because it adds
  complexity without a current boundary need.
- Implement directly in controllers: rejected by the Constitution.

## Decision: Keep business rules in Application and Domain services/entities

**Rationale**: Controllers must remain thin. Domain entities already validate
basic invariants such as required names and non-negative price values.
Application services should coordinate repository calls, reference validation
and mapping to DTOs.

**Alternatives considered**:
- Put reference validation in controllers: rejected because controllers would
  contain business/application rules.
- Use MediatR for all cadastro operations: rejected for this feature because
  existing cadastro services already follow a simpler service pattern.

## Decision: Use explicit DTO mapping without AutoMapper

**Rationale**: The Constitution forbids AutoMapper and requires DTOs. Existing
code already contains explicit mappers for purchases and sales and simple DTOs
for products.

**Alternatives considered**:
- Return domain entities from endpoints: rejected because it exposes domain
  contracts and can leak invariants.
- Add AutoMapper: rejected by project Constitution and user constraints.

## Decision: Add Cliente active state instead of deleting records

**Rationale**: The spec requires client inactivation and the Constitution says
historical operation must never be lost. An active/inactive state preserves
history and lets new workflows distinguish active clients.

**Alternatives considered**:
- Delete client records: rejected because it can break historical sales,
  accounts receivable and auditability.
- Add inactivation for all entities: rejected because the feature explicitly
  scopes inactivation only to Cliente.

## Decision: Preserve Produto without stock balance field

**Rationale**: Product can expose catalog and commercial data, but stock balance
must continue to be calculated from movements. This feature must not add or
derive mutable stock fields on Produto.

**Alternatives considered**:
- Add stock quantity to Produto for list convenience: rejected by Constitution.
- Recalculate stock during product update: rejected because it touches stock
  rules outside feature scope.

## Decision: Validate Product references before create/update

**Rationale**: Products must require an existing Categoria and, if a Fornecedor
is provided, it must exist. This protects purchases and sales from unusable
product records.

**Alternatives considered**:
- Rely only on database foreign keys: rejected because users need clear
  application-level error outcomes.
- Allow missing Categoria: rejected by feature spec and existing Produto domain
  invariant.

## Decision: Keep existing external dependencies only

**Rationale**: The feature can be implemented with current ASP.NET Core, EF Core
and existing project dependencies. No new library is necessary.

**Alternatives considered**:
- Add validation or mapping packages: rejected by user constraints and
  simplicity principle.
