using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IEventoFinanceiroRepository
{
    Task AdicionarAsync(EventoFinanceiro eventoFinanceiro);
}
