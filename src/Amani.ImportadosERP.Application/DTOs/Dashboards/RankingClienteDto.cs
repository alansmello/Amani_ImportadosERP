namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class RankingClienteDto
{
    public string TipoRanking { get; set; } = string.Empty;
    public int Posicao { get; set; }
    public Guid ClienteId { get; set; }
    public string ClienteNome { get; set; } = string.Empty;
    public int Quantidade { get; set; }
    public decimal? ValorFinanceiro { get; set; }
    public string CriterioOrdenacao { get; set; } = string.Empty;
    public AvisoDadoIncompletoDto? Aviso { get; set; }
}
