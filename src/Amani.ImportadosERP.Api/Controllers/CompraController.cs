using System;
using System.Collections.Generic;
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

        try
        {
            var id = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id }, new { id });
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            return MapApplicationError(ex);
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        if (id == Guid.Empty) return BadRequest(new { error = "Id da compra e obrigatorio" });

        var compra = await _service.ObterPorIdAsync(id);
        if (compra == null) return NotFound();
        return Ok(compra);
    }

    [HttpPost("{compraId:guid}/itens/{itemId:guid}/recebimentos")]
    public async Task<IActionResult> RegistrarRecebimento(Guid compraId, Guid itemId, [FromBody] RegistrarRecebimentoCompraItemDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (itemId == Guid.Empty) return BadRequest(new { error = "ItemId e obrigatorio" });

        try
        {
            var recebimento = await _service.RegistrarRecebimentoItemAsync(compraId, itemId, dto);
            return CreatedAtAction(nameof(GetRecebimentos), new { compraId }, recebimento);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            return MapApplicationError(ex);
        }
    }

    [HttpPost("{compraId:guid}/itens/{itemId:guid}/perdas")]
    public async Task<IActionResult> RegistrarPerda(Guid compraId, Guid itemId, [FromBody] RegistrarPerdaCompraItemDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (itemId == Guid.Empty) return BadRequest(new { error = "ItemId e obrigatorio" });

        try
        {
            var perda = await _service.RegistrarPerdaItemAsync(compraId, itemId, dto);
            return CreatedAtAction(nameof(GetPerdas), new { compraId }, perda);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            return MapApplicationError(ex);
        }
    }

    [HttpGet("em-transito")]
    public async Task<IActionResult> GetEmTransito()
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var compras = await _service.ObterComprasEmTransitoAsync();
        return Ok(compras);
    }

    [HttpGet("produtos-pendentes")]
    public async Task<IActionResult> GetProdutosPendentes()
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var produtos = await _service.ObterProdutosPendentesRecebimentoAsync();
        return Ok(produtos);
    }

    [HttpGet("{compraId:guid}/recebimentos")]
    public async Task<IActionResult> GetRecebimentos(Guid compraId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (await _service.ObterPorIdAsync(compraId) == null) return NotFound();

        var recebimentos = await _service.ObterRecebimentosAsync(compraId);
        return Ok(recebimentos);
    }

    [HttpGet("{compraId:guid}/perdas")]
    public async Task<IActionResult> GetPerdas(Guid compraId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (await _service.ObterPorIdAsync(compraId) == null) return NotFound();

        var perdas = await _service.ObterPerdasAsync(compraId);
        return Ok(perdas);
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

    private IActionResult MapApplicationError(Exception ex)
    {
        return ex switch
        {
            ArgumentException => BadRequest(new { error = ex.Message }),
            KeyNotFoundException => NotFound(new { error = ex.Message }),
            InvalidOperationException invalid when IsBadRequestBusinessError(invalid) => BadRequest(new { error = invalid.Message }),
            InvalidOperationException => Conflict(new { error = ex.Message }),
            _ => StatusCode(500, new { error = "Erro inesperado ao processar compra" })
        };
    }

    private static bool IsApplicationException(Exception ex)
    {
        return ex is ArgumentException
            || ex is KeyNotFoundException
            || ex is InvalidOperationException;
    }

    private static bool IsBadRequestBusinessError(InvalidOperationException ex)
    {
        return ex.Message.Contains("exceder", StringComparison.OrdinalIgnoreCase);
    }
}
