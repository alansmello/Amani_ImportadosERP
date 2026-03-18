using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Services;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComprasController : ControllerBase
{
    private readonly CompraService _service;
    private readonly IMediator _mediator;

    public ComprasController(CompraService service, IMediator mediator)
    {
        _service = service;
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarCompraDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var id = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var compra = await _service.ObterPorIdAsync(id);
        if (compra == null) return NotFound();
        return Ok(compra);
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim, [FromQuery] Guid? fornecedorId)
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

        var query = new ObterListaComprasQuery
        {
            DataInicio = dataInicioUtc,
            DataFim = dataFimUtc,
            FornecedorId = fornecedorId
        };

        var compras = await _mediator.Send(query);
        return Ok(compras);
    }
}
