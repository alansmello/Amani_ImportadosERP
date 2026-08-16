using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraItemDevolucaoMapping : IEntityTypeConfiguration<CompraItemDevolucao>
{
    public void Configure(EntityTypeBuilder<CompraItemDevolucao> builder)
    {
        builder.ToTable("compra_item_devolucoes", table =>
        {
            table.HasCheckConstraint("CK_compra_item_devolucoes_Quantidade", "\"Quantidade\" > 0");
            table.HasCheckConstraint(
                "CK_compra_item_devolucoes_MomentoReferencias",
                "(\"Momento\" = 'AntesDoRecebimento' AND \"CompraItemRecebimentoId\" IS NULL AND \"EstoqueMovimentacaoId\" IS NULL) OR " +
                "(\"Momento\" = 'DepoisDoRecebimento' AND \"CompraItemRecebimentoId\" IS NOT NULL AND \"EstoqueMovimentacaoId\" IS NOT NULL)");
            table.HasCheckConstraint(
                "CK_compra_item_devolucoes_ObservacaoOutro",
                "\"Motivo\" <> 'Outro' OR (\"Observacao\" IS NOT NULL AND length(trim(\"Observacao\")) > 0)");
        });

        builder.HasKey(d => d.Id);
        builder.Property(d => d.CompraId).IsRequired();
        builder.Property(d => d.CompraItemId).IsRequired();
        builder.Property(d => d.CompraItemRecebimentoId).IsRequired(false);
        builder.Property(d => d.EstoqueMovimentacaoId).IsRequired(false);
        builder.Property(d => d.Momento).IsRequired().HasConversion<string>().HasMaxLength(30);
        builder.Property(d => d.Quantidade).IsRequired();
        builder.Property(d => d.Motivo).IsRequired().HasConversion<string>().HasMaxLength(40);
        builder.Property(d => d.DataDevolucao).IsRequired();
        builder.Property(d => d.Observacao).HasMaxLength(500).IsRequired(false);
        builder.Property(d => d.OperacaoId).IsRequired();

        builder.HasIndex(d => d.OperacaoId).IsUnique();
        builder.HasIndex(d => new { d.CompraId, d.DataDevolucao });
        builder.HasIndex(d => new { d.CompraItemId, d.Momento });
        builder.HasIndex(d => d.CompraItemRecebimentoId);
        builder.HasIndex(d => d.EstoqueMovimentacaoId).IsUnique();

        builder.HasOne(d => d.Compra)
               .WithMany()
               .HasForeignKey(d => d.CompraId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.CompraItem)
               .WithMany()
               .HasForeignKey(d => d.CompraItemId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.CompraItemRecebimento)
               .WithMany()
               .HasForeignKey(d => d.CompraItemRecebimentoId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(d => d.EstoqueMovimentacao)
               .WithOne()
               .HasForeignKey<CompraItemDevolucao>(d => d.EstoqueMovimentacaoId)
               .OnDelete(DeleteBehavior.Restrict);
    }
}
