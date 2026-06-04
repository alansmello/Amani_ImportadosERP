# Quickstart: Cadastros Base

This guide validates that the Cadastros Base feature works end-to-end after
implementation.

## Prerequisites

- PostgreSQL database available with the project connection string.
- Existing backend API can be built and run.
- Feature implementation completed from this plan.

## Build Validation

From repository root:

```powershell
dotnet build Amani_ImportadosERP.sln
```

Expected outcome:
- Build completes successfully.
- No new external package restore is required beyond existing project packages.

## Runtime Validation

Start the API using the normal project profile:

```powershell
dotnet run --project src\Amani.ImportadosERP.Api\Amani.ImportadosERP.Api.csproj
```

Expected outcome:
- API starts.
- Swagger remains available in development.

## Scenario 1: Cliente Lifecycle

1. Create a cliente through `POST /api/clientes`.
2. List clientes through `GET /api/clientes`.
3. Get the created cliente through `GET /api/clientes/{id}`.
4. Update the cliente through `PUT /api/clientes/{id}`.
5. Inactivate the cliente through `POST /api/clientes/{id}/inativar`.
6. List clientes again and confirm the active state changed.

Expected outcome:
- Cliente is created, updated and inactivated.
- No historical records are deleted.

## Scenario 2: Fornecedor and Categoria

1. Create fornecedor through `POST /api/fornecedores`.
2. Create categoria through `POST /api/categorias`.
3. List and get each record by identifier.
4. Update each record and verify updated values in subsequent reads.

Expected outcome:
- Both cadastros can be maintained independently.
- Updates do not affect existing purchases or products unexpectedly.

## Scenario 3: Produto With References

1. Use an existing or newly created categoria.
2. Optionally use an existing fornecedor.
3. Create produto through `POST /api/produtos`.
4. List produtos through `GET /api/produtos`.
5. Get produto by identifier.
6. Update product name, sale price, category or supplier.

Expected outcome:
- Produto is available for purchase and sale flows.
- Invalid category or supplier references are rejected.
- No stock movement is created by product creation or update.

## Regression Checks

After cadastro validation:

1. Confirm existing compra endpoints still work.
2. Confirm existing venda endpoints still validate stock as before.
3. Confirm cost-average and profit behavior are unchanged.
4. Confirm no product response exposes a fixed stock balance field.

Expected outcome:
- Operational modules keep their prior behavior.
