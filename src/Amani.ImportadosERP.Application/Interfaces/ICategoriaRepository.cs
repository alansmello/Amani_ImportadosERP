using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICategoriaRepository
{
    Task AdicionarAsync(Categoria categoria);
    Task<Categoria?> ObterPorIdAsync(Guid id);
    Task<Categoria?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<List<Categoria>> ListarAsync();
    Task SalvarAsync();
    Task RemoverAsync(Guid id);
}
