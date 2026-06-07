using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IEstoqueMovimentacaoRepository
{
    Task AdicionarAsync(EstoqueMovimentacao movimentacao);
    Task AdicionarSemSalvarAsync(EstoqueMovimentacao movimentacao);
    Task AdicionarRangeAsync(System.Collections.Generic.IEnumerable<EstoqueMovimentacao> movimentacoes);
}
