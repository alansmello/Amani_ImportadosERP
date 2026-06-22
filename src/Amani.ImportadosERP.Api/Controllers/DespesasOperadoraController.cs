using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Queries;
using Amani.ImportadosERP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/despesas-operadora")]
public sealed class DespesasOperadoraController : ControllerBase
{
    private readonly IMediator _mediator;

    public DespesasOperadoraController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] DateTime? dataInicio, [FromQuery] DateTime? dataFim, [FromQuery] string? formaPagamento)
    {
        FormaPagamento? formaPagamentoEnum = null;

        if (!string.IsNullOrWhiteSpace(formaPagamento))
        {
            if (!Enum.TryParse<FormaPagamento>(formaPagamento, ignoreCase: true, out var parsed))
            {
                return BadRequest(new { error = "Forma de pagamento invalida para despesa de operadora" });
            }

            formaPagamentoEnum = parsed;
        }

        DateTime? dataInicioUtc = dataInicio.HasValue
            ? new DateTime(dataInicio.Value.Year, dataInicio.Value.Month, dataInicio.Value.Day, 0, 0, 0, DateTimeKind.Utc)
            : null;

        DateTime? dataFimUtc = dataFim.HasValue
            ? new DateTime(dataFim.Value.Year, dataFim.Value.Month, dataFim.Value.Day, 23, 59, 59, DateTimeKind.Utc)
            : null;

        try
        {
            var result = await _mediator.Send(new ObterDespesasOperadoraQuery
            {
                DataInicio = dataInicioUtc,
                DataFim = dataFimUtc,
                FormaPagamento = formaPagamentoEnum
            });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
