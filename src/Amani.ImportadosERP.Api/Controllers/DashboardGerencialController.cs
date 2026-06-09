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

    [HttpGet]
    public async Task<IActionResult> GetConsolidado(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] int? mes,
        [FromQuery] int? ano,
        [FromQuery] int? limiteRankings,
        [FromQuery] string[] tiposGraficos,
        [FromQuery] string[] tiposAlertas)
    {
        try
        {
            var result = await _mediator.Send(new ObterDashboardGerencialQuery
            {
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Mes = mes,
                Ano = ano,
                LimiteRankings = limiteRankings,
                TiposGraficos = tiposGraficos,
                TiposAlertas = tiposAlertas
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

    [HttpGet("rankings")]
    public async Task<IActionResult> GetRankings(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] int? mes,
        [FromQuery] int? ano,
        [FromQuery] int? limiteRankings)
    {
        try
        {
            var result = await _mediator.Send(new ObterDashboardRankingsQuery
            {
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Mes = mes,
                Ano = ano,
                LimiteRankings = limiteRankings
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

    [HttpGet("alertas")]
    public async Task<IActionResult> GetAlertas(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] int? mes,
        [FromQuery] int? ano,
        [FromQuery] string[] tiposAlertas)
    {
        try
        {
            var result = await _mediator.Send(new ObterDashboardAlertasQuery
            {
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Mes = mes,
                Ano = ano,
                TiposAlertas = tiposAlertas
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

    [HttpGet("graficos")]
    public async Task<IActionResult> GetGraficos(
        [FromQuery] DateTime? dataInicial,
        [FromQuery] DateTime? dataFinal,
        [FromQuery] int? mes,
        [FromQuery] int? ano,
        [FromQuery] string[] tiposGraficos)
    {
        try
        {
            var result = await _mediator.Send(new ObterDashboardGraficosQuery
            {
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Mes = mes,
                Ano = ano,
                TiposGraficos = tiposGraficos
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
