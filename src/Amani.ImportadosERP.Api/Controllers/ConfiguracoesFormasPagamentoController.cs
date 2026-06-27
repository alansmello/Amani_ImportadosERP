using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.Queries;
using Amani.ImportadosERP.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/configuracoes/formas-pagamento")]
public sealed class ConfiguracoesFormasPagamentoController : ControllerBase
{
    private readonly IMediator _mediator;

    public ConfiguracoesFormasPagamentoController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new ObterConfiguracoesFormasPagamentoQuery());
        return Ok(result);
    }

    [HttpPut("{formaPagamento}")]
    public async Task<IActionResult> Put(string formaPagamento, [FromBody] AtualizarConfiguracaoFormaPagamentoRequest request)
    {
        if (!Enum.TryParse<FormaPagamento>(formaPagamento, ignoreCase: true, out var formaPagamentoEnum))
        {
            return BadRequest(new { error = "Forma de pagamento invalida" });
        }

        try
        {
            var result = await _mediator.Send(new AtualizarConfiguracaoFormaPagamentoCommand
            {
                FormaPagamento = formaPagamentoEnum,
                PercentualTaxa = request.PercentualTaxa
            });

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    public sealed class AtualizarConfiguracaoFormaPagamentoRequest
    {
        public decimal PercentualTaxa { get; set; }
    }
}
