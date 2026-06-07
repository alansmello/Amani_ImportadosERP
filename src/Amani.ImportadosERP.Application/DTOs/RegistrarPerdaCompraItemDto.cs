using System;
using System.ComponentModel.DataAnnotations;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarPerdaCompraItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero.")]
    public int Quantidade { get; set; }

    [Required(ErrorMessage = "Motivo e obrigatorio.")]
    public string Motivo { get; set; } = string.Empty;
    public DateTime? DataPerda { get; set; }
    public string? Observacao { get; set; }
}
