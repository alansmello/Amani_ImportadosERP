using System;
using System.Threading;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.Commands;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using MediatR;

namespace Amani.ImportadosERP.Application.Commands.Handlers;

public sealed class AtualizarConfiguracaoFormaPagamentoCommandHandler
    : IRequestHandler<AtualizarConfiguracaoFormaPagamentoCommand, ConfiguracaoFormaPagamentoDto>
{
    private readonly IConfiguracaoFormaPagamentoRepository _repository;

    public AtualizarConfiguracaoFormaPagamentoCommandHandler(IConfiguracaoFormaPagamentoRepository repository)
    {
        _repository = repository;
    }

    public async Task<ConfiguracaoFormaPagamentoDto> Handle(
        AtualizarConfiguracaoFormaPagamentoCommand request,
        CancellationToken cancellationToken)
    {
        if (request.FormaPagamento != Domain.Enums.FormaPagamento.CartaoDebito)
        {
            throw new InvalidOperationException("Somente cartao de debito possui taxa configuravel");
        }

        if (request.PercentualTaxa < 0 || request.PercentualTaxa >= 100)
        {
            throw new InvalidOperationException("Percentual de taxa invalido para cartao de debito");
        }

        var configuracao = await _repository.ObterPorFormaAsync(request.FormaPagamento);
        if (configuracao == null)
        {
            throw new InvalidOperationException("Forma de pagamento invalida");
        }

        configuracao.AtualizarTaxa(request.PercentualTaxa);
        await _repository.AtualizarAsync(configuracao);
        await _repository.SalvarAsync();

        return new ConfiguracaoFormaPagamentoDto
        {
            FormaPagamento = configuracao.FormaPagamento,
            PercentualTaxa = configuracao.PercentualTaxa,
            AtualizadoEm = configuracao.AtualizadoEm
        };
    }
}
