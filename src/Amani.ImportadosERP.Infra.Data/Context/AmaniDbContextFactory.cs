using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;

namespace Amani.ImportadosERP.Infra.Data.Context;

public class AmaniDbContextFactory : IDesignTimeDbContextFactory<AmaniDbContext>
{
    public AmaniDbContext CreateDbContext(string[] args)
    {
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
            ?? "Host=localhost;Port=5433;Database=amani_db;Username=postgres;Password=surf22bob";

        var optionsBuilder = new DbContextOptionsBuilder<AmaniDbContext>();

        optionsBuilder.UseNpgsql(connectionString);

        return new AmaniDbContext(optionsBuilder.Options);
    }
}