using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterSaldosEstoqueQueryHandler
    : IRequestHandler<ObterSaldosEstoqueQuery, IReadOnlyCollection<EstoqueProdutoSaldoDto>>
{
    private readonly IEstoqueConsultaRepository _estoqueConsultaRepository;

    public ObterSaldosEstoqueQueryHandler(IEstoqueConsultaRepository estoqueConsultaRepository)
    {
        _estoqueConsultaRepository = estoqueConsultaRepository;
    }

    public async Task<IReadOnlyCollection<EstoqueProdutoSaldoDto>> Handle(
        ObterSaldosEstoqueQuery request,
        CancellationToken cancellationToken)
    {
        var saldos = await _estoqueConsultaRepository.ObterSaldosAsync(
            request.CategoriaId,
            request.ApenasComSaldo);

        return saldos
            .Select(saldo => new EstoqueProdutoSaldoDto
            {
                ProdutoId = saldo.ProdutoId,
                NomeProduto = saldo.NomeProduto,
                CategoriaId = saldo.CategoriaId,
                Saldo = saldo.Saldo
            })
            .ToList();
    }
}
