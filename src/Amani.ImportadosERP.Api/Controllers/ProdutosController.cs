using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private readonly ProdutoService _service;

    public ProdutosController(ProdutoService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarProdutoDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var produto = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = produto.Id }, produto);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var produtos = await _service.ListarAsync();
        return Ok(produtos);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var produto = await _service.ObterPorIdAsync(id);
        if (produto == null) return NotFound();
        return Ok(produto);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AtualizarProdutoDto dto)
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
