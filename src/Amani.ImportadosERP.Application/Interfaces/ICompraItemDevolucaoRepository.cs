using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICompraItemDevolucaoRepository
{
    Task AdicionarAsync(CompraItemDevolucao devolucao);
    Task AdicionarSemSalvarAsync(CompraItemDevolucao devolucao);
    Task AdicionarCompensacaoAsync(CompraItemDevolucaoCompensacao compensacao);
    Task AdicionarCompensacaoSemSalvarAsync(CompraItemDevolucaoCompensacao compensacao);
    Task<CompraItemDevolucao?> ObterPorIdAsync(Guid id);
    Task<CompraItemDevolucao?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<CompraItemDevolucao?> ObterPorOperacaoIdAsync(Guid operacaoId);
    Task<CompraItemDevolucaoCompensacao?> ObterCompensacaoPorOperacaoIdAsync(Guid operacaoId);
    Task<IReadOnlyCollection<CompraItemDevolucao>> ObterPorCompraAsync(Guid compraId, DateTime? referencia = null);
    Task<IReadOnlyCollection<CompraItemDevolucao>> ObterPorItemAsync(Guid compraItemId, DateTime? referencia = null);
    Task<int> ObterQuantidadeVigenteAntesRecebimentoAsync(Guid compraItemId, DateTime? referencia = null);
    Task<int> ObterQuantidadeVigenteDepoisRecebimentoAsync(Guid compraItemRecebimentoId, DateTime? referencia = null);
}
