using System;
using System.ComponentModel.DataAnnotations;

namespace Amani.ImportadosERP.Application.DTOs;

public sealed class RegistrarRecebimentoCompraItemDto
{
    [Range(1, int.MaxValue, ErrorMessage = "Quantidade deve ser maior que zero.")]
    public int Quantidade { get; set; }
    public DateTime? DataRecebimento { get; set; }
    public string? Observacao { get; set; }
}
