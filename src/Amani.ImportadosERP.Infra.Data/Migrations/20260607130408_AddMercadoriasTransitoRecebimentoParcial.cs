using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMercadoriasTransitoRecebimentoParcial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "CompraItemId",
                table: "estoque_movimentacoes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "compras",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Criada");

            migrationBuilder.Sql("""
                UPDATE compras
                SET "Status" = 'Recebida'
                WHERE "Status" = 'Criada';
                """);

            migrationBuilder.CreateTable(
                name: "compra_item_perdas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    Motivo = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    DataPerda = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_item_perdas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_compra_item_perdas_compra_items_CompraItemId",
                        column: x => x.CompraItemId,
                        principalTable: "compra_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_perdas_compras_CompraId",
                        column: x => x.CompraId,
                        principalTable: "compras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "compra_item_recebimentos",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraId = table.Column<Guid>(type: "uuid", nullable: false),
                    CompraItemId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProdutoId = table.Column<Guid>(type: "uuid", nullable: false),
                    Quantidade = table.Column<int>(type: "integer", nullable: false),
                    ValorUnitario = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    DataRecebimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EstoqueMovimentacaoId = table.Column<Guid>(type: "uuid", nullable: true),
                    Origem = table.Column<string>(type: "character varying(30)", maxLength: 30, nullable: false),
                    Observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_compra_item_recebimentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_compra_item_recebimentos_compra_items_CompraItemId",
                        column: x => x.CompraItemId,
                        principalTable: "compra_items",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_recebimentos_compras_CompraId",
                        column: x => x.CompraId,
                        principalTable: "compras",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_compra_item_recebimentos_estoque_movimentacoes_EstoqueMovim~",
                        column: x => x.EstoqueMovimentacaoId,
                        principalTable: "estoque_movimentacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_estoque_movimentacoes_CompraItemId",
                table: "estoque_movimentacoes",
                column: "CompraItemId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_perdas_CompraId",
                table: "compra_item_perdas",
                column: "CompraId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_perdas_CompraItemId",
                table: "compra_item_perdas",
                column: "CompraItemId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_perdas_ProdutoId",
                table: "compra_item_perdas",
                column: "ProdutoId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_recebimentos_CompraId",
                table: "compra_item_recebimentos",
                column: "CompraId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_recebimentos_CompraItemId",
                table: "compra_item_recebimentos",
                column: "CompraItemId");

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_recebimentos_EstoqueMovimentacaoId",
                table: "compra_item_recebimentos",
                column: "EstoqueMovimentacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_compra_item_recebimentos_ProdutoId",
                table: "compra_item_recebimentos",
                column: "ProdutoId");

            migrationBuilder.AddForeignKey(
                name: "FK_estoque_movimentacoes_compra_items_CompraItemId",
                table: "estoque_movimentacoes",
                column: "CompraItemId",
                principalTable: "compra_items",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.Sql("""
                INSERT INTO compra_item_recebimentos (
                    "Id",
                    "CompraId",
                    "CompraItemId",
                    "ProdutoId",
                    "Quantidade",
                    "ValorUnitario",
                    "DataRecebimento",
                    "EstoqueMovimentacaoId",
                    "Origem",
                    "Observacao",
                    "CreatedAt",
                    "UpdatedAt"
                )
                SELECT
                    (
                        substr(md5(ci."Id"::text || '-legacy-receipt'), 1, 8) || '-' ||
                        substr(md5(ci."Id"::text || '-legacy-receipt'), 9, 4) || '-' ||
                        substr(md5(ci."Id"::text || '-legacy-receipt'), 13, 4) || '-' ||
                        substr(md5(ci."Id"::text || '-legacy-receipt'), 17, 4) || '-' ||
                        substr(md5(ci."Id"::text || '-legacy-receipt'), 21, 12)
                    )::uuid,
                    ci."CompraId",
                    ci."Id",
                    ci."ProdutoId",
                    ci."Quantidade",
                    ci."CustoUnitario",
                    c."DataCompra",
                    NULL,
                    'LegadoMigrado',
                    'Recebimento legado migrado pela Feature 003',
                    NOW(),
                    NULL
                FROM compra_items ci
                INNER JOIN compras c ON c."Id" = ci."CompraId"
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM compra_item_recebimentos r
                    WHERE r."CompraItemId" = ci."Id"
                      AND r."Origem" = 'LegadoMigrado'
                );
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_estoque_movimentacoes_compra_items_CompraItemId",
                table: "estoque_movimentacoes");

            migrationBuilder.DropTable(
                name: "compra_item_perdas");

            migrationBuilder.DropTable(
                name: "compra_item_recebimentos");

            migrationBuilder.DropIndex(
                name: "IX_estoque_movimentacoes_CompraItemId",
                table: "estoque_movimentacoes");

            migrationBuilder.DropColumn(
                name: "CompraItemId",
                table: "estoque_movimentacoes");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "compras");
        }
    }
}
