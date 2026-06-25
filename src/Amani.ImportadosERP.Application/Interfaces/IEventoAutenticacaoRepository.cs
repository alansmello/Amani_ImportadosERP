using System.Threading.Tasks;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IEventoAutenticacaoRepository
{
    Task AdicionarAsync(EventoAutenticacao evento);
    Task SalvarAsync();
}
