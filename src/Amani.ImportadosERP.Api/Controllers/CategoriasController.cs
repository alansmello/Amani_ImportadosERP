using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/categorias")]
public class CategoriasController : ControllerBase
{
    private readonly CategoriaService _service;

    public CategoriasController(CategoriaService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarCategoriaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var categoria = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = categoria.Id }, categoria);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categorias = await _service.ListarAsync();
        return Ok(categorias);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var categoria = await _service.ObterPorIdAsync(id);
        if (categoria == null) return NotFound();
        return Ok(categoria);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AtualizarCategoriaDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var atualizado = await _service.AtualizarAsync(id, dto);
            if (!atualizado) return NotFound();
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _service.RemoverAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }
}
