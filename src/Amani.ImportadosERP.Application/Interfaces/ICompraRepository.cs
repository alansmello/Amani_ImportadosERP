using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICompraRepository
{
    Task AdicionarAsync(Compra compra);
    Task<Compra?> ObterPorIdAsync(Guid id);
    Task<List<Compra>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? fornecedorId);
}
