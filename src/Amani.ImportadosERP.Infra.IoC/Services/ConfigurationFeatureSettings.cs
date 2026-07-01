using Amani.ImportadosERP.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Amani.ImportadosERP.Infra.IoC.Services;

public sealed class ConfigurationFeatureSettings : IFeatureSettings
{
    private readonly IConfiguration _configuration;

    public ConfigurationFeatureSettings(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public bool ApresentacoesFracionadasEnabled =>
        bool.TryParse(_configuration["Features:ApresentacoesFracionadasEnabled"], out var enabled) && enabled;
}
