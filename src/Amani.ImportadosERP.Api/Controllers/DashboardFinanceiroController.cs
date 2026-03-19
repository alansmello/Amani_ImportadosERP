using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/dashboard-financeiro")]
public class DashboardFinanceiroController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardFinanceiroController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new ObterDashboardFinanceiroQuery());
        return Ok(result);
    }
}
