using System.Threading;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Commands.Auth;
using Amani.ImportadosERP.Application.DTOs.Auth;
using Amani.ImportadosERP.Application.Services;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, LoginResponseDto>
{
    private readonly AuthService _authService;

    public LoginCommandHandler(AuthService authService)
    {
        _authService = authService;
    }

    public async Task<LoginResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return await _authService.LoginAsync(new LoginRequestDto
        {
            Login = request.Login,
            Senha = request.Senha
        });
    }
}
