using System;
using System.Threading.Tasks;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IEstoqueConsultaRepository
{
    Task<int> ObterSaldoAsync(Guid produtoId);
}
