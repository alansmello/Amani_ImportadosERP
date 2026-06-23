using System;
using MediatR;
using Amani.ImportadosERP.Application.DTOs;

namespace Amani.ImportadosERP.Application.Queries;

public sealed class ObterCategoriaDespesaPorIdQuery : IRequest<CategoriaDespesaDto?>
{
    public Guid Id { get; set; }
}
