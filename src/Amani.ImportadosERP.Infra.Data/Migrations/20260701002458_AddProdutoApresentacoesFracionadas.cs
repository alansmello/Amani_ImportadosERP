using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddProdutoApresentacoesFracionadas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApresentacaoNomeSnapshot",
                table: "venda_items",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "FatorConversaoAplicado",
                table: "venda_items",
                type: "numeric(28,12)",
                precision: 28,
                scale: 12,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FatorDenominadorAplicado",
                table: "venda_items",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FatorNumeradorAplicado",
                table: "venda_items",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ProdutoApresentacaoId",
                table: "venda_items",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "QuantidadeConvertidaEstoque",
                table: "venda_items",
                type: "numeric(28,12)",
                precision: 28,
                scale: 12,
                nullable: true);

            migrationBuilder.AlterColumn<decimal>(
                name: "Quantidade",
                table: "estoque_movimentacoes",
                type: "numeric(28,12)",
                precision: 28,
                scale: 12,
                nullable: false,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<long>(
                name: "QuantidadeExataDenominador",
                table: "estoque_movimentacoes",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "QuantidadeExataNumerador",
                table: "estoque_movimentacoes",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "VendaItemId",
                table: "estoque_movimentacoes",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "produto_apresentacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Nome = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    FatorNumerador = table.Column<long>(type: "bigint", nullable: false),
                    FatorDenominador = table.Column<long>(type: "bigint", nullable: false),
                    PermiteCompra = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    PermiteVenda = table.Column<bool>(type: "boolean", nullable: false),
                    PrecoVenda = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_produto_apresentacoes", x => x.Id);
                    table.CheckConstraint("CK_produto_apresentacoes_FatorAteUm", "\"FatorNumerador\" <= \"FatorDenominador\"");
                    table.CheckConstraint("CK_produto_apresentacoes_FatorDenominador", "\"FatorDenominador\" > 0");
                    table.CheckConstraint("CK_produto_apresentacoes_FatorNumerador", "\"FatorNumerador\" > 0");
                    table.CheckConstraint("CK_produto_apresentacoes_PermiteCompra", "\"PermiteCompra\" = FALSE");
                    table.ForeignKey(
                        name: "FK_produto_apresentacoes_produtos_ProdutoId",
                        column: x => x.ProdutoId,
                        principalTable: "produtos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_venda_items_ProdutoApresentacaoId",
                table: "venda_items",
                column: "ProdutoApresentacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_estoque_movimentacoes_VendaItemId",
                table: "estoque_movimentacoes",
                column: "VendaItemId");

            migrationBuilder.AddCheckConstraint(
                name: "CK_estoque_movimentacoes_Quantidade",
                table: "estoque_movimentacoes",
                sql: "\"Quantidade\" > 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_estoque_movimentacoes_QuantidadeExata",
                table: "estoque_movimentacoes",
                sql: "(\"QuantidadeExataNumerador\" IS NULL AND \"QuantidadeExataDenominador\" IS NULL) OR (\"QuantidadeExataNumerador\" IS NOT NULL AND \"QuantidadeExataDenominador\" IS NOT NULL AND \"QuantidadeExataNumerador\" > 0 AND \"QuantidadeExataDenominador\" > 0 AND \"Quantidade\" = round(\"QuantidadeExataNumerador\"::numeric / \"QuantidadeExataDenominador\", 12))");

            migrationBuilder.AddCheckConstraint(
                name: "CK_venda_items_ApresentacaoSnapshot",
                table: "venda_items",
                sql: "(\"ProdutoApresentacaoId\" IS NULL AND \"ApresentacaoNomeSnapshot\" IS NULL AND \"FatorNumeradorAplicado\" IS NULL AND \"FatorDenominadorAplicado\" IS NULL AND \"FatorConversaoAplicado\" IS NULL AND \"QuantidadeConvertidaEstoque\" IS NULL) OR (\"ProdutoApresentacaoId\" IS NOT NULL AND \"ApresentacaoNomeSnapshot\" IS NOT NULL AND \"FatorNumeradorAplicado\" > 0 AND \"FatorDenominadorAplicado\" > 0 AND \"FatorNumeradorAplicado\" <= \"FatorDenominadorAplicado\" AND \"FatorConversaoAplicado\" > 0 AND \"QuantidadeConvertidaEstoque\" > 0 AND \"FatorConversaoAplicado\" = round(\"FatorNumeradorAplicado\"::numeric / \"FatorDenominadorAplicado\", 12) AND \"QuantidadeConvertidaEstoque\" = round(\"Quantidade\"::numeric * \"FatorNumeradorAplicado\" / \"FatorDenominadorAplicado\", 12))");

            migrationBuilder.CreateIndex(
                name: "IX_produto_apresentacoes_ProdutoId_Ativo_PermiteVenda",
                table: "produto_apresentacoes",
                columns: new[] { "ProdutoId", "Ativo", "PermiteVenda" });

            migrationBuilder.CreateIndex(
                name: "IX_produto_apresentacoes_ProdutoId_Nome",
                table: "produto_apresentacoes",
                columns: new[] { "ProdutoId", "Nome" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_estoque_movimentacoes_venda_items_VendaItemId",
                table: "estoque_movimentacoes",
                column: "VendaItemId",
                principalTable: "venda_items",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_venda_items_produto_apresentacoes_ProdutoApresentacaoId",
                table: "venda_items",
                column: "ProdutoApresentacaoId",
                principalTable: "produto_apresentacoes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM estoque_movimentacoes
                        WHERE "QuantidadeExataNumerador" IS NOT NULL
                           OR "Quantidade" <> trunc("Quantidade")
                    ) THEN
                        RAISE EXCEPTION 'Rollback bloqueado: existem movimentacoes fracionadas. Desabilite a feature e mantenha o schema expansivo.';
                    END IF;
                END $$;
                """);
            migrationBuilder.DropForeignKey(
                name: "FK_estoque_movimentacoes_venda_items_VendaItemId",
                table: "estoque_movimentacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_venda_items_produto_apresentacoes_ProdutoApresentacaoId",
                table: "venda_items");

            migrationBuilder.DropTable(
                name: "produto_apresentacoes");

            migrationBuilder.DropIndex(
                name: "IX_venda_items_ProdutoApresentacaoId",
                table: "venda_items");

            migrationBuilder.DropIndex(
                name: "IX_estoque_movimentacoes_VendaItemId",
                table: "estoque_movimentacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_estoque_movimentacoes_Quantidade",
                table: "estoque_movimentacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_estoque_movimentacoes_QuantidadeExata",
                table: "estoque_movimentacoes");

            migrationBuilder.DropCheckConstraint(
                name: "CK_venda_items_ApresentacaoSnapshot",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "ApresentacaoNomeSnapshot",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "FatorConversaoAplicado",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "FatorDenominadorAplicado",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "FatorNumeradorAplicado",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "ProdutoApresentacaoId",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "QuantidadeConvertidaEstoque",
                table: "venda_items");

            migrationBuilder.DropColumn(
                name: "QuantidadeExataDenominador",
                table: "estoque_movimentacoes");

            migrationBuilder.DropColumn(
                name: "QuantidadeExataNumerador",
                table: "estoque_movimentacoes");

            migrationBuilder.DropColumn(
                name: "VendaItemId",
                table: "estoque_movimentacoes");

            migrationBuilder.AlterColumn<int>(
                name: "Quantidade",
                table: "estoque_movimentacoes",
                type: "integer",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(28,12)",
                oldPrecision: 28,
                oldScale: 12);
        }
    }
}
