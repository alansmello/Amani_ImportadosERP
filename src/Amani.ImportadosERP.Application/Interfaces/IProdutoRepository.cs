using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IProdutoRepository
{
    Task AdicionarAsync(Produto produto);
    Task<Produto?> ObterPorIdAsync(Guid id);
}
