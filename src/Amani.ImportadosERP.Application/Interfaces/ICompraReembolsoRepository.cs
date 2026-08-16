using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICompraReembolsoRepository
{
    Task AdicionarAsync(CompraReembolso reembolso);
    Task AdicionarSemSalvarAsync(CompraReembolso reembolso);
    Task AdicionarCancelamentoAsync(CompraReembolsoCancelamento cancelamento);
    Task AdicionarCancelamentoSemSalvarAsync(CompraReembolsoCancelamento cancelamento);
    Task<CompraReembolso?> ObterPorIdAsync(Guid id);
    Task<CompraReembolso?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<CompraReembolso?> ObterPorOperacaoIdAsync(Guid operacaoId);
    Task<CompraReembolsoCancelamento?> ObterCancelamentoPorOperacaoIdAsync(Guid operacaoId);
    Task<IReadOnlyCollection<CompraReembolso>> ObterPorCompraAsync(Guid compraId, DateTime? referencia = null);
    Task<decimal> ObterTotalLiquidoPorCompraAsync(Guid compraId, DateTime? referencia = null);
    Task<bool> ExisteReferenciaExternaAsync(Guid compraId, string referenciaExterna);
}
