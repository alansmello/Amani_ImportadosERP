using System;
using Amani.ImportadosERP.Domain.Common;
using Amani.ImportadosERP.Domain.Enums;

namespace Amani.ImportadosERP.Domain.Entities;

public sealed class EventoAutenticacao : BaseEntity
{
    public Guid? UsuarioId { get; private set; }
    public Usuario? Usuario { get; private set; }
    public string LoginInformado { get; private set; } = string.Empty;
    public ResultadoAutenticacao Resultado { get; private set; }
    public string MensagemSegura { get; private set; } = string.Empty;

    public EventoAutenticacao(
        Guid? usuarioId,
        string loginInformado,
        ResultadoAutenticacao resultado,
        string mensagemSegura)
    {
        if (string.IsNullOrWhiteSpace(loginInformado)) throw new ArgumentException("Login informado e obrigatorio", nameof(loginInformado));
        if (string.IsNullOrWhiteSpace(mensagemSegura)) throw new ArgumentException("Mensagem segura e obrigatoria", nameof(mensagemSegura));

        UsuarioId = usuarioId;
        LoginInformado = loginInformado.Trim();
        Resultado = resultado;
        MensagemSegura = mensagemSegura.Trim();
    }

    protected EventoAutenticacao() { }
}
