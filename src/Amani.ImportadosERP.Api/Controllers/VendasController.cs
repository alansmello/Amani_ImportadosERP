using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Services;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VendasController : ControllerBase
{
    private readonly VendaService _service;
    private readonly IMediator _mediator;

    public VendasController(VendaService service, IMediator mediator)
    {
        _service = service;
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarVendaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var result = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var venda = await _service.ObterPorIdAsync(id);
        if (venda == null) return NotFound();
        return Ok(venda);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim, [FromQuery] Guid? clienteId)
    {
        DateTime? dataInicioUtc = dataInicio.HasValue
            ? new DateTime(
                dataInicio.Value.Year,
                dataInicio.Value.Month,
                dataInicio.Value.Day,
                0, 0, 0,
                DateTimeKind.Utc
              )
            : null;

        DateTime? dataFimUtc = dataFim.HasValue
            ? new DateTime(
                dataFim.Value.Year,
                dataFim.Value.Month,
                dataFim.Value.Day,
                23, 59, 59,
                DateTimeKind.Utc
              )
            : null;
        var query = new ObterListaVendasQuery
        {
            DataInicio = dataInicioUtc,
            DataFim = dataFimUtc,
            ClienteId = clienteId
        };

        var vendas = await _mediator.Send(query);
        return Ok(vendas);
    }

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard([FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim, [FromQuery] Guid? clienteId)
    {
        DateTime? dataInicioUtc = dataInicio.HasValue
           ? new DateTime(
               dataInicio.Value.Year,
               dataInicio.Value.Month,
               dataInicio.Value.Day,
               0, 0, 0,
               DateTimeKind.Utc
             )
           : null;

        DateTime? dataFimUtc = dataFim.HasValue
            ? new DateTime(
                dataFim.Value.Year,
                dataFim.Value.Month,
                dataFim.Value.Day,
                23, 59, 59,
                DateTimeKind.Utc
              )
            : null;

        var query = new ObterDashboardQuery
        {
            DataInicio = dataInicioUtc,
            DataFim = dataFimUtc,
            ClienteId = clienteId
        };

        var dashboard = await _mediator.Send(query);
        return Ok(dashboard);
    }

    [HttpPost("{id:guid}/cancelar")]
    public async Task<IActionResult> Cancelar(Guid id)
    {
        await _mediator.Send(new CancelarVendaCommand
        {
            VendaId = id
        });

        return Ok();
    }
}
