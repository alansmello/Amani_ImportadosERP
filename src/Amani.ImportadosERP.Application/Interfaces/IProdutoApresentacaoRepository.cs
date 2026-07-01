using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IProdutoApresentacaoRepository
{
    Task AdicionarAsync(ProdutoApresentacao apresentacao);
    Task<ProdutoApresentacao?> ObterPorIdAsync(Guid id);
    Task<ProdutoApresentacao?> ObterPorIdParaAtualizarAsync(Guid id);
    Task<IReadOnlyCollection<ProdutoApresentacao>> ListarPorProdutoAsync(Guid produtoId, bool apenasAtivas = false);
    Task<bool> NomeExisteAsync(Guid produtoId, string nome, Guid? ignorarId = null);
    Task SalvarAsync();
}
