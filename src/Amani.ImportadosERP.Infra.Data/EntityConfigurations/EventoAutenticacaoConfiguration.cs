using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class EventoAutenticacaoConfiguration : IEntityTypeConfiguration<EventoAutenticacao>
{
    public void Configure(EntityTypeBuilder<EventoAutenticacao> builder)
    {
        builder.ToTable("eventos_autenticacao");
        builder.HasKey(e => e.Id);

        builder.Property(e => e.LoginInformado).IsRequired().HasMaxLength(150);
        builder.Property(e => e.Resultado).IsRequired().HasConversion<string>().HasMaxLength(40);
        builder.Property(e => e.MensagemSegura).IsRequired().HasMaxLength(250);

        builder.HasOne(e => e.Usuario)
            .WithMany()
            .HasForeignKey(e => e.UsuarioId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasIndex(e => e.UsuarioId);
        builder.HasIndex(e => e.CreatedAt);
    }
}
