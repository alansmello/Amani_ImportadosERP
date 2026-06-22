using System.Collections.Generic;
using Amani.ImportadosERP.Application.DTOs;
using MediatR;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterConfiguracoesFormasPagamentoQuery : IRequest<List<ConfiguracaoFormaPagamentoDto>>
{
}
