using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraMapping : IEntityTypeConfiguration<Compra>
{
    public void Configure(EntityTypeBuilder<Compra> builder)
    {
        builder.ToTable("compras");
        builder.HasKey(c => c.Id);
        builder.Property(c => c.FornecedorId).IsRequired();
        builder.Property(c => c.DataCompra).IsRequired();
        builder.Property(c => c.Desconto).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(c => c.Acrescimo).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(c => c.Status)
               .IsRequired()
               .HasConversion<string>()
               .HasMaxLength(30)
               .HasDefaultValue(CompraStatus.Criada);

        builder.HasMany(c => c.Items)
               .WithOne(ci => ci.Compra)
               .HasForeignKey(ci => ci.CompraId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Recebimentos)
               .WithOne(r => r.Compra)
               .HasForeignKey(r => r.CompraId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(c => c.Perdas)
               .WithOne(p => p.Compra)
               .HasForeignKey(p => p.CompraId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
