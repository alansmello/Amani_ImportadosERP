using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICompraItemRecebimentoRepository
{
    Task AdicionarAsync(CompraItemRecebimento recebimento);
    Task<List<CompraItemRecebimento>> ObterPorCompraAsync(Guid compraId);
}
