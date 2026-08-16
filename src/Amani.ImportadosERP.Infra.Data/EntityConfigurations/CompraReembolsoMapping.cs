using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraReembolsoMapping : IEntityTypeConfiguration<CompraReembolso>
{
    public void Configure(EntityTypeBuilder<CompraReembolso> builder)
    {
        builder.ToTable("compra_reembolsos", table =>
        {
            table.HasCheckConstraint("CK_compra_reembolsos_Valor", "\"Valor\" > 0");
        });

        builder.HasKey(r => r.Id);
        builder.Property(r => r.CompraId).IsRequired();
        builder.Property(r => r.Valor).IsRequired().HasPrecision(18, 2);
        builder.Property(r => r.DataReembolso).IsRequired();
        builder.Property(r => r.ReferenciaExterna).HasMaxLength(100).IsRequired(false);
        builder.Property(r => r.Observacao).HasMaxLength(500).IsRequired(false);
        builder.Property(r => r.OperacaoId).IsRequired();

        builder.HasIndex(r => r.OperacaoId).IsUnique();
        builder.HasIndex(r => new { r.CompraId, r.DataReembolso });
        builder.HasIndex(r => new { r.CompraId, r.ReferenciaExterna })
               .IsUnique()
               .HasFilter("\"ReferenciaExterna\" IS NOT NULL");

        builder.HasOne(r => r.Compra)
               .WithMany()
               .HasForeignKey(r => r.CompraId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.Navigation(r => r.Alocacoes)
               .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
