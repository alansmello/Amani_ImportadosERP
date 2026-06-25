using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class UsuarioConfiguration : IEntityTypeConfiguration<Usuario>
{
    public void Configure(EntityTypeBuilder<Usuario> builder)
    {
        builder.ToTable("usuarios");
        builder.HasKey(u => u.Id);

        builder.Property(u => u.Login).IsRequired().HasMaxLength(150);
        builder.Property(u => u.LoginNormalizado).IsRequired().HasMaxLength(150);
        builder.Property(u => u.NomeExibicao).IsRequired().HasMaxLength(150);
        builder.Property(u => u.SenhaHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Ativo).IsRequired().HasDefaultValue(true);
        builder.Property(u => u.OrigemProvisionamento).IsRequired().HasMaxLength(80);
        builder.Property(u => u.UltimoLoginEm);

        builder.HasIndex(u => u.LoginNormalizado).IsUnique();
    }
}
