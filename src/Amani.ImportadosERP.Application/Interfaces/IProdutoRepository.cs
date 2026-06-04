using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IProdutoRepository
{
    Task AdicionarAsync(Produto produto);
    Task<Produto?> ObterPorIdAsync(Guid id);
    Task<Produto?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<List<Produto>> ListarAsync();
    Task SalvarAsync();
}
