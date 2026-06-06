using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/implantacao")]
public class ImplantacaoController : ControllerBase
{
    private readonly ImplantacaoService _service;

    public ImplantacaoController(ImplantacaoService service)
    {
        _service = service;
    }

    [HttpPost("inventario-inicial")]
    public async Task<IActionResult> RegistrarInventarioInicial([FromBody] RegistrarInventarioInicialDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var resultado = await _service.RegistrarInventarioInicialAsync(dto);
            return Ok(resultado);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}
