namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class DashboardCaixaResumoDto
{
    public decimal CaixaInicial { get; set; }
    public decimal AjusteImplantacao { get; set; }
    public decimal Entradas { get; set; }
    public decimal Saidas { get; set; }
    public decimal CaixaFinal { get; set; }
}
