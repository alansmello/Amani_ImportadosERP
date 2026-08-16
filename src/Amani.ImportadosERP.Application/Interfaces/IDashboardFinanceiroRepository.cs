using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDashboardFinanceiroRepository
{
    Task<decimal> ObterReceitaTotalAsync(DateTime dataInicial, DateTime dataFinal);
    Task<IReadOnlyCollection<DashboardVendaCustoDto>> ObterItensVendidosComCustoAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        DateTime dataReferencia);
    Task<decimal> ObterTotalComprasAsync(DateTime dataInicial, DateTime dataFinal);
    Task<decimal> ObterTotalDespesasAsync(DateTime dataInicial, DateTime dataFinal);
    Task<decimal> ObterContasReceberAbertasAsync(DateTime dataReferencia);
    Task<decimal> ObterValoresRecebidosAsync(DateTime dataInicial, DateTime dataFinal);
    Task<decimal> ObterReembolsosComprasLiquidosAsync(DateTime dataInicial, DateTime dataFinal);
    Task<DashboardCaixaResumoDto> ObterResumoCaixaAsync(DateTime dataInicial, DateTime dataFinal);

    Task<DashboardRecebiveisResumoDto> ObterResumoRecebiveisAsync(DateTime dataReferencia);
}
