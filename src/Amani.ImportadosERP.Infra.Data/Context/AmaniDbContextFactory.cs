using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Amani.ImportadosERP.Infra.Data.Context;

public class AmaniDbContextFactory : IDesignTimeDbContextFactory<AmaniDbContext>
{
    public AmaniDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<AmaniDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5433;Database=amani_db;Username=postgres;Password=surf22bob"
        );

        return new AmaniDbContext(optionsBuilder.Options);

    }

   
}
