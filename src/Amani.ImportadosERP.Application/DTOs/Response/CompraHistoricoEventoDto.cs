namespace Amani.ImportadosERP.Application.DTOs.Response;

public sealed class CompraHistoricoEventoDto
{
    public Guid Id { get; set; }
    public Guid CompraId { get; set; }
    public Guid? CompraItemId { get; set; }
    public Guid? ProdutoId { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public string Dimensao { get; set; } = string.Empty;
    public DateTime DataEfetiva { get; set; }
    public DateTime DataRegistro { get; set; }
    public int? Quantidade { get; set; }
    public decimal? Valor { get; set; }
    public string? Motivo { get; set; }
    public string? Observacao { get; set; }
    public Guid? ReferenciaId { get; set; }
}
