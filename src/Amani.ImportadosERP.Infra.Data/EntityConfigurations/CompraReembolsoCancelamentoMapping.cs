using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraReembolsoCancelamentoMapping : IEntityTypeConfiguration<CompraReembolsoCancelamento>
{
    public void Configure(EntityTypeBuilder<CompraReembolsoCancelamento> builder)
    {
        builder.ToTable("compra_reembolso_cancelamentos", table =>
        {
            table.HasCheckConstraint("CK_compra_reembolso_cancelamentos_Motivo", "length(trim(\"Motivo\")) > 0");
        });

        builder.HasKey(c => c.Id);
        builder.Property(c => c.CompraReembolsoId).IsRequired();
        builder.Property(c => c.DataCancelamento).IsRequired();
        builder.Property(c => c.Motivo).IsRequired().HasMaxLength(500);
        builder.Property(c => c.OperacaoId).IsRequired();

        builder.HasIndex(c => c.CompraReembolsoId).IsUnique();
        builder.HasIndex(c => c.OperacaoId).IsUnique();

        builder.HasOne(c => c.CompraReembolso)
               .WithOne(r => r.Cancelamento)
               .HasForeignKey<CompraReembolsoCancelamento>(c => c.CompraReembolsoId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
