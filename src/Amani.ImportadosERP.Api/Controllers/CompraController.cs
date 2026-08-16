using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.DTOs.Devolucoes;
using Amani.ImportadosERP.Application.DTOs.Reembolsos;
using Amani.ImportadosERP.Application.DTOs.Response;
using Amani.ImportadosERP.Application.Services;
using Amani.ImportadosERP.Application.Queries;
using Microsoft.Extensions.Logging;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ComprasController : ControllerBase
{
    private readonly CompraService _service;
    private readonly IMediator _mediator;
    private readonly ILogger<ComprasController> _logger;

    public ComprasController(CompraService service, IMediator mediator, ILogger<ComprasController> logger)
    {
        _service = service;
        _mediator = mediator;
        _logger = logger;
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

    [HttpPost("{compraId:guid}/itens/{itemId:guid}/devolucoes")]
    public async Task<IActionResult> RegistrarDevolucao(Guid compraId, Guid itemId, [FromBody] RegistrarCompraItemDevolucaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (itemId == Guid.Empty) return BadRequest(new { error = "ItemId e obrigatorio" });

        try
        {
            var devolucao = await _service.RegistrarDevolucaoAsync(compraId, itemId, dto);
            _logger.LogInformation(
                "Devolucao de compra registrada. CompraId={CompraId} ItemId={ItemId} OperacaoId={OperacaoId}",
                compraId,
                itemId,
                dto.OperacaoId);
            return CreatedAtAction(nameof(GetDevolucoes), new { compraId }, devolucao);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            _logger.LogWarning(
                ex,
                "Falha de negocio ao registrar devolucao de compra. CompraId={CompraId} ItemId={ItemId} OperacaoId={OperacaoId}",
                compraId,
                itemId,
                dto?.OperacaoId);
            return MapApplicationError(ex);
        }
    }

    [HttpGet("em-transito")]
    public async Task<IActionResult> GetEmTransito()
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var compras = await _mediator.Send(new ObterComprasEmTransitoQuery());
        return Ok(compras);
    }

    [HttpGet("produtos-pendentes")]
    public async Task<IActionResult> GetProdutosPendentes()
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var produtos = await _mediator.Send(new ObterProdutosPendentesRecebimentoQuery());
        return Ok(produtos);
    }

    [HttpGet("{compraId:guid}/recebimentos")]
    public async Task<IActionResult> GetRecebimentos(Guid compraId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (await _service.ObterPorIdAsync(compraId) == null) return NotFound();

        var recebimentos = await _mediator.Send(new ObterRecebimentosCompraQuery { CompraId = compraId });
        return Ok(recebimentos);
    }

    [HttpGet("{compraId:guid}/perdas")]
    public async Task<IActionResult> GetPerdas(Guid compraId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (await _service.ObterPorIdAsync(compraId) == null) return NotFound();

        var perdas = await _mediator.Send(new ObterPerdasCompraQuery { CompraId = compraId });
        return Ok(perdas);
    }

    [HttpGet("{compraId:guid}/devolucoes")]
    public async Task<IActionResult> GetDevolucoes(Guid compraId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });

        try
        {
            var devolucoes = await _service.ObterDevolucoesAsync(compraId);
            return Ok(devolucoes);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            return MapApplicationError(ex);
        }
    }

    [HttpPost("{compraId:guid}/devolucoes/{devolucaoId:guid}/compensacoes")]
    public async Task<IActionResult> CompensarDevolucao(Guid compraId, Guid devolucaoId, [FromBody] CompensarCompraItemDevolucaoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (devolucaoId == Guid.Empty) return BadRequest(new { error = "DevolucaoId e obrigatorio" });

        try
        {
            var resultado = await _service.CompensarDevolucaoAsync(compraId, devolucaoId, dto);
            _logger.LogInformation(
                "Compensacao de devolucao processada. CompraId={CompraId} DevolucaoId={DevolucaoId} OperacaoId={OperacaoId} Criada={Criada}",
                compraId,
                devolucaoId,
                dto.OperacaoId,
                resultado.Criada);
            return resultado.Criada
                ? CreatedAtAction(nameof(GetDevolucoes), new { compraId }, resultado.Devolucao)
                : Ok(resultado.Devolucao);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            _logger.LogWarning(
                ex,
                "Falha de negocio ao compensar devolucao. CompraId={CompraId} DevolucaoId={DevolucaoId} OperacaoId={OperacaoId}",
                compraId,
                devolucaoId,
                dto?.OperacaoId);
            return MapApplicationError(ex);
        }
    }

    [HttpPost("{compraId:guid}/reembolsos")]
    public async Task<IActionResult> RegistrarReembolso(Guid compraId, [FromBody] RegistrarCompraReembolsoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });

        try
        {
            var reembolso = await _service.RegistrarReembolsoAsync(compraId, dto);
            _logger.LogInformation(
                "Reembolso de compra registrado. CompraId={CompraId} OperacaoId={OperacaoId}",
                compraId,
                dto.OperacaoId);
            return CreatedAtAction(nameof(GetReembolsos), new { compraId }, reembolso);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            _logger.LogWarning(
                ex,
                "Falha de negocio ao registrar reembolso de compra. CompraId={CompraId} OperacaoId={OperacaoId}",
                compraId,
                dto?.OperacaoId);
            return MapApplicationError(ex);
        }
    }

    [HttpPost("{compraId:guid}/reembolsos/{reembolsoId:guid}/cancelamentos")]
    public async Task<IActionResult> CancelarReembolso(Guid compraId, Guid reembolsoId, [FromBody] CancelarCompraReembolsoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });
        if (reembolsoId == Guid.Empty) return BadRequest(new { error = "ReembolsoId e obrigatorio" });

        try
        {
            var resultado = await _service.CancelarReembolsoAsync(compraId, reembolsoId, dto);
            _logger.LogInformation(
                "Cancelamento de reembolso processado. CompraId={CompraId} ReembolsoId={ReembolsoId} OperacaoId={OperacaoId} Criado={Criado}",
                compraId,
                reembolsoId,
                dto.OperacaoId,
                resultado.Criado);
            return resultado.Criado
                ? CreatedAtAction(nameof(GetReembolsos), new { compraId }, resultado.Reembolso)
                : Ok(resultado.Reembolso);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            _logger.LogWarning(
                ex,
                "Falha de negocio ao cancelar reembolso. CompraId={CompraId} ReembolsoId={ReembolsoId} OperacaoId={OperacaoId}",
                compraId,
                reembolsoId,
                dto?.OperacaoId);
            return MapApplicationError(ex);
        }
    }

    [HttpGet("{compraId:guid}/reembolsos")]
    public async Task<IActionResult> GetReembolsos(Guid compraId)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        if (compraId == Guid.Empty) return BadRequest(new { error = "CompraId e obrigatorio" });

        try
        {
            var reembolsos = await _service.ObterReembolsosAsync(compraId);
            return Ok(reembolsos);
        }
        catch (Exception ex) when (IsApplicationException(ex))
        {
            return MapApplicationError(ex);
        }
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
