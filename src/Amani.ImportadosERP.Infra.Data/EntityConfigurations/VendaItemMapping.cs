using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class VendaItemMapping : IEntityTypeConfiguration<VendaItem>
{
    public void Configure(EntityTypeBuilder<VendaItem> builder)
    {
        builder.ToTable("venda_items", table => table.HasCheckConstraint(
            "CK_venda_items_ApresentacaoSnapshot",
            "(\"ProdutoApresentacaoId\" IS NULL AND \"ApresentacaoNomeSnapshot\" IS NULL " +
            "AND \"FatorNumeradorAplicado\" IS NULL AND \"FatorDenominadorAplicado\" IS NULL " +
            "AND \"FatorConversaoAplicado\" IS NULL AND \"QuantidadeConvertidaEstoque\" IS NULL) OR " +
            "(\"ProdutoApresentacaoId\" IS NOT NULL AND \"ApresentacaoNomeSnapshot\" IS NOT NULL " +
            "AND \"FatorNumeradorAplicado\" > 0 AND \"FatorDenominadorAplicado\" > 0 " +
            "AND \"FatorNumeradorAplicado\" <= \"FatorDenominadorAplicado\" " +
            "AND \"FatorConversaoAplicado\" > 0 AND \"QuantidadeConvertidaEstoque\" > 0 " +
            "AND \"FatorConversaoAplicado\" = round(\"FatorNumeradorAplicado\"::numeric / \"FatorDenominadorAplicado\", 12) " +
            "AND \"QuantidadeConvertidaEstoque\" = round(\"Quantidade\"::numeric * \"FatorNumeradorAplicado\" / \"FatorDenominadorAplicado\", 12))"));
        builder.HasKey(vi => vi.Id);
        builder.Property(vi => vi.ProdutoId).IsRequired();
        builder.Property(vi => vi.Quantidade).IsRequired();
        builder.Property(vi => vi.PrecoUnitario).IsRequired().HasPrecision(18,2);
        builder.Property(vi => vi.Desconto).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(vi => vi.Acrescimo).IsRequired().HasPrecision(18,2).HasDefaultValue(0m);
        builder.Property(vi => vi.ApresentacaoNomeSnapshot).HasMaxLength(100);
        builder.Property(vi => vi.FatorConversaoAplicado).HasPrecision(28, 12);
        builder.Property(vi => vi.QuantidadeConvertidaEstoque).HasPrecision(28, 12);
        builder.HasOne(vi => vi.Venda).WithMany(v => v.Items).HasForeignKey(vi => vi.VendaId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne(vi => vi.ProdutoApresentacao).WithMany().HasForeignKey(vi => vi.ProdutoApresentacaoId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(vi => vi.ProdutoApresentacaoId);
    }
}
