using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class RegistrarPagamentoCommandHandler : IRequestHandler<RegistrarPagamentoCommand, Unit>
{
    private readonly IContaReceberRepository _repository;
    private readonly IVendaRepository _vendaRepository;
    private readonly IDespesaOperadoraRepository _despesaOperadoraRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RegistrarPagamentoCommandHandler(
        IContaReceberRepository repository,
        IVendaRepository vendaRepository,
        IDespesaOperadoraRepository despesaOperadoraRepository,
        IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _vendaRepository = vendaRepository;
        _despesaOperadoraRepository = despesaOperadoraRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Unit> Handle(RegistrarPagamentoCommand request, CancellationToken cancellationToken)
    {
        if (request.Valor <= 0)
            throw new InvalidOperationException("Valor recebido deve ser maior que zero");

        if (request.Desconto < 0)
            throw new InvalidOperationException("Desconto nao pode ser negativo");

        if (request.ValorBrutoLiquidado.HasValue && request.ValorBrutoLiquidado.Value <= 0)
            throw new InvalidOperationException("Valor bruto liquidado deve ser maior que zero");

        var conta = await _repository.ObterPorIdAsync(request.ContaReceberId);
        if (conta == null)
            throw new InvalidOperationException("Conta nao encontrada");

        var totalLiquidado = conta.Pagamentos.Sum(p => p.ValorBrutoLiquidado);
        var saldoRestante = conta.Valor - totalLiquidado;
        if (saldoRestante <= 0)
            throw new InvalidOperationException("Conta ja esta integralmente liquidada");

        Venda? venda = null;
        if (conta.VendaId.HasValue)
        {
            venda = await _vendaRepository.ObterPorIdAsync(conta.VendaId.Value);
        }

        var isCartaoCredito = venda?.FormaPagamento == FormaPagamento.CartaoCredito;
        decimal valorBrutoLiquidado;
        DespesaOperadora? despesaOperadora = null;

        if (isCartaoCredito)
        {
            if (request.Desconto != 0)
                throw new InvalidOperationException("Desconto nao e permitido no recebimento de cartao de credito");

            if (!request.ValorBrutoLiquidado.HasValue
                || request.ValorBrutoLiquidado.Value != saldoRestante)
            {
                throw new InvalidOperationException("Cartao de credito exige liquidacao integral do saldo");
            }

            valorBrutoLiquidado = saldoRestante;
            if (request.Valor > valorBrutoLiquidado)
                throw new InvalidOperationException("Valor liquido recebido nao pode exceder o saldo bruto");

            var valorTaxa = valorBrutoLiquidado - request.Valor;
            if (valorTaxa > 0)
            {
                var percentualTaxa = decimal.Round(
                    valorTaxa / valorBrutoLiquidado * 100,
                    4,
                    MidpointRounding.AwayFromZero);

                despesaOperadora = new DespesaOperadora(
                    venda!.Id,
                    FormaPagamento.CartaoCredito,
                    valorBrutoLiquidado,
                    request.Valor,
                    percentualTaxa);
            }
        }
        else
        {
            var valorSimples = request.Valor + request.Desconto;
            if (request.ValorBrutoLiquidado.HasValue
                && request.ValorBrutoLiquidado.Value != valorSimples)
            {
                throw new InvalidOperationException(
                    "Valor bruto liquidado deve corresponder ao pagamento mais o desconto");
            }

            valorBrutoLiquidado = valorSimples;
        }

        if (valorBrutoLiquidado > saldoRestante)
            throw new InvalidOperationException("Pagamento e desconto excedem o saldo restante");

        var pagamento = new PagamentoRecebido(
            conta.Id,
            request.Valor,
            request.Desconto,
            valorBrutoLiquidado);

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _repository.AdicionarPagamentoAsync(pagamento);

            if (despesaOperadora != null)
            {
                await _despesaOperadoraRepository.AdicionarAsync(despesaOperadora);
            }
        });

        return Unit.Value;
    }
}
