namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarPagamentoDto
{
    public decimal Valor { get; set; }
    public decimal Desconto { get; set; } = 0m;
}
