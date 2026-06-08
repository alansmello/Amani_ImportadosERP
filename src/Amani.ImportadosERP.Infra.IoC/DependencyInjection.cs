using Amani.ImportadosERP.Infra.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Amani.ImportadosERP.Application.Interfaces;
using MediatR;

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
        services.AddScoped<IClienteRepository, Amani.ImportadosERP.Infra.Data.Repositories.ClienteRepository>();
        services.AddScoped<IFornecedorRepository, Amani.ImportadosERP.Infra.Data.Repositories.FornecedorRepository>();
        services.AddScoped<ICategoriaRepository, Amani.ImportadosERP.Infra.Data.Repositories.CategoriaRepository>();
        services.AddScoped<ICompraRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraRepository>();
        services.AddScoped<ICompraItemRecebimentoRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraItemRecebimentoRepository>();
        services.AddScoped<ICompraItemPerdaRepository, Amani.ImportadosERP.Infra.Data.Repositories.CompraItemPerdaRepository>();
        services.AddScoped<IVendaRepository, Amani.ImportadosERP.Infra.Data.Repositories.VendaRepository>();
        services.AddScoped<IDespesaRepository, Amani.ImportadosERP.Infra.Data.Repositories.DespesaRepository>();
        services.AddScoped<IEstoqueMovimentacaoRepository, Amani.ImportadosERP.Infra.Data.Repositories.EstoqueMovimentacaoRepository>();
        services.AddScoped<IEstoqueConsultaRepository, Amani.ImportadosERP.Infra.Data.Repositories.EstoqueConsultaRepository>();
        services.AddScoped<ICustoProdutoRepository, Amani.ImportadosERP.Infra.Data.Repositories.CustoProdutoRepository>();
        services.AddScoped<IContaReceberRepository, Amani.ImportadosERP.Infra.Data.Repositories.ContaReceberRepository>();
        services.AddScoped<IEventoFinanceiroRepository, Amani.ImportadosERP.Infra.Data.Repositories.EventoFinanceiroRepository>();
        services.AddScoped<IDashboardFinanceiroRepository, Amani.ImportadosERP.Infra.Data.Repositories.DashboardFinanceiroRepository>();
        services.AddScoped<IUnitOfWork, Amani.ImportadosERP.Infra.Data.Repositories.UnitOfWork>();

        // Services
        services.AddScoped<Amani.ImportadosERP.Application.Services.ClienteService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.FornecedorService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.CategoriaService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.ProdutoService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.ImplantacaoService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.CompraService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.VendaService>();
        services.AddScoped<Amani.ImportadosERP.Application.Services.DashboardFiltroService>();

        // MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Amani.ImportadosERP.Application.Queries.ObterListaVendasQuery).Assembly));

        return services;
    }
}
