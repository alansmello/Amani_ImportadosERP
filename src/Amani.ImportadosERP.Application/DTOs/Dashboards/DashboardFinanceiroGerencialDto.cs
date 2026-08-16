namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardFinanceiroGerencialDto
{
    public DashboardFiltroAplicadoDto FiltrosAplicados { get; set; } = new();
    public decimal ReceitaTotal { get; set; }
    public decimal LucroTotal { get; set; }
    public decimal TotalCompras { get; set; }
    public decimal TotalDespesas { get; set; }
    public decimal SaldoOperacional { get; set; }
    public decimal ContasReceberAbertas { get; set; }
    public decimal ValoresRecebidos { get; set; }
    public decimal ReembolsosComprasPeriodo { get; set; }
    public decimal EntradasCaixaPeriodo { get; set; }
    public decimal ValorLucroNaoCalculavel { get; set; }
    public int QuantidadeItensSemCusto { get; set; }
    public decimal? SaidasPeriodo { get; set; }
    public decimal? CaixaInicialPeriodo { get; set; }
    public decimal? AjusteImplantacaoPeriodo { get; set; }
    public decimal? CaixaFinalPeriodo { get; set; }
    public decimal? ContasReceberVencidas { get; set; }
    public decimal? ContasReceberAVencer { get; set; }
    public decimal? ValorEstoqueAoCusto { get; set; }
    public decimal? ValorEstoqueAoPrecoVenda { get; set; }
    public decimal? ValorMercadoriasEmTransitoAoCusto { get; set; }
    public string? MotivoValorMercadoriasEmTransitoAoCustoIndisponivel { get; set; }
    public decimal? ValorMercadoriasEmTransitoAoPrecoVenda { get; set; }
    public string? MotivoValorMercadoriasEmTransitoAoPrecoVendaIndisponivel { get; set; }
    public decimal? LucroPotencialEstoque { get; set; }
    public decimal? QuantidadeEstoqueSemCusto { get; set; }
    public decimal? ValorVendaEstoqueSemCusto { get; set; }
    public decimal? ValorTotalRealistaOperacao { get; set; }
    public decimal? ValorTotalPotencialOperacao { get; set; }
    public IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos { get; set; } = Array.Empty<AvisoDadoIncompletoDto>();
}
