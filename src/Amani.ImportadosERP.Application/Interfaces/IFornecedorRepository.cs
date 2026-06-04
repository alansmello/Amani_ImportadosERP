using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IFornecedorRepository
{
    Task AdicionarAsync(Fornecedor fornecedor);
    Task<Fornecedor?> ObterPorIdAsync(Guid id);
    Task<Fornecedor?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<List<Fornecedor>> ListarAsync();
    Task SalvarAsync();
}
