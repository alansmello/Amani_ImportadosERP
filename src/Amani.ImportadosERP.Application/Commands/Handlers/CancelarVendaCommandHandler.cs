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

    public CancelarVendaCommandHandler(
        IVendaRepository vendaRepository,
        IEstoqueMovimentacaoRepository estoqueRepository,
        IContaReceberRepository contaReceberRepository)
    {
        _vendaRepository = vendaRepository;
        _estoqueRepository = estoqueRepository;
        _contaReceberRepository = contaReceberRepository;
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
            movimentacoes.Add(new EstoqueMovimentacao(
                item.ProdutoId,
                item.Quantidade,
                TipoMovimentacao.Entrada,
                null,
                null,
                item.PrecoUnitario
            ));
        }

        if (movimentacoes.Count > 0)
            await _estoqueRepository.AdicionarRangeAsync(movimentacoes);

        // 3) Remover contas a receber sem pagamentos
        foreach (var conta in contas)
        {
            await _contaReceberRepository.RemoverAsync(conta);
        }

        // 4) Marcar venda como cancelada
        venda.Cancelar();

        await _contaReceberRepository.SalvarAsync();
        await _vendaRepository.SalvarAsync();

        return Unit.Value;
    }
}
