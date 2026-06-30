namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardEstoqueValorizadoDto
{
    public int QuantidadeTotal { get; set; }
    public decimal ValorAoCusto { get; set; }
    public decimal ValorAoPrecoVenda { get; set; }
    public decimal LucroPotencialCalculavel { get; set; }
    public int QuantidadeSemCusto { get; set; }
    public decimal ValorVendaSemCusto { get; set; }
}
