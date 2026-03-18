using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DespesasController : ControllerBase
{
    private readonly IMediator _mediator;

    public DespesasController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarDespesaCommand command)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var id = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetAll), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim, [FromQuery] Guid? categoriaId)
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

        var query = new ObterListaDespesasQuery
        {
            DataInicio = dataInicioUtc,
            DataFim = dataFimUtc,
            CategoriaId = categoriaId
        };

        var despesas = await _mediator.Send(query);
        return Ok(despesas);
    }
}
