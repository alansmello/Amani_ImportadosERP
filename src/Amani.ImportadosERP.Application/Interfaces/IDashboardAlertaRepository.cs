using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDashboardAlertaRepository
{
    Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasEstoqueBaixoAsync(
        DateTime dataReferencia,
        int limiteMinimo);

    Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasProdutosSemMovimentacaoAsync(
        DateTime dataReferencia,
        int diasSemMovimentacao);

    Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasComprasEmTransitoAntigoAsync(
        DateTime dataReferencia,
        int limiteDias);

    Task<IReadOnlyCollection<AlertaGerencialDto>> ObterAlertasPerdasRecorrentesAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        int limiteOcorrencias);
}
