using System;
using System.Threading.Tasks;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICustoProdutoRepository
{
    Task<decimal> ObterCustoMedioAsync(Guid produtoId);
}
