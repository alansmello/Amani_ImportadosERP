using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Infra.Data.Context;
using System.Data;

namespace Amani.ImportadosERP.Infra.Data.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly AmaniDbContext _db;

    public UnitOfWork(AmaniDbContext db)
    {
        _db = db;
    }

    public async Task ExecuteInTransactionAsync(Func<Task> operation)
    {
        if (operation == null) throw new ArgumentNullException(nameof(operation));

        var strategy = _db.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

            await operation();
            await _db.SaveChangesAsync();

            await transaction.CommitAsync();
        });
    }

    public async Task SaveChangesAsync()
    {
        await _db.SaveChangesAsync();
    }
}
