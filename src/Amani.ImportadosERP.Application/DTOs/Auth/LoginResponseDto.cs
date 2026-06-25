using System;

namespace Amani.ImportadosERP.Application.DTOs.Auth;

public sealed class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public DateTime ExpiresAt { get; set; }
    public DateTime IdleExpiresAt { get; set; }
    public UsuarioAutenticadoDto Usuario { get; set; } = new();
}
