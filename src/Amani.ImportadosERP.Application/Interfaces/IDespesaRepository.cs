using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDespesaRepository
{
    Task AdicionarAsync(Despesa despesa);
    Task<Despesa?> ObterPorIdAsync(Guid id);
    Task<List<Despesa>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? categoriaId);
}
