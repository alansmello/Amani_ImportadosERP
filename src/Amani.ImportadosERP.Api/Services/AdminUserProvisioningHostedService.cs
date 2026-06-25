using System;
using System.Threading;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace Amani.ImportadosERP.Api.Services;

public sealed class AdminUserProvisioningHostedService : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AdminUserProvisioningHostedService> _logger;

    public AdminUserProvisioningHostedService(
        IServiceScopeFactory scopeFactory,
        IConfiguration configuration,
        ILogger<AdminUserProvisioningHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var login = _configuration["Auth:Provisioning:AdminLogin"];
        var senha = _configuration["Auth:Provisioning:AdminPassword"];
        var nome = _configuration["Auth:Provisioning:AdminName"];

        if (string.IsNullOrWhiteSpace(login) || string.IsNullOrWhiteSpace(senha))
        {
            return;
        }

        await using var scope = _scopeFactory.CreateAsyncScope();
        var usuarios = scope.ServiceProvider.GetRequiredService<IUsuarioRepository>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var loginNormalizado = Usuario.NormalizarLogin(login);
        var existente = await usuarios.ObterPorLoginNormalizadoAsync(loginNormalizado);

        if (existente != null)
        {
            _logger.LogInformation("Usuario administrativo inicial ja existe para o login configurado.");
            return;
        }

        var usuario = new Usuario(
            login,
            string.IsNullOrWhiteSpace(nome) ? login : nome,
            passwordHasher.Hash(senha),
            "Environment");

        await usuarios.AdicionarAsync(usuario);
        _logger.LogInformation("Usuario administrativo inicial provisionado a partir de configuracao segura.");
    }

    public Task StopAsync(CancellationToken cancellationToken)
    {
        return Task.CompletedTask;
    }
}
