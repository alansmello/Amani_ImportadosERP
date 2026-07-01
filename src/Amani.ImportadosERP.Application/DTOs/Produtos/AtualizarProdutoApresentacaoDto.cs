namespace Amani.ImportadosERP.Application.DTOs;

public sealed class AtualizarProdutoApresentacaoDto
{
    public string Nome { get; set; } = string.Empty;
    public long FatorNumerador { get; set; }
    public long FatorDenominador { get; set; }
    public bool PermiteCompra { get; set; }
    public bool PermiteVenda { get; set; }
    public decimal? PrecoVenda { get; set; }
    public bool Ativo { get; set; }
}
