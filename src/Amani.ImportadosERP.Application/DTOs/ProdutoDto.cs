using System;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class ProdutoDto
{
    public Guid Id { get; set; }
    public string Nome { get; set; } = null!;
    public decimal PrecoVenda { get; set; }
    public decimal Custo { get; set; }
    public Guid CategoriaId { get; set; }
    public Guid? FornecedorId { get; set; }
}
