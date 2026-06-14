using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/estoque")]
public class EstoqueController : ControllerBase
{
    private readonly IMediator _mediator;

    public EstoqueController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> Get(
        [FromQuery] Guid? categoriaId,
        [FromQuery] bool apenasComSaldo = false)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var saldos = await _mediator.Send(new ObterSaldosEstoqueQuery
            {
                CategoriaId = categoriaId,
                ApenasComSaldo = apenasComSaldo
            });

            return Ok(saldos);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("{produtoId}/movimentacoes")]
    public async Task<IActionResult> GetMovimentacoes(
        string produtoId,
        [FromQuery] DateTime? dataInicio,
        [FromQuery] DateTime? dataFim,
        [FromQuery] string? tipo,
        [FromQuery] int? limite)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (!Guid.TryParse(produtoId, out var produtoGuid) || produtoGuid == Guid.Empty)
        {
            return BadRequest(new { error = "ProdutoId invalido" });
        }

        try
        {
            var historico = await _mediator.Send(new ObterMovimentacoesProdutoQuery
            {
                ProdutoId = produtoGuid,
                DataInicio = dataInicio,
                DataFim = dataFim,
                Tipo = tipo,
                Limite = limite
            });

            return Ok(historico);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
