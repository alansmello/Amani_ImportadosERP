using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddDespesasCategorias : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Data",
                table: "despesas",
                newName: "DataCompetencia");

            migrationBuilder.AddColumn<string>(
                name: "FormaPagamento",
                table: "despesas",
                type: "character varying(30)",
                maxLength: 30,
                nullable: false,
                defaultValue: "Dinheiro");

            migrationBuilder.AddColumn<bool>(
                name: "Ativa",
                table: "categoria_despesas",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<string>(
                name: "Descricao",
                table: "categoria_despesas",
                type: "character varying(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NomeNormalizado",
                table: "categoria_despesas",
                type: "character varying(150)",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(
                "UPDATE categoria_despesas SET \"NomeNormalizado\" = UPPER(TRIM(\"Nome\")) WHERE \"NomeNormalizado\" = '';");

            migrationBuilder.CreateIndex(
                name: "IX_categoria_despesas_NomeNormalizado",
                table: "categoria_despesas",
                column: "NomeNormalizado",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_categoria_despesas_NomeNormalizado",
                table: "categoria_despesas");

            migrationBuilder.DropColumn(
                name: "FormaPagamento",
                table: "despesas");

            migrationBuilder.DropColumn(
                name: "Ativa",
                table: "categoria_despesas");

            migrationBuilder.DropColumn(
                name: "Descricao",
                table: "categoria_despesas");

            migrationBuilder.DropColumn(
                name: "NomeNormalizado",
                table: "categoria_despesas");

            migrationBuilder.RenameColumn(
                name: "DataCompetencia",
                table: "despesas",
                newName: "Data");
        }
    }
}
