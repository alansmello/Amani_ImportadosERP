using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class CancelarVendaCommandHandler : IRequestHandler<CancelarVendaCommand, Unit>
{
    private readonly IVendaRepository _vendaRepository;
    private readonly IEstoqueMovimentacaoRepository _estoqueRepository;
    private readonly IContaReceberRepository _contaReceberRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CancelarVendaCommandHandler(
        IVendaRepository vendaRepository,
        IEstoqueMovimentacaoRepository estoqueRepository,
        IContaReceberRepository contaReceberRepository,
        IUnitOfWork unitOfWork)
    {
        _vendaRepository = vendaRepository;
        _estoqueRepository = estoqueRepository;
        _contaReceberRepository = contaReceberRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(CancelarVendaCommand request, CancellationToken cancellationToken)
    {
        var venda = await _vendaRepository.ObterPorIdParaAtualizarAsync(request.VendaId);

        if (venda == null)
            throw new Exception("Venda não encontrada");

        if (venda.Cancelada)
            throw new Exception("Venda já cancelada");

        // 1) Validar contas a receber associadas (não pode ter pagamentos)
        var contas = await _contaReceberRepository.ObterPorVendaIdAsync(venda.Id);

        foreach (var conta in contas)
        {
            if (conta.Pagamentos.Any())
                throw new Exception("Não é possível cancelar venda com pagamentos realizados");
        }

        // 2) Reverter estoque (entrada para cada item vendido)
        var movimentacoes = new List<EstoqueMovimentacao>();
        foreach (var item in venda.Items)
        {
            var exata = item.ObterQuantidadeEstoqueExata();
            movimentacoes.Add(new EstoqueMovimentacao(
                item.ProdutoId,
                exata.ParaDecimal(),
                TipoMovimentacao.Entrada,
                null,
                null,
                null,
                null,
                null,
                exata.NumeradorInt64(),
                exata.DenominadorInt64(),
                item.Id
            ));
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            if (movimentacoes.Count > 0)
                await _estoqueRepository.AdicionarRangeAsync(movimentacoes);

            foreach (var conta in contas)
                await _contaReceberRepository.RemoverAsync(conta);

            venda.Cancelar();
        });

        return Unit.Value;
    }
}
