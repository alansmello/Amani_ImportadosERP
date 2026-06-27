using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/contas-receber")]
public class ContasReceberController : ControllerBase
{
    private readonly IMediator _mediator;

    public ContasReceberController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarContaReceberCommand command)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var dataUtc = new DateTime(
            command.DataVencimento.Year,
            command.DataVencimento.Month,
            command.DataVencimento.Day,
            0, 0, 0,
            DateTimeKind.Utc
        );

        command.DataVencimento = dataUtc;

        var id = await _mediator.Send(command);

        return Ok(new { id });
    }

    [HttpPost("{id:guid}/pagamentos")]
    public async Task<IActionResult> RegistrarPagamento(Guid id, [FromBody] RegistrarPagamentoDto dto)
    {
        var command = new RegistrarPagamentoCommand
        {
            ContaReceberId = id,
            Valor = dto.Valor,
            Desconto = dto.Desconto,
            ValorBrutoLiquidado = dto.ValorBrutoLiquidado
        };

        try
        {
            await _mediator.Send(command);
        }
        catch (Exception ex)
        {
            return BadRequest(new { error = ex.Message });
        }

        return Ok();
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var result = await _mediator.Send(new ObterListaContasReceberQuery());
        return Ok(result);
    }

    [HttpGet("por-cliente")]
    public async Task<IActionResult> PorCliente()
    {
        var result = await _mediator.Send(new ObterContasReceberPorClienteQuery());
        return Ok(result);
    }

    [HttpGet("cliente/{clienteId:guid}")]
    public async Task<IActionResult> PorClienteDetalhe(Guid clienteId)
    {
        var result = await _mediator.Send(new ObterContasReceberPorClienteDetalheQuery
        {
            ClienteId = clienteId
        });

        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _mediator.Send(new ExcluirContaReceberCommand
        {
            Id = id
        });

        return Ok();
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AtualizarContaReceberDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var command = new AtualizarContaReceberCommand
        {
            Id = id,
            Valor = dto.Valor,
            DataVencimento = new DateTime(
                dto.DataVencimento.Year,
                dto.DataVencimento.Month,
                dto.DataVencimento.Day,
                0, 0, 0,
                DateTimeKind.Utc
            )
        };

        await _mediator.Send(command);

        return Ok();
    }
}
