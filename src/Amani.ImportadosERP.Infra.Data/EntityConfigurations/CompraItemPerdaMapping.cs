using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraItemPerdaMapping : IEntityTypeConfiguration<CompraItemPerda>
{
    public void Configure(EntityTypeBuilder<CompraItemPerda> builder)
    {
        builder.ToTable("compra_item_perdas");
        builder.HasKey(p => p.Id);
        builder.Property(p => p.CompraId).IsRequired();
        builder.Property(p => p.CompraItemId).IsRequired();
        builder.Property(p => p.ProdutoId).IsRequired();
        builder.Property(p => p.Quantidade).IsRequired();
        builder.Property(p => p.Motivo)
               .IsRequired()
               .HasConversion<string>()
               .HasMaxLength(30);
        builder.Property(p => p.DataPerda).IsRequired();
        builder.Property(p => p.Observacao).HasMaxLength(500).IsRequired(false);

        builder.HasIndex(p => p.CompraId);
        builder.HasIndex(p => p.CompraItemId);
        builder.HasIndex(p => p.ProdutoId);

        builder.HasOne(p => p.Compra)
               .WithMany(c => c.Perdas)
               .HasForeignKey(p => p.CompraId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.CompraItem)
               .WithMany(i => i.Perdas)
               .HasForeignKey(p => p.CompraItemId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
