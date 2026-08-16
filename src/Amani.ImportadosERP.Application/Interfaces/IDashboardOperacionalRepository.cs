using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDashboardOperacionalRepository
{
    Task<int> ObterProdutosCadastradosAsync(DateTime dataReferencia);
    Task<decimal> ObterEstoqueDisponivelTotalAsync(DateTime dataReferencia);
    Task<ResumoMercadoriasEmTransitoDto> ObterMercadoriasEmTransitoAsync(DateTime dataReferencia);
    Task<int> ObterComprasEmAbertoAsync(DateTime dataReferencia);
    Task<int> ObterProdutosPendentesRecebimentoAsync(DateTime dataReferencia);
    Task<(int Quantidade, decimal Valor)> ObterPerdasRegistradasAsync(DateTime dataInicial, DateTime dataFinal);
    Task<ResumoRecuperacaoOperacionalDto> ObterRecuperacaoOperacionalAsync(DateTime dataInicial, DateTime dataFinal, DateTime dataReferencia);
    Task<int> ObterQuantidadeVendasAsync(DateTime dataInicial, DateTime dataFinal);
    Task<int> ObterQuantidadeComprasAsync(DateTime dataInicial, DateTime dataFinal);
}
