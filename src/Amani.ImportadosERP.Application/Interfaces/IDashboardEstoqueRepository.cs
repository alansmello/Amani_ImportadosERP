using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Interfaces;

public interface IDashboardEstoqueRepository
{
    Task<DashboardEstoqueValorizadoDto> ObterEstoqueValorizadoAsync(DateTime dataReferencia);
}
