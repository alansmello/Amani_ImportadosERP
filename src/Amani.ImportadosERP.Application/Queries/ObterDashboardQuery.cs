using System;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterDashboardQuery : IRequest<DashboardDto>
{
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public Guid? ClienteId { get; set; }
}
