using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class EstoqueMovimentacaoMapping : IEntityTypeConfiguration<EstoqueMovimentacao>
{
    public void Configure(EntityTypeBuilder<EstoqueMovimentacao> builder)
    {
        builder.ToTable("estoque_movimentacoes", table =>
        {
            table.HasCheckConstraint("CK_estoque_movimentacoes_Quantidade", "\"Quantidade\" > 0");
            table.HasCheckConstraint(
                "CK_estoque_movimentacoes_QuantidadeExata",
                "(\"QuantidadeExataNumerador\" IS NULL AND \"QuantidadeExataDenominador\" IS NULL) OR " +
                "(\"QuantidadeExataNumerador\" IS NOT NULL AND \"QuantidadeExataDenominador\" IS NOT NULL " +
                "AND \"QuantidadeExataNumerador\" > 0 AND \"QuantidadeExataDenominador\" > 0 " +
                "AND \"Quantidade\" = round(\"QuantidadeExataNumerador\"::numeric / \"QuantidadeExataDenominador\", 12))");
        });
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ProdutoId).IsRequired();
        builder.Property(e => e.Quantidade).IsRequired().HasPrecision(28, 12);
        builder.Property(e => e.Tipo).IsRequired();
        builder.Property(e => e.CompraItemId).IsRequired(false);
        builder.Property(e => e.Data).IsRequired();
        builder.Property(e => e.ValorUnitario).HasPrecision(18,2).IsRequired(false);
        builder.Property(e => e.QuantidadeExataNumerador).IsRequired(false);
        builder.Property(e => e.QuantidadeExataDenominador).IsRequired(false);

        builder.HasOne<Compra>().WithMany().HasForeignKey(e => e.CompraId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(e => e.CompraItem).WithMany().HasForeignKey(e => e.CompraItemId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne<Venda>().WithMany().HasForeignKey(e => e.VendaId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne(e => e.VendaItem).WithMany().HasForeignKey(e => e.VendaItemId).OnDelete(DeleteBehavior.SetNull);
        builder.HasIndex(e => e.VendaItemId);

        builder.HasIndex(e => new { e.ProdutoId, e.Data, e.Tipo })
            .HasDatabaseName("IX_estoque_movimentacoes_ProdutoId_Data_Tipo");
    }
}
