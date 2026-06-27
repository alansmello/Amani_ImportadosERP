using System;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Enums;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterDespesasOperadoraQuery : IRequest<DespesaOperadoraConsultaDto>
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public FormaPagamento? FormaPagamento { get; set; }
}
