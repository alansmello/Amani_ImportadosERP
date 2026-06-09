using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDashboardGraficoRepository
{
    Task<SerieGraficaDto> ObterReceitaPorPeriodoAsync(DateTime dataInicial, DateTime dataFinal);
    Task<(SerieGraficaDto Serie, IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos)> ObterLucroPorPeriodoAsync(DateTime dataInicial, DateTime dataFinal);
    Task<SerieGraficaDto> ObterComprasPorPeriodoAsync(DateTime dataInicial, DateTime dataFinal);
    Task<SerieGraficaDto> ObterDespesasPorCategoriaAsync(DateTime dataInicial, DateTime dataFinal);
    Task<SerieGraficaDto> ObterEvolucaoEstoqueAsync(DateTime dataInicial, DateTime dataFinal);
}
