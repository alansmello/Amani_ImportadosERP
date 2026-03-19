namespace Amani.ImportadosERP.Application.DTOs;

public sealed class DashboardFinanceiroDto
{
    public decimal TotalRecebido { get; set; }
    public decimal TotalAReceber { get; set; }
    public decimal TotalCompras { get; set; }
    public decimal TotalDespesas { get; set; }
    public decimal CaixaAtual { get; set; }
    public decimal LucroReal { get; set; }
}
