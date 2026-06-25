using Amani.ImportadosERP.Application.DTOs.Auth;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands.Auth;

public sealed class LoginCommand : IRequest<LoginResponseDto>
{
    public string Login { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}
