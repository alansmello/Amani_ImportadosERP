using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ProdutoApresentacaoDto
{
    public Guid Id { get; set; }
    public Guid ProdutoId { get; set; }
    public string Nome { get; set; } = string.Empty;
    public long FatorNumerador { get; set; }
    public long FatorDenominador { get; set; }
    public decimal FatorCalculado { get; set; }
    public bool PermiteCompra { get; set; }
    public bool PermiteVenda { get; set; }
    public decimal? PrecoVenda { get; set; }
    public bool Ativo { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
