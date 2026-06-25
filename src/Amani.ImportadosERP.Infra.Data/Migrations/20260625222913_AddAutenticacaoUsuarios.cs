using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAutenticacaoUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Login = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    LoginNormalizado = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    NomeExibicao = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    SenhaHash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    OrigemProvisionamento = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    UltimoLoginEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "eventos_autenticacao",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UsuarioId = table.Column<Guid>(type: "uuid", nullable: true),
                    LoginInformado = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Resultado = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    MensagemSegura = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_eventos_autenticacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_eventos_autenticacao_usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_eventos_autenticacao_CreatedAt",
                table: "eventos_autenticacao",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_eventos_autenticacao_UsuarioId",
                table: "eventos_autenticacao",
                column: "UsuarioId");

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_LoginNormalizado",
                table: "usuarios",
                column: "LoginNormalizado",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "eventos_autenticacao");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
