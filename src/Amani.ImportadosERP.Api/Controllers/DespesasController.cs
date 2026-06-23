using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.DTOs;
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
    public async Task<IActionResult> Create([FromBody] CriarDespesaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var id = await _mediator.Send(new CriarDespesaCommand
            {
                DataCompetencia = dto.DataCompetencia ?? DateTime.UtcNow,
                Valor = dto.Valor,
                Descricao = dto.Descricao,
                CategoriaDespesaId = dto.CategoriaDespesaId,
                FormaPagamento = dto.FormaPagamento
            });

            return CreatedAtAction(nameof(GetAll), new { id }, new { id });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim, [FromQuery] Guid? categoriaId)
    {
        if (dataInicio.HasValue && dataFim.HasValue && dataInicio.Value.Date > dataFim.Value.Date)
        {
            return BadRequest(new { error = "Periodo invalido: dataInicio deve ser menor ou igual a dataFim." });
        }

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
            DataCompetenciaInicio = dataInicioUtc,
            DataCompetenciaFim = dataFimUtc,
            CategoriaId = categoriaId
        };

        var despesas = await _mediator.Send(query);
        return Ok(despesas);
    }
}
