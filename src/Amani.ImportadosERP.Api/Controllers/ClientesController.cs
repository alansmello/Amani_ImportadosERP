using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Services;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/clientes")]
public class ClientesController : ControllerBase
{
    private readonly ClienteService _service;

    public ClientesController(ClienteService service)
    {
        _service = service;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CriarClienteDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var cliente = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = cliente.Id }, cliente);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] bool? ativo)
    {
        var clientes = await _service.ListarAsync(ativo);
        return Ok(clientes);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var cliente = await _service.ObterPorIdAsync(id);
        if (cliente == null) return NotFound();
        return Ok(cliente);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] AtualizarClienteDto dto)
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

    [HttpPost("{id:guid}/inativar")]
    public async Task<IActionResult> Inativar(Guid id)
    {
        var inativado = await _service.InativarAsync(id);
        if (!inativado) return NotFound();
        return NoContent();
    }
}
