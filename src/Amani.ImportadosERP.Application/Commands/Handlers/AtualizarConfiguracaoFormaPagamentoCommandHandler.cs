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
        if (request.PercentualTaxa < 0)
        {
            throw new InvalidOperationException("Percentual de taxa invalido");
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
