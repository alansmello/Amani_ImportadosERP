namespace Amani.ImportadosERP.Application.DTOs;

public sealed class AtualizarClienteDto
{
    public string Nome { get; set; } = null!;
    public string? Email { get; set; }
    public string? Telefone { get; set; }
}
