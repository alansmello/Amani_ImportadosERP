using Amani.ImportadosERP.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/dashboard-gerencial")]
public class DashboardGerencialController : ControllerBase
{
    private readonly IMediator _mediator;

    public DashboardGerencialController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("financeiro")]
    public async Task<IActionResult> GetFinanceiro(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] int? mes,
        [FromQuery] int? ano)
    {
        try
        {
            var result = await _mediator.Send(new ObterDashboardFinanceiroGerencialQuery
            {
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Mes = mes,
                Ano = ano
            });

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                erro = "Filtro invalido",
                detalhes = new[] { ex.Message }
            });
        }
    }

    [HttpGet("operacional")]
    public async Task<IActionResult> GetOperacional(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] int? mes,
        [FromQuery] int? ano)
    {
        try
        {
            var result = await _mediator.Send(new ObterDashboardOperacionalQuery
            {
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Mes = mes,
                Ano = ano
            });

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                erro = "Filtro invalido",
                detalhes = new[] { ex.Message }
            });
        }
    }
}
