using System;

namespace Amani.ImportadosERP.Application.DTOs.Auth;

public sealed class UsuarioAutenticadoDto
{
    public Guid Id { get; set; }
    public string Login { get; set; } = string.Empty;
    public string NomeExibicao { get; set; } = string.Empty;
}
