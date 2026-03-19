using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterDashboardFinanceiroQuery : IRequest<DashboardFinanceiroDto>
{
}
