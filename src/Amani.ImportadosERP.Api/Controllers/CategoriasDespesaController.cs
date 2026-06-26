using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Queries;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/categorias-despesa")]
public class CategoriasDespesaController : ControllerBase
{
    private readonly IMediator _mediator;

    public CategoriasDespesaController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool incluirInativas = false)
    {
        var categorias = await _mediator.Send(new ObterCategoriasDespesaQuery
        {
            IncluirInativas = incluirInativas
        });

        return Ok(categorias);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var categoria = await _mediator.Send(new ObterCategoriaDespesaPorIdQuery
        {
            Id = id
        });

        return categoria == null ? NotFound() : Ok(categoria);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarCategoriaDespesaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var id = await _mediator.Send(new CriarCategoriaDespesaCommand
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao
            });

            return CreatedAtAction(nameof(GetById), new { id }, new { id });
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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AtualizarCategoriaDespesaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            await _mediator.Send(new AtualizarCategoriaDespesaCommand
            {
                Id = id,
                Nome = dto.Nome,
                Descricao = dto.Descricao
            });

            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
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

    [HttpPost("{id:guid}/inativar")]
    public async Task<IActionResult> Inactivate(Guid id)
    {
        try
        {
            await _mediator.Send(new InativarCategoriaDespesaCommand
            {
                Id = id
            });

            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }

    [HttpPost("{id:guid}/reativar")]
    public async Task<IActionResult> Reactivate(Guid id)
    {
        try
        {
            await _mediator.Send(new ReativarCategoriaDespesaCommand
            {
                Id = id
            });

            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
    }
}
