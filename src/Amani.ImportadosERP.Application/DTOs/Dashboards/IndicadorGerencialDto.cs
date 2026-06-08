namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class IndicadorGerencialDto
{
    public string Nome { get; set; } = string.Empty;
    public decimal Valor { get; set; }
    public string Unidade { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public string? Observacao { get; set; }
}
