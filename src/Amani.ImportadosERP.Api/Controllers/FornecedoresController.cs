using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/fornecedores")]
public class FornecedoresController : ControllerBase
{
    private readonly FornecedorService _service;

    public FornecedoresController(FornecedorService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarFornecedorDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var fornecedor = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = fornecedor.Id }, fornecedor);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var fornecedores = await _service.ListarAsync();
        return Ok(fornecedores);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var fornecedor = await _service.ObterPorIdAsync(id);
        if (fornecedor == null) return NotFound();
        return Ok(fornecedor);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AtualizarFornecedorDto dto)
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
}
