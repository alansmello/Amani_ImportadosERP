using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDespesaOperadoraRepository
{
    Task AdicionarAsync(DespesaOperadora despesa);
    Task<(IReadOnlyList<DespesaOperadora> Itens, decimal TotalTaxas)> ObterConsultaComFiltrosAsync(DateTime? dataInicio, DateTime? dataFim, FormaPagamento? formaPagamento);
    Task SalvarAsync();
}
