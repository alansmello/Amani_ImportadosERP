using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterDashboardFinanceiroQueryHandler : IRequestHandler<ObterDashboardFinanceiroQuery, DashboardFinanceiroDto>
{
    private readonly IContaReceberRepository _contaRepository;
    private readonly ICompraRepository _compraRepository;
    private readonly IDespesaRepository _despesaRepository;

    public ObterDashboardFinanceiroQueryHandler(
        IContaReceberRepository contaRepository,
        ICompraRepository compraRepository,
        IDespesaRepository despesaRepository)
    {
        _contaRepository = contaRepository;
        _compraRepository = compraRepository;
        _despesaRepository = despesaRepository;
    }

    public async Task<DashboardFinanceiroDto> Handle(ObterDashboardFinanceiroQuery request, CancellationToken cancellationToken)
    {
        var contas = await _contaRepository.ObterTodasAsync();
        var compras = await _compraRepository.ObterTodasAsync();
        var despesas = await _despesaRepository.ObterComFiltrosAsync(null, null, null);

        var totalRecebido = contas
            .SelectMany(c => c.Pagamentos)
            .Sum(p => p.Valor);

        var totalAReceber = contas
            .Select(c => c.Valor - c.Pagamentos.Sum(p => p.Valor))
            .Sum();

        var totalCompras = compras.Sum(c => c.Total());
        var totalDespesas = despesas.Sum(d => d.Valor);

        var caixaAtual = totalRecebido - totalCompras - totalDespesas;
        var lucroReal = totalRecebido - totalCompras - totalDespesas;

        return new DashboardFinanceiroDto
        {
            TotalRecebido = totalRecebido,
            TotalAReceber = totalAReceber,
            TotalCompras = totalCompras,
            TotalDespesas = totalDespesas,
            CaixaAtual = caixaAtual,
            LucroReal = lucroReal
        };
    }
}
