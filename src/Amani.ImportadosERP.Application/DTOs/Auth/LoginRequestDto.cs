using System.ComponentModel.DataAnnotations;

namespace Amani.ImportadosERP.Application.DTOs.Auth;

public sealed class LoginRequestDto
{
    [Required]
    public string Login { get; set; } = string.Empty;

    [Required]
    public string Senha { get; set; } = string.Empty;
}
