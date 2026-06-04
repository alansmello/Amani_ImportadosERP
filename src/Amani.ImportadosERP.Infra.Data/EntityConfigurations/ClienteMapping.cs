using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class ClienteMapping : IEntityTypeConfiguration<Cliente>
{
    public void Configure(EntityTypeBuilder<Cliente> builder)
    {
        builder.ToTable("clientes");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.Nome).IsRequired().HasMaxLength(150);
        builder.Property(c => c.Email).HasMaxLength(200);
        builder.Property(c => c.Telefone).HasMaxLength(50);
        builder.Property(c => c.Ativo).IsRequired().HasDefaultValue(true);
    }
}
