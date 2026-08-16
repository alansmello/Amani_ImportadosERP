using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Amani.ImportadosERP.Application.Interfaces;
using MediatR;
using Amani.ImportadosERP.Infra.IoC.Services;

namespace Amani.ImportadosERP.Infra.IoC;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("DefaultConnection");
        services.AddDbContext<AmaniDbContext>(options =>
            options.UseNpgsql(connection));

        // Repositories
        services.AddScoped<IProdutoRepository, Amani.ImportadosERP.Infra.Data.Repositories.ProdutoRepository>();
        services.AddScoped<IProdutoApresentacaoRepository, Amani.ImportadosERP.Infra.Data.Repositories.ProdutoApresentacaoRepository>();
        services.AddScoped<IClienteRepository, Amani.ImportadosERP.Infra.Data.Repositories.ClienteRepository>();
        services.AddScoped<IFornecedorRepository, Amani.ImportadosERP.Infra.Data.Repositories.FornecedorRepository>();
        services.AddScoped<ICategoriaRepository, Amani.ImportadosERP.Infra.Data.Repositories.CategoriaRepository>();
        services.AddScoped<ICompraRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraRepository>();
        services.AddScoped<ICompraItemRecebimentoRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraItemRecebimentoRepository>();
        services.AddScoped<ICompraItemPerdaRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraItemPerdaRepository>();
        services.AddScoped<ICompraItemDevolucaoRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraItemDevolucaoRepository>();
        services.AddScoped<ICompraReembolsoRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraReembolsoRepository>();
        services.AddScoped<IVendaRepository, Amani.ImportadosERP.Infra.Data.Repositories.VendaRepository>();
        services.AddScoped<IDespesaRepository, Amani.ImportadosERP.Infra.Data.Repositories.DespesaRepository>();
        services.AddScoped<ICategoriaDespesaRepository, Amani.ImportadosERP.Infra.Data.Repositories.CategoriaDespesaRepository>();
        services.AddScoped<IEstoqueMovimentacaoRepository, Amani.ImportadosERP.Infra.Data.Repositories.EstoqueMovimentacaoRepository>();
        services.AddScoped<IEstoqueConsultaRepository, Amani.ImportadosERP.Infra.Data.Repositories.EstoqueConsultaRepository>();
        services.AddScoped<ICustoProdutoRepository, Amani.ImportadosERP.Infra.Data.Repositories.CustoProdutoRepository>();
        services.AddScoped<IContaReceberRepository, Amani.ImportadosERP.Infra.Data.Repositories.ContaReceberRepository>();
        services.AddScoped<IEventoFinanceiroRepository, Amani.ImportadosERP.Infra.Data.Repositories.EventoFinanceiroRepository>();
        services.AddScoped<IConfiguracaoFormaPagamentoRepository, Amani.ImportadosERP.Infra.Data.Repositories.ConfiguracaoFormaPagamentoRepository>();
        services.AddScoped<IDespesaOperadoraRepository, Amani.ImportadosERP.Infra.Data.Repositories.DespesaOperadoraRepository>();
        services.AddScoped<Amani.ImportadosERP.Infra.Data.Repositories.DashboardCustoMedioReadService>();
        services.AddScoped<IDashboardFinanceiroRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardFinanceiroRepository>();
        services.AddScoped<IDashboardEstoqueRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardEstoqueRepository>();
        services.AddScoped<IDashboardOperacionalRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardOperacionalRepository>();
        services.AddScoped<IDashboardRankingRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardRankingRepository>();
        services.AddScoped<IDashboardAlertaRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardAlertaRepository>();
        services.AddScoped<IDashboardGraficoRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardGraficoRepository>();
        services.AddScoped<IUsuarioRepository, Amani.ImportadosERP.Infra.Data.Repositories.UsuarioRepository>();
        services.AddScoped<IEventoAutenticacaoRepository, Amani.ImportadosERP.Infra.Data.Repositories.EventoAutenticacaoRepository>();
        services.AddScoped<IUnitOfWork, Amani.ImportadosERP.Infra.Data.Repositories.UnitOfWork>();
        services.AddSingleton<IFeatureSettings, ConfigurationFeatureSettings>();

        // Services
        services.AddScoped<IPasswordHasher, PasswordHasher>();
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.AuthService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.ClienteService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.FornecedorService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.CategoriaService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.ProdutoService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.ProdutoApresentacaoService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.ImplantacaoService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.CompraService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.VendaService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.EstoqueQuantidadeService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.DashboardFiltroService>();

        // MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Amani.ImportadosERP.Application.Queries.ObterListaVendasQuery).Assembly));

        return services;
    }
}
