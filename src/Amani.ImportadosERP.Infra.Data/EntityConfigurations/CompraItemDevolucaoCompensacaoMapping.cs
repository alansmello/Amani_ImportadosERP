using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraItemDevolucaoCompensacaoMapping : IEntityTypeConfiguration<CompraItemDevolucaoCompensacao>
{
    public void Configure(EntityTypeBuilder<CompraItemDevolucaoCompensacao> builder)
    {
        builder.ToTable("compra_item_devolucao_compensacoes", table =>
        {
            table.HasCheckConstraint("CK_compra_item_devolucao_compensacoes_Motivo", "length(trim(\"Motivo\")) > 0");
        });

        builder.HasKey(c => c.Id);
        builder.Property(c => c.CompraItemDevolucaoId).IsRequired();
        builder.Property(c => c.EstoqueMovimentacaoId).IsRequired(false);
        builder.Property(c => c.DataCompensacao).IsRequired();
        builder.Property(c => c.Motivo).IsRequired().HasMaxLength(500);
        builder.Property(c => c.PresencaFisicaConfirmada).IsRequired();
        builder.Property(c => c.OperacaoId).IsRequired();

        builder.HasIndex(c => c.CompraItemDevolucaoId).IsUnique();
        builder.HasIndex(c => c.OperacaoId).IsUnique();
        builder.HasIndex(c => c.EstoqueMovimentacaoId).IsUnique();

        builder.HasOne(c => c.CompraItemDevolucao)
               .WithOne(d => d.Compensacao)
               .HasForeignKey<CompraItemDevolucaoCompensacao>(c => c.CompraItemDevolucaoId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(c => c.EstoqueMovimentacao)
               .WithOne()
               .HasForeignKey<CompraItemDevolucaoCompensacao>(c => c.EstoqueMovimentacaoId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
