using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Commands.Auth;
using Amani.ImportadosERP.Application.DTOs.Auth;
using Amani.ImportadosERP.Application.Services;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Amani.ImportadosERP.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private const string CredenciaisNaoAceitas = "Credenciais nao aceitas.";
    private readonly IMediator _mediator;
    private readonly AuthService _authService;

    public AuthController(IMediator mediator, AuthService authService)
    {
        _mediator = mediator;
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        try
        {
            var response = await _mediator.Send(new LoginCommand
            {
                Login = dto.Login,
                Senha = dto.Senha
            });

            return Ok(response);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = CredenciaisNaoAceitas });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var usuarioIdRaw =
            User.FindFirstValue(ClaimTypes.NameIdentifier) ??
            User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        var login =
            User.FindFirstValue(ClaimTypes.Name) ??
            User.FindFirstValue(JwtRegisteredClaimNames.UniqueName) ??
            string.Empty;

        if (Guid.TryParse(usuarioIdRaw, out var usuarioId))
        {
            await _authService.RegistrarLogoutAsync(usuarioId, login);
        }

        return NoContent();
    }
}
