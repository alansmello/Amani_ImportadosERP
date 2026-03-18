Solução Amani_ImportadosERP (.NET 8)

Arquitetura: Clean Architecture + DDD-lite

Projetos:
- Amani.ImportadosERP.Domain
- Amani.ImportadosERP.Application
- Amani.ImportadosERP.Infra.Data
- Amani.ImportadosERP.Infra.IoC
- Amani.ImportadosERP.Api

Tecnologias:
- .NET 8
- Entity Framework Core (Npgsql)
- PostgreSQL
- Fluent API (OnModelCreating)

Como executar:
1. Ajuste a connection string em `src/Amani.ImportadosERP.Api/appsettings.json` (DefaultConnection).
2. Instale as ferramentas EF Core se necessário: `dotnet tool install --global dotnet-ef`.
3. A partir do diretório `src/Amani.ImportadosERP.Infra.Data`, crie uma migration:
   `dotnet ef migrations add InitialCreate --project ../Amani.ImportadosERP.Infra.Data --startup-project ../Amani.ImportadosERP.Api`
4. Aplique a migration:
   `dotnet ef database update --project ../Amani.ImportadosERP.Infra.Data --startup-project ../Amani.ImportadosERP.Api`
5. Execute API:
   `dotnet run --project src/Amani.ImportadosERP.Api`

Notas:
- As entidades usam Fluent API em `ApplicationDbContext.OnModelCreating`.
- Serviço de domínio `ProductService` disponível via `IProductService`.
- Endpoints: POST `/api/products`, GET `/api/products/{id}`.

