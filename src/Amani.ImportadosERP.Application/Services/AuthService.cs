using System;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs.Auth;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.Services;

public sealed class AuthService
{
    private const string MensagemCredenciaisInvalidas = "Credenciais nao aceitas.";
    private readonly IUsuarioRepository _usuarios;
    private readonly IEventoAutenticacaoRepository _eventos;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IUsuarioRepository usuarios,
        IEventoAutenticacaoRepository eventos,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IUnitOfWork unitOfWork)
    {
        _usuarios = usuarios;
        _eventos = eventos;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _unitOfWork = unitOfWork;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
    {
        if (request == null) throw new ArgumentNullException(nameof(request));
        if (string.IsNullOrWhiteSpace(request.Login)) throw new ArgumentException("Login e obrigatorio.", nameof(request.Login));
        if (string.IsNullOrWhiteSpace(request.Senha)) throw new ArgumentException("Senha e obrigatoria.", nameof(request.Senha));

        var loginNormalizado = Usuario.NormalizarLogin(request.Login);
        var usuario = await _usuarios.ObterPorLoginNormalizadoAsync(loginNormalizado);

        if (usuario == null)
        {
            await RegistrarFalhaAsync(null, loginNormalizado, ResultadoAutenticacao.CredenciaisInvalidas);
            throw new UnauthorizedAccessException(MensagemCredenciaisInvalidas);
        }

        if (!usuario.Ativo)
        {
            await RegistrarFalhaAsync(usuario.Id, loginNormalizado, ResultadoAutenticacao.UsuarioInativo);
            throw new UnauthorizedAccessException(MensagemCredenciaisInvalidas);
        }

        if (!_passwordHasher.Verificar(usuario.SenhaHash, request.Senha))
        {
            await RegistrarFalhaAsync(usuario.Id, loginNormalizado, ResultadoAutenticacao.CredenciaisInvalidas);
            throw new UnauthorizedAccessException(MensagemCredenciaisInvalidas);
        }

        var token = _jwtTokenService.GerarToken(usuario);

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            usuario.RegistrarLoginBemSucedido(DateTime.UtcNow);
            await _eventos.AdicionarAsync(new EventoAutenticacao(
                usuario.Id,
                loginNormalizado,
                ResultadoAutenticacao.Sucesso,
                "Login realizado com sucesso."));
        });

        return new LoginResponseDto
        {
            AccessToken = token.AccessToken,
            TokenType = token.TokenType,
            ExpiresAt = token.ExpiresAt,
            IdleExpiresAt = token.IdleExpiresAt,
            Usuario = new UsuarioAutenticadoDto
            {
                Id = usuario.Id,
                Login = usuario.Login,
                NomeExibicao = usuario.NomeExibicao
            }
        };
    }

    public async Task RegistrarLogoutAsync(Guid usuarioId, string login)
    {
        if (usuarioId == Guid.Empty) return;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _eventos.AdicionarAsync(new EventoAutenticacao(
                usuarioId,
                Usuario.NormalizarLogin(login),
                ResultadoAutenticacao.Logout,
                "Logout registrado."));
        });
    }

    private async Task RegistrarFalhaAsync(
        Guid? usuarioId,
        string loginNormalizado,
        ResultadoAutenticacao resultado)
    {
        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _eventos.AdicionarAsync(new EventoAutenticacao(
                usuarioId,
                loginNormalizado,
                resultado,
                "Tentativa de autenticacao negada."));
        });
    }
}
