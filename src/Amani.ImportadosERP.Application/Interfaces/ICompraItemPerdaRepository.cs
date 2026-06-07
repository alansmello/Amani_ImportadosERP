using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface ICompraItemPerdaRepository
{
    Task AdicionarAsync(CompraItemPerda perda);
    Task<List<CompraItemPerda>> ObterPorCompraAsync(Guid compraId);
}
