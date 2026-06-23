using System;
using MediatR;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class CriarDespesaCommand : IRequest<Guid>
{
    public DateTime DataCompetencia { get; set; }
    public decimal Valor { get; set; }
    public string Descricao { get; set; } = null!;
    public Guid CategoriaDespesaId { get; set; }
    public FormaPagamento FormaPagamento { get; set; }
}
