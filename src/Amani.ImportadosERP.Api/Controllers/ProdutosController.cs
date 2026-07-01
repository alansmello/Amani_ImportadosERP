using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Services;
using System.Collections.Generic;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/produtos")]
public class ProdutosController : ControllerBase
{
    private readonly ProdutoService _service;
    private readonly ProdutoApresentacaoService _apresentacaoService;

    public ProdutosController(ProdutoService service, ProdutoApresentacaoService apresentacaoService)
    {
        _service = service;
        _apresentacaoService = apresentacaoService;
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

    [HttpGet("{produtoId:guid}/apresentacoes")]
    public async Task<IActionResult> GetApresentacoes(Guid produtoId, [FromQuery] bool apenasAtivas = false)
    {
        return Ok(await _apresentacaoService.ListarAsync(produtoId, apenasAtivas));
    }

    [HttpPost("{produtoId:guid}/apresentacoes")]
    public async Task<IActionResult> CriarApresentacao(Guid produtoId, [FromBody] CriarProdutoApresentacaoDto dto)
    {
        try
        {
            var result = await _apresentacaoService.CriarAsync(produtoId, dto);
            return Created($"api/produtos/{produtoId}/apresentacoes/{result.Id}", result);
        }
        catch (KeyNotFoundException) { return NotFound(); }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPut("{produtoId:guid}/apresentacoes/{id:guid}")]
    public async Task<IActionResult> AtualizarApresentacao(Guid produtoId, Guid id, [FromBody] AtualizarProdutoApresentacaoDto dto)
    {
        try
        {
            return await _apresentacaoService.AtualizarAsync(produtoId, id, dto) ? NoContent() : NotFound();
        }
        catch (ArgumentException ex) { return BadRequest(new { error = ex.Message }); }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }

    [HttpPost("{produtoId:guid}/apresentacoes/{id:guid}/desativar")]
    public async Task<IActionResult> DesativarApresentacao(Guid produtoId, Guid id)
    {
        try
        {
            return await _apresentacaoService.DesativarAsync(produtoId, id) ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex) { return BadRequest(new { error = ex.Message }); }
    }
}
