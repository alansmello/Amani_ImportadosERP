using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICategoriaDespesaRepository
{
    Task AdicionarAsync(CategoriaDespesa categoria);
    Task<CategoriaDespesa?> ObterPorIdAsync(Guid id);
    Task<CategoriaDespesa?> ObterPorNomeNormalizadoAsync(string nomeNormalizado);
    Task<List<CategoriaDespesa>> ListarAsync(bool incluirInativas);
    Task AtualizarAsync(CategoriaDespesa categoria);
}
