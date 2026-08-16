using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraReembolsoAlocacaoMapping : IEntityTypeConfiguration<CompraReembolsoAlocacao>
{
    public void Configure(EntityTypeBuilder<CompraReembolsoAlocacao> builder)
    {
        builder.ToTable("compra_reembolso_alocacoes", table =>
        {
            table.HasCheckConstraint("CK_compra_reembolso_alocacoes_Valor", "\"Valor\" > 0");
            table.HasCheckConstraint(
                "CK_compra_reembolso_alocacoes_OcorrenciaUnica",
                "NOT (\"CompraItemPerdaId\" IS NOT NULL AND \"CompraItemDevolucaoId\" IS NOT NULL)");
        });

        builder.HasKey(a => a.Id);
        builder.Property(a => a.CompraReembolsoId).IsRequired();
        builder.Property(a => a.CompraItemId).IsRequired();
        builder.Property(a => a.CompraItemPerdaId).IsRequired(false);
        builder.Property(a => a.CompraItemDevolucaoId).IsRequired(false);
        builder.Property(a => a.Valor).IsRequired().HasPrecision(18, 2);

        builder.HasIndex(a => a.CompraReembolsoId);
        builder.HasIndex(a => a.CompraItemId);
        builder.HasIndex(a => a.CompraItemPerdaId);
        builder.HasIndex(a => a.CompraItemDevolucaoId);

        builder.HasOne(a => a.CompraReembolso)
               .WithMany(r => r.Alocacoes)
               .HasForeignKey(a => a.CompraReembolsoId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.CompraItem)
               .WithMany()
               .HasForeignKey(a => a.CompraItemId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.CompraItemPerda)
               .WithMany()
               .HasForeignKey(a => a.CompraItemPerdaId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.CompraItemDevolucao)
               .WithMany()
               .HasForeignKey(a => a.CompraItemDevolucaoId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
