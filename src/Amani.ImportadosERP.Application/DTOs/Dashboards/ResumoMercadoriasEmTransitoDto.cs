namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class ResumoMercadoriasEmTransitoDto
{
    public int QuantidadePendente { get; set; }
    public decimal? ValorAoCusto { get; set; }
    public decimal SubtotalCalculavelAoCusto { get; set; }
    public bool ValorAoCustoCompleto { get; set; } = true;
    public string? MotivoValorAoCustoIndisponivel { get; set; }
    public decimal? ValorAoPrecoVenda { get; set; }
    public string? MotivoValorAoPrecoVendaIndisponivel { get; set; }
}
