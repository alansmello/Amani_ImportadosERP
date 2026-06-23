using Amani.ImportadosERP.Domain.Entities;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IConfiguracaoFormaPagamentoRepository
{
    Task<IReadOnlyList<ConfiguracaoFormaPagamento>> ObterTodasAsync();
    Task<ConfiguracaoFormaPagamento?> ObterPorFormaAsync(FormaPagamento formaPagamento);
    Task AtualizarAsync(ConfiguracaoFormaPagamento configuracao);
    Task SalvarAsync();
}
