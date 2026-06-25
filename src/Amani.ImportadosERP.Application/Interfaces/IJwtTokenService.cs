using System;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public sealed record JwtTokenResult(
    string AccessToken,
    string TokenType,
    DateTime ExpiresAt,
    DateTime IdleExpiresAt);

public interface IJwtTokenService
{
    JwtTokenResult GerarToken(Usuario usuario);
}
