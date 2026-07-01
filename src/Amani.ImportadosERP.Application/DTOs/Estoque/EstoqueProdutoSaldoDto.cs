using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class EstoqueProdutoSaldoDto
{
    public Guid ProdutoId { get; set; }
    public string NomeProduto { get; set; } = string.Empty;
    public Guid CategoriaId { get; set; }
    public decimal Saldo { get; set; }
}
