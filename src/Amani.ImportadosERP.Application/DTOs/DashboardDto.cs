namespace Amani.ImportadosERP.Application.DTOs;

public sealed class DashboardDto
{
    public decimal TotalVendido { get; set; }
    public decimal LucroTotal { get; set; }
    public int QuantidadeVendas { get; set; }
    public decimal TicketMedio { get; set; }
}
