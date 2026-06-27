using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Amani.ImportadosERP.Infra.Data.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeNonDebitPaymentFees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                """
                UPDATE configuracoes_formas_pagamento
                SET percentual_taxa = 0
                WHERE forma_pagamento <> 'CartaoDebito' AND percentual_taxa <> 0;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Nao ha como restaurar valores anteriores sem historico confiavel.
        }
    }
}
