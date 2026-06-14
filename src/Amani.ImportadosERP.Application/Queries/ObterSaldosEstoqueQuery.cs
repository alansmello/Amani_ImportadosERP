using System;
using System.Collections.Generic;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterSaldosEstoqueQuery : IRequest<IReadOnlyCollection<EstoqueProdutoSaldoDto>>
{
    public Guid? CategoriaId { get; set; }
    public bool ApenasComSaldo { get; set; }
}
