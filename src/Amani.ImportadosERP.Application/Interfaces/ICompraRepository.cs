using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICompraRepository
{
    Task AdicionarAsync(Compra compra);
    Task<Compra?> ObterPorIdAsync(Guid id);
    Task<Compra?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<Compra?> ObterPorIdComItemParaAtualizarAsync(Guid compraId, Guid itemId);
    Task<List<Compra>> ObterTodasAsync();
    Task<List<Compra>> ObterComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, Guid? fornecedorId);
    Task SalvarAsync();
}
