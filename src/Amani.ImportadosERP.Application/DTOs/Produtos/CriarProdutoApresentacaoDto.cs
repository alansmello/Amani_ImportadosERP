namespace Amani.ImportadosERP.Application.DTOs;

public sealed class CriarProdutoApresentacaoDto
{
    public string Nome { get; set; } = string.Empty;
    public long FatorNumerador { get; set; }
    public long FatorDenominador { get; set; }
    public bool PermiteCompra { get; set; }
    public bool PermiteVenda { get; set; } = true;
    public decimal? PrecoVenda { get; set; }
    public bool Ativo { get; set; } = true;
}
