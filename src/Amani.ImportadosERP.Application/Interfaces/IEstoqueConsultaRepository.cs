using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Application.DTOs;
using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IEstoqueConsultaRepository
{
    Task<decimal> ObterSaldoAsync(Guid produtoId);
    Task<QuantidadeRacional> ObterSaldoExatoAsync(Guid produtoId);
    Task<IReadOnlyDictionary<Guid, QuantidadeRacional>> ObterSaldosExatosAsync(IReadOnlyCollection<Guid> produtoIds, DateTime? dataReferencia = null);
    Task<IReadOnlyCollection<EstoqueProdutoSaldoDto>> ObterSaldosAsync(Guid? categoriaId, bool apenasComSaldo);
    Task<IReadOnlyCollection<EstoqueMovimentacaoItemDto>> ObterMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo, int limite);
    Task<int> ContarMovimentacoesAsync(Guid produtoId, DateTime? dataInicio, DateTime? dataFim, TipoMovimentacao? tipo);
}
