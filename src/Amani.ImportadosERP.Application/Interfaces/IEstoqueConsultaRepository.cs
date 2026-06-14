using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IEstoqueConsultaRepository
{
    Task<int> ObterSaldoAsync(Guid produtoId);
    Task<IReadOnlyCollection<EstoqueProdutoSaldoDto>> ObterSaldosAsync(Guid? categoriaId, bool apenasComSaldo);
    Task<IReadOnlyCollection<EstoqueMovimentacaoItemDto>> ObterMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo, int limite);
    Task<int> ContarMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo);
}
