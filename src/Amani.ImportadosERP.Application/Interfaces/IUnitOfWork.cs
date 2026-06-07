using System;
using System.Threading.Tasks;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<Task> operation);
    Task SaveChangesAsync();
}
