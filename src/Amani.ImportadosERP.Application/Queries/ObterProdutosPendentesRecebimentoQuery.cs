using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterProdutosPendentesRecebimentoQuery : IRequest<List<ProdutoPendenteRecebimentoDto>>
{
}
