using Amani.ImportadosERP.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public sealed class ProdutoApresentacaoMapping : IEntityTypeConfiguration<ProdutoApresentacao>
{
    public void Configure(EntityTypeBuilder<ProdutoApresentacao> builder)
    {
        builder.ToTable("produto_apresentacoes", table =>
        {
            table.HasCheckConstraint("CK_produto_apresentacoes_FatorNumerador", "\"FatorNumerador\" > 0");
            table.HasCheckConstraint("CK_produto_apresentacoes_FatorDenominador", "\"FatorDenominador\" > 0");
            table.HasCheckConstraint("CK_produto_apresentacoes_FatorAteUm", "\"FatorNumerador\" <= \"FatorDenominador\"");
            table.HasCheckConstraint("CK_produto_apresentacoes_PermiteCompra", "\"PermiteCompra\" = FALSE");
        });
        builder.HasKey(a => a.Id);
        builder.Property(a => a.Nome).IsRequired().HasMaxLength(100);
        builder.Property(a => a.FatorNumerador).IsRequired();
        builder.Property(a => a.FatorDenominador).IsRequired();
        builder.Property(a => a.PermiteCompra).IsRequired().HasDefaultValue(false);
        builder.Property(a => a.PermiteVenda).IsRequired();
        builder.Property(a => a.PrecoVenda).HasPrecision(18, 2);
        builder.Property(a => a.Ativo).IsRequired();
        builder.HasOne(a => a.Produto).WithMany(p => p.Apresentacoes).HasForeignKey(a => a.ProdutoId).OnDelete(DeleteBehavior.Restrict);
        builder.HasIndex(a => new { a.ProdutoId, a.Nome }).IsUnique();
        builder.HasIndex(a => new { a.ProdutoId, a.Ativo, a.PermiteVenda });
    }
}
