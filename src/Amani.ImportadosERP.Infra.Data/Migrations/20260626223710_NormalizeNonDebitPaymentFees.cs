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
                DO $$
                BEGIN
                    IF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'configuracoes_formas_pagamento'
                          AND column_name = 'forma_pagamento'
                    ) THEN
                        UPDATE configuracoes_formas_pagamento
                        SET percentual_taxa = 0
                        WHERE forma_pagamento <> 'CartaoDebito' AND percentual_taxa <> 0;
                    ELSIF EXISTS (
                        SELECT 1
                        FROM information_schema.columns
                        WHERE table_name = 'configuracoes_formas_pagamento'
                          AND column_name = 'FormaPagamento'
                    ) THEN
                        UPDATE "configuracoes_formas_pagamento"
                        SET "PercentualTaxa" = 0
                        WHERE "FormaPagamento" <> 'CartaoDebito' AND "PercentualTaxa" <> 0;
                    END IF;
                END $$;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Nao ha como restaurar valores anteriores sem historico confiavel.
        }
    }
}
