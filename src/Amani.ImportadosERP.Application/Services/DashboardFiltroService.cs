using Amani.ImportadosERP.Application.DTOs.Dashboards;

namespace Amani.ImportadosERP.Application.Services;

public sealed class DashboardFiltroService
{
    private const int AnoMinimo = 2000;
    private const int AnoMaximo = 2100;

    public DashboardFiltroAplicadoDto Normalizar(DashboardFiltroDto filtro)
    {
        filtro ??= new DashboardFiltroDto();

        if (filtro.Mes.HasValue && (filtro.Mes.Value < 1 || filtro.Mes.Value > 12))
        {
            throw new ArgumentException("Mes deve estar entre 1 e 12", nameof(filtro.Mes));
        }

        if (filtro.Ano.HasValue && (filtro.Ano.Value < AnoMinimo || filtro.Ano.Value > AnoMaximo))
        {
            throw new ArgumentException($"Ano deve estar entre {AnoMinimo} e {AnoMaximo}", nameof(filtro.Ano));
        }

        if (filtro.DataInicial.HasValue || filtro.DataFinal.HasValue)
        {
            if (!filtro.DataInicial.HasValue || !filtro.DataFinal.HasValue)
            {
                throw new ArgumentException("DataInicial e DataFinal devem ser informadas juntas");
            }

            var inicio = InicioDoDia(filtro.DataInicial.Value);
            var fim = FimDoDia(filtro.DataFinal.Value);

            if (inicio > fim)
            {
                throw new ArgumentException("DataInicial nao pode ser posterior a DataFinal");
            }

            return CriarAplicado("PeriodoCustomizado", inicio, fim, filtro.Mes, filtro.Ano, "PeriodoCustomizado");
        }

        if (filtro.Mes.HasValue)
        {
            if (!filtro.Ano.HasValue)
            {
                throw new ArgumentException("Ano deve ser informado quando Mes for informado", nameof(filtro.Ano));
            }

            var inicio = new DateTime(filtro.Ano.Value, filtro.Mes.Value, 1, 0, 0, 0, DateTimeKind.Utc);
            var fim = FimDoDia(inicio.AddMonths(1).AddDays(-1));
            return CriarAplicado("Mes", inicio, fim, filtro.Mes, filtro.Ano, "MesAno");
        }

        if (filtro.Ano.HasValue)
        {
            var inicio = new DateTime(filtro.Ano.Value, 1, 1, 0, 0, 0, DateTimeKind.Utc);
            var fim = new DateTime(filtro.Ano.Value, 12, 31, 23, 59, 59, DateTimeKind.Utc);
            return CriarAplicado("Ano", inicio, fim, null, filtro.Ano, "Ano");
        }

        var hoje = DateTime.UtcNow;
        var inicioPadrao = new DateTime(hoje.Year, hoje.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var fimPadrao = FimDoDia(inicioPadrao.AddMonths(1).AddDays(-1));
        return CriarAplicado("Padrao", inicioPadrao, fimPadrao, hoje.Month, hoje.Year, "MesCorrente");
    }

    private static DashboardFiltroAplicadoDto CriarAplicado(
        string tipo,
        DateTime inicio,
        DateTime fim,
        int? mes,
        int? ano,
        string precedencia)
    {
        return new DashboardFiltroAplicadoDto
        {
            TipoFiltro = tipo,
            DataInicial = inicio,
            DataFinal = fim,
            DataReferencia = fim,
            Mes = mes,
            Ano = ano,
            PrecedenciaAplicada = precedencia
        };
    }

    private static DateTime InicioDoDia(DateTime data)
    {
        return new DateTime(data.Year, data.Month, data.Day, 0, 0, 0, DateTimeKind.Utc);
    }

    private static DateTime FimDoDia(DateTime data)
    {
        return new DateTime(data.Year, data.Month, data.Day, 23, 59, 59, DateTimeKind.Utc);
    }
}
