using Amani.ImportadosERP.Application.Interfaces;
using Amani.ImportadosERP.Domain.Common;

namespace Amani.ImportadosERP.Application.Services;

public sealed class EstoqueQuantidadeService
{
    private readonly IEstoqueConsultaRepository _repository;

    public EstoqueQuantidadeService(IEstoqueConsultaRepository repository) => _repository = repository;

    public Task<QuantidadeRacional> ObterSaldoExatoAsync(Guid produtoId) => _repository.ObterSaldoExatoAsync(produtoId);

    public static decimal Projetar(QuantidadeRacional quantidade) => quantidade.ParaDecimal();
}
