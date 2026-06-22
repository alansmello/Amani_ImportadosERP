using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Application.Interfaces;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries.Handlers;

public sealed class ObterConfiguracoesFormasPagamentoQueryHandler
    : IRequestHandler<ObterConfiguracoesFormasPagamentoQuery, List<ConfiguracaoFormaPagamentoDto>>
{
    private readonly IConfiguracaoFormaPagamentoRepository _repository;

    public ObterConfiguracoesFormasPagamentoQueryHandler(IConfiguracaoFormaPagamentoRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<ConfiguracaoFormaPagamentoDto>> Handle(
        ObterConfiguracoesFormasPagamentoQuery request,
        CancellationToken cancellationToken)
    {
        var configuracoes = await _repository.ObterTodasAsync();

        return configuracoes
            .Select(x => new ConfiguracaoFormaPagamentoDto
            {
                FormaPagamento = x.FormaPagamento,
                PercentualTaxa = x.PercentualTaxa,
                AtualizadoEm = x.AtualizadoEm
            })
            .ToList();
    }
}
