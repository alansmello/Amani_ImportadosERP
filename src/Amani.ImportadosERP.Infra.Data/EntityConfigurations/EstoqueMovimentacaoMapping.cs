using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Amani.ImportadosERP.Domain.Entities;

namespace Amani.ImportadosERP.Infra.Data.EntityConfigurations;

public class EstoqueMovimentacaoMapping : IEntityTypeConfiguration<EstoqueMovimentacao>
{
    public void Configure(EntityTypeBuilder<EstoqueMovimentacao> builder)
    {
        builder.ToTable("estoque_movimentacoes");
        builder.HasKey(e => e.Id);
        builder.Property(e => e.ProdutoId).IsRequired();
        builder.Property(e => e.Quantidade).IsRequired();
        builder.Property(e => e.Tipo).IsRequired();
        builder.Property(e => e.Data).IsRequired();
        builder.Property(e => e.ValorUnitario).HasPrecision(18,2).IsRequired(false);

        builder.HasOne<Compra>().WithMany().HasForeignKey(e => e.CompraId).OnDelete(DeleteBehavior.SetNull);
        builder.HasOne<Venda>().WithMany().HasForeignKey(e => e.VendaId).OnDelete(DeleteBehavior.SetNull);
    }
}
