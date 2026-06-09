using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDashboardRankingRepository
{
    Task<IReadOnlyCollection<RankingProdutoDto>> ObterProdutosMaisVendidosAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        int limite);

    Task<(IReadOnlyCollection<RankingProdutoDto> Rankings, IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos)> ObterProdutosMaisLucrativosAsync(
        DateTime dataInicial,
        DateTime dataFinal,
        DateTime dataReferencia,
        int limite);

    Task<IReadOnlyCollection<RankingProdutoDto>> ObterProdutosComMaiorEstoqueAsync(
        DateTime dataReferencia,
        int limite);

    Task<IReadOnlyCollection<RankingProdutoDto>> ObterProdutosComMenorEstoqueAsync(
        DateTime dataReferencia,
        int limite);
}
