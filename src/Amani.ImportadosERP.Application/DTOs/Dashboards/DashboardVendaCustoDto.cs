namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardVendaCustoDto
{
    public Guid VendaId { get; set; }
    public Guid ProdutoId { get; set; }
    public int Quantidade { get; set; }
    public decimal ValorLiquidoItem { get; set; }
    public decimal? CustoMedio { get; set; }
}
