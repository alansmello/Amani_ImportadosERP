using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Amani.ImportadosERP.Infra.IoC.Services;

public class JwtTokenService : IJwtTokenService
{
    private const string TokenType = "Bearer";
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public JwtTokenResult GerarToken(Usuario usuario)
    {
        if (usuario == null) throw new ArgumentNullException(nameof(usuario));

        var now = DateTime.UtcNow;
        var expiresAt = now.AddHours(GetInt("Jwt:AccessTokenExpirationHours", 8));
        var idleExpiresAt = now.AddMinutes(GetInt("Jwt:IdleExpirationMinutes", 60));
        var signingKey = _configuration["Jwt:SigningKey"];

        if (string.IsNullOrWhiteSpace(signingKey))
            throw new InvalidOperationException("Jwt:SigningKey nao configurado.");

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, usuario.Login),
            new(ClaimTypes.NameIdentifier, usuario.Id.ToString()),
            new(ClaimTypes.Name, usuario.Login),
            new("nome_exibicao", usuario.NomeExibicao),
            new("idle_expires_at", idleExpiresAt.ToString("O"))
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(signingKey)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            notBefore: now,
            expires: expiresAt,
            signingCredentials: credentials);

        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);
        return new JwtTokenResult(accessToken, TokenType, expiresAt, idleExpiresAt);
    }

    private int GetInt(string key, int fallback)
    {
        return int.TryParse(_configuration[key], out var value) && value > 0
            ? value
            : fallback;
    }
}
