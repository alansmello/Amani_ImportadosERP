using System;

namespace Amani.ImportadosERP.Application.DTOs.Dashboards;

public sealed class AvisoDadoIncompletoDto
{
    public string Codigo { get; set; } = string.Empty;
    public string Mensagem { get; set; } = string.Empty;
    public string? EntidadeTipo { get; set; }
    public Guid? EntidadeId { get; set; }
    public string Impacto { get; set; } = string.Empty;
}
