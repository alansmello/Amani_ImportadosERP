using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IVendaRepository
{
    Task AdicionarAsync(Venda venda);
    Task<Venda?> ObterPorIdAsync(Guid id);
    Task<List<Venda>> ObterTodasAsync();
    Task<List<Venda>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? clienteId);
}
