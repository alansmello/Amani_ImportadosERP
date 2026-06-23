using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Enums;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands;

public sealed class AtualizarConfiguracaoFormaPagamentoCommand : IRequest<ConfiguracaoFormaPagamentoDto>
{
    public FormaPagamento FormaPagamento { get; set; }
    public decimal PercentualTaxa { get; set; }
}
