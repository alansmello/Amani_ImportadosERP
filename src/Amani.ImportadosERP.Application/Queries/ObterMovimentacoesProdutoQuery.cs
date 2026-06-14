using System;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterMovimentacoesProdutoQuery : IRequest<EstoqueProdutoMovimentacoesDto>
{
    public Guid ProdutoId { get; set; }
    public DateTime? DataInicio { get; set; }
    public DateTime? DataFim { get; set; }
    public string? Tipo { get; set; }
    public int? Limite { get; set; }
}
