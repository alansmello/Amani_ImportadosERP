START TRANSACTION;


DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "ApresentacaoNomeSnapshot" character varying(100);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "FatorConversaoAplicado" numeric(28,12);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "FatorDenominadorAplicado" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "FatorNumeradorAplicado" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "ProdutoApresentacaoId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD "QuantidadeConvertidaEstoque" numeric(28,12);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ALTER COLUMN "Quantidade" TYPE numeric(28,12);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD "QuantidadeExataDenominador" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD "QuantidadeExataNumerador" bigint;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD "VendaItemId" uuid;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE TABLE produto_apresentacoes (
        "Id" uuid NOT NULL,
        "ProdutoId" uuid NOT NULL,
        "Nome" character varying(100) NOT NULL,
        "FatorNumerador" bigint NOT NULL,
        "FatorDenominador" bigint NOT NULL,
        "PermiteCompra" boolean NOT NULL DEFAULT FALSE,
        "PermiteVenda" boolean NOT NULL,
        "PrecoVenda" numeric(18,2),
        "Ativo" boolean NOT NULL,
        "CreatedAt" timestamp with time zone NOT NULL,
        "UpdatedAt" timestamp with time zone,
        CONSTRAINT "PK_produto_apresentacoes" PRIMARY KEY ("Id"),
        CONSTRAINT "CK_produto_apresentacoes_FatorAteUm" CHECK ("FatorNumerador" <= "FatorDenominador"),
        CONSTRAINT "CK_produto_apresentacoes_FatorDenominador" CHECK ("FatorDenominador" > 0),
        CONSTRAINT "CK_produto_apresentacoes_FatorNumerador" CHECK ("FatorNumerador" > 0),
        CONSTRAINT "CK_produto_apresentacoes_PermiteCompra" CHECK ("PermiteCompra" = FALSE),
        CONSTRAINT "FK_produto_apresentacoes_produtos_ProdutoId" FOREIGN KEY ("ProdutoId") REFERENCES produtos ("Id") ON DELETE RESTRICT
    );
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE INDEX "IX_venda_items_ProdutoApresentacaoId" ON venda_items ("ProdutoApresentacaoId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE INDEX "IX_estoque_movimentacoes_VendaItemId" ON estoque_movimentacoes ("VendaItemId");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "CK_estoque_movimentacoes_Quantidade" CHECK ("Quantidade" > 0);
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "CK_estoque_movimentacoes_QuantidadeExata" CHECK (("QuantidadeExataNumerador" IS NULL AND "QuantidadeExataDenominador" IS NULL) OR ("QuantidadeExataNumerador" IS NOT NULL AND "QuantidadeExataDenominador" IS NOT NULL AND "QuantidadeExataNumerador" > 0 AND "QuantidadeExataDenominador" > 0 AND "Quantidade" = round("QuantidadeExataNumerador"::numeric / "QuantidadeExataDenominador", 12)));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD CONSTRAINT "CK_venda_items_ApresentacaoSnapshot" CHECK (("ProdutoApresentacaoId" IS NULL AND "ApresentacaoNomeSnapshot" IS NULL AND "FatorNumeradorAplicado" IS NULL AND "FatorDenominadorAplicado" IS NULL AND "FatorConversaoAplicado" IS NULL AND "QuantidadeConvertidaEstoque" IS NULL) OR ("ProdutoApresentacaoId" IS NOT NULL AND "ApresentacaoNomeSnapshot" IS NOT NULL AND "FatorNumeradorAplicado" > 0 AND "FatorDenominadorAplicado" > 0 AND "FatorNumeradorAplicado" <= "FatorDenominadorAplicado" AND "FatorConversaoAplicado" > 0 AND "QuantidadeConvertidaEstoque" > 0 AND "FatorConversaoAplicado" = round("FatorNumeradorAplicado"::numeric / "FatorDenominadorAplicado", 12) AND "QuantidadeConvertidaEstoque" = round("Quantidade"::numeric * "FatorNumeradorAplicado" / "FatorDenominadorAplicado", 12)));
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE INDEX "IX_produto_apresentacoes_ProdutoId_Ativo_PermiteVenda" ON produto_apresentacoes ("ProdutoId", "Ativo", "PermiteVenda");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    CREATE UNIQUE INDEX "IX_produto_apresentacoes_ProdutoId_Nome" ON produto_apresentacoes ("ProdutoId", "Nome");
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE estoque_movimentacoes ADD CONSTRAINT "FK_estoque_movimentacoes_venda_items_VendaItemId" FOREIGN KEY ("VendaItemId") REFERENCES venda_items ("Id") ON DELETE SET NULL;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    ALTER TABLE venda_items ADD CONSTRAINT "FK_venda_items_produto_apresentacoes_ProdutoApresentacaoId" FOREIGN KEY ("ProdutoApresentacaoId") REFERENCES produto_apresentacoes ("Id") ON DELETE RESTRICT;
    END IF;
END $EF$;

DO $EF$
BEGIN
    IF NOT EXISTS(SELECT 1 FROM "__EFMigrationsHistory" WHERE "MigrationId" = '20260701002458_AddProdutoApresentacoesFracionadas') THEN
    INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
    VALUES ('20260701002458_AddProdutoApresentacoesFracionadas', '8.0.8');
    END IF;
END $EF$;
COMMIT;

