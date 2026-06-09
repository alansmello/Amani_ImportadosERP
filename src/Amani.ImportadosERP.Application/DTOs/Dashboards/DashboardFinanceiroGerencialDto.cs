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
    public decimal ValorLucroNaoCalculavel { get; set; }
    public int QuantidadeItensSemCusto { get; set; }
    public IReadOnlyCollection<AvisoDadoIncompletoDto> Avisos { get; set; } = Array.Empty<AvisoDadoIncompletoDto>();
}
