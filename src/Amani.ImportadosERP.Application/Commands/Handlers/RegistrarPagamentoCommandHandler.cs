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
            throw new Exception("Valor invalido");

        if (request.Desconto < 0)
            throw new Exception("Desconto invalido");

        if (request.ValorBrutoLiquidado.HasValue && request.ValorBrutoLiquidado.Value <= 0)
            throw new Exception("Valor bruto liquidado invalido");

        if (request.PercentualTaxaOperadora.HasValue && request.PercentualTaxaOperadora.Value < 0)
            throw new Exception("Percentual de taxa invalido");

        var conta = await _repository.ObterPorIdAsync(request.ContaReceberId);
        if (conta == null)
            throw new Exception("Conta nao encontrada");

        var totalLiquidado = conta.Pagamentos.Sum(p => p.ValorBrutoLiquidado);
        var saldoRestante = conta.Valor - totalLiquidado;
        var valorBrutoLiquidado = request.ValorBrutoLiquidado ?? request.Valor + request.Desconto;
        var taxaOperadora = valorBrutoLiquidado - request.Valor - request.Desconto;

        if (valorBrutoLiquidado > saldoRestante)
            throw new Exception("Pagamento, desconto e taxa excedem o saldo");

        if (taxaOperadora < 0)
            throw new Exception("Valor bruto liquidado nao pode ser menor que valor mais desconto");

        DespesaOperadora? despesaOperadora = null;
        if (taxaOperadora > 0)
        {
            if (!conta.VendaId.HasValue)
                throw new Exception("Taxa de operadora exige conta vinculada a venda");

            var venda = await _vendaRepository.ObterPorIdAsync(conta.VendaId.Value);
            if (venda == null || venda.FormaPagamento != FormaPagamento.CartaoCredito)
                throw new Exception("Taxa de operadora no recebimento permitida apenas para cartao de credito");

            var percentualTaxa = request.PercentualTaxaOperadora
                ?? venda.PercentualTaxaAplicado
                ?? (valorBrutoLiquidado > 0
                    ? decimal.Round(taxaOperadora / valorBrutoLiquidado * 100, 4, MidpointRounding.AwayFromZero)
                    : 0m);

            if (percentualTaxa < 0)
                throw new Exception("Percentual de taxa invalido");

            despesaOperadora = new DespesaOperadora(
                venda.Id,
                FormaPagamento.CartaoCredito,
                valorBrutoLiquidado,
                request.Valor,
                percentualTaxa);
        }

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
