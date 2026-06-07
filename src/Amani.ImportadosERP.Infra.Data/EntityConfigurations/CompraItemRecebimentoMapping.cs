using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class CompraItemRecebimentoMapping : IEntityTypeConfiguration<CompraItemRecebimento>
{
    public void Configure(EntityTypeBuilder<CompraItemRecebimento> builder)
    {
        builder.ToTable("compra_item_recebimentos");
        builder.HasKey(r => r.Id);
        builder.Property(r => r.CompraId).IsRequired();
        builder.Property(r => r.CompraItemId).IsRequired();
        builder.Property(r => r.ProdutoId).IsRequired();
        builder.Property(r => r.Quantidade).IsRequired();
        builder.Property(r => r.ValorUnitario).IsRequired().HasPrecision(18, 2);
        builder.Property(r => r.DataRecebimento).IsRequired();
        builder.Property(r => r.EstoqueMovimentacaoId).IsRequired(false);
        builder.Property(r => r.Origem)
               .IsRequired()
               .HasConversion<string>()
               .HasMaxLength(30);
        builder.Property(r => r.Observacao).HasMaxLength(500).IsRequired(false);

        builder.HasIndex(r => r.CompraId);
        builder.HasIndex(r => r.CompraItemId);
        builder.HasIndex(r => r.ProdutoId);
        builder.HasIndex(r => r.EstoqueMovimentacaoId).IsUnique();

        builder.HasOne(r => r.Compra)
               .WithMany(c => c.Recebimentos)
               .HasForeignKey(r => r.CompraId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.CompraItem)
               .WithMany(i => i.Recebimentos)
               .HasForeignKey(r => r.CompraItemId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.EstoqueMovimentacao)
               .WithOne()
               .HasForeignKey<CompraItemRecebimento>(r => r.EstoqueMovimentacaoId)
               .OnDelete(DeleteBehavior.SetNull);
    }
}
